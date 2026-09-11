import { useEffect, useRef, useState } from 'react'
import {
  Modal,
  View,
  Text,
  Animated,
  ActivityIndicator,
  PanResponder,
  Pressable,
  useWindowDimensions,
  StyleSheet,
} from 'react-native'
import { colors, spacing, radius, shadow, useAccentColors } from '../theme'
import { getCachedImageSize, bustImageSizeCache } from '../utils/imageSize'

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

// Lets the user pick which part of an image stays visible by dragging it
// around behind a fixed crop window. No zoom/resize — just repositioning.
// The result is a "focal point" (0..1 fractions), not a re-encoded image:
// rendering is done by FocalImage using the same cover-scale math.
export default function ImageCropModal({
  visible,
  uri,
  aspectRatio = 1,
  initialFocalX = 0.5,
  initialFocalY = 0.5,
  onCancel,
  onConfirm,
}) {
  const { accent } = useAccentColors()
  const { width: windowWidth } = useWindowDimensions()
  const cropWidth = windowWidth - spacing.lg * 2
  const cropHeight = cropWidth / aspectRatio

  const [naturalSize, setNaturalSize] = useState(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [retryTick, setRetryTick] = useState(0)
  const translate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current
  const dragStart = useRef({ x: 0, y: 0 })
  const boundsRef = useRef({ freeX: 0, freeY: 0 })
  const initializedFor = useRef(null)

  useEffect(() => {
    if (!visible || !uri) return
    initializedFor.current = null
    setNaturalSize(null)
    setLoadFailed(false)
    let cancelled = false
    getCachedImageSize(uri).then((size) => {
      if (cancelled) return
      if (size) setNaturalSize(size)
      else setLoadFailed(true)
    })
    return () => {
      cancelled = true
    }
  }, [visible, uri, retryTick])

  function retryLoad() {
    bustImageSizeCache(uri)
    setLoadFailed(false)
    setRetryTick((t) => t + 1)
  }

  let displaySize = null
  if (naturalSize) {
    const coverScale = Math.max(cropWidth / naturalSize.width, cropHeight / naturalSize.height)
    const displayWidth = naturalSize.width * coverScale
    const displayHeight = naturalSize.height * coverScale
    const freeX = displayWidth - cropWidth
    const freeY = displayHeight - cropHeight
    displaySize = { displayWidth, displayHeight }
    boundsRef.current = { freeX, freeY }

    if (initializedFor.current !== uri) {
      initializedFor.current = uri
      const startX = -freeX * initialFocalX
      const startY = -freeY * initialFocalY
      translate.setValue({ x: startX, y: startY })
      dragStart.current = { x: startX, y: startY }
    }
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 3,
      onPanResponderGrant: () => {
        translate.stopAnimation((value) => {
          dragStart.current = value
        })
      },
      onPanResponderMove: (_, gesture) => {
        const { freeX, freeY } = boundsRef.current
        const nextX = clamp(dragStart.current.x + gesture.dx, -freeX, 0)
        const nextY = clamp(dragStart.current.y + gesture.dy, -freeY, 0)
        translate.setValue({ x: nextX, y: nextY })
      },
      onPanResponderRelease: () => {
        translate.stopAnimation((value) => {
          dragStart.current = value
        })
      },
    })
  ).current

  function handleConfirm() {
    translate.stopAnimation((value) => {
      const { freeX, freeY } = boundsRef.current
      const focalX = freeX > 0 ? clamp(-value.x / freeX, 0, 1) : 0.5
      const focalY = freeY > 0 ? clamp(-value.y / freeY, 0, 1) : 0.5
      onConfirm(focalX, focalY)
    })
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Text style={styles.title}>Drag to reposition</Text>

        <View
          style={[
            styles.cropWindow,
            {
              width: cropWidth,
              height: cropHeight,
              borderRadius: aspectRatio === 1 ? cropWidth / 2 : radius.lg,
              borderColor: accent,
            },
          ]}
          {...panResponder.panHandlers}
        >
          {naturalSize && displaySize ? (
            <Animated.Image
              source={{ uri }}
              style={{
                width: displaySize.displayWidth,
                height: displaySize.displayHeight,
                transform: translate.getTranslateTransform(),
              }}
            />
          ) : loadFailed ? (
            <View style={styles.loadError}>
              <Text style={styles.loadErrorText}>Couldn't load this image</Text>
              <Pressable onPress={retryLoad}>
                <Text style={[styles.retryText, { color: accent }]}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <ActivityIndicator color={accent} />
          )}
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.confirmBtn, { backgroundColor: accent }]}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmBtnText}>Use this crop</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: spacing.lg },
  cropWindow: {
    overflow: 'hidden',
    borderWidth: 2,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadError: { alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  loadErrorText: { color: colors.textDim, fontSize: 13, textAlign: 'center' },
  retryText: { fontSize: 14, fontWeight: '700' },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
  },
  cancelBtnText: { color: colors.textDim, fontSize: 15, fontWeight: '600' },
  confirmBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: radius.pill,
    ...shadow,
  },
  confirmBtnText: { color: colors.bg, fontSize: 15, fontWeight: '700' },
})
