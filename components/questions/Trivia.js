import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function Trivia({ week, myAnswer, answers, onAnswer, member }) {
  const shouldReveal = week.shouldReveal || false
  const [triviaAnswer, setTriviaAnswer] = useState('')

  const handleSubmit = () => {
    if (triviaAnswer.trim()) {
      onAnswer(triviaAnswer.trim())
      setTriviaAnswer('')
    }
  }

  // Waiting state - answered but not revealed
  if (myAnswer && !shouldReveal) {
    return (
      <View style={styles.container}>
        <Text style={styles.bigIcon}>🧠</Text>
        <Text style={styles.typeTitle}>Trivia</Text>
        <Text style={styles.questionText}>{week.question}</Text>
        
        <View style={styles.waitingCard}>
          <Text style={styles.waitingText}>✓ Answer submitted</Text>
          <Text style={styles.waitingSubtext}>Waiting for others to answer...</Text>
          <View style={styles.myAnswerPreview}>
            <Text style={styles.previewLabel}>Your answer:</Text>
            <Text style={styles.previewText}>{myAnswer.answer}</Text>
          </View>
        </View>
      </View>
    )
  }

  // Results revealed
  if (myAnswer && shouldReveal) {
    const correctAnswer = week.correct_answer?.toLowerCase()
    
    const sortedAnswers = [...answers].sort((a, b) => {
      const aCorrect = a.answer?.toLowerCase() === correctAnswer
      const bCorrect = b.answer?.toLowerCase() === correctAnswer
      if (aCorrect && !bCorrect) return -1
      if (!aCorrect && bCorrect) return 1
      return 0
    })

    return (
      <ScrollView style={styles.container}>
        <Text style={styles.bigIcon}>🧠</Text>
        <Text style={styles.typeTitle}>Trivia</Text>
        <Text style={styles.questionText}>{week.question}</Text>

        {/* Correct answer */}
        <View style={styles.correctAnswerCard}>
          <Text style={styles.correctLabel}>Correct Answer</Text>
          <Text style={styles.correctAnswerText}>{week.correct_answer}</Text>
        </View>

        {/* All answers */}
        {sortedAnswers.length > 0 && (
          <View style={styles.allAnswersSection}>
            <Text style={styles.sectionTitle}>ANSWERS</Text>
            
            {sortedAnswers.map((entry, index) => {
              const isCorrect = entry.answer?.toLowerCase() === correctAnswer
              return (
                <View
                  key={entry.id}
                  style={[
                    styles.answerRow,
                    isCorrect ? styles.correctAnswerRow : styles.incorrectAnswerRow
                  ]}
                >
                  <View style={styles.answerRowContent}>
                    <View style={styles.memberInfo}>
                      <Text style={styles.emoji}>{entry.member?.emoji}</Text>
                      <Text style={[styles.memberName, isCorrect && styles.correctMemberName]}>
                        {entry.member?.name}
                      </Text>
                    </View>
                    <View style={styles.answerWithBadge}>
                      <Text style={[styles.answerText, isCorrect ? styles.correctAnswerText : styles.incorrectAnswerText]}>
                        {entry.answer}
                      </Text>
                      {isCorrect && index === 0 && <Text style={styles.trophy}>🏆</Text>}
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    )
  }

  // Input form - not yet answered
  return (
    <View style={styles.container}>
      <Text style={styles.bigIcon}>🧠</Text>
      <Text style={styles.typeTitle}>Trivia</Text>
      <Text style={styles.questionText}>{week.question}</Text>
      
      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="Type your answer..."
          placeholderTextColor="#64748b"
          value={triviaAnswer}
          onChangeText={setTriviaAnswer}
          autoCapitalize="sentences"
        />
        <TouchableOpacity 
          style={[styles.submitButton, !triviaAnswer.trim() && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!triviaAnswer.trim()}
        >
          <Text style={styles.submitButtonText}>Lock it in 🔒</Text>
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
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#fff',
    padding: 16,
    borderRadius: 8,
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  submitButton: {
    backgroundColor: '#06b6d4',
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
    borderWidth: 1,
    borderColor: '#334155',
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
  myAnswerPreview: {
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
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  correctAnswerCard: {
    backgroundColor: '#0e7490',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#155e75',
  },
  correctLabel: {
    fontSize: 12,
    color: '#67e8f9',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  correctAnswerText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  allAnswersSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  answerRow: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  correctAnswerRow: {
    backgroundColor: '#064e3b',
    borderWidth: 1,
    borderColor: '#047857',
  },
  incorrectAnswerRow: {
    backgroundColor: '#1e293b80',
    borderWidth: 1,
    borderColor: '#33415580',
  },
  answerRowContent: {
    gap: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 20,
  },
  memberName: {
    fontSize: 14,
    color: '#94a3b8',
  },
  correctMemberName: {
    color: '#6ee7b7',
  },
  answerWithBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 28,
  },
  answerText: {
    fontSize: 16,
    flex: 1,
  },
  correctAnswerText: {
    color: '#6ee7b7',
  },
  incorrectAnswerText: {
    color: '#f87171',
  },
  trophy: {
    fontSize: 20,
  },
})