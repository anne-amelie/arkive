import { useEffect, useRef, useState } from 'react'
import { Animated, Pressable, Text, View, StyleSheet } from 'react-native'
import { colors, spacing } from '../theme'

export default function SegmentedTabs({ options, value, onChange, style }) {
  const [layouts, setLayouts] = useState({})
  const translateX = useRef(new Animated.Value(0)).current
  const width = useRef(new Animated.Value(0)).current
  const hasMeasured = useRef(false)

  const activeLayout = layouts[value]

  useEffect(() => {
    if (!activeLayout) return

    if (!hasMeasured.current) {
      hasMeasured.current = true
      translateX.setValue(activeLayout.x)
      width.setValue(activeLayout.width)
      return
    }

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: activeLayout.x,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(width, {
        toValue: activeLayout.width,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start()
  }, [activeLayout, translateX, width])

  return (
    <View style={[styles.track, style]}>
      {options.map((option) => (
        <Pressable
          key={option.key}
          style={styles.tabItem}
          onPress={() => onChange(option.key)}
          onLayout={(e) => {
            const { x, width: w } = e.nativeEvent.layout
            setLayouts((prev) => ({ ...prev, [option.key]: { x, width: w } }))
          }}
        >
          <Text style={[styles.tabLabel, value === option.key && styles.tabLabelActive]}>
            {option.label}
          </Text>
        </Pressable>
      ))}

      <Animated.View
        pointerEvents="none"
        style={[styles.indicatorPosition, { transform: [{ translateX }] }]}
      >
        <Animated.View style={[styles.indicatorBar, { width }]} />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: spacing.md,
  },
  tabItem: {
    paddingBottom: 10,
  },
  tabLabel: { color: colors.textDim, fontSize: 15 },
  tabLabelActive: { color: colors.text, fontWeight: '700' },
  indicatorPosition: {
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  indicatorBar: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.text,
  },
})
