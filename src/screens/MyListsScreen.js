import { useState } from 'react'
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLibrary } from '../store/LibraryContext'
import ShowCard from '../components/ShowCard'
import { colors, spacing } from '../theme'

export default function MyListsScreen({ navigation }) {
  const { library, createList } = useLibrary()
  const [newListName, setNewListName] = useState('')
  const [showInput, setShowInput] = useState(false)

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

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        {listNames.length === 0 && (
          <Text style={styles.emptyMsg}>
            Tu n'as pas encore de liste. Crée-en une pour organiser tes séries (ex : "À revoir",
            "Coup de cœur"...).
          </Text>
        )}

        {listNames.map((name) => {
          const ids = library.lists[name]
          const shows = ids.map((id) => library.shows[id]).filter(Boolean)
          return (
            <View key={name}>
              <Text style={styles.sectionTitle}>{name}</Text>
              {shows.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyBoxText}>There's nothing in this list yet</Text>
                </View>
              ) : (
                <View style={styles.grid}>
                  {shows.map((show) => (
                    <ShowCard
                      key={show.id}
                      show={show}
                      onPress={() => navigation.navigate('ShowDetail', { id: show.id })}
                    />
                  ))}
                </View>
              )}
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
            placeholder="Nom de la liste"
            placeholderTextColor={colors.textDim}
            style={styles.input}
          />
        ) : (
          <Pressable style={styles.newListBtn} onPress={() => setShowInput(true)}>
            <Text style={styles.newListBtnText}>+ Nouvelle liste</Text>
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
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 10,
  },
  emptyBox: {
    marginHorizontal: spacing.md,
    padding: 40,
    borderRadius: 10,
    backgroundColor: colors.cardEmpty,
    alignItems: 'center',
  },
  emptyBoxText: { color: colors.textDim, fontSize: 15 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: spacing.md,
  },
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
