import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function ThisOrThat({ week, myAnswer, answers, onAnswer, member }) {
  const shouldReveal = week.shouldReveal || false
  
  const optionAAnswers = answers.filter(a => a.answer === 'option_a')
  const optionBAnswers = answers.filter(a => a.answer === 'option_b')

  const handleVote = (option) => {
    if (myAnswer) return
    onAnswer(option)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.bigIcon}>🤯</Text>
      <Text style={styles.typeTitle}>This or That</Text>
      <Text style={styles.questionText}>Would you rather...</Text>

      {!myAnswer && (
        <Text style={styles.instructionText}>Make your choice:</Text>
      )}

      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={[
            styles.optionButton,
            myAnswer?.answer === 'option_a' && styles.optionButtonSelected
          ]}
          onPress={() => handleVote('option_a')}
          disabled={!!myAnswer}
        >
          <Text style={styles.optionLabel}>Option A</Text>
          <Text style={styles.optionText}>{week.option_a}</Text>
          
          {shouldReveal && optionAAnswers.length > 0 && (
            <View style={styles.emojiContainer}>
              {optionAAnswers.map((a) => (
                <Text key={a.id} style={styles.emoji}>{a.member?.emoji}</Text>
              ))}
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.orText}>OR</Text>

        <TouchableOpacity 
          style={[
            styles.optionButton,
            myAnswer?.answer === 'option_b' && styles.optionButtonSelected
          ]}
          onPress={() => handleVote('option_b')}
          disabled={!!myAnswer}
        >
          <Text style={styles.optionLabel}>Option B</Text>
          <Text style={styles.optionText}>{week.option_b}</Text>
          
          {shouldReveal && optionBAnswers.length > 0 && (
            <View style={styles.emojiContainer}>
              {optionBAnswers.map((a) => (
                <Text key={a.id} style={styles.emoji}>{a.member?.emoji}</Text>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </View>

      {myAnswer && !shouldReveal && (
        <Text style={styles.statusText}>
          ✓ Choice made! Waiting for others to answer...
        </Text>
      )}

      {shouldReveal && (
        <Text style={styles.statusText}>
          {answers.length === 1 
            ? "You're the first to choose!" 
            : `${answers.length} people have decided`}
        </Text>
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
  optionsContainer: {
    width: '100%',
    gap: 16,
  },
  optionButton: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#1e293b',
  },
  optionButtonSelected: {
    backgroundColor: '#a855f7',
    borderWidth: 2,
    borderColor: '#c084fc',
  },
  optionLabel: {
    fontSize: 12,
    color: '#c084fc',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  orText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748b',
    textAlign: 'center',
  },
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 12,
  },
  emoji: {
    fontSize: 20,
  },
  statusText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 24,
  },
})