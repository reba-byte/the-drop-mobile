import { useEffect, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useGroup } from '../context/GroupContext'
import { supabase } from '../lib/supabase'

const REACTIONS = [
  { type: 'fire', emoji: '🔥', label: 'Fire' },
  { type: 'dead', emoji: '💀', label: 'Dead' },
  { type: 'cry', emoji: '😭', label: 'Crying' },
  { type: 'sob', emoji: '😤', label: 'So real' },
  { type: 'skull', emoji: '☠️', label: 'Skull' },
  { type: 'slay', emoji: '💅', label: 'Slay' },
  { type: 'chef', emoji: '🤌', label: 'Chef\'s kiss' },
  { type: 'clown', emoji: '🤡', label: 'Clown' },
  { type: 'tea', emoji: '☕', label: 'Tea' },
  { type: 'npc', emoji: '🤖', label: 'NPC' },
  { type: 'cap', emoji: '🧢', label: 'Cap' },
  { type: '100', emoji: '💯', label: '100' },
]

export default function Reactions({ targetId, type }) {
  const { member } = useGroup()
  const [reactions, setReactions] = useState([])
  const [myReaction, setMyReaction] = useState(null)
  const [showPickerModal, setShowPickerModal] = useState(false)
  const [showReactorsModal, setShowReactorsModal] = useState(false)
  const [selectedReaction, setSelectedReaction] = useState(null)

  useEffect(() => {
    loadReactions()
    const subscription = supabase
      .channel(`reactions-${type}-${targetId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'reactions' 
      }, () => { 
        loadReactions() 
      })
      .subscribe()
    
    return () => { 
      subscription.unsubscribe() 
    }
  }, [targetId, type])

  async function loadReactions() {
    let query = supabase.from('reactions').select('*, member:members(name, emoji)')
    
    if (type === 'comment') {
      query = query.eq('comment_id', targetId)
    } else if (type === 'question') {
      const { data: answersData } = await supabase
        .from('answers')
        .select('id')
        .eq('week_id', targetId)
      
      const answerIds = answersData?.map(a => a.id) || []
      if (answerIds.length === 0) {
        setReactions([])
        return
      }
      query = query.in('answer_id', answerIds)
    }
    
    const { data } = await query
    setReactions(data || [])
    const mine = data?.find(r => r.member_id === member?.id)
    setMyReaction(mine?.reaction_type || null)
  }

  async function toggleReaction(reactionType) {
    // Remove existing reaction if clicking the same one
    if (myReaction === reactionType) {
      const reactionToRemove = reactions.find(
        r => r.member_id === member.id && r.reaction_type === reactionType
      )
      if (reactionToRemove) {
        await supabase.from('reactions').delete().eq('id', reactionToRemove.id)
      }
      setMyReaction(null)
    } else {
      // Remove old reaction if exists
      if (myReaction) {
        const oldReaction = reactions.find(r => r.member_id === member.id)
        if (oldReaction) {
          await supabase.from('reactions').delete().eq('id', oldReaction.id)
        }
      }
      
      // Add new reaction
      const insertData = { 
        member_id: member.id, 
        reaction_type: reactionType 
      }
      
      if (type === 'comment') {
        insertData.comment_id = targetId
      } else if (type === 'question') {
        const { data: answersData } = await supabase
          .from('answers')
          .select('id')
          .eq('week_id', targetId)
          .limit(1)
          .single()
        
        if (!answersData) return
        insertData.answer_id = answersData.id
      }
      
      await supabase.from('reactions').insert(insertData)
      setMyReaction(reactionType)
    }
    
    setShowPickerModal(false)
    loadReactions()
  }

  function showReactors(reactionType) {
    const reactorsForType = reactions
      .filter(r => r.reaction_type === reactionType)
      .map(r => r.member)
    
    setSelectedReaction({ 
      type: reactionType, 
      reactors: reactorsForType 
    })
    setShowReactorsModal(true)
  }

  // Calculate reaction counts
  const reactionCounts = {}
  REACTIONS.forEach(r => { 
    reactionCounts[r.type] = reactions.filter(rx => rx.reaction_type === r.type).length 
  })
  
  // Get unique reactions that have been used
  const usedReactions = REACTIONS.filter(r => reactionCounts[r.type] > 0)

  return (
    <View style={styles.container}>
      <View style={styles.reactionsRow}>
        {/* Show existing reactions as pills */}
        {usedReactions.map((reaction) => {
          const count = reactionCounts[reaction.type]
          const isMyReaction = myReaction === reaction.type
          
          return (
            <TouchableOpacity
              key={reaction.type}
              style={[
                styles.reactionPill,
                isMyReaction && styles.reactionPillSelected
              ]}
              onPress={() => toggleReaction(reaction.type)}
              onLongPress={() => showReactors(reaction.type)}
            >
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              <Text style={[
                styles.reactionCount,
                isMyReaction && styles.reactionCountSelected
              ]}>
                {count}
              </Text>
            </TouchableOpacity>
          )
        })}
        
        {/* Add reaction button */}
        <TouchableOpacity
          style={styles.addReactionButton}
          onPress={() => setShowPickerModal(true)}
        >
          <Text style={styles.addReactionText}>
            {usedReactions.length === 0 ? '😀 React' : '➕'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reaction Picker Modal */}
      <Modal
        visible={showPickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPickerModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowPickerModal(false)}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Choose a reaction</Text>
            <View style={styles.pickerGrid}>
              {REACTIONS.map((reaction) => (
                <TouchableOpacity
                  key={reaction.type}
                  style={[
                    styles.pickerOption,
                    myReaction === reaction.type && styles.pickerOptionSelected
                  ]}
                  onPress={() => toggleReaction(reaction.type)}
                >
                  <Text style={styles.pickerEmoji}>{reaction.emoji}</Text>
                  <Text style={styles.pickerLabel}>{reaction.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Reactors List Modal */}
      <Modal
        visible={showReactorsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReactorsModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowReactorsModal(false)}
        >
          <View style={styles.modalContent}>
            {selectedReaction && (
              <>
                <Text style={styles.modalTitle}>
                  {REACTIONS.find(r => r.type === selectedReaction.type)?.emoji} Reactions
                </Text>
                <View style={styles.reactorsList}>
                  {selectedReaction.reactors.map((reactor, index) => (
                    <Text key={index} style={styles.reactorName}>
                      {`${reactor.emoji} ${reactor.name}`}
                    </Text>
                  ))}
                </View>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={() => setShowReactorsModal(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  reactionPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reactionPillSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionCount: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  reactionCountSelected: {
    color: '#3b82f6',
  },
  addReactionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
    borderStyle: 'dashed',
  },
  addReactionText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    width: '85%',
    maxWidth: 320,
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 12,
    textAlign: 'center',
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  pickerOption: {
    backgroundColor: '#0f172a',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pickerOptionSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#1e3a8a',
  },
  pickerEmoji: {
    fontSize: 28,
  },
  pickerLabel: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    minWidth: 250,
    maxWidth: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  reactorsList: {
    gap: 12,
    marginBottom: 20,
  },
  reactorName: {
    fontSize: 16,
    color: '#fff',
  },
  closeButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
})