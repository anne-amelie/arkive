import { FlatList, View, StyleSheet } from 'react-native'
import { spacing } from '../theme'

const COLUMNS = 3

// Virtualized poster grid: FlatList only mounts/decodes rows near the visible
// viewport instead of every image at once, which is what made scrolling with
// a large library slow on real devices (a plain View grid inside a ScrollView
// has no windowing at all).
export default function CardGrid({ items, renderItem, style }) {
  const remainder = items.length % COLUMNS
  const data = remainder === 0 ? items : [...items, ...Array(COLUMNS - remainder).fill(null)]

  return (
    <FlatList
      data={data}
      keyExtractor={(item, index) => (item ? String(item.id) : `filler-${index}`)}
      numColumns={COLUMNS}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => <View style={styles.cell}>{item && renderItem(item)}</View>}
      contentContainerStyle={[styles.content, style]}
      style={styles.list}
      initialNumToRender={12}
      windowSize={7}
      removeClippedSubviews
    />
  )
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { paddingHorizontal: spacing.md, gap: 10 },
  row: { gap: 10 },
  cell: { flex: 1 },
})
