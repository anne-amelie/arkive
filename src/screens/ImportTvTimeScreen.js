import { useState } from 'react'
import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { useLibrary } from '../store/LibraryContext'
import { parseTvTimeFile, importMovies, importSeries } from '../utils/tvTimeImport'
import { colors, spacing, radius, shadow, useAccentColors } from '../theme'

export default function ImportTvTimeScreen({ navigation }) {
  const { importLibraryData } = useLibrary()
  const { accent } = useAccentColors()
  const [status, setStatus] = useState('idle') // idle | reading | importing | done | error
  const [progress, setProgress] = useState(null) // { phase, current, total }
  const [summary, setSummary] = useState(null) // { movies, shows }
  const [error, setError] = useState(null)

  async function handlePickFiles() {
    setError(null)
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      multiple: true,
      copyToCacheDirectory: true,
    })
    if (result.canceled) return

    setStatus('reading')
    setSummary(null)
    setProgress(null)

    try {
      const files = await Promise.all(
        result.assets.map(async (asset) => {
          const content = await FileSystem.readAsStringAsync(asset.uri)
          return JSON.parse(content)
        })
      )

      const moviesFile = files.find((f) => parseTvTimeFile(f) === 'movies')
      const seriesFile = files.find((f) => parseTvTimeFile(f) === 'series')

      if (!moviesFile && !seriesFile) {
        setError("These files don't look like a TV Time JSON export.")
        setStatus('error')
        return
      }

      setStatus('importing')

      const [moviesResult, seriesResult] = await Promise.all([
        moviesFile
          ? importMovies(moviesFile, (p) => setProgress(p))
          : Promise.resolve(null),
        seriesFile
          ? importSeries(seriesFile, (p) => setProgress(p))
          : Promise.resolve(null),
      ])

      importLibraryData({
        movies: moviesResult?.movies ?? {},
        shows: seriesResult?.shows ?? {},
      })

      setSummary({ movies: moviesResult, shows: seriesResult })
      setProgress(null)
      setStatus('done')
    } catch (e) {
      console.error(e)
      setError('Import failed. Make sure the files are valid TV Time exports.')
      setStatus('error')
    }
  }

  const busy = status === 'reading' || status === 'importing'

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Import TV Time</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Import from TV Time</Text>
          <Text style={styles.sectionHint}>
            Select the JSON file(s) from your TV Time export (movies and/or series). Each
            title is matched on TMDB and added to your library with its watch history.
          </Text>

          <Pressable
            style={[styles.button, { backgroundColor: accent }, busy && styles.buttonDisabled]}
            onPress={handlePickFiles}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={colors.bg} />
            ) : (
              <Text style={styles.buttonText}>Choose files</Text>
            )}
          </Pressable>

          {progress && (
            <Text style={styles.progressText}>
              {progress.phase === 'movies' ? 'Movies' : 'Series'}: {progress.current}/{progress.total}
            </Text>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Result</Text>

            {summary.movies && (
              <ResultBlock
                label="Movies"
                matched={summary.movies.matched}
                total={summary.movies.total}
                unmatched={summary.movies.unmatched}
              />
            )}

            {summary.shows && (
              <ResultBlock
                label="Series"
                matched={summary.shows.matched}
                total={summary.shows.total}
                unmatched={summary.shows.unmatched}
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function ResultBlock({ label, matched, total, unmatched }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <View style={styles.resultBlock}>
      <Text style={styles.resultLine}>
        {label}: {matched}/{total} imported
      </Text>
      {unmatched.length > 0 && (
        <>
          <Pressable onPress={() => setExpanded((v) => !v)}>
            <Text style={styles.resultLink}>
              {expanded ? 'Hide' : 'Show'} the {unmatched.length} not found
            </Text>
          </Pressable>
          {expanded &&
            unmatched.map((title, i) => (
              <Text key={i} style={styles.unmatchedItem}>
                • {title}
              </Text>
            ))}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  content: { paddingBottom: spacing.xl },
  section: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow,
  },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  sectionHint: { color: colors.textDim, fontSize: 12, marginBottom: spacing.lg },
  button: {
    borderRadius: radius.pill,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.bg, fontWeight: '700', fontSize: 14 },
  progressText: { color: colors.textDim, fontSize: 12, marginTop: spacing.sm, textAlign: 'center' },
  errorText: { color: '#e08080', fontSize: 12, marginTop: spacing.sm },
  resultBlock: { marginTop: spacing.sm },
  resultLine: { color: colors.text, fontSize: 14, fontWeight: '600' },
  resultLink: { color: colors.accent, fontSize: 12, marginTop: 4 },
  unmatchedItem: { color: colors.textDim, fontSize: 12, marginTop: 2 },
})
