import { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useGroup } from '../../context/GroupContext'
import { supabase } from '../../lib/supabase'

export default function Prediction({ week, myAnswer, answers, onAnswer, member }) {
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
    onAnswer(memberId)
  }

  if (myAnswer && shouldReveal) {
    // Count predictions for each member
    const voteCounts = {}
    answers.forEach(answer => {
      voteCounts[answer.answer] = (voteCounts[answer.answer] || 0) + 1
    })

    return (
      <View style={styles.container}>
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Predictions:</Text>
          {members.map(m => {
            const votes = voteCounts[m.id] || 0
            const percentage = answers.length > 0 ? Math.round((votes / answers.length) * 100) : 0
            const isMyPrediction = myAnswer.answer === m.id
            
            return (
              <View key={m.id} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.memberName}>
                    {`${m.emoji} ${m.name}`}
                  </Text>
                  {isMyPrediction && <Text style={styles.yourVote}>Your prediction</Text>}
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                </View>
                <Text style={styles.voteCount}>{votes} predictions ({percentage}%)</Text>
              </View>
            )
          })}
        </View>

        <View style={styles.votersSection}>
          <Text style={styles.votersTitle}>Everyone's predictions:</Text>
          {answers.map(answer => {
            const predicted = members.find(m => m.id === answer.answer)
            return (
              <View key={answer.id} style={styles.voterRow}>
                <Text style={styles.voterName}>{`${answer.member.emoji} ${answer.member.name}`}</Text>
                <Text style={styles.voterChoice}>
                  {`→ ${predicted?.emoji} ${predicted?.name}`}
                </Text>
              </View>
            )
          })}
        </View>
      </View>
    )
  }

  if (myAnswer && !shouldReveal) {
    const predicted = members.find(m => m.id === myAnswer.answer)
    return (
      <View style={styles.container}>
        <View style={styles.waitingCard}>
          <Text style={styles.waitingText}>
            {`✓ You predicted: ${predicted?.emoji} ${predicted?.name}`}
          </Text>
          <Text style={styles.waitingSubtext}>Waiting for everyone else...</Text>
        </View>
      </View>
    )
  }

  // Show member selection
  return (
    <View style={styles.container}>
      {members.map(m => (
        <TouchableOpacity
          key={m.id}
          style={styles.memberButton}
          onPress={() => handleVote(m.id)}
        >
          <Text style={styles.memberButtonText}>
            {`${m.emoji} ${m.name}`}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  memberButton: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
  },
  memberButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
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
  },
  resultsContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
  },
  resultCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  yourVote: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#0f172a',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  voteCount: {
    fontSize: 14,
    color: '#94a3b8',
  },
  votersSection: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  votersTitle: {
    fontSize: 14,
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  voterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  voterName: {
    fontSize: 16,
    color: '#fff',
  },
  voterChoice: {
    fontSize: 14,
    color: '#94a3b8',
  },
})