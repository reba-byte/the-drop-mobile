import { useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function Confession({ week, myAnswer, answers, onAnswer, member }) {
  const shouldReveal = week.shouldReveal || false
  const [confessionText, setConfessionText] = useState('')

  const handleSubmit = () => {
    if (confessionText.trim()) {
      onAnswer(confessionText.trim())
      setConfessionText('')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.bigIcon}>🫣</Text>
      <Text style={styles.typeTitle}>Confession</Text>
      <Text style={styles.questionText}>{week.question}</Text>

      {!myAnswer && !shouldReveal && (
        <>
          <Text style={styles.instructionText}>Confess anonymously:</Text>
          <TextInput
            style={styles.input}
            placeholder="Type your confession..."
            placeholderTextColor="#64748b"
            value={confessionText}
            onChangeText={setConfessionText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.submitButton, !confessionText.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!confessionText.trim()}
          >
            <Text style={styles.submitButtonText}>Submit Confession</Text>
          </TouchableOpacity>
        </>
      )}

      {myAnswer && !shouldReveal && (
        <Text style={styles.statusText}>
          ✓ Confession submitted! Waiting for others to answer...
        </Text>
      )}

      {shouldReveal && (
        <>
          <Text style={styles.instructionText}>Everyone's confessions:</Text>
          <View style={styles.confessionsContainer}>
            {answers.map((answer) => (
              <View key={answer.id} style={styles.confessionCard}>
                <Text style={styles.memberName}>
                  {`${answer.member.emoji} ${answer.member.name}`}
                </Text>
                <Text style={styles.confessionTextDisplay}>{answer.answer}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  bigIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  typeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 32,
  },
  instructionText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    backgroundColor: '#1e293b',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    minHeight: 120,
    fontSize: 16,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  submitButton: {
    width: '100%',
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
  confessionsContainer: {
    width: '100%',
    gap: 12,
  },
  confessionCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
  },
  memberName: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  confessionTextDisplay: {
    fontSize: 16,
    color: '#fff',
  },
  statusText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 24,
  },
})