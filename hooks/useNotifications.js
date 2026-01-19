import { useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import { setupNotificationListeners } from '../lib/pushNotifications'

/**
 * Hook to setup notification listeners
 * Place this in your root layout component (_layout.js or app/_layout.js)
 */
export function useNotifications() {
  const router = useRouter()
  const notificationListener = useRef()
  const responseListener = useRef()

  useEffect(() => {
    // Handle notification received while app is open
    const onNotificationReceived = (notification) => {
      console.log('Notification received:', notification)
      // You can show an in-app alert or update UI here
    }

    // Handle notification tap (user clicked on notification)
    const onNotificationTapped = (response) => {
      console.log('Notification tapped:', response)
      
      const data = response.notification.request.content.data
      
      // Navigate to the question if week_id is provided
      if (data?.week_id) {
        router.push(`/question/${data.week_id}`)
      } else if (data?.screen) {
        // Navigate to other screens if specified
        router.push(data.screen)
      } else {
        // Default: go to home
        router.push('/')
      }
    }

    // Setup listeners
    const cleanup = setupNotificationListeners(
      onNotificationReceived,
      onNotificationTapped
    )

    return cleanup
  }, [router])
}