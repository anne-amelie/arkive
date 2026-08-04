import { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Slider from '@react-native-community/slider'
import { Ionicons } from '@expo/vector-icons'
import { getSeriesExtended, artworkUrl } from '../api/tvdb'
import { useLibrary } from '../store/LibraryContext'
import { colors, spacing } from '../theme'

export default function ShowDetailScreen({ route, navigation }) {
  const { id } = route.params
  const { library, addToWatchlist, removeFromWatchlist, setProgress } = useLibrary()
  const [series, setSeries] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    getSeriesExtended(id)
      .then((data) => {
        if (!cancelled) {
          setSeries(data)
          setStatus('done')
        }
      })
      .catch(() => !cancelled && setStatus('error'))
    return () => {
      cancelled = true
    }
  }, [id])

  const inLibrary = Boolean(library.shows[id])
  const progress = library.shows[id]?.progress ?? 0

  function toggleWatchlist() {
    if (inLibrary) {
      removeFromWatchlist(id)
    } else {
      addToWatchlist({ id, name: series?.name || 'Série', image: artworkUrl(series?.image) })
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={colors.text} />
          <Text style={styles.backText}>Retour</Text>
        </Pressable>

        {status === 'loading' && <Text style={styles.emptyMsg}>Chargement...</Text>}
        {status === 'error' && (
          <Text style={styles.emptyMsg}>Impossible de charger cette série depuis TheTVDB.</Text>
        )}

        {series && (
          <>
            {series.image && (
              <Image source={{ uri: artworkUrl(series.image) }} style={styles.poster} />
            )}
            <Text style={styles.name}>{series.name}</Text>
            {series.overview && <Text style={styles.overview}>{series.overview}</Text>}

            <Pressable
              style={[styles.cta, inLibrary ? styles.ctaSecondary : styles.ctaPrimary]}
              onPress={toggleWatchlist}
            >
              <Text style={inLibrary ? styles.ctaSecondaryText : styles.ctaPrimaryText}>
                {inLibrary ? 'Retirer de ma watchlist' : 'Ajouter à ma watchlist'}
              </Text>
            </Pressable>

            {inLibrary && (
              <View style={{ marginTop: spacing.md }}>
                <Text style={styles.progressLabel}>Progression : {Math.round(progress * 100)}%</Text>
                <Slider
                  minimumValue={0}
                  maximumValue={1}
                  value={progress}
                  onSlidingComplete={(v) => setProgress(id, v)}
                  minimumTrackTintColor={colors.accent}
                  maximumTrackTintColor={colors.card}
                  thumbTintColor={colors.accent}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  backText: { color: colors.text, fontSize: 15 },
  emptyMsg: { color: colors.textDim, textAlign: 'center', padding: 40, fontSize: 14 },
  poster: { width: '100%', aspectRatio: 16 / 9, borderRadius: 12, marginBottom: spacing.md },
  name: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 8 },
  overview: { color: colors.textDim, fontSize: 15, lineHeight: 22 },
  cta: { marginTop: spacing.md, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  ctaPrimary: { backgroundColor: colors.accent },
  ctaPrimaryText: { color: '#1a1a10', fontWeight: '700', fontSize: 15 },
  ctaSecondary: { backgroundColor: colors.card },
  ctaSecondaryText: { color: colors.text, fontWeight: '700', fontSize: 15 },
  progressLabel: { color: colors.textDim, fontSize: 13, marginBottom: 4 },
})
