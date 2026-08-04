import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useLibrary } from '../store/LibraryContext'
import HueSlider from '../components/HueSlider'
import SaturationValueSquare from '../components/SaturationValueSquare'
import { colors, spacing, radius, shadow, useAccentColors } from '../theme'

export default function SettingsScreen({ navigation }) {
  const { library, updateSettings } = useLibrary()
  const { accent } = useAccentColors()
  const hue = library.settings?.accentHue ?? 271
  const saturation = library.settings?.accentSaturation ?? 40
  const value = library.settings?.accentValue ?? 85

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Accent color</Text>
          <View style={[styles.swatch, { backgroundColor: accent }]} />
        </View>
        <Text style={styles.sectionHint}>
          Used for progress bars, active tabs, and highlights across the app.
        </Text>

        <HueSlider hue={hue} onChange={(next) => updateSettings({ accentHue: next })} />

        <View style={styles.squareWrap}>
          <SaturationValueSquare
            hue={hue}
            saturation={saturation}
            value={value}
            onChange={(nextSat, nextVal) =>
              updateSettings({ accentSaturation: nextSat, accentValue: nextVal })
            }
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  section: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  sectionHint: { color: colors.textDim, fontSize: 12, marginBottom: spacing.lg },
  squareWrap: { marginTop: spacing.lg },
})
