import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { LibraryProvider } from './src/store/LibraryContext'
import RootNavigator from './src/navigation/RootNavigator'
import { colors } from './src/theme'

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LibraryProvider>
        <NavigationContainer theme={theme}>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </LibraryProvider>
    </SafeAreaProvider>
  )
}
