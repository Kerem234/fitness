import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { AppNavigator } from './src/navigation/AppNavigator'
import { useFonts } from 'expo-font'
import './global.css'
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'
import { registerForPushNotificationsAsync, scheduleDailyReminders } from './src/services/notifications'

// Global Notification Handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [fontsLoaded] = useFonts({
    // Load custom fonts if needed
  })

  useEffect(() => {
    // Init Notifications
    registerForPushNotificationsAsync().then(status => {
      if (status === 'granted') {
        scheduleDailyReminders()
      }
    })
  }, [])

  return (
    <NavigationContainer>
      <AppNavigator />
      <StatusBar style="auto" />
    </NavigationContainer>
  )
}
