import { Image } from 'react-native'

// ImageCropModal and FocalImage both need the natural pixel size of the same
// remote (TMDB) URL. Without a shared cache, each mount re-triggers its own
// network round-trip via Image.getSize — on a slow/flaky connection that's
// what made the crop preview or the final avatar/banner sometimes just not
// show up.
const cache = new Map()

export function getCachedImageSize(uri) {
  return new Promise((resolve) => {
    if (!uri) {
      resolve(null)
      return
    }
    if (cache.has(uri)) {
      resolve(cache.get(uri))
      return
    }
    Image.getSize(
      uri,
      (width, height) => {
        const size = { width, height }
        cache.set(uri, size)
        resolve(size)
      },
      () => resolve(null)
    )
  })
}

export function bustImageSizeCache(uri) {
  cache.delete(uri)
}
