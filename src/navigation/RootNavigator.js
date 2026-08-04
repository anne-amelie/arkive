import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'

import ShowsScreen from '../screens/ShowsScreen'
import MoviesScreen from '../screens/MoviesScreen'
import MyListsScreen from '../screens/MyListsScreen'
import ExploreScreen from '../screens/ExploreScreen'
import ProfileScreen from '../screens/ProfileScreen'
import ShowDetailScreen from '../screens/ShowDetailScreen'
import MovieDetailScreen from '../screens/MovieDetailScreen'
import { colors } from '../theme'

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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textDim,
        tabBarStyle: {
          backgroundColor: '#050506',
          borderTopColor: colors.border,
          height: 76,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} color={color} size={size - 2} />
        ),
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
    </Stack.Navigator>
  )
}
