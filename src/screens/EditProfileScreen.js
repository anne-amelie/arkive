import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useLibrary } from '../store/LibraryContext'
import PosterPickerSheet from '../components/PosterPickerSheet'
import FocalImage from '../components/FocalImage'
import { colors, spacing, radius, shadow, useAccentColors } from '../theme'

const BANNER_HEIGHT = 170

export default function EditProfileScreen({ navigation }) {
  const { library, updateProfile } = useLibrary()
  const { accent } = useAccentColors()
  const { width: windowWidth } = useWindowDimensions()
  const [username, setUsername] = useState(library.profile?.username || '')
  const [pickerTarget, setPickerTarget] = useState(null) // 'avatar' | 'background' | null
  const backgroundImage = library.profile?.backgroundImage
  const avatarImage = library.profile?.avatarImage
  const backgroundAspectRatio = windowWidth / BANNER_HEIGHT

  function handleDone() {
    updateProfile({ username: username.trim() })
    navigation.goBack()
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.banner}>
          {backgroundImage ? (
            <FocalImage
              uri={backgroundImage.uri}
              focalX={backgroundImage.focalX}
              focalY={backgroundImage.focalY}
              style={styles.bannerImage}
            />
          ) : (
            <LinearGradient colors={['#3a2d47', colors.bg]} style={styles.bannerImage} />
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.45)', 'transparent']}
            style={styles.topScrim}
            pointerEvents="none"
          />

          <View style={styles.topRow}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.iconBtn}>
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </Pressable>
            <Pressable onPress={handleDone} hitSlop={8}>
              <Text style={[styles.doneLink, { color: accent }]}>Done</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.changeCoverBtn}
            onPress={() => setPickerTarget('background')}
          >
            <Ionicons name="image-outline" size={14} color={colors.text} />
            <Text style={styles.changeCoverText}>Change cover</Text>
          </Pressable>
        </View>

        <View style={styles.avatarRow} pointerEvents="box-none">
          <Pressable style={styles.avatarWrap} onPress={() => setPickerTarget('avatar')}>
            <View style={styles.avatar}>
              {avatarImage ? (
                <FocalImage
                  uri={avatarImage.uri}
                  focalX={avatarImage.focalX}
                  focalY={avatarImage.focalY}
                  style={styles.avatarImage}
                />
              ) : (
                <Ionicons name="person" size={30} color={colors.textDim} />
              )}
            </View>
            <View style={[styles.avatarEditBadge, { backgroundColor: accent }]}>
              <Ionicons name="camera" size={13} color={colors.bg} />
            </View>
          </Pressable>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="username"
            placeholderTextColor={colors.textDim}
            style={styles.input}
          />
        </View>
      </ScrollView>

      <PosterPickerSheet
        visible={pickerTarget === 'avatar'}
        title="Choose a profile picture"
        aspectRatio={1}
        onClose={() => setPickerTarget(null)}
        onSelect={(image) => updateProfile({ avatarImage: image })}
      />
      <PosterPickerSheet
        visible={pickerTarget === 'background'}
        title="Choose a background"
        aspectRatio={backgroundAspectRatio}
        onClose={() => setPickerTarget(null)}
        onSelect={(image) => updateProfile({ backgroundImage: image })}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.xl },
  banner: { height: BANNER_HEIGHT },
  bannerImage: { width: '100%', height: '100%' },
  topScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '50%',
  },
  topRow: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
  },
  doneLink: { fontSize: 15, fontWeight: '700' },
  changeCoverBtn: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.overlay,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  changeCoverText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  avatarRow: {
    paddingHorizontal: spacing.md,
    marginTop: -40,
    marginBottom: spacing.lg,
  },
  avatarWrap: { width: 84, height: 84 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarEditBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...shadow,
  },
  fieldLabel: { color: colors.textDim, fontSize: 11, fontWeight: '600', marginBottom: 2 },
  input: { color: colors.text, fontSize: 15, padding: 0 },
})
