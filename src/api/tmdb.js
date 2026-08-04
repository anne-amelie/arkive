// Lightweight client for the TMDb (The Movie Database) v3 API
// Official docs: https://developer.themoviedb.org/reference/intro/getting-started
const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY
const IMAGE_BASE = 'https://image.tmdb.org/t/p'

async function request(path, { params } = {}) {
  if (!API_KEY) {
    throw new Error('Missing TMDb API key. Add EXPO_PUBLIC_TMDB_API_KEY to your .env file')
  }

  const query = new URLSearchParams({ api_key: API_KEY, language: 'en-US', ...params })
  const res = await fetch(`${BASE_URL}${path}?${query}`)

  if (!res.ok) {
    throw new Error(`TMDb error ${res.status} on ${path}`)
  }

  return res.json()
}

// --- Endpoints used by the app ---

export async function searchSeries(query, { limit = 20 } = {}) {
  if (!query?.trim()) return []
  const json = await request('/search/tv', { params: { query } })
  return (json.results || []).slice(0, limit).map((item) => ({
    id: item.id,
    name: item.name,
    image: item.poster_path,
  }))
}

export async function searchMovies(query, { limit = 20 } = {}) {
  if (!query?.trim()) return []
  const json = await request('/search/movie', { params: { query } })
  return (json.results || []).slice(0, limit).map((item) => ({
    id: item.id,
    name: item.title,
    image: item.poster_path,
  }))
}

export async function getSeriesExtended(id) {
  const json = await request(`/tv/${id}`)
  return {
    id: json.id,
    name: json.name,
    overview: json.overview,
    image: json.poster_path,
    backdrop: json.backdrop_path,
    seasons: json.seasons || [],
    genres: (json.genres || []).map((g) => g.name),
    rating: json.vote_average || null,
    year: yearOf(json.first_air_date),
  }
}

export async function getMovieExtended(id) {
  const json = await request(`/movie/${id}`)
  return {
    id: json.id,
    name: json.title,
    overview: json.overview,
    image: json.poster_path,
    backdrop: json.backdrop_path,
    runtime: json.runtime,
    genres: (json.genres || []).map((g) => g.name),
    rating: json.vote_average || null,
    year: yearOf(json.release_date),
  }
}

function yearOf(dateString) {
  return dateString ? dateString.slice(0, 4) : null
}

// Fetches every episode (across all seasons) to build the season/episode list.
// `seasons` can be passed in (from getSeriesExtended) to avoid a redundant /tv/{id} call.
export async function getAllSeriesEpisodes(id, seasons) {
  const seasonList = seasons ?? (await request(`/tv/${id}`)).seasons ?? []

  const seasonPages = await Promise.all(
    seasonList.map((s) => request(`/tv/${id}/season/${s.season_number}`))
  )

  return seasonPages.flatMap((season) =>
    (season.episodes || []).map((ep) => ({
      id: ep.id,
      seasonNumber: ep.season_number,
      number: ep.episode_number,
      name: ep.name,
      image: ep.still_path,
      airDate: ep.air_date,
    }))
  )
}

// Helper: builds a directly usable image URL
export function artworkUrl(path, size = 'w500') {
  if (!path) return null
  return path.startsWith('http') ? path : `${IMAGE_BASE}/${size}${path}`
}

// Helper: formats a duration in minutes (e.g. 128 -> "2h 08min")
export function formatRuntime(minutes) {
  if (!minutes || minutes <= 0) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${String(m).padStart(2, '0')}min`
}
