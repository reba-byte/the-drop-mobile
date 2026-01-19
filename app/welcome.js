import { useRouter } from 'expo-router'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useGroup } from '../context/GroupContext'

export default function WelcomeScreen() {
  const router = useRouter()
  const { member } = useGroup()

  return (
    <View style={styles.container}>
      {/* Header with profile icon */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.profileEmoji}>{member?.emoji || '👤'}</Text>
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <View style={styles.logoSection}>
        <Text style={styles.neonText}>THE DROP</Text>
        <Text style={styles.tagline}>Connect with your people</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Ready to get started?</Text>
        <Text style={styles.subtitle}>
          Join an existing group or create your own to start connecting
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/join-group')}
          >
            <Text style={styles.primaryButtonIcon}>🎟️</Text>
            <View>
              <Text style={styles.primaryButtonTitle}>I have an invite code</Text>
              <Text style={styles.primaryButtonSubtitle}>Join an existing group</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/create-group')}
          >
            <Text style={styles.secondaryButtonIcon}>✨</Text>
            <View>
              <Text style={styles.secondaryButtonTitle}>Create a group</Text>
              <Text style={styles.secondaryButtonSubtitle}>Start fresh with your people</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <TouchableOpacity 
        style={styles.profileLink}
        onPress={() => router.push('/profile')}
      >
        <Text style={styles.profileLinkText}>
          {!member?.name || !member?.emoji ? 'Complete your profile first →' : 'Edit profile →'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: 'flex-end',
  },
  profileButton: {
    backgroundColor: '#1e293b',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileEmoji: {
    fontSize: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 60,
    paddingHorizontal: 24,
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
    fontSize: 16,
    color: '#94a3b8',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  primaryButtonIcon: {
    fontSize: 40,
  },
  primaryButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  primaryButtonSubtitle: {
    fontSize: 14,
    color: '#e9d5ff',
  },
  secondaryButton: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  secondaryButtonIcon: {
    fontSize: 40,
  },
  secondaryButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  secondaryButtonSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  profileLink: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  profileLinkText: {
    color: '#8b5cf6',
    fontSize: 14,
  },
})