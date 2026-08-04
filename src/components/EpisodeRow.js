import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing } from '../theme'

export default function EpisodeRow({ episode, watched, onToggle }) {
  return (
    <Pressable style={styles.row} onPress={onToggle}>
      {episode.image ? (
        <Image source={{ uri: episode.image }} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbFallback]} />
      )}
      <Text style={styles.label} numberOfLines={2}>
        S{String(episode.seasonNumber).padStart(2, '0')} | E
        {String(episode.number).padStart(2, '0')}
        {episode.name ? `  ${episode.name}` : ''}
      </Text>
      <Ionicons
        name={watched ? 'checkmark-circle' : 'checkmark-circle-outline'}
        size={22}
        color={watched ? colors.accent : colors.textDim}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: spacing.xs,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  thumb: { width: 64, height: 44, borderRadius: 6 },
  thumbFallback: { backgroundColor: colors.cardEmpty },
  label: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 18 },
})
