import { Slot } from 'expo-router'
import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { GroupProvider } from '../context/GroupContext'
import { useNotifications } from '../hooks/useNotifications'
import LoginScreen from './login'

function AppContent() {
  useNotifications()
  const { session, loading, biometricEnabled, authenticateWithBiometrics } = useAuth()
  const [biometricPassed, setBiometricPassed] = useState(false)
  const [checkingBiometric, setCheckingBiometric] = useState(false)

  useEffect(() => {
    async function checkBiometric() {
      // If user has session and biometric enabled, require biometric auth
      if (session && biometricEnabled && !biometricPassed) {
        setCheckingBiometric(true)
        const success = await authenticateWithBiometrics()
        setBiometricPassed(success)
        setCheckingBiometric(false)
        
        if (!success) {
          // User cancelled or failed biometric - stay on login
          setBiometricPassed(false)
        }
      }
    }
    
    if (!loading) {
      checkBiometric()
    }
  }, [session, biometricEnabled, loading])

  // Show loading state briefly
  if (loading || checkingBiometric) {
    return <View style={styles.container} />
  }

  // Show login screen if no session OR if biometric required but not passed
  if (!session || (biometricEnabled && !biometricPassed)) {
    return <LoginScreen />
  }

  // User is authenticated - show app
  return (
    <GroupProvider session={session}>
      <Slot />
    </GroupProvider>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
})