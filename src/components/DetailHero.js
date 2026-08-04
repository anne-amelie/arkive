import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing } from '../theme'

export default function DetailHero({
  image,
  title,
  subtitle,
  progress,
  inLibrary,
  onBack,
  onToggleFavorite,
  onAddToList,
}) {
  return (
    <View>
      <View style={styles.imageWrap}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imageFallback]} />
        )}

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.75)']}
          style={styles.scrim}
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
                color={inLibrary ? colors.accent : colors.text}
              />
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={onAddToList}>
              <Ionicons name="add" size={22} color={colors.text} />
            </Pressable>
          </View>
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      {typeof progress === 'number' && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  imageWrap: {
    width: '100%',
    aspectRatio: 2.35,
    backgroundColor: colors.card,
  },
  image: { width: '100%', height: '100%' },
  imageFallback: { backgroundColor: colors.card },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%',
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
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
  },
  titleWrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.sm,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: '700' },
  subtitle: { color: colors.text, fontSize: 13, opacity: 0.85, marginTop: 2 },
  progressTrack: {
    height: 4,
    backgroundColor: colors.accentDim,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
})
