// Client léger pour l'API TMDb (The Movie Database) v3
// Doc officielle : https://developer.themoviedb.org/reference/intro/getting-started
const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY
const IMAGE_BASE = 'https://image.tmdb.org/t/p'

async function request(path, { params } = {}) {
  if (!API_KEY) {
    throw new Error(
      "Clé API TMDb manquante. Ajoute EXPO_PUBLIC_TMDB_API_KEY dans ton fichier .env"
    )
  }

  const query = new URLSearchParams({ api_key: API_KEY, language: 'fr-FR', ...params })
  const res = await fetch(`${BASE_URL}${path}?${query}`)

  if (!res.ok) {
    throw new Error(`Erreur TMDb ${res.status} sur ${path}`)
  }

  return res.json()
}

// --- Endpoints utilisés par l'app ---

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
    seasons: json.seasons || [],
  }
}

export async function getMovieExtended(id) {
  const json = await request(`/movie/${id}`)
  return {
    id: json.id,
    name: json.title,
    overview: json.overview,
    image: json.poster_path,
    runtime: json.runtime,
  }
}

// Récupère la totalité des épisodes (toutes saisons) pour construire la liste saisons/épisodes.
// `seasons` peut être passé (depuis getSeriesExtended) pour éviter un appel /tv/{id} redondant.
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
    }))
  )
}

// Helper : construit une URL d'image utilisable directement
export function artworkUrl(path, size = 'w500') {
  if (!path) return null
  return path.startsWith('http') ? path : `${IMAGE_BASE}/${size}${path}`
}

// Helper : formate une durée en minutes (ex: 128 -> "2h 08min")
export function formatRuntime(minutes) {
  if (!minutes || minutes <= 0) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${String(m).padStart(2, '0')}min`
}
