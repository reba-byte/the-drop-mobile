import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function Confession({ week, myAnswer, answers, onAnswer, member }) {
  const shouldReveal = week.shouldReveal || false
  const [confessionText, setConfessionText] = useState('')

  const handleSubmit = () => {
    if (confessionText.trim()) {
      onAnswer(confessionText.trim())
      setConfessionText('')
    }
  }

  // Waiting state - answered but not revealed
  if (myAnswer && !shouldReveal) {
    return (
      <View style={styles.container}>
        <Text style={styles.bigIcon}>🫣</Text>
        <Text style={styles.typeTitle}>Confession</Text>
        <Text style={styles.questionText}>{week.question}</Text>
        
        <View style={styles.waitingCard}>
          <Text style={styles.waitingText}>✓ Confession submitted</Text>
          <Text style={styles.waitingSubtext}>Waiting for others to answer...</Text>
          <View style={styles.myConfessionPreview}>
            <Text style={styles.previewLabel}>Your confession:</Text>
            <Text style={styles.previewText}>{myAnswer.answer}</Text>
          </View>
        </View>
      </View>
    )
  }

  // Results revealed
  if (myAnswer && shouldReveal) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.bigIcon}>🫣</Text>
        <Text style={styles.typeTitle}>Confession</Text>
        <Text style={styles.questionText}>{week.question}</Text>

        <View style={styles.confessionsSection}>
          {answers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No confessions yet...</Text>
            </View>
          ) : (
            answers.map(answer => (
              <View key={answer.id} style={styles.confessionCard}>
                <View style={styles.memberHeader}>
                  <Text style={styles.memberEmoji}>{answer.member?.emoji}</Text>
                  <Text style={styles.memberName}>{answer.member?.name}</Text>
                </View>
                <Text style={styles.confessionText}>{answer.answer}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    )
  }

  // Input form - not yet answered
  return (
    <View style={styles.container}>
      <Text style={styles.bigIcon}>🫣</Text>
      <Text style={styles.typeTitle}>Confession</Text>
      <Text style={styles.questionText}>{week.question}</Text>
      
      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="Confess..."
          placeholderTextColor="#64748b"
          value={confessionText}
          onChangeText={setConfessionText}
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity 
          style={[styles.submitButton, !confessionText.trim() && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!confessionText.trim()}
        >
          <Text style={styles.submitButtonText}>Submit confession 🫣</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  bigIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  typeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputCard: {
    gap: 16,
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    minHeight: 120,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#334155',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  waitingCard: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 18,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 8,
  },
  waitingSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
  },
  myConfessionPreview: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  previewLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#fff',
  },
  confessionsSection: {
    gap: 12,
  },
  confessionCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  memberEmoji: {
    fontSize: 20,
  },
  memberName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  confessionText: {
    fontSize: 16,
    color: '#cbd5e1',
    lineHeight: 24,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
})