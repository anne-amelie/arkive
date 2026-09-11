// Turns a TV Time data export (JSON) into records shaped for LibraryContext.
//
// TV Time identifies movies/shows by tvdb_id/imdb_id and episodes by season+episode
// number, while Arkive's library is keyed by TMDb id (and TMDb episode id). So each
// entry has to be resolved against TMDb's /find endpoint before it can be written
// into the store.
import { findByExternalId, getMovieExtended, getAllSeriesEpisodes, artworkUrl } from '../api/tmdb'

// Runs `fn` over `items` with at most `limit` in flight at once, calling `onSettled`
// after each item resolves so callers can report incremental progress.
async function mapWithConcurrency(items, limit, fn, onSettled) {
  let cursor = 0

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++
      await fn(items[index], index)
      onSettled?.(index)
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
}

function labelOf(entry) {
  return entry.year ? `${entry.title} (${entry.year})` : entry.title
}

// TV Time's series export nests a `seasons` array on every entry; the movies export
// doesn't. Returns 'series' | 'movies' | null (unrecognized shape).
export function parseTvTimeFile(json) {
  if (!Array.isArray(json) || json.length === 0) return null
  return Array.isArray(json[0]?.seasons) ? 'series' : 'movies'
}

export async function importMovies(tvTimeMovies, onProgress) {
  const total = tvTimeMovies.length
  const movies = {}
  const unmatched = []
  let done = 0

  await mapWithConcurrency(
    tvTimeMovies,
    8,
    async (entry) => {
      const imdbId = entry.id?.imdb
      if (!imdbId) {
        unmatched.push(labelOf(entry))
        return
      }
      try {
        const found = await findByExternalId(imdbId, 'imdb_id')
        const match = found.movie_results?.[0]
        if (!match) {
          unmatched.push(labelOf(entry))
          return
        }
        const extended = await getMovieExtended(match.id).catch(() => null)
        movies[match.id] = {
          id: match.id,
          name: match.title || entry.title,
          image: artworkUrl(match.poster_path),
          durationMinutes: extended?.runtime ?? null,
          watched: Boolean(entry.is_watched),
          addedAt: entry.created_at ? Date.parse(entry.created_at) : Date.now(),
          watchedAt: entry.is_watched && entry.watched_at ? Date.parse(entry.watched_at) : undefined,
        }
      } catch {
        unmatched.push(labelOf(entry))
      }
    },
    () => {
      done += 1
      onProgress?.({ phase: 'movies', current: done, total })
    }
  )

  return { movies, unmatched, total, matched: total - unmatched.length }
}

export async function importSeries(tvTimeSeries, onProgress) {
  const total = tvTimeSeries.length
  const shows = {}
  const unmatched = []
  let done = 0

  await mapWithConcurrency(
    tvTimeSeries,
    4,
    async (entry) => {
      const tvdbId = entry.id?.tvdb
      if (!tvdbId) {
        unmatched.push(labelOf(entry))
        return
      }
      try {
        const found = await findByExternalId(tvdbId, 'tvdb_id')
        const match = found.tv_results?.[0]
        if (!match) {
          unmatched.push(labelOf(entry))
          return
        }

        const episodes = await getAllSeriesEpisodes(match.id)
        const byNumber = new Map(episodes.map((ep) => [`${ep.seasonNumber}:${ep.number}`, ep]))

        const episodeRuntimes = {}
        for (const ep of episodes) {
          if (ep.runtime) episodeRuntimes[ep.id] = ep.runtime
        }

        const watchedEpisodes = {}
        let lastWatchedAt
        for (const season of entry.seasons || []) {
          for (const ep of season.episodes || []) {
            if (!ep.is_watched) continue
            const tmdbEp = byNumber.get(`${season.number}:${ep.number}`)
            if (!tmdbEp) continue
            watchedEpisodes[tmdbEp.id] = true
            if (ep.watched_at) {
              const watchedAt = Date.parse(ep.watched_at)
              if (!lastWatchedAt || watchedAt > lastWatchedAt) lastWatchedAt = watchedAt
            }
          }
        }

        shows[match.id] = {
          id: match.id,
          name: match.name || entry.title,
          image: artworkUrl(match.poster_path),
          watchedEpisodes,
          totalEpisodes: episodes.length,
          episodeRuntimes,
          addedAt: entry.created_at ? Date.parse(entry.created_at) : Date.now(),
          lastWatchedAt,
        }
      } catch {
        unmatched.push(labelOf(entry))
      }
    },
    () => {
      done += 1
      onProgress?.({ phase: 'series', current: done, total })
    }
  )

  return { shows, unmatched, total, matched: total - unmatched.length }
}
