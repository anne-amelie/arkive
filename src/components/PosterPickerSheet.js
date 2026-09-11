import { useEffect, useRef, useState } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { searchSeries, searchMovies, artworkUrl } from '../api/tmdb'
import { useLibrary } from '../store/LibraryContext'
import ShowCard from './ShowCard'
import CardGrid from './CardGrid'
import SegmentedTabs from './SegmentedTabs'
import ImageCropModal from './ImageCropModal'
import { colors, spacing, radius } from '../theme'

const TAB_OPTIONS = [
  { key: 'series', label: 'Shows' },
  { key: 'movie', label: 'Movies' },
]

const WINDOW_HEIGHT = Dimensions.get('window').height
const COLLAPSED_HEIGHT = WINDOW_HEIGHT * 0.62
const EXPANDED_HEIGHT = WINDOW_HEIGHT * 0.92
const MIN_DRAG_HEIGHT = WINDOW_HEIGHT * 0.3

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

// Reusable poster picker: lets the user pick an image either from what they've
// already watched, or by searching TMDb directly. Used for both the profile
// avatar and the profile background.
export default function PosterPickerSheet({ visible, onClose, title, onSelect, aspectRatio = 1 }) {
  const { library } = useLibrary()
  const [mediaType, setMediaType] = useState('series')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle')
  const [croppingUri, setCroppingUri] = useState(null)
  const debounceRef = useRef(null)
  const sheetHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current
  const heightAtGestureStart = useRef(COLLAPSED_HEIGHT)

  useEffect(() => {
    if (visible) sheetHeight.setValue(COLLAPSED_HEIGHT)
  }, [visible, sheetHeight])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 4,
      onPanResponderGrant: () => {
        sheetHeight.stopAnimation((value) => {
          heightAtGestureStart.current = value
        })
      },
      onPanResponderMove: (_, gesture) => {
        const next = clamp(
          heightAtGestureStart.current - gesture.dy,
          MIN_DRAG_HEIGHT,
          EXPANDED_HEIGHT
        )
        sheetHeight.setValue(next)
      },
      onPanResponderRelease: (_, gesture) => {
        const released = heightAtGestureStart.current - gesture.dy
        if (released < COLLAPSED_HEIGHT * 0.55) {
          onClose()
          return
        }
        const target =
          released > (COLLAPSED_HEIGHT + EXPANDED_HEIGHT) / 2 ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT
        Animated.spring(sheetHeight, { toValue: target, useNativeDriver: false }).start()
      },
    })
  ).current

  useEffect(() => {
    clearTimeout(debounceRef.current)

    if (!query.trim()) {
      setResults([])
      setStatus('idle')
      return
    }

    setStatus('loading')
    debounceRef.current = setTimeout(async () => {
      try {
        const search = mediaType === 'series' ? searchSeries : searchMovies
        const data = await search(query)
        setResults((data || []).map((item) => ({ ...item, image: artworkUrl(item.image) })))
        setStatus('done')
      } catch (err) {
        console.error(err)
        setStatus('error')
      }
    }, 400)

    return () => clearTimeout(debounceRef.current)
  }, [query, mediaType])

  const watched = [
    ...Object.values(library.shows)
      .filter((show) => Object.keys(show.watchedEpisodes || {}).length > 0)
      .map((show) => ({ id: `show-${show.id}`, image: show.image })),
    ...Object.values(library.movies)
      .filter((movie) => movie.watched)
      .map((movie) => ({ id: `movie-${movie.id}`, image: movie.image })),
  ]

  const isSearching = query.trim().length > 0
  const items = isSearching ? results : watched

  function pick(image) {
    if (!image) return
    setCroppingUri(image)
  }

  function handleCropConfirm(focalX, focalY) {
    onSelect({ uri: croppingUri, focalX, focalY })
    setCroppingUri(null)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.sheet, { height: sheetHeight }]}>
        <View style={styles.handleWrap} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>

        <Text style={styles.title}>{title}</Text>

        <SegmentedTabs
          options={TAB_OPTIONS}
          value={mediaType}
          onChange={setMediaType}
          style={styles.tabsOverride}
        />

        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.textDim} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search TMDb..."
            placeholderTextColor={colors.textDim}
            style={styles.searchInput}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close" size={16} color={colors.textDim} />
            </Pressable>
          )}
        </View>

        {!isSearching && <Text style={styles.sectionLabel}>From what you've watched</Text>}
        {status === 'loading' && <Text style={styles.emptyMsg}>Searching...</Text>}
        {isSearching && status === 'done' && results.length === 0 && (
          <Text style={styles.emptyMsg}>No results for "{query}".</Text>
        )}
        {!isSearching && watched.length === 0 && (
          <Text style={styles.emptyMsg}>Nothing watched yet — try searching instead.</Text>
        )}

        <CardGrid
          items={items}
          style={styles.grid}
          renderItem={(item) => (
            <ShowCard
              key={item.id}
              show={item}
              showProgress={false}
              onPress={() => pick(item.image)}
            />
          )}
        />

        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Cancel</Text>
        </Pressable>
      </Animated.View>

      <ImageCropModal
        visible={Boolean(croppingUri)}
        uri={croppingUri}
        aspectRatio={aspectRatio}
        onCancel={() => setCroppingUri(null)}
        onConfirm={handleCropConfirm}
      />
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.lg,
  },
  handleWrap: { alignItems: 'center', paddingVertical: 10 },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  tabsOverride: { paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15 },
  sectionLabel: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyMsg: { color: colors.textDim, fontSize: 13, textAlign: 'center', padding: spacing.md },
  grid: { paddingBottom: spacing.sm },
  closeBtn: { alignItems: 'center', marginTop: spacing.sm },
  closeBtnText: { color: colors.textDim, fontSize: 14 },
})
