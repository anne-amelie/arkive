import { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, SectionList, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getSeriesExtended, getAllSeriesEpisodes, artworkUrl } from '../api/tmdb'
import { useLibrary } from '../store/LibraryContext'
import DetailHero from '../components/DetailHero'
import SeasonSection from '../components/SeasonSection'
import EpisodeRow from '../components/EpisodeRow'
import AddToListSheet from '../components/AddToListSheet'
import { colors, spacing } from '../theme'

export default function ShowDetailScreen({ route, navigation }) {
  const { id } = route.params
  const {
    library,
    addToWatchlist,
    removeFromWatchlist,
    toggleEpisodeWatched,
    setSeasonWatched,
    setShowEpisodeCount,
  } = useLibrary()
  const [series, setSeries] = useState(null)
  const [episodes, setEpisodes] = useState([])
  const [status, setStatus] = useState('loading')
  const [listSheetOpen, setListSheetOpen] = useState(false)
  const [expandedSeason, setExpandedSeason] = useState(null)
  const sectionListRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    getSeriesExtended(id)
      .then(async (seriesData) => {
        if (cancelled) return
        setSeries(seriesData)
        const episodesData = await getAllSeriesEpisodes(id, seriesData.seasons)
        if (!cancelled) {
          setEpisodes(episodesData)
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

  const seasons = useMemo(() => {
    const bySeason = new Map()
    for (const ep of episodes) {
      const num = ep.seasonNumber ?? 0
      if (!bySeason.has(num)) bySeason.set(num, [])
      bySeason.get(num).push(ep)
    }
    return [...bySeason.entries()]
      .sort(([a], [b]) => a - b)
      .map(([seasonNumber, eps]) => ({
        seasonNumber,
        episodes: eps.sort((a, b) => (a.number ?? 0) - (b.number ?? 0)),
      }))
  }, [episodes])

  const seasonCount = seasons.filter((s) => s.seasonNumber > 0).length || seasons.length

  const inLibrary = Boolean(library.shows[id])
  const watchedEpisodes = library.shows[id]?.watchedEpisodes ?? {}

  useEffect(() => {
    if (inLibrary && episodes.length > 0) setShowEpisodeCount(id, episodes.length)
  }, [inLibrary, episodes.length, id, setShowEpisodeCount])

  const progress =
    episodes.length > 0
      ? episodes.filter((ep) => watchedEpisodes[ep.id]).length / episodes.length
      : 0

  function toggleWatchlist() {
    if (inLibrary) {
      removeFromWatchlist(id)
    } else {
      addToWatchlist({ id, name: series?.name || 'Show', image: artworkUrl(series?.image) })
    }
  }

  const sections = seasons.map((season) => ({
    key: String(season.seasonNumber),
    seasonNumber: season.seasonNumber,
    episodes: season.episodes,
    data: season.seasonNumber === expandedSeason ? season.episodes : [],
  }))

  useEffect(() => {
    if (expandedSeason === null) return
    const sectionIndex = sections.findIndex((s) => s.seasonNumber === expandedSeason)
    if (sectionIndex === -1 || sections[sectionIndex].episodes.length === 0) return
    sectionListRef.current?.scrollToLocation({
      sectionIndex,
      itemIndex: 0,
      viewPosition: 0,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedSeason])

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {status === 'loading' && <Text style={styles.emptyMsg}>Loading...</Text>}
      {status === 'error' && (
        <Text style={styles.emptyMsg}>Couldn't load this show from TMDb.</Text>
      )}

      {series && (
        <>
          <SectionList
            ref={sectionListRef}
            sections={sections}
            keyExtractor={(episode) => String(episode.id)}
            stickySectionHeadersEnabled
            contentContainerStyle={{ paddingBottom: spacing.xl }}
            ListHeaderComponent={
              <>
                <DetailHero
                  image={series.image ? artworkUrl(series.image) : null}
                  title={series.name}
                  subtitle={
                    seasonCount > 0 ? `${seasonCount} season${seasonCount > 1 ? 's' : ''}` : null
                  }
                  progress={inLibrary ? progress : null}
                  inLibrary={inLibrary}
                  onBack={() => navigation.goBack()}
                  onToggleFavorite={toggleWatchlist}
                  onAddToList={() => setListSheetOpen(true)}
                />
                {series.overview && (
                  <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
                    <Text style={styles.sectionTitle}>Synopsis</Text>
                    <Text style={styles.overview}>{series.overview}</Text>
                  </View>
                )}
              </>
            }
            renderSectionHeader={({ section }) => (
              <SeasonSection
                seasonNumber={section.seasonNumber}
                episodeCount={section.episodes.length}
                watchedCount={section.episodes.filter((ep) => watchedEpisodes[ep.id]).length}
                expanded={section.seasonNumber === expandedSeason}
                onToggleExpand={() =>
                  setExpandedSeason((prev) =>
                    prev === section.seasonNumber ? null : section.seasonNumber
                  )
                }
                onToggleSeason={(watched) =>
                  setSeasonWatched(
                    id,
                    section.episodes.map((ep) => ep.id),
                    watched
                  )
                }
              />
            )}
            renderItem={({ item }) => (
              <EpisodeRow
                episode={item}
                watched={Boolean(watchedEpisodes[item.id])}
                onToggle={() => toggleEpisodeWatched(id, item.id)}
              />
            )}
          />

          <AddToListSheet
            visible={listSheetOpen}
            onClose={() => setListSheetOpen(false)}
            id={id}
            type="show"
          />
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  emptyMsg: { color: colors.textDim, textAlign: 'center', padding: 40, fontSize: 14 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 8 },
  overview: { color: colors.textDim, fontSize: 14, lineHeight: 21 },
})
