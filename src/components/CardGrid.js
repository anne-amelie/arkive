import { View, StyleSheet } from 'react-native'
import { spacing } from '../theme'

// Fixed-column grid: even when a row isn't full (e.g. a single item), invisible
// cells fill the gap so card size stays consistent.
export default function CardGrid({ items, columns = 3, renderItem, style }) {
  const rows = []
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns))
  }

  return (
    <View style={[styles.wrap, style]}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item) => renderItem(item))}
          {row.length < columns &&
            Array.from({ length: columns - row.length }).map((_, i) => (
              <View key={`filler-${rowIndex}-${i}`} style={{ flex: 1 }} />
            ))}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.md, gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
})
