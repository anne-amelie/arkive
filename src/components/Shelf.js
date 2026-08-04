import { View, Text, StyleSheet } from 'react-native'
import ShowCard from './ShowCard'
import { colors, spacing } from '../theme'

export default function Shelf({ title, shows, onSelect }) {
  if (!shows || shows.length === 0) return null

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        {shows.map((show) => (
          <ShowCard key={show.id} show={show} onPress={() => onSelect?.(show)} />
        ))}
        {/* Complète la rangée pour garder des cartes bien alignées si < 3 items */}
        {shows.length < 3 &&
          Array.from({ length: 3 - shows.length }).map((_, i) => (
            <View key={`filler-${i}`} style={{ flex: 1 }} />
          ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md + 2,
  },
  title: {
    color: colors.textDim,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
})
