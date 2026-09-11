import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, shadow, useAccentColors } from '../theme'

function formatAirDate(dateString) {
  if (!dateString) return null
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function EpisodeRow({ episode, watched, onToggle }) {
  const { accent } = useAccentColors()
  const airDate = formatAirDate(episode.airDate)

  return (
    <Pressable style={styles.row} onPress={onToggle}>
      <View style={[styles.thumbWrap, watched && styles.thumbWatched]}>
        {episode.image ? (
          <Image source={{ uri: episode.image }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbFallback]} />
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>E{String(episode.number).padStart(2, '0')}</Text>
          </View>
          {airDate && <Text style={styles.airDate}>{airDate}</Text>}
        </View>
        <Text style={[styles.name, watched && styles.nameWatched]} numberOfLines={2}>
          {episode.name || 'Untitled'}
        </Text>
      </View>

      <Ionicons
        name={watched ? 'checkmark-circle' : 'checkmark-circle-outline'}
        size={24}
        color={watched ? accent : colors.textDim}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.xs,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    ...shadow,
  },
  thumbWrap: { borderRadius: radius.sm, overflow: 'hidden' },
  thumbWatched: { opacity: 0.5 },
  thumb: { width: 88, height: 56, borderRadius: radius.sm },
  thumbFallback: { backgroundColor: colors.cardEmpty },
  info: { flex: 1, gap: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    backgroundColor: colors.chip,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { color: colors.textDim, fontSize: 11, fontWeight: '700' },
  airDate: { color: colors.textDim, fontSize: 11 },
  name: { color: colors.text, fontSize: 14, fontWeight: '600', lineHeight: 19 },
  nameWatched: { color: colors.textDim, fontWeight: '400' },
})
