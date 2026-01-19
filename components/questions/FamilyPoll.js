import { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useGroup } from '../../context/GroupContext'
import { supabase } from '../../lib/supabase'

export default function FamilyPoll({ week, myAnswer, answers, onAnswer, member }) {
  const { selectedGroup } = useGroup()
  const [members, setMembers] = useState([])
  const shouldReveal = week.shouldReveal || false

  useEffect(() => {
    loadMembers()
  }, [])

  async function loadMembers() {
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('group_id', selectedGroup.id)
      .eq('is_lurker', false) // Only show non-lurker members as options
      .order('name')

    setMembers(data || [])
  }

  const handleVote = (memberId) => {
    if (myAnswer) return
    onAnswer(memberId)
  }

  const voteCounts = {}
  answers.forEach(answer => {
    voteCounts[answer.answer] = (voteCounts[answer.answer] || 0) + 1
  })

  return (
    <View style={styles.container}>
      <Text style={styles.bigIcon}>👀</Text>
      <Text style={styles.typeTitle}>Group Poll</Text>
      <Text style={styles.questionText}>{week.question}</Text>

      {!myAnswer && (
        <Text style={styles.instructionText}>Cast your vote:</Text>
      )}

      <View style={styles.optionsContainer}>
        {members.map((m) => {
          const votes = voteCounts[m.id] || 0
          const isMyVote = myAnswer?.answer === m.id
          
          return (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.optionButton,
                isMyVote && styles.optionButtonSelected
              ]}
              onPress={() => handleVote(m.id)}
              disabled={!!myAnswer}
            >
              <View style={styles.memberRow}>
                <Text style={styles.memberEmoji}>{m.emoji}</Text>
                <Text style={styles.memberName}>{m.name}</Text>
              </View>
              {shouldReveal && votes > 0 && (
                <Text style={styles.voteCount}>{votes}</Text>
              )}
            </TouchableOpacity>
          )
        })}
      </View>

      {myAnswer && !shouldReveal && (
        <Text style={styles.statusText}>
          ✓ Vote cast! Waiting for others to answer...
        </Text>
      )}

      {shouldReveal && (
        <Text style={styles.statusText}>
          {answers.length === 1 
            ? "You're the first to vote!" 
            : `${answers.length} votes cast`}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#6366f1',
    borderWidth: 2,
    borderColor: '#818cf8',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberEmoji: {
    fontSize: 24,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  voteCount: {
    fontSize: 18,
    color: '#94a3b8',
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 24,
  },
})