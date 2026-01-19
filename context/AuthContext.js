import AsyncStorage from '@react-native-async-storage/async-storage'
import * as LocalAuthentication from 'expo-local-authentication'
import { createContext, useContext, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

const BIOMETRIC_ENABLED_KEY = '@biometric_enabled'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [biometricSupported, setBiometricSupported] = useState(false)

  useEffect(() => {
    // Check biometric support
    checkBiometricSupport()
    
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkBiometricSupport() {
    const compatible = await LocalAuthentication.hasHardwareAsync()
    const enrolled = await LocalAuthentication.isEnrolledAsync()
    const supported = compatible && enrolled
    
    setBiometricSupported(supported)

    if (supported) {
      const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY)
      setBiometricEnabled(enabled === 'true')
    }
  }

  async function authenticateWithBiometrics() {
    if (!biometricSupported) {
      Alert.alert('Not Available', 'Biometric authentication is not available on this device')
      return false
    }

    const biometricType = await LocalAuthentication.supportedAuthenticationTypesAsync()
    const isFaceID = biometricType.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
    
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Authenticate with ${isFaceID ? 'Face ID' : 'Touch ID'}`,
      fallbackLabel: 'Use password',
      cancelLabel: 'Cancel',
    })

    return result.success
  }

  async function enableBiometrics() {
    if (!biometricSupported) {
      Alert.alert('Not Available', 'Biometric authentication is not available on this device')
      return
    }

    // Test biometric authentication
    const success = await authenticateWithBiometrics()
    
    if (success) {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true')
      setBiometricEnabled(true)
      Alert.alert('Success', 'Biometric authentication enabled!')
    }
  }

  async function disableBiometrics() {
    await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY)
    setBiometricEnabled(false)
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    // Offer to enable biometrics on first sign in
    if (!error && biometricSupported && !biometricEnabled) {
      setTimeout(() => {
        Alert.alert(
          'Enable Face ID?',
          'Use Face ID for faster sign in next time',
          [
            { text: 'Not Now', style: 'cancel' },
            { text: 'Enable', onPress: enableBiometrics },
          ]
        )
      }, 500)
    }

    return { data, error }
  }

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    biometricEnabled,
    biometricSupported,
    enableBiometrics,
    disableBiometrics,
    authenticateWithBiometrics,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}