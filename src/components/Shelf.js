import { View, Text, StyleSheet } from 'react-native'
import ShowCard from './ShowCard'
import CardGrid from './CardGrid'
import { colors, spacing } from '../theme'

export default function Shelf({ title, shows, onSelect }) {
  if (!shows || shows.length === 0) return null

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <CardGrid
        items={shows}
        renderItem={(show) => (
          <ShowCard key={show.id} show={show} onPress={() => onSelect?.(show)} />
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.md + 2,
  },
  title: {
    color: colors.textDim,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
})
