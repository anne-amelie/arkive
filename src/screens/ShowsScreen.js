import { useMemo, useState } from 'react'
import { Text, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLibrary } from '../store/LibraryContext'
import Shelf from '../components/Shelf'
import SegmentedTabs from '../components/SegmentedTabs'
import { colors, spacing, tabBarClearance } from '../theme'

const TAB_OPTIONS = [
  { key: 'watchlist', label: 'Watch List' },
  { key: 'upcoming', label: 'Upcoming' },
]

const STALE_DAYS = 21

function withProgress(show) {
  const watchedCount = Object.keys(show.watchedEpisodes || {}).length
  const progress = show.totalEpisodes ? watchedCount / show.totalEpisodes : undefined
  return { ...show, progress, watchedCount }
}

export default function ShowsScreen({ navigation }) {
  const { library } = useLibrary()
  const [tab, setTab] = useState('watchlist')

  const shows = Object.values(library.shows)

  const { watchNext, staleWatch, notStarted } = useMemo(() => {
    const now = Date.now()
    const watchNext = []
    const staleWatch = []
    const notStarted = []
    for (const show of shows) {
      const withProg = withProgress(show)
      if (withProg.watchedCount === 0) {
        notStarted.push(withProg)
      } else if (show.lastWatchedAt && now - show.lastWatchedAt > STALE_DAYS * 86400000) {
        staleWatch.push(withProg)
      } else {
        watchNext.push(withProg)
      }
    }
    return { watchNext, staleWatch, notStarted }
  }, [shows])

  const goToShow = (show) => navigation.navigate('ShowDetail', { id: show.id })

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Shows</Text>

      <SegmentedTabs
        options={TAB_OPTIONS}
        value={tab}
        onChange={setTab}
        style={{ marginBottom: spacing.md }}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: tabBarClearance }}>
        {tab === 'watchlist' ? (
          shows.length === 0 ? (
            <Text style={styles.emptyMsg}>
              Your watchlist is empty. Go to "Explore" to add some shows.
            </Text>
          ) : (
            <>
              <Shelf title="Watch Next" shows={watchNext} onSelect={goToShow} />
              <Shelf title="Haven't watched in a while" shows={staleWatch} onSelect={goToShow} />
              <Shelf title="Haven't started" shows={notStarted} onSelect={goToShow} />
            </>
          )
        ) : (
          <Text style={styles.emptyMsg}>
            Upcoming episodes will show up here once we're connected to TMDb's air dates.
          </Text>
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
  emptyMsg: {
    color: colors.textDim,
    textAlign: 'center',
    padding: 40,
    fontSize: 14,
  },
})
