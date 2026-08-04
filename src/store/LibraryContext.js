import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const LibraryContext = createContext(null)
const STORAGE_KEY = 'arkive_library'
// Bump this whenever the shape of the stored data changes in an incompatible way
// (e.g. switching data providers, changing how progress is tracked). Any stored
// payload with a different version is discarded instead of merged.
const SCHEMA_VERSION = 2

const EMPTY_STATE = {
  shows: {}, // id -> { id, name, image, watchedEpisodes: { episodeId: true }, totalEpisodes, episodeRuntimes: { episodeId: minutes }, addedAt, lastWatchedAt }
  movies: {}, // id -> { id, name, image, durationMinutes, watched, addedAt, watchedAt }
  lists: {}, // list name -> [{ id, type: 'show' | 'movie' }]
  profile: {
    username: '',
    avatarImage: null, // { uri, focalX, focalY } | null
    backgroundImage: null, // { uri, focalX, focalY } | null
  },
  settings: {
    // HSV accent color picked in SettingsScreen (hue 0-360, saturation/value 0-100)
    accentHue: 271,
    accentSaturation: 40,
    accentValue: 85,
  },
}

export function LibraryProvider({ children }) {
  const [library, setLibrary] = useState(EMPTY_STATE)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const parsed = raw ? JSON.parse(raw) : null
        if (parsed?.version === SCHEMA_VERSION) {
          setLibrary({ ...EMPTY_STATE, ...parsed.data })
        }
      })
      .catch((e) => console.warn("Couldn't read the local library", e))
      .finally(() => setReady(true))
  }, [])

  useEffect(() => {
    if (ready) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, data: library }))
    }
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

      setShowEpisodeCount(showId, totalEpisodes, episodeRuntimes) {
        setLibrary((prev) => {
          const show = prev.shows[showId]
          if (!show) return prev
          if (show.totalEpisodes === totalEpisodes && show.episodeRuntimes) return prev
          return {
            ...prev,
            shows: { ...prev.shows, [showId]: { ...show, totalEpisodes, episodeRuntimes } },
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
              durationMinutes: movie.durationMinutes,
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

      updateProfile(patch) {
        setLibrary((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }))
      },

      updateSettings(patch) {
        setLibrary((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }))
      },
    }),
    [library, ready]
  )

  return <LibraryContext.Provider value={api}>{children}</LibraryContext.Provider>
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used within a LibraryProvider')
  return ctx
}
