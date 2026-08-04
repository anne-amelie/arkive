import { useMemo, useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLibrary } from '../store/LibraryContext'
import Shelf from '../components/Shelf'
import { colors, spacing } from '../theme'

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

      <View style={styles.tabs}>
        <Pressable onPress={() => setTab('watchlist')}>
          <Text style={[styles.tab, tab === 'watchlist' && styles.tabActive]}>Watch List</Text>
        </Pressable>
        <Pressable onPress={() => setTab('upcoming')}>
          <Text style={[styles.tab, tab === 'upcoming' && styles.tabActive]}>Upcoming</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
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
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    color: colors.textDim,
    fontSize: 15,
    paddingBottom: 10,
  },
  tabActive: {
    color: colors.text,
    fontWeight: '600',
    borderBottomWidth: 2,
    borderBottomColor: colors.text,
  },
  emptyMsg: {
    color: colors.textDim,
    textAlign: 'center',
    padding: 40,
    fontSize: 14,
  },
})
