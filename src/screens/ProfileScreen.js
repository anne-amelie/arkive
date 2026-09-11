import { useMemo } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useLibrary } from '../store/LibraryContext'
import { formatRuntime } from '../api/tmdb'
import FocalImage from '../components/FocalImage'
import { colors, spacing, radius, shadow, tabBarClearance, useAccentColors } from '../theme'

export default function ProfileScreen({ navigation }) {
  const { library } = useLibrary()
  const { accent, accentSoft } = useAccentColors()
  const backgroundImage = library.profile?.backgroundImage

  const stats = useMemo(() => {
    const shows = Object.values(library.shows)
    const movies = Object.values(library.movies)

    const episodesWatched = shows.reduce(
      (sum, show) => sum + Object.keys(show.watchedEpisodes || {}).length,
      0
    )
    const moviesWatched = movies.filter((movie) => movie.watched).length

    const episodeMinutes = shows.reduce((sum, show) => {
      const runtimes = show.episodeRuntimes || {}
      const watchedIds = Object.keys(show.watchedEpisodes || {})
      return sum + watchedIds.reduce((epSum, epId) => epSum + (runtimes[epId] || 0), 0)
    }, 0)
    const movieMinutes = movies.reduce(
      (sum, movie) => sum + (movie.watched ? movie.durationMinutes || 0 : 0),
      0
    )

    return {
      episodesWatched,
      moviesWatched,
      watchTime: formatRuntime(episodeMinutes + movieMinutes) || '0min',
    }
  }, [library.shows, library.movies])

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: tabBarClearance }}>
        <View style={styles.header}>
          {backgroundImage ? (
            <FocalImage
              uri={backgroundImage.uri}
              focalX={backgroundImage.focalX}
              focalY={backgroundImage.focalY}
              style={styles.headerImage}
            />
          ) : (
            <LinearGradient colors={['#3a2d47', colors.bg]} style={styles.headerImage} />
          )}
          <LinearGradient
            colors={['transparent', colors.bg]}
            style={styles.headerScrim}
            pointerEvents="none"
          />
          <Pressable
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Settings')}
            hitSlop={8}
          >
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            {library.profile?.avatarImage ? (
              <FocalImage
                uri={library.profile.avatarImage.uri}
                focalX={library.profile.avatarImage.focalX}
                focalY={library.profile.avatarImage.focalY}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons name="person" size={28} color={colors.textDim} />
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{library.profile?.username || 'username'}</Text>
            <Pressable
              style={[styles.editBadge, { backgroundColor: accentSoft }]}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={[styles.editBadgeText, { color: accent }]}>Edit profile</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.statsStack}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.watchTime}</Text>
            <Text style={styles.statLabel}>WATCH TIME</Text>
          </View>

          <View style={[styles.statCard, styles.splitCard]}>
            <View style={styles.splitHalf}>
              <Text style={styles.statValue}>{stats.episodesWatched}</Text>
              <Text style={styles.statLabel}>EPISODES</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.splitHalf}>
              <Text style={styles.statValue}>{stats.moviesWatched}</Text>
              <Text style={styles.statLabel}>MOVIES</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 170 },
  headerImage: { width: '100%', height: '100%' },
  headerScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
    paddingHorizontal: spacing.md,
    marginTop: -32,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  avatarImage: { width: '100%', height: '100%' },
  profileInfo: { paddingBottom: 6 },
  username: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  editBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  editBadgeText: { fontSize: 12, fontWeight: '600' },
  settingsBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
  },
  statsStack: { padding: spacing.md, paddingTop: spacing.xl, gap: spacing.lg },
  statCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    paddingVertical: 22,
    alignItems: 'center',
    gap: 7,
    ...shadow,
  },
  splitCard: { flexDirection: 'row', paddingVertical: 19 },
  splitHalf: { flex: 1, alignItems: 'center', gap: 7 },
  divider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border },
  statValue: { color: colors.text, fontSize: 23, fontWeight: '700' },
  statLabel: {
    color: colors.textDim,
    fontWeight: '600',
    letterSpacing: 0.5,
    fontSize: 11,
    textAlign: 'center',
  },
})
