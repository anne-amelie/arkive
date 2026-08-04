import { View, Image, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../theme'

export default function ShowCard({ show, onPress, showProgress = true }) {
  if (!show) return null

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {show.image ? (
        <Image source={{ uri: show.image }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.emptyAdd}>
          <Ionicons name="add" size={26} color={colors.textDim} />
        </View>
      )}
      {showProgress && typeof show.progress === 'number' && show.progress > 0 && (
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${Math.min(100, Math.round(show.progress * 100))}%` }]}
          />
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 2 / 3,
    borderRadius: 10,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emptyAdd: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardEmpty,
  },
  progressTrack: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
})
