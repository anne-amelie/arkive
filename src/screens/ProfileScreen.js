import { useMemo } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useLibrary } from '../store/LibraryContext'
import { colors, spacing } from '../theme'

export default function ProfileScreen() {
  const { library } = useLibrary()

  const stats = useMemo(() => {
    const shows = Object.values(library.shows)
    const showsWatching = shows.filter(
      (s) => Object.keys(s.watchedEpisodes || {}).length > 0
    ).length
    return { totalShows: shows.length, showsWatching }
  }, [library])

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <LinearGradient colors={['#4a3b63', '#2b2440']} style={styles.header}>
          <View style={styles.headerOverlay}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={22} color="#444" />
            </View>
            <View>
              <Text style={styles.username}>username</Text>
              <Pressable style={styles.editBadge}>
                <Text style={styles.editBadgeText}>EDIT</Text>
              </Pressable>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statsStack}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalShows}</Text>
            <Text style={styles.statLabel}>SHOWS IN YOUR LIBRARY</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.showsWatching}</Text>
            <Text style={styles.statLabel}>CURRENTLY WATCHING</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 220, justifyContent: 'flex-end' },
  headerOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#d0d0d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: { color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 4 },
  editBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  editBadgeText: { color: colors.text, fontSize: 11, letterSpacing: 0.6 },
  statsStack: { padding: spacing.md, gap: 14 },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  statValue: { color: colors.text, fontSize: 26, fontWeight: '700', marginBottom: 4 },
  statLabel: { color: colors.textDim, fontWeight: '600', letterSpacing: 0.5, fontSize: 12 },
})
