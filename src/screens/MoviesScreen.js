import { useMemo, useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLibrary } from '../store/LibraryContext'
import ShowCard from '../components/ShowCard'
import CardGrid from '../components/CardGrid'
import { colors, spacing } from '../theme'

export default function MoviesScreen({ navigation }) {
  const { library } = useLibrary()
  const [tab, setTab] = useState('toWatch')

  const movies = Object.values(library.movies)

  const { toWatch, watched } = useMemo(() => {
    const toWatch = []
    const watched = []
    for (const movie of movies) {
      ;(movie.watched ? watched : toWatch).push({ ...movie, progress: movie.watched ? 1 : 0 })
    }
    return { toWatch, watched }
  }, [movies])

  const shown = tab === 'toWatch' ? toWatch : watched
  const goToMovie = (movie) => navigation.navigate('MovieDetail', { id: movie.id })

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Movies</Text>

      <View style={styles.tabs}>
        <Pressable onPress={() => setTab('toWatch')}>
          <Text style={[styles.tab, tab === 'toWatch' && styles.tabActive]}>To watch</Text>
        </Pressable>
        <Pressable onPress={() => setTab('watched')}>
          <Text style={[styles.tab, tab === 'watched' && styles.tabActive]}>Watched</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        {movies.length === 0 ? (
          <Text style={styles.emptyMsg}>
            Your movie list is empty. Go to "Explore" (Movies tab) to add some.
          </Text>
        ) : shown.length === 0 ? (
          <Text style={styles.emptyMsg}>Nothing here yet.</Text>
        ) : (
          <CardGrid
            items={shown}
            style={{ paddingTop: spacing.md }}
            renderItem={(movie) => (
              <ShowCard key={movie.id} show={movie} onPress={() => goToMovie(movie)} />
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: { color: colors.textDim, fontSize: 15, paddingBottom: 10 },
  tabActive: {
    color: colors.text,
    fontWeight: '600',
    borderBottomWidth: 2,
    borderBottomColor: colors.text,
  },
  emptyMsg: { color: colors.textDim, textAlign: 'center', padding: 40, fontSize: 14 },
})
