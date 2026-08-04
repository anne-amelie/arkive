import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius, shadow, useAccentColors } from '../theme'

export default function DetailHero({
  backdrop,
  poster,
  title,
  subtitle,
  year,
  rating,
  genres,
  progress,
  inLibrary,
  onBack,
  onToggleFavorite,
  onAddToList,
}) {
  const { accent, accentDim, accentSoft } = useAccentColors()
  const backdropSource = backdrop || poster

  return (
    <View>
      <View style={styles.backdropWrap}>
        {backdropSource ? (
          <Image source={{ uri: backdropSource }} style={styles.backdrop} resizeMode="cover" />
        ) : (
          <View style={[styles.backdrop, styles.backdropFallback]} />
        )}

        <LinearGradient
          colors={['rgba(0,0,0,0.55)', 'transparent']}
          style={styles.topScrim}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['transparent', colors.bg]}
          style={styles.bottomScrim}
          pointerEvents="none"
        />

        <View style={styles.topRow}>
          <Pressable style={styles.iconBtn} onPress={onBack}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable style={styles.iconBtn} onPress={onToggleFavorite}>
              <Ionicons
                name={inLibrary ? 'heart' : 'heart-outline'}
                size={19}
                color={inLibrary ? accent : colors.text}
              />
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={onAddToList}>
              <Ionicons name="add" size={22} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.posterWrap}>
          {poster ? (
            <Image source={{ uri: poster }} style={styles.poster} resizeMode="cover" />
          ) : (
            <View style={[styles.poster, styles.posterFallback]} />
          )}
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          <View style={styles.metaRow}>
            {typeof rating === 'number' && rating > 0 && (
              <View style={[styles.ratingBadge, { backgroundColor: accentSoft }]}>
                <Ionicons name="star" size={12} color={accent} />
                <Text style={[styles.ratingText, { color: accent }]}>{rating.toFixed(1)}</Text>
              </View>
            )}
            {year && <Text style={styles.metaText}>{year}</Text>}
            {subtitle && <Text style={styles.metaText}>{subtitle}</Text>}
          </View>

          {genres?.length > 0 && (
            <View style={styles.genreRow}>
              {genres.slice(0, 3).map((genre) => (
                <View key={genre} style={styles.chip}>
                  <Text style={styles.chipText}>{genre}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {typeof progress === 'number' && (
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>{Math.round(progress * 100)}% watched</Text>
          <View style={[styles.progressTrack, { backgroundColor: accentDim }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(progress * 100)}%`, backgroundColor: accent },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  )
}

const POSTER_WIDTH = 92

const styles = StyleSheet.create({
  backdropWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.card,
  },
  backdrop: { width: '100%', height: '100%' },
  backdropFallback: { backgroundColor: colors.card },
  topScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '40%',
  },
  bottomScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  topRow: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  contentRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginTop: -48,
    gap: spacing.md,
  },
  posterWrap: {
    width: POSTER_WIDTH,
    aspectRatio: 2 / 3,
    borderRadius: radius.md,
    borderWidth: 3,
    borderColor: colors.bg,
    overflow: 'hidden',
    backgroundColor: colors.card,
    ...shadow,
  },
  poster: { width: '100%', height: '100%' },
  posterFallback: { backgroundColor: colors.cardEmpty },
  infoCol: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xs,
  },
  title: { color: colors.text, fontSize: 21, fontWeight: '700', lineHeight: 26 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  ratingText: { fontSize: 12, fontWeight: '700' },
  metaText: { color: colors.textDim, fontSize: 13 },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: {
    backgroundColor: colors.chip,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  chipText: { color: colors.textDim, fontSize: 11, fontWeight: '600' },
  progressSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: 6,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: radius.pill },
  progressLabel: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
})
