import { useEffect, useState } from 'react'
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useGroup } from '../context/GroupContext'
import { checkNotificationPermission, registerForPushNotificationsAsync } from '../lib/pushNotifications'
import { supabase } from '../lib/supabase'

export default function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const { member } = useGroup()

  useEffect(() => {
    if (!member) return

    async function checkPermission() {
      const permission = await checkNotificationPermission()
      
      // Show prompt if permission is not determined yet
      if (permission === 'undetermined') {
        setShowPrompt(true)
      }
    }
    
    checkPermission()
  }, [member])

  const handleEnable = async () => {
    try {
      const token = await registerForPushNotificationsAsync()
      
      if (!token) {
        Alert.alert(
          'Notifications Unavailable',
          'Could not enable notifications. Please check your device settings.',
          [{ text: 'OK' }]
        )
        setShowPrompt(false)
        return
      }

      // Save token to Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          member_id: member.id,
          subscription: { token, type: 'expo' },
          platform: 'mobile'
        }, {
          onConflict: 'member_id'
        })

      if (error) {
        console.error('Error saving push token:', error)
        Alert.alert('Error', 'Could not save notification preferences')
      } else {
        setShowPrompt(false)
        Alert.alert('Success!', 'You\'ll now get notified when The Drop lands 🔥')
      }
    } catch (error) {
      console.error('Error enabling notifications:', error)
      Alert.alert('Error', 'Could not enable notifications')
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  if (!member || !showPrompt) return null

  return (
    <Modal
      visible={showPrompt}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.icon}>🔥</Text>
          <Text style={styles.title}>Don't miss The Drop!</Text>
          <Text style={styles.message}>
            Get pinged every time a new question drops. Your group's waiting...
          </Text>
          
          <TouchableOpacity
            style={styles.enableButton}
            onPress={handleEnable}
          >
            <Text style={styles.enableButtonText}>Let's go</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
          >
            <Text style={styles.dismissButtonText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  enableButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
  },
  enableButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  dismissButton: {
    paddingVertical: 8,
  },
  dismissButtonText: {
    color: '#94a3b8',
    fontSize: 14,
  },
})