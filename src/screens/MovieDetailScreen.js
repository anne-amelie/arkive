import { useEffect, useState } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { getMovieExtended, artworkUrl, formatRuntime } from '../api/tmdb'
import { useLibrary } from '../store/LibraryContext'
import DetailHero from '../components/DetailHero'
import AddToListSheet from '../components/AddToListSheet'
import { colors, spacing, radius, shadow } from '../theme'

export default function MovieDetailScreen({ route, navigation }) {
  const { id } = route.params
  const { library, addMovieToWatchlist, removeMovieFromWatchlist, toggleMovieWatched } =
    useLibrary()
  const [movie, setMovie] = useState(null)
  const [status, setStatus] = useState('loading')
  const [listSheetOpen, setListSheetOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    getMovieExtended(id)
      .then((data) => {
        if (!cancelled) {
          setMovie(data)
          setStatus('done')
        }
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const inLibrary = Boolean(library.movies[id])
  const watched = Boolean(library.movies[id]?.watched)
  const duration = formatRuntime(movie?.runtime)

  function toggleWatchlist() {
    if (inLibrary) {
      removeMovieFromWatchlist(id)
    } else {
      addMovieToWatchlist({
        id,
        name: movie?.name || 'Movie',
        image: artworkUrl(movie?.image),
        duration,
      })
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        {status === 'loading' && <Text style={styles.emptyMsg}>Loading...</Text>}
        {status === 'error' && (
          <Text style={styles.emptyMsg}>Couldn't load this movie from TMDb.</Text>
        )}

        {movie && (
          <>
            <DetailHero
              backdrop={movie.backdrop ? artworkUrl(movie.backdrop, 'w780') : null}
              poster={movie.image ? artworkUrl(movie.image) : null}
              title={movie.name}
              year={movie.year}
              rating={movie.rating}
              genres={movie.genres}
              subtitle={duration}
              progress={inLibrary ? (watched ? 1 : 0) : null}
              inLibrary={inLibrary}
              onBack={() => navigation.goBack()}
              onToggleFavorite={toggleWatchlist}
              onAddToList={() => setListSheetOpen(true)}
            />

            <View style={{ paddingHorizontal: spacing.md }}>
              {inLibrary && (
                <Pressable style={styles.watchedRow} onPress={() => toggleMovieWatched(id)}>
                  <Text style={styles.watchedLabel}>Mark as watched</Text>
                  <Ionicons
                    name={watched ? 'checkmark-circle' : 'checkmark-circle-outline'}
                    size={22}
                    color={watched ? colors.accent : colors.textDim}
                  />
                </Pressable>
              )}

              {movie.overview && (
                <View style={styles.synopsisCard}>
                  <Text style={styles.sectionTitle}>Synopsis</Text>
                  <Text style={styles.overview}>{movie.overview}</Text>
                </View>
              )}
            </View>

            <AddToListSheet
              visible={listSheetOpen}
              onClose={() => setListSheetOpen(false)}
              id={id}
              type="movie"
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  emptyMsg: { color: colors.textDim, textAlign: 'center', padding: 40, fontSize: 14 },
  synopsisCard: {
    marginTop: spacing.md,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow,
  },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 8 },
  overview: { color: colors.textDim, fontSize: 14, lineHeight: 21 },
  watchedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    ...shadow,
  },
  watchedLabel: { color: colors.text, fontSize: 15, fontWeight: '600' },
})
