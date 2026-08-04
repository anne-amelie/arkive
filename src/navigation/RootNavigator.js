import { Platform, View, StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import ShowsScreen from '../screens/ShowsScreen'
import MoviesScreen from '../screens/MoviesScreen'
import MyListsScreen from '../screens/MyListsScreen'
import ExploreScreen from '../screens/ExploreScreen'
import ProfileScreen from '../screens/ProfileScreen'
import ShowDetailScreen from '../screens/ShowDetailScreen'
import MovieDetailScreen from '../screens/MovieDetailScreen'
import EditProfileScreen from '../screens/EditProfileScreen'
import SettingsScreen from '../screens/SettingsScreen'
import { colors, spacing, radius, useAccentColors } from '../theme'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

const ICONS = {
  Shows: 'tv-outline',
  Movies: 'film-outline',
  'My List': 'list-outline',
  Explore: 'search-outline',
  Profile: 'person-outline',
}

function Tabs() {
  const insets = useSafeAreaInsets()
  const { accent } = useAccentColors()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: colors.textDim,
        tabBarStyle: {
          position: 'absolute',
          left: spacing.lg,
          right: spacing.lg,
          bottom: insets.bottom + spacing.md,
          height: 72,
          borderRadius: radius.xl,
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.12)',
          paddingBottom: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.45,
          shadowRadius: 16,
          elevation: 12,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView intensity={100} tint="systemThinMaterialDark" style={styles.blur} />
          ) : (
            <View style={styles.solidBackground} />
          ),
        tabBarItemStyle: { justifyContent: 'center' },
        tabBarIconStyle: { flex: 0, height: 34, marginBottom: 2 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ color }) => <Ionicons name={ICONS[route.name]} color={color} size={22} />,
      })}
    >
      <Tab.Screen name="Shows" component={ShowsScreen} />
      <Tab.Screen name="Movies" component={MoviesScreen} />
      <Tab.Screen name="My List" component={MyListsScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  blur: { flex: 1, borderRadius: radius.xl, overflow: 'hidden' },
  solidBackground: {
    flex: 1,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
  },
})

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen
        name="ShowDetail"
        component={ShowDetailScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="MovieDetail"
        component={MovieDetailScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ presentation: 'card' }}
      />
    </Stack.Navigator>
  )
}
