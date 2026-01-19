import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useAuth } from '../context/AuthContext'

export default function LoginScreen() {
  const router = useRouter()
  const { signIn, signUp, session, biometricEnabled, biometricSupported, authenticateWithBiometrics } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Only show biometric if there's an existing session that needs unlocking
  const showBiometric = session && biometricEnabled && !isSignUp

  async function handleBiometricLogin() {
    const success = await authenticateWithBiometrics()
    if (success) {
      // Biometric passed - the AppContent in _layout will handle navigation
      router.replace('/')
    }
  }

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    setLoading(true)

    if (isSignUp) {
      const { error } = await signUp(email, password)
      if (error) {
        Alert.alert('Sign Up Error', error.message)
      } else {
        Alert.alert('Success!', 'Check your email to verify your account', [
          { text: 'OK', onPress: () => setIsSignUp(false) }
        ])
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) {
        Alert.alert('Sign In Error', error.message)
      }
      // If successful, AuthContext will update and _layout will handle navigation
    }

    setLoading(false)
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Text style={styles.neonText}>THE DROP</Text>
          <Text style={styles.tagline}>
            {isSignUp ? 'Join your people' : 'Welcome back'}
          </Text>
        </View>

        {/* Biometric Login Button - only for existing sessions */}
        {showBiometric && (
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={handleBiometricLogin}
          >
            <Text style={styles.biometricEmoji}>👤</Text>
            <Text style={styles.biometricText}>Sign in with Face ID</Text>
          </TouchableOpacity>
        )}

        {/* Or Divider (only show if biometric is enabled) */}
        {showBiometric && (
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>
        )}

        {/* Form */}
        <View style={styles.formCard}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          {!isSignUp && (
            <TouchableOpacity 
              onPress={() => router.push('/reset-password')}
              style={styles.forgotButton}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Toggle Sign Up/Sign In */}
        <View style={styles.toggleSection}>
          <Text style={styles.toggleText}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </Text>
          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.toggleLink}>
              {isSignUp ? 'Sign in' : 'Sign up'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  neonText: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: 8,
    color: '#fff',
    textShadowColor: '#8b5cf6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    color: '#94a3b8',
    letterSpacing: 1,
  },
  biometricButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 2,
    borderColor: '#8b5cf6',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  biometricEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  biometricText: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    color: '#64748b',
    fontSize: 14,
  },
  formCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#8b5cf6',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#6d28d9',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  toggleText: {
    color: '#64748b',
    fontSize: 14,
  },
  toggleLink: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '600',
  },
})