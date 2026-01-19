import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

// Configure how notifications are handled when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

/**
 * Request permission and get push token
 */
export async function registerForPushNotificationsAsync() {
  let token

  // Check if physical device
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices')
    return null
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  // Request permission if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('Permission not granted for push notifications')
    return null
  }

  // Get push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
    
    if (!projectId) {
      throw new Error('Project ID not found')
    }

    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data
    console.log('Push token:', token)
  } catch (error) {
    console.error('Error getting push token:', error)
    return null
  }

  // Android-specific channel setup
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#8b5cf6',
    })
  }

  return token
}

/**
 * Check current permission status
 */
export async function checkNotificationPermission() {
  if (!Device.isDevice) {
    return 'unsupported'
  }

  const { status } = await Notifications.getPermissionsAsync()
  return status
}

/**
 * Setup notification listeners
 */
export function setupNotificationListeners(
  onNotificationReceived,
  onNotificationTapped
) {
  // Listener for when notification is received while app is foregrounded
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    onNotificationReceived
  )

  // Listener for when user taps on notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    onNotificationTapped
  )

  return () => {
    receivedSubscription.remove()
    responseSubscription.remove()
  }
}