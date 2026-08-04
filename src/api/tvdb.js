// Client léger pour l'API TheTVDB v4
// Doc officielle : https://thetvdb.github.io/v4-api/
import AsyncStorage from '@react-native-async-storage/async-storage'

const BASE_URL = 'https://api4.thetvdb.com/v4'
const API_KEY = process.env.EXPO_PUBLIC_TVDB_API_KEY
const PIN = process.env.EXPO_PUBLIC_TVDB_PIN || undefined

const TOKEN_KEY = 'arkive_tvdb_token'
const TOKEN_DATE_KEY = 'arkive_tvdb_token_date'
// Le token TheTVDB est valable ~1 mois, on le recycle avant ça par sécurité (28 jours)
const TOKEN_MAX_AGE_MS = 28 * 24 * 60 * 60 * 1000

let inFlightLogin = null

async function login() {
  if (!API_KEY) {
    throw new Error(
      "Clé API TheTVDB manquante. Ajoute EXPO_PUBLIC_TVDB_API_KEY dans ton fichier .env"
    )
  }

  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apikey: API_KEY, pin: PIN }),
  })

  if (!res.ok) {
    throw new Error(`Échec de connexion à TheTVDB (${res.status})`)
  }

  const json = await res.json()
  const token = json.data.token
  await AsyncStorage.setItem(TOKEN_KEY, token)
  await AsyncStorage.setItem(TOKEN_DATE_KEY, String(Date.now()))
  return token
}

async function getToken() {
  const cached = await AsyncStorage.getItem(TOKEN_KEY)
  const cachedDate = Number((await AsyncStorage.getItem(TOKEN_DATE_KEY)) || 0)
  const isFresh = cached && Date.now() - cachedDate < TOKEN_MAX_AGE_MS

  if (isFresh) return cached

  if (!inFlightLogin) {
    inFlightLogin = login().finally(() => {
      inFlightLogin = null
    })
  }
  return inFlightLogin
}

async function requestFull(path, { params, retry = true } = {}) {
  const token = await getToken()
  const query = params
    ? '?' +
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')
    : ''

  const res = await fetch(`${BASE_URL}${path}${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (res.status === 401 && retry) {
    await AsyncStorage.removeItem(TOKEN_KEY)
    return requestFull(path, { params, retry: false })
  }

  if (!res.ok) {
    throw new Error(`Erreur TheTVDB ${res.status} sur ${path}`)
  }

  return res.json()
}

async function request(path, opts) {
  const json = await requestFull(path, opts)
  return json.data
}

// --- Endpoints utilisés par l'app ---

export function searchSeries(query, { limit = 20 } = {}) {
  if (!query?.trim()) return Promise.resolve([])
  return request('/search', { params: { query, type: 'series', limit } })
}

export function searchMovies(query, { limit = 20 } = {}) {
  if (!query?.trim()) return Promise.resolve([])
  return request('/search', { params: { query, type: 'movie', limit } })
}

export function getSeriesExtended(id) {
  return request(`/series/${id}/extended`)
}

export function getMovieExtended(id) {
  return request(`/movies/${id}/extended`)
}

export function getSeriesEpisodes(id, { page = 0 } = {}) {
  return request(`/series/${id}/episodes/default`, { params: { page } })
}

// Récupère la totalité des épisodes (toutes pages) pour construire la liste saisons/épisodes.
export async function getAllSeriesEpisodes(id) {
  let page = 0
  let episodes = []
  const MAX_PAGES = 20 // garde-fou, une série dépasse rarement 20 pages d'épisodes

  while (page < MAX_PAGES) {
    const json = await requestFull(`/series/${id}/episodes/default`, { params: { page } })
    episodes = episodes.concat(json.data?.episodes || [])
    if (!json.links?.next) break
    page += 1
  }

  return episodes
}

// Helper : construit une URL d'image utilisable directement
export function artworkUrl(path) {
  if (!path) return null
  return path.startsWith('http') ? path : `https://artworks.thetvdb.com${path}`
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
