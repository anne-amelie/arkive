import { View, Text, StyleSheet } from 'react-native'
import ShowCard from './ShowCard'
import { colors, spacing } from '../theme'

const COLUMNS = 3

// Plain (non-virtualized) grid: used for the bounded Shows-tab shelves, which
// sit stacked inside one shared ScrollView. A virtualized FlatList (see
// CardGrid) doesn't work here — nesting it in a ScrollView of the same
// orientation breaks windowing and triggers RN's nested-list warning.
export default function Shelf({ title, shows, onSelect }) {
  if (!shows || shows.length === 0) return null

  const rows = []
  for (let i = 0; i < shows.length; i += COLUMNS) rows.push(shows.slice(i, i + COLUMNS))

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((show) => (
              <ShowCard key={show.id} show={show} onPress={() => onSelect?.(show)} />
            ))}
            {row.length < COLUMNS &&
              Array.from({ length: COLUMNS - row.length }).map((_, i) => (
                <View key={`filler-${rowIndex}-${i}`} style={{ flex: 1 }} />
              ))}
          </View>
        ))}
      </View>
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
  grid: {
    paddingHorizontal: spacing.md,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
})
