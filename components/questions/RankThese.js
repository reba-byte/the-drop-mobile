import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function RankThese({ week, myAnswer, answers, onAnswer, member }) {
  const shouldReveal = week.shouldReveal || false
  
  // Handle items - could be string or array depending on source
  const items = typeof week.items === 'string' 
    ? JSON.parse(week.items) 
    : (week.items || [])
  
  const [rankedItems, setRankedItems] = useState(items)

  const moveUp = (index) => {
    if (index === 0) return
    const newItems = [...rankedItems]
    ;[newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]]
    setRankedItems(newItems)
  }

  const moveDown = (index) => {
    if (index === rankedItems.length - 1) return
    const newItems = [...rankedItems]
    ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
    setRankedItems(newItems)
  }

  const handleSubmit = () => {
    onAnswer(JSON.stringify(rankedItems))
  }

  // Waiting state - answered but not revealed
  if (myAnswer && !shouldReveal) {
    const myRanking = JSON.parse(myAnswer.answer)
    return (
      <View style={styles.container}>
        <Text style={styles.bigIcon}>📊</Text>
        <Text style={styles.typeTitle}>Rank These</Text>
        <Text style={styles.questionText}>{week.question}</Text>
        
        <View style={styles.waitingCard}>
          <Text style={styles.waitingText}>✓ Ranking submitted</Text>
          <Text style={styles.waitingSubtext}>Waiting for others to answer...</Text>
          <View style={styles.rankingPreview}>
            <Text style={styles.previewLabel}>Your ranking:</Text>
            {myRanking.map((item, index) => (
              <View key={item} style={styles.previewItemRow}>
                <Text style={styles.previewRank}>{index + 1}.</Text>
                <Text style={styles.previewItem}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    )
  }

  // Results revealed
  if (myAnswer && shouldReveal) {
    const myRanking = JSON.parse(myAnswer.answer)
    
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.bigIcon}>📊</Text>
        <Text style={styles.typeTitle}>Rank These</Text>
        <Text style={styles.questionText}>{week.question}</Text>

        {/* Your ranking */}
        <View style={styles.yourRankingSection}>
          <Text style={styles.sectionTitle}>YOUR RANKING</Text>
          <View style={styles.rankingCard}>
            {myRanking.map((item, index) => (
              <View key={item} style={styles.rankRow}>
                <Text style={styles.rankNumber}>{index + 1}.</Text>
                <Text style={styles.rankItemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Other members' rankings */}
        {answers.filter(a => a.member_id !== myAnswer?.member_id).length > 0 && (
          <View style={styles.otherRankingsSection}>
            {answers
              .filter(a => a.member_id !== myAnswer?.member_id)
              .map((answer) => {
                const ranking = JSON.parse(answer.answer)
                return (
                  <View key={answer.id} style={styles.memberRankingCard}>
                    <View style={styles.memberHeader}>
                      <Text style={styles.memberEmoji}>{answer.member?.emoji}</Text>
                      <Text style={styles.memberName}>{answer.member?.name}</Text>
                    </View>
                    <View style={styles.memberRankingList}>
                      {ranking.map((item, index) => (
                        <View key={item} style={styles.rankRow}>
                          <Text style={styles.rankNumber}>{index + 1}.</Text>
                          <Text style={styles.rankItemTextSmall}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )
              })}
          </View>
        )}

        {/* Commentary */}
        <View style={styles.commentary}>
          <Text style={styles.commentaryText}>
            Interesting how everyone's priorities differ here.
          </Text>
        </View>
      </ScrollView>
    )
  }

  // Input form - not yet answered
  return (
    <View style={styles.container}>
      <Text style={styles.bigIcon}>📊</Text>
      <Text style={styles.typeTitle}>Rank These</Text>
      <Text style={styles.questionText}>{week.question}</Text>
      <Text style={styles.instructionText}>Tap arrows to reorder from worst to best</Text>
      
      <View style={styles.rankingList}>
        {rankedItems.map((item, index) => (
          <View key={item} style={styles.rankingItem}>
            <View style={styles.itemContent}>
              <Text style={styles.rankBadgeText}>
                {index === 0 ? '😢' : index === rankedItems.length - 1 ? '🔥' : `${index + 1}.`}
              </Text>
              <Text style={styles.itemText}>{item}</Text>
            </View>
            <View style={styles.arrowButtons}>
              <TouchableOpacity 
                style={[styles.arrowButton, index === 0 && styles.arrowButtonDisabled]}
                onPress={() => moveUp(index)}
                disabled={index === 0}
              >
                <Text style={styles.arrowText}>↑</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.arrowButton, index === rankedItems.length - 1 && styles.arrowButtonDisabled]}
                onPress={() => moveDown(index)}
                disabled={index === rankedItems.length - 1}
              >
                <Text style={styles.arrowText}>↓</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Ranking</Text>
      </TouchableOpacity>
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
  instructionText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 16,
  },
  rankingList: {
    gap: 8,
  },
  rankingItem: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  rankBadgeText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
    width: 32,
  },
  itemText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
  },
  arrowButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  arrowButton: {
    backgroundColor: '#0f172a',
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowButtonDisabled: {
    opacity: 0.3,
  },
  arrowText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
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
  rankingPreview: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  previewLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  previewItemRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  previewRank: {
    fontSize: 14,
    color: '#64748b',
    width: 24,
  },
  previewItem: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },
  yourRankingSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  rankingCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  rankNumber: {
    fontSize: 14,
    color: '#64748b',
    width: 24,
  },
  rankItemText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  rankItemTextSmall: {
    fontSize: 14,
    color: '#cbd5e1',
    flex: 1,
  },
  otherRankingsSection: {
    gap: 12,
  },
  memberRankingCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  memberEmoji: {
    fontSize: 20,
  },
  memberName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  memberRankingList: {
    gap: 4,
  },
  commentary: {
    marginTop: 24,
    marginBottom: 40,
  },
  commentaryText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
  },
})