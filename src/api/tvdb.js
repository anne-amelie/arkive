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

async function request(path, { params, retry = true } = {}) {
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
    return request(path, { params, retry: false })
  }

  if (!res.ok) {
    throw new Error(`Erreur TheTVDB ${res.status} sur ${path}`)
  }

  const json = await res.json()
  return json.data
}

// --- Endpoints utilisés par l'app ---

export function searchSeries(query, { limit = 20 } = {}) {
  if (!query?.trim()) return Promise.resolve([])
  return request('/search', { params: { query, type: 'series', limit } })
}

export function getSeriesExtended(id) {
  return request(`/series/${id}/extended`)
}

export function getSeriesEpisodes(id, { page = 0 } = {}) {
  return request(`/series/${id}/episodes/default`, { params: { page } })
}

// Helper : construit une URL d'image utilisable directement
export function artworkUrl(path) {
  if (!path) return null
  return path.startsWith('http') ? path : `https://artworks.thetvdb.com${path}`
}
