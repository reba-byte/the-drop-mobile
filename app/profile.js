import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useGroup } from '../context/GroupContext'
import { supabase } from '../lib/supabase'

const EMOJI_OPTIONS = [
  '😀', '😎', '🤓', '🥳', '😇', '🤩', '😴', '🤔',
  '🙃', '😊', '🥰', '😍', '🤗', '🤭', '🤪', '😜',
  '👻', '👽', '🤖', '🎃', '😺', '🦊', '🐶', '🐱',
  '🦁', '🐯', '🐼', '🐨', '🐸', '🦄', '🐷', '🐮',
  '🌟', '⭐', '✨', '💫', '🔥', '💎', '🎨', '🎭',
  '🎪', '🎯', '🎲', '🎮', '🎸', '🎺', '🎻', '🎹',
]

export default function ProfileSettings() {
  const router = useRouter()
  const { member, loadUserGroups } = useGroup()
  const [name, setName] = useState(member?.name || '')
  const [selectedEmoji, setSelectedEmoji] = useState(member?.emoji || '👤')
  const [saving, setSaving] = useState(false)

  async function saveProfile() {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name')
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('members')
      .update({
        name: name.trim(),
        emoji: selectedEmoji,
      })
      .eq('id', member.id)

    setSaving(false)

    if (error) {
      Alert.alert('Error', error.message)
      return
    }

    Alert.alert('Success', 'Profile updated!')
    
    // Reload groups to update the member info in context
    if (loadUserGroups) {
      await loadUserGroups()
    }
    
    router.back()
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Profile Settings</Text>

      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>Preview:</Text>
        <Text style={styles.previewText}>
          {selectedEmoji} {name || 'Your Name'}
        </Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Name</Text>
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
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={saveProfile}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Text>
      </TouchableOpacity>

            <TouchableOpacity 
        style={styles.createGroupButton}
        onPress={() => router.push('/create-group')}
      >
        <Text style={styles.createGroupButtonText}>+ Create New Group</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.joinGroupButton}
        onPress={() => router.push('/join-group')}
      >
        <Text style={styles.joinGroupButtonText}>+ Join Another Group</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.signOutButton}
        onPress={() => supabase.auth.signOut()}
      >
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
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
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  formSection: {
    marginBottom: 32,
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
  saveButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#334155',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#7f1d1d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  joinGroupButton: {
  backgroundColor: '#10b981',
  padding: 16,
  borderRadius: 8,
  alignItems: 'center',
  marginBottom: 12,
},
joinGroupButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
createGroupButton: {
  backgroundColor: '#3b82f6',
  padding: 16,
  borderRadius: 8,
  alignItems: 'center',
  marginBottom: 12,
},
createGroupButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
})