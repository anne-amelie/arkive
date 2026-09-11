import { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { getCachedImageSize } from '../utils/imageSize'

// Renders `uri` cropped to fill its box using the chosen focal point
// (0..1 fractions, from ImageCropModal) instead of always centering.
export default function FocalImage({ uri, focalX = 0.5, focalY = 0.5, style }) {
  const [box, setBox] = useState(null)
  const [natural, setNatural] = useState(null)

  useEffect(() => {
    if (!uri) return
    setNatural(null)
    let cancelled = false
    getCachedImageSize(uri).then((size) => {
      if (!cancelled) setNatural(size)
    })
    return () => {
      cancelled = true
    }
  }, [uri])

  function handleLayout(e) {
    const { width, height } = e.nativeEvent.layout
    setBox({ width, height })
  }

  let imageStyle = null
  if (box && natural && box.width > 0 && box.height > 0) {
    const coverScale = Math.max(box.width / natural.width, box.height / natural.height)
    const displayWidth = natural.width * coverScale
    const displayHeight = natural.height * coverScale
    const freeX = displayWidth - box.width
    const freeY = displayHeight - box.height
    imageStyle = {
      width: displayWidth,
      height: displayHeight,
      transform: [{ translateX: -freeX * focalX }, { translateY: -freeY * focalY }],
    }
  }

  return (
    <View style={[styles.box, style]} onLayout={handleLayout}>
      {uri && imageStyle && (
        <Image source={{ uri }} style={imageStyle} cachePolicy="memory-disk" />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  box: { overflow: 'hidden' },
})
