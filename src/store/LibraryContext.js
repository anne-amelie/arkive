import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const LibraryContext = createContext(null)
const STORAGE_KEY = 'arkive_library_v2'

const EMPTY_STATE = {
  shows: {}, // id -> { id, name, image, watchedEpisodes: { episodeId: true }, totalEpisodes, addedAt, lastWatchedAt }
  movies: {}, // id -> { id, name, image, duration, watched, addedAt, watchedAt }
  lists: {}, // nom de liste -> [{ id, type: 'show' | 'movie' }]
}

export function LibraryProvider({ children }) {
  const [library, setLibrary] = useState(EMPTY_STATE)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setLibrary({ ...EMPTY_STATE, ...JSON.parse(raw) })
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
              watchedEpisodes: prev.shows[show.id]?.watchedEpisodes ?? {},
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

      toggleEpisodeWatched(showId, episodeId) {
        setLibrary((prev) => {
          const show = prev.shows[showId]
          if (!show) return prev
          const watchedEpisodes = { ...show.watchedEpisodes }
          const nowWatched = !watchedEpisodes[episodeId]
          if (nowWatched) {
            watchedEpisodes[episodeId] = true
          } else {
            delete watchedEpisodes[episodeId]
          }
          return {
            ...prev,
            shows: {
              ...prev.shows,
              [showId]: { ...show, watchedEpisodes, lastWatchedAt: Date.now() },
            },
          }
        })
      },

      setShowEpisodeCount(showId, totalEpisodes) {
        setLibrary((prev) => {
          const show = prev.shows[showId]
          if (!show || show.totalEpisodes === totalEpisodes) return prev
          return {
            ...prev,
            shows: { ...prev.shows, [showId]: { ...show, totalEpisodes } },
          }
        })
      },

      setSeasonWatched(showId, episodeIds, watched) {
        setLibrary((prev) => {
          const show = prev.shows[showId]
          if (!show) return prev
          const watchedEpisodes = { ...show.watchedEpisodes }
          for (const epId of episodeIds) {
            if (watched) {
              watchedEpisodes[epId] = true
            } else {
              delete watchedEpisodes[epId]
            }
          }
          return {
            ...prev,
            shows: {
              ...prev.shows,
              [showId]: { ...show, watchedEpisodes, lastWatchedAt: Date.now() },
            },
          }
        })
      },

      addMovieToWatchlist(movie) {
        setLibrary((prev) => ({
          ...prev,
          movies: {
            ...prev.movies,
            [movie.id]: {
              id: movie.id,
              name: movie.name,
              image: movie.image,
              duration: movie.duration,
              watched: prev.movies[movie.id]?.watched ?? false,
              addedAt: prev.movies[movie.id]?.addedAt ?? Date.now(),
            },
          },
        }))
      },

      removeMovieFromWatchlist(id) {
        setLibrary((prev) => {
          const movies = { ...prev.movies }
          delete movies[id]
          return { ...prev, movies }
        })
      },

      toggleMovieWatched(id) {
        setLibrary((prev) => {
          const movie = prev.movies[id]
          if (!movie) return prev
          const watched = !movie.watched
          return {
            ...prev,
            movies: {
              ...prev.movies,
              [id]: { ...movie, watched, watchedAt: watched ? Date.now() : movie.watchedAt },
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

      addToList(listName, id, type) {
        setLibrary((prev) => {
          const current = prev.lists[listName] || []
          if (current.some((entry) => entry.id === id && entry.type === type)) return prev
          return { ...prev, lists: { ...prev.lists, [listName]: [...current, { id, type }] } }
        })
      },

      removeFromList(listName, id, type) {
        setLibrary((prev) => ({
          ...prev,
          lists: {
            ...prev.lists,
            [listName]: (prev.lists[listName] || []).filter(
              (entry) => !(entry.id === id && entry.type === type)
            ),
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
