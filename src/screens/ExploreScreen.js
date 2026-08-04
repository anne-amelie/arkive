import { useEffect, useRef, useState } from 'react'
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { searchSeries, artworkUrl } from '../api/tvdb'
import ShowCard from '../components/ShowCard'
import { colors, spacing } from '../theme'

export default function ExploreScreen({ navigation }) {
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
        const data = await searchSeries(query)
        setResults(
          (data || []).map((item) => ({
            id: item.tvdb_id || item.id,
            name: item.name || item.translations?.eng || 'Sans titre',
            image: artworkUrl(item.image_url || item.image),
          }))
        )
        setStatus('done')
      } catch (err) {
        console.error(err)
        setStatus('error')
      }
    }, 400)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Explore</Text>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textDim} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher une série..."
          placeholderTextColor={colors.textDim}
          style={styles.searchInput}
          autoFocus
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')}>
            <Ionicons name="close" size={18} color={colors.textDim} />
          </Pressable>
        )}
      </View>

      {status === 'loading' && <Text style={styles.emptyMsg}>Recherche en cours...</Text>}
      {status === 'error' && (
        <Text style={styles.emptyMsg}>
          Impossible de contacter TheTVDB. Vérifie ta clé API dans le fichier .env.
        </Text>
      )}
      {status === 'done' && results.length === 0 && (
        <Text style={styles.emptyMsg}>Aucun résultat pour "{query}".</Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        numColumns={3}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={{ gap: 10, padding: spacing.md }}
        renderItem={({ item }) => (
          <ShowCard
            show={item}
            showProgress={false}
            onPress={() => navigation.navigate('ShowDetail', { id: item.id })}
          />
        )}
      />
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
