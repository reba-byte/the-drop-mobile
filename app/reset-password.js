import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { supabase } from '../lib/supabase'

export default function ResetPasswordScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleReset() {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'thedropmobile://reset-password',
    })

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      setSent(true)
    }

    setLoading(false)
  }

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.successCard}>
          <Text style={styles.successEmoji}>📧</Text>
          <Text style={styles.successTitle}>Check your email!</Text>
          <Text style={styles.successText}>
            We've sent password reset instructions to {email}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
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
        {/* Header */}
        <TouchableOpacity 
          style={styles.backLink}
          onPress={() => router.back()}
        >
          <Text style={styles.backLinkText}>← Back</Text>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you instructions to reset your password
          </Text>

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

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleReset}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  backLink: {
    marginBottom: 32,
  },
  backLinkText: {
    color: '#8b5cf6',
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 32,
    lineHeight: 24,
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
  successCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successEmoji: {
    fontSize: 72,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})