import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing } from '../theme'

export default function MoviesScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Movies</Text>
      <View style={{ padding: spacing.md }}>
        <Text style={styles.msg}>
          Section films à venir — branchable sur /search?type=movie et /movies/{'{'}id{'}'}/extended
          de TheTVDB, sur le même principe que les séries.
        </Text>
      </View>
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
  msg: { color: colors.textDim, textAlign: 'center', fontSize: 14 },
})
