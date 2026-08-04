import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing } from '../theme'

export default function SeasonSection({
  seasonNumber,
  episodeCount,
  watchedCount,
  expanded,
  onToggleExpand,
  onToggleSeason,
}) {
  const progress = episodeCount > 0 ? watchedCount / episodeCount : 0
  const allWatched = watchedCount === episodeCount && episodeCount > 0

  const label = seasonNumber === 0 ? 'Specials' : `Season ${seasonNumber}`

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.header} onPress={onToggleExpand}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{label}</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textDim}
          />
        </View>
        <Pressable hitSlop={8} onPress={() => onToggleSeason(!allWatched)}>
          <Ionicons
            name={allWatched ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={22}
            color={allWatched ? colors.accent : colors.textDim}
          />
        </Pressable>
      </Pressable>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
    paddingBottom: spacing.sm,

  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { color: colors.text, fontSize: 15, fontWeight: '600' },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentDim,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.accent },
})
