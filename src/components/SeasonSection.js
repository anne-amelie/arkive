import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, shadow } from '../theme'

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
    <View style={styles.outer}>
      <Pressable style={styles.card} onPress={onToggleExpand}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{label}</Text>
            <Text style={styles.count}>
              {watchedCount}/{episodeCount}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Pressable hitSlop={8} onPress={() => onToggleSeason(!allWatched)}>
              <Ionicons
                name={allWatched ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={22}
                color={allWatched ? colors.accent : colors.textDim}
              />
            </Pressable>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textDim}
            />
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  count: { color: colors.textDim, fontSize: 12, fontWeight: '600' },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.accentDim,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: radius.pill },
})
