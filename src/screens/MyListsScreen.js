import { useState } from 'react'
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useLibrary } from '../store/LibraryContext'
import ShowCard from '../components/ShowCard'
import CardGrid from '../components/CardGrid'
import { colors, spacing, tabBarClearance } from '../theme'

export default function MyListsScreen({ navigation }) {
  const { library, createList } = useLibrary()
  const [newListName, setNewListName] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [openList, setOpenList] = useState(null)

  const listNames = Object.keys(library.lists)

  function handleCreate() {
    const name = newListName.trim()
    if (name) createList(name)
    setNewListName('')
    setShowInput(false)
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>My lists</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: tabBarClearance }}>
        {listNames.length === 0 && (
          <Text style={styles.emptyMsg}>
            You don't have any lists yet. Create one to organize your shows (e.g. "To rewatch",
            "Favorites"...).
          </Text>
        )}

        {listNames.map((name) => {
          const entries = library.lists[name]
          const items = entries
            .map((entry) => {
              const source = entry.type === 'movie' ? library.movies : library.shows
              const item = source[entry.id]
              if (!item) return null
              const progress =
                entry.type === 'movie'
                  ? item.watched
                    ? 1
                    : 0
                  : item.totalEpisodes
                    ? Object.keys(item.watchedEpisodes || {}).length / item.totalEpisodes
                    : undefined
              return { ...item, type: entry.type, progress }
            })
            .filter(Boolean)
          const isOpen = openList === name
          return (
            <View key={name}>
              <Pressable
                style={styles.sectionHeader}
                onPress={() => setOpenList(isOpen ? null : name)}
              >
                <Text style={styles.sectionTitle}>{name}</Text>
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.textDim}
                />
              </Pressable>
              {isOpen &&
                (items.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyBoxText}>There's nothing in this list yet</Text>
                  </View>
                ) : (
                  <CardGrid
                    items={items}
                    renderItem={(item) => (
                      <ShowCard
                        key={`${item.type}-${item.id}`}
                        show={item}
                        onPress={() =>
                          navigation.navigate(
                            item.type === 'movie' ? 'MovieDetail' : 'ShowDetail',
                            { id: item.id }
                          )
                        }
                      />
                    )}
                  />
                ))}
            </View>
          )
        })}

        {showInput ? (
          <TextInput
            autoFocus
            value={newListName}
            onChangeText={setNewListName}
            onBlur={handleCreate}
            onSubmitEditing={handleCreate}
            placeholder="List name"
            placeholderTextColor={colors.textDim}
            style={styles.input}
          />
        ) : (
          <Pressable style={styles.newListBtn} onPress={() => setShowInput(true)}>
            <Text style={styles.newListBtnText}>+ New list</Text>
          </Pressable>
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
  emptyMsg: { color: colors.textDim, textAlign: 'center', padding: 40, fontSize: 14 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 10,
  },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  emptyBox: {
    marginHorizontal: spacing.md,
    padding: 40,
    borderRadius: 10,
    backgroundColor: colors.cardEmpty,
    alignItems: 'center',
  },
  emptyBoxText: { color: colors.textDim, fontSize: 15 },
  input: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.bgElevated,
    borderRadius: 10,
    padding: 12,
    color: colors.text,
    fontSize: 15,
  },
  newListBtn: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textDim,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  newListBtnText: { color: colors.textDim, fontSize: 14 },
})
