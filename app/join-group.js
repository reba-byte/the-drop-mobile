import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useGroup } from '../context/GroupContext'
import { supabase } from '../lib/supabase'

export default function JoinGroup() {
  const router = useRouter()
  const { loadUserGroups } = useGroup()
  const [inviteCode, setInviteCode] = useState('')
  const [name, setName] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('👤')
  const [joining, setJoining] = useState(false)

  const EMOJI_OPTIONS = [
    '😀', '😎', '🤓', '🥳', '😇', '🤩', '😴', '🤔',
    '🙃', '😊', '🥰', '😍', '🤗', '🤭', '🤪', '😜',
    '👻', '👽', '🤖', '🎃', '😺', '🦊', '🐶', '🐱',
  ]

  async function joinGroup() {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code')
      return
    }

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name')
      return
    }

    setJoining(true)

    // Find the group with this invite code
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('invite_code', inviteCode.trim().toUpperCase())
      .single()

    if (groupError || !groupData) {
      setJoining(false)
      Alert.alert('Error', 'Invalid invite code')
      return
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('members')
      .select('*')
      .eq('group_id', groupData.id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      setJoining(false)
      Alert.alert('Already a Member', 'You are already a member of this group!')
      router.back()
      return
    }

    // Check if game has already started
    const now = new Date()
    const gameStarted = groupData.game_starts_at && new Date(groupData.game_starts_at) <= now
    const isLurker = gameStarted

    // Show warning if joining as lurker
    if (isLurker) {
      Alert.alert(
        'Game Already Started',
        `The game has already started for "${groupData.name}". You can join as a Lurker (view-only mode). You can see questions and answers but won't be counted toward "all answered" reveals.`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setJoining(false) },
          { 
            text: 'Join as Lurker', 
            onPress: () => completeJoin(groupData, user, isLurker)
          }
        ]
      )
    } else {
      completeJoin(groupData, user, isLurker)
    }
  }

  async function completeJoin(groupData, user, isLurker) {
    // Add user as a member
    const { error: memberError } = await supabase
      .from('members')
      .insert({
        group_id: groupData.id,
        user_id: user.id,
        name: name.trim(),
        emoji: selectedEmoji,
        is_curator: false,
        is_lurker: isLurker,
      })

    setJoining(false)

    if (memberError) {
      Alert.alert('Error', memberError.message)
      return
    }

    const message = isLurker 
      ? `You joined ${groupData.name} as a Lurker! You can see everything but won't be counted in voting.`
      : `You joined ${groupData.name}!`
    
    Alert.alert('Success!', message)
    
    // Reload groups
    await loadUserGroups()
    router.back()
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Join a Group</Text>
      <Text style={styles.subtitle}>Enter an invite code to join</Text>

      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>You'll appear as:</Text>
        <Text style={styles.previewText}>
          {selectedEmoji} {name || 'Your Name'}
        </Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Invite Code</Text>
        <TextInput
          style={styles.input}
          value={inviteCode}
          onChangeText={setInviteCode}
          placeholder="Enter code..."
          placeholderTextColor="#64748b"
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name..."
          placeholderTextColor="#64748b"
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Choose Your Emoji</Text>
        <View style={styles.emojiGrid}>
          {EMOJI_OPTIONS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={[
                styles.emojiButton,
                selectedEmoji === emoji && styles.emojiButtonSelected
              ]}
              onPress={() => setSelectedEmoji(emoji)}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.joinButton, joining && styles.joinButtonDisabled]}
        onPress={joinGroup}
        disabled={joining}
      >
        <Text style={styles.joinButtonText}>
          {joining ? 'Joining...' : 'Join Group'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 20,
  },
  backText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 24,
  },
  previewCard: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  previewLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  previewText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#fff',
    padding: 16,
    borderRadius: 8,
    fontSize: 18,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emojiButton: {
    backgroundColor: '#1e293b',
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiButtonSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#1e3a8a',
  },
  emojiText: {
    fontSize: 32,
  },
  joinButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  joinButtonDisabled: {
    backgroundColor: '#334155',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})