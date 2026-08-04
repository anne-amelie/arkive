import { useEffect, useRef, useState } from 'react'
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { searchSeries, searchMovies, artworkUrl } from '../api/tmdb'
import ShowCard from '../components/ShowCard'
import CardGrid from '../components/CardGrid'
import { colors, spacing } from '../theme'

export default function ExploreScreen({ navigation }) {
  const [mediaType, setMediaType] = useState('series') // series | movie
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | error | done
  const debounceRef = useRef(null)

  useEffect(() => {
    clearTimeout(debounceRef.current)

    if (!query.trim()) {
      setResults([])
      setStatus('idle')
      return
    }

    setStatus('loading')
    debounceRef.current = setTimeout(async () => {
      try {
        const search = mediaType === 'series' ? searchSeries : searchMovies
        const data = await search(query)
        setResults((data || []).map((item) => ({ ...item, image: artworkUrl(item.image) })))
        setStatus('done')
      } catch (err) {
        console.error(err)
        setStatus('error')
      }
    }, 400)

    return () => clearTimeout(debounceRef.current)
  }, [query, mediaType])

  const goToItem = (item) =>
    navigation.navigate(mediaType === 'series' ? 'ShowDetail' : 'MovieDetail', { id: item.id })

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Explore</Text>

      <View style={styles.tabs}>
        <Pressable onPress={() => setMediaType('series')}>
          <Text style={[styles.tab, mediaType === 'series' && styles.tabActive]}>Shows</Text>
        </Pressable>
        <Pressable onPress={() => setMediaType('movie')}>
          <Text style={[styles.tab, mediaType === 'movie' && styles.tabActive]}>Movies</Text>
        </Pressable>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textDim} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={mediaType === 'series' ? 'Search for a show...' : 'Search for a movie...'}
          placeholderTextColor={colors.textDim}
          style={styles.searchInput}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')}>
            <Ionicons name="close" size={18} color={colors.textDim} />
          </Pressable>
        )}
      </View>

      {status === 'loading' && <Text style={styles.emptyMsg}>Searching...</Text>}
      {status === 'error' && (
        <Text style={styles.emptyMsg}>
          Couldn't reach TMDb. Check your API key in the .env file.
        </Text>
      )}
      {status === 'done' && results.length === 0 && (
        <Text style={styles.emptyMsg}>No results for "{query}".</Text>
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <CardGrid
          items={results}
          style={{ paddingTop: spacing.sm }}
          renderItem={(item) => (
            <ShowCard
              key={item.id}
              show={item}
              showProgress={false}
              onPress={() => goToItem(item)}
            />
          )}
        />
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
    paddingBottom: spacing.sm,
  },
  tab: { color: colors.textDim, fontSize: 15, paddingBottom: 6 },
  tabActive: {
    color: colors.text,
    fontWeight: '600',
    borderBottomWidth: 2,
    borderBottomColor: colors.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 16 },
  emptyMsg: { color: colors.textDim, textAlign: 'center', padding: 30, fontSize: 14 },
})
