import { Platform } from 'react-native'
import { useLibrary } from '../store/LibraryContext'
import { darkenHex, hexToRgba, hsvToHex } from '../utils/color'

export const colors = {
  bg: '#0e0e10',
  bgElevated: '#1a1a1d',
  card: '#3f3f42',
  cardEmpty: '#2a2a2d',
  text: '#f5f5f4',
  textDim: '#9a9a9e',
  accent: '#c3aed6',
  accentDim: '#5f5270',
  accentSoft: 'rgba(195,174,214,0.18)',
  border: '#232326',
  overlay: 'rgba(0,0,0,0.4)',
  chip: 'rgba(255,255,255,0.08)',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
}

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
}

// Height of the floating tab bar + its bottom offset + a bit of breathing room.
// Scrollable tab screens should add this much bottom padding so content never
// ends up hidden behind the floating bar.
export const tabBarClearance = 132

export const shadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  android: { elevation: 6 },
  default: {},
})

// The accent color is user-configurable (see SettingsScreen). Everything else
// in `colors` is fixed, so only these three derived values need to be reactive.
export function useAccentColors() {
  const { library } = useLibrary()
  const hue = library.settings?.accentHue ?? 271
  const saturation = library.settings?.accentSaturation ?? 40
  const value = library.settings?.accentValue ?? 85
  const accent = hsvToHex(hue, saturation, value)
  return {
    accent,
    accentDim: darkenHex(accent, 0.5),
    accentSoft: hexToRgba(accent, 0.18),
  }
}
