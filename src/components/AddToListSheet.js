import { useState } from 'react'
import { Modal, View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLibrary } from '../store/LibraryContext'
import { colors, spacing } from '../theme'

export default function AddToListSheet({ visible, onClose, id, type }) {
  const { library, createList, addToList, removeFromList } = useLibrary()
  const [newListName, setNewListName] = useState('')

  const listNames = Object.keys(library.lists)

  function isInList(name) {
    return (library.lists[name] || []).some((entry) => entry.id === id && entry.type === type)
  }

  function toggleList(name) {
    if (isInList(name)) {
      removeFromList(name, id, type)
    } else {
      addToList(name, id, type)
    }
  }

  function handleCreate() {
    const name = newListName.trim()
    if (name) {
      createList(name)
      addToList(name, id, type)
    }
    setNewListName('')
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={styles.title}>Add to a list</Text>

        <FlatList
          data={listNames}
          keyExtractor={(name) => name}
          style={{ maxHeight: 260 }}
          ListEmptyComponent={
            <Text style={styles.emptyMsg}>No lists yet, create one.</Text>
          }
          renderItem={({ item: name }) => (
            <Pressable style={styles.row} onPress={() => toggleList(name)}>
              <Text style={styles.rowText}>{name}</Text>
              <Ionicons
                name={isInList(name) ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={20}
                color={isInList(name) ? colors.accent : colors.textDim}
              />
            </Pressable>
          )}
        />

        <View style={styles.newRow}>
          <TextInput
            value={newListName}
            onChangeText={setNewListName}
            onSubmitEditing={handleCreate}
            placeholder="New list"
            placeholderTextColor={colors.textDim}
            style={styles.input}
          />
          <Pressable style={styles.newBtn} onPress={handleCreate}>
            <Ionicons name="add" size={20} color={colors.text} />
          </Pressable>
        </View>

        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: spacing.sm },
  emptyMsg: { color: colors.textDim, fontSize: 13, paddingVertical: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: { color: colors.text, fontSize: 15 },
  newRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
  },
  newBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  closeBtn: { alignItems: 'center', marginTop: spacing.md },
  closeBtnText: { color: colors.textDim, fontSize: 14 },
})
