import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Comments from '../../components/Comments'
import Confession from '../../components/questions/Confession'
import Debate from '../../components/questions/Debate'
import FamilyPoll from '../../components/questions/FamilyPoll'
import HotTake from '../../components/questions/HotTake'
import Prediction from '../../components/questions/Prediction'
import RankThese from '../../components/questions/RankThese'
import ThisOrThat from '../../components/questions/ThisOrThat'
import Trivia from '../../components/questions/Trivia'
import Reactions from '../../components/Reactions'
import { useGroup } from '../../context/GroupContext'
import { supabase } from '../../lib/supabase'

export default function QuestionScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { member, selectedGroup } = useGroup()
  
  const [week, setWeek] = useState(null)
  const [myAnswer, setMyAnswer] = useState(null)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedGroup && member) {
      loadQuestion()
    }
  }, [selectedGroup, member, id])

  async function loadQuestion() {
    const { data: weekData } = await supabase
      .from('weeks')
      .select('*')
      .eq('id', id)
      .single()

    if (!weekData) {
      setLoading(false)
      return
    }

    const { data: answersData } = await supabase
      .from('answers')
      .select('*, member:members(name, emoji, is_lurker)')
      .eq('week_id', id)

    // Filter out lurker answers - they don't count toward "all answered"
    const validAnswers = answersData?.filter(a => !a.member?.is_lurker) || []
    setAnswers(answersData || []) // Keep all answers for display
    
    const mine = answersData?.find(a => a.member_id === member?.id)
    setMyAnswer(mine)

    if (!selectedGroup) {
      setLoading(false)
      return
    }

    // Get the group to check member locking
    const { data: groupData } = await supabase
      .from('groups')
      .select('member_count_locked, expected_member_count')
      .eq('id', selectedGroup.id)
      .single()

    // Determine total expected members
    let expectedCount
    if (groupData?.member_count_locked && groupData?.expected_member_count > 0) {
      // Game has started - use locked count
      expectedCount = groupData.expected_member_count
    } else {
      // Game hasn't started - count current non-lurker members
      const { data: membersData } = await supabase
        .from('members')
        .select('id')
        .eq('group_id', selectedGroup.id)
        .eq('is_lurker', false)
      
      expectedCount = membersData?.length || 0
    }

    const allAnswered = validAnswers.length >= expectedCount && expectedCount > 0

    const now = new Date()
    const revealsAt = weekData.reveals_at ? new Date(weekData.reveals_at) : null
    const shouldReveal = allAnswered || (revealsAt && now >= revealsAt)

    weekData.shouldReveal = shouldReveal
    weekData.allAnswered = allAnswered
    setWeek(weekData)

    setLoading(false)
  }

  async function handleAnswer(answer) {
    const { data, error } = await supabase
      .from('answers')
      .insert({
        week_id: id,
        member_id: member.id,
        answer: answer,
      })
      .select('*, member:members(name, emoji, is_lurker)')
      .single()

    if (error) {
      console.error('Error saving answer:', error.message)
      return
    }

    setMyAnswer(data)
    setAnswers([...answers, data])
    
    loadQuestion()
  }

  if (!selectedGroup || !member) {
    return (
      <View style={styles.centerContainer}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <Text style={styles.backText}>← Back to Home</Text>
        </TouchableOpacity>
        <Text style={styles.loadingText}>Please select a group first...</Text>
      </View>
    )
  }

  if (loading || !week) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  const gradientColors = getGradientColors(week.type)

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.weekNumber}>Week {week.week_number}</Text>
        </View>

        {/* Category Badge */}
        <View style={styles.categoryContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{week.category}</Text>
          </View>
        </View>

        {/* Question Components */}
        <View style={styles.contentContainer}>
          {week.type === 'debate' && (
            <Debate
              week={week}
              myAnswer={myAnswer}
              answers={answers}
              onAnswer={handleAnswer}
              member={member}
            />
          )}

          {week.type === 'this-or-that' && (
            <ThisOrThat
              week={week}
              myAnswer={myAnswer}
              answers={answers}
              onAnswer={handleAnswer}
              member={member}
            />
          )}

          {week.type === 'hot-take' && (
            <HotTake
              week={week}
              myAnswer={myAnswer}
              answers={answers}
              onAnswer={handleAnswer}
              member={member}
            />
          )}

          {week.type === 'confession' && (
            <Confession
              week={week}
              myAnswer={myAnswer}
              answers={answers}
              onAnswer={handleAnswer}
              member={member}
            />
          )}

          {week.type === 'family-poll' && (
            <FamilyPoll
              week={week}
              myAnswer={myAnswer}
              answers={answers}
              onAnswer={handleAnswer}
              member={member}
            />
          )}

          {week.type === 'prediction' && (
            <Prediction
              week={week}
              myAnswer={myAnswer}
              answers={answers}
              onAnswer={handleAnswer}
              member={member}
            />
          )}

          {week.type === 'trivia' && (
            <Trivia
              week={week}
              myAnswer={myAnswer}
              answers={answers}
              onAnswer={handleAnswer}
              member={member}
            />
          )}

          {week.type === 'rank-these' && (
            <RankThese
              week={week}
              myAnswer={myAnswer}
              answers={answers}
              onAnswer={handleAnswer}
              member={member}
            />
          )}

          {/* Reactions to Question Results */}
          {week.shouldReveal && myAnswer && (
            <View style={styles.reactionsSection}>
              <Text style={styles.sectionTitle}>REACT TO RESULTS</Text>
              <Reactions targetId={week.id} type="question" />
            </View>
          )}

          {/* Comments */}
          {myAnswer && <Comments weekId={id} />}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

// Matches web: bg-gradient-to-br ${colorMap[type]} via-slate-900 to-slate-950
function getGradientColors(type) {
  const colorMap = {
    'debate': ['#450a0a', '#0f172a', '#020617'],           // rose-950 → slate-900 → slate-950
    'family-poll': ['#451a03', '#0f172a', '#020617'],     // amber-950 → slate-900 → slate-950
    'hot-take': ['#450a0a', '#0f172a', '#020617'],        // red-950 → slate-900 → slate-950
    'confession': ['#022c22', '#0f172a', '#020617'],      // emerald-950 → slate-900 → slate-950
    'this-or-that': ['#3b0764', '#0f172a', '#020617'],    // purple-950 → slate-900 → slate-950
    'trivia': ['#083344', '#0f172a', '#020617'],          // cyan-950 → slate-900 → slate-950
    'rank-these': ['#431407', '#0f172a', '#020617'],      // orange-950 → slate-900 → slate-950
    'prediction': ['#1e1b4b', '#0f172a', '#020617'],      // indigo-950 → slate-900 → slate-950
  }
  return colorMap[type] || ['#020617', '#0f172a', '#020617']
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  weekNumber: {
    color: '#64748b',
    fontSize: 14,
  },
  categoryContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryBadge: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  reactionsSection: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
  },
})