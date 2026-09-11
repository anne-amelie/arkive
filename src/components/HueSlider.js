import { useRef, useState } from 'react'
import { View, PanResponder, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { hslToHex } from '../utils/color'
import { colors, radius, shadow } from '../theme'

const TRACK_COLORS = Array.from({ length: 13 }, (_, i) => hslToHex((i * 360) / 12, 80, 55))
const THUMB_SIZE = 28

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

// A draggable hue strip (0-360°). The caller is responsible for turning the
// hue into a final color (see deriveAccent in SettingsScreen) — this only
// picks the hue, at a fixed vivid saturation/lightness for the track itself.
export default function HueSlider({ hue, onChange }) {
  const [trackWidth, setTrackWidth] = useState(0)

  // Refs so the PanResponder (created once) always reads fresh values.
  const hueRef = useRef(hue)
  hueRef.current = hue
  const trackWidthRef = useRef(trackWidth)
  trackWidthRef.current = trackWidth
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const dragStartHue = useRef(hue)

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 2,
      onPanResponderGrant: () => {
        dragStartHue.current = hueRef.current
      },
      onPanResponderMove: (_, gesture) => {
        const width = trackWidthRef.current
        if (!width) return
        const deltaHue = (gesture.dx / width) * 360
        const next = clamp(dragStartHue.current + deltaHue, 0, 360)
        onChangeRef.current(next)
      },
    })
  ).current

  const thumbLeft = trackWidth ? clamp((hue / 360) * trackWidth, 0, trackWidth) - THUMB_SIZE / 2 : 0

  return (
    <View
      style={styles.track}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      {...panResponder.panHandlers}
    >
      <LinearGradient
        colors={TRACK_COLORS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      />
      {trackWidth > 0 && (
        <View
          pointerEvents="none"
          style={[
            styles.thumb,
            { left: thumbLeft, backgroundColor: hslToHex(hue, 80, 55) },
          ]}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    height: THUMB_SIZE,
    justifyContent: 'center',
  },
  gradient: {
    height: 10,
    borderRadius: radius.pill,
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
