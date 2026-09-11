import { useRef, useState } from 'react'
import { View, PanResponder, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { hsvToHex } from '../utils/color'
import { colors, radius, shadow } from '../theme'

const THUMB_SIZE = 24

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

// Classic saturation/value picker square for a fixed hue: left→right is
// saturation (white → vivid hue), top→bottom is value (hue → black).
export default function SaturationValueSquare({ hue, saturation, value, onChange }) {
  const [size, setSize] = useState(0)

  // Refs so the PanResponder (created once) always reads fresh values.
  const sizeRef = useRef(size)
  sizeRef.current = size
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const dragOrigin = useRef({ x: 0, y: 0 })

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        dragOrigin.current = { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY }
        updateFromTouch(dragOrigin.current.x, dragOrigin.current.y)
      },
      onPanResponderMove: (_, gesture) => {
        updateFromTouch(dragOrigin.current.x + gesture.dx, dragOrigin.current.y + gesture.dy)
      },
    })
  ).current

  function updateFromTouch(x, y) {
    const s = sizeRef.current
    if (!s) return
    const nextSat = clamp((x / s) * 100, 0, 100)
    const nextVal = clamp(100 - (y / s) * 100, 0, 100)
    onChangeRef.current(nextSat, nextVal)
  }

  const hueColor = hsvToHex(hue, 100, 100)
  const thumbLeft = size ? clamp((saturation / 100) * size, 0, size) - THUMB_SIZE / 2 : 0
  const thumbTop = size ? clamp((1 - value / 100) * size, 0, size) - THUMB_SIZE / 2 : 0

  return (
    <View
      style={styles.square}
      onLayout={(e) => setSize(e.nativeEvent.layout.width)}
      {...panResponder.panHandlers}
    >
      <LinearGradient
        colors={['#ffffff', hueColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {size > 0 && (
        <View
          pointerEvents="none"
          style={[
            styles.thumb,
            {
              left: thumbLeft,
              top: thumbTop,
              backgroundColor: hsvToHex(hue, saturation, value),
            },
          ]}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  square: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 3,
    borderColor: colors.text,
    ...shadow,
  },
})
