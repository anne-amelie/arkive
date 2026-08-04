import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const LibraryContext = createContext(null)
const STORAGE_KEY = 'arkive_library_v1'

const EMPTY_STATE = {
  shows: {}, // id -> { id, name, image, progress (0-1), status, addedAt, lastWatchedAt }
  lists: {}, // nom de liste -> [id, id, ...]
}

export function LibraryProvider({ children }) {
  const [library, setLibrary] = useState(EMPTY_STATE)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setLibrary(JSON.parse(raw))
      })
      .catch((e) => console.warn('Impossible de lire la bibliothèque locale', e))
      .finally(() => setReady(true))
  }, [])

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(library))
  }, [library, ready])

  const api = useMemo(
    () => ({
      library,
      ready,

      addToWatchlist(show) {
        setLibrary((prev) => ({
          ...prev,
          shows: {
            ...prev.shows,
            [show.id]: {
              id: show.id,
              name: show.name,
              image: show.image,
              progress: prev.shows[show.id]?.progress ?? 0,
              status: prev.shows[show.id]?.status ?? 'not_started',
              addedAt: prev.shows[show.id]?.addedAt ?? Date.now(),
            },
          },
        }))
      },

      removeFromWatchlist(id) {
        setLibrary((prev) => {
          const shows = { ...prev.shows }
          delete shows[id]
          return { ...prev, shows }
        })
      },

      setProgress(id, progress) {
        setLibrary((prev) => {
          if (!prev.shows[id]) return prev
          return {
            ...prev,
            shows: {
              ...prev.shows,
              [id]: { ...prev.shows[id], progress, lastWatchedAt: Date.now() },
            },
          }
        })
      },

      createList(name) {
        setLibrary((prev) => {
          if (prev.lists[name]) return prev
          return { ...prev, lists: { ...prev.lists, [name]: [] } }
        })
      },

      addToList(listName, showId) {
        setLibrary((prev) => {
          const current = prev.lists[listName] || []
          if (current.includes(showId)) return prev
          return { ...prev, lists: { ...prev.lists, [listName]: [...current, showId] } }
        })
      },

      removeFromList(listName, showId) {
        setLibrary((prev) => ({
          ...prev,
          lists: {
            ...prev.lists,
            [listName]: (prev.lists[listName] || []).filter((id) => id !== showId),
          },
        }))
      },
    }),
    [library, ready]
  )

  return <LibraryContext.Provider value={api}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary doit être utilisé sous LibraryProvider')
  return ctx
}
