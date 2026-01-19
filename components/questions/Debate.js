import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function Debate({ week, myAnswer, answers, onAnswer, member }) {
  const shouldReveal = week.shouldReveal || false
  
  const optionAAnswers = answers.filter(a => a.answer === 'option_a')
  const optionBAnswers = answers.filter(a => a.answer === 'option_b')

  const handleVote = (option) => {
    if (myAnswer) return
    onAnswer(option)
  }

  return (
    <View style={styles.container}>
      {/* Big Icon */}
      <Text style={styles.bigIcon}>⚔️</Text>
      
      {/* Type Title */}
      <Text style={styles.typeTitle}>Debate</Text>
      
      {/* Question */}
      <Text style={styles.questionText}>{week.question}</Text>

      {!myAnswer && (
        <Text style={styles.instructionText}>Pick a side:</Text>
      )}

      {/* Options */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={[
            styles.optionButton,
            myAnswer?.answer === 'option_a' && styles.optionButtonSelected
          ]}
          onPress={() => handleVote('option_a')}
          disabled={!!myAnswer}
        >
          <Text style={styles.optionText}>{week.option_a}</Text>
          
          {shouldReveal && optionAAnswers.length > 0 && (
            <View style={styles.emojiContainer}>
              {optionAAnswers.map((a) => (
                <Text key={a.id} style={styles.emoji}>
                  {a.member?.emoji}
                </Text>
              ))}
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.optionButton,
            myAnswer?.answer === 'option_b' && styles.optionButtonSelected
          ]}
          onPress={() => handleVote('option_b')}
          disabled={!!myAnswer}
        >
          <Text style={styles.optionText}>{week.option_b}</Text>
          
          {shouldReveal && optionBAnswers.length > 0 && (
            <View style={styles.emojiContainer}>
              {optionBAnswers.map((a) => (
                <Text key={a.id} style={styles.emoji}>
                  {a.member?.emoji}
                </Text>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Status Message */}
      {myAnswer && !shouldReveal && (
        <Text style={styles.statusText}>
          ✓ Vote cast! Waiting for others to answer...
        </Text>
      )}

      {shouldReveal && (
        <Text style={styles.statusText}>
          {answers.length === 1 
            ? "You're the first to answer!" 
            : `${answers.length} people have answered`}
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
    gap: 12,
  },
  optionButton: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#6366f1',
    borderWidth: 2,
    borderColor: '#818cf8',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
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