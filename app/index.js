import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useGroup } from '../context/GroupContext'
import { supabase } from '../lib/supabase'
import WelcomeScreen from './welcome'

function GroupSelector() {
  const router = useRouter()
  const { groups, selectGroup } = useGroup()

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.title}>Your Groups</Text>
        <Text style={styles.subtitle}>Pick a group to continue</Text>
        
        <View style={styles.groupsList}>
          {groups.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.groupButton}
              onPress={() => selectGroup(item.group, item)}
            >
              <Text style={styles.groupEmoji}>{item.emoji}</Text>
              <View style={styles.groupInfo}>
                <Text style={styles.groupButtonText}>{item.group.name}</Text>
                <Text style={styles.groupSubtext}>Continue playing →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add options to join/create more groups */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/join-group')}
          >
            <Text style={styles.actionButtonText}>+ Join Another Group</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/create-group')}
          >
            <Text style={styles.actionButtonText}>+ Create New Group</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

function HomeScreen() {
  const router = useRouter()
  const { selectedGroup, member, groups, selectGroup } = useGroup()
  const [weeks, setWeeks] = useState([])
  const [currentWeek, setCurrentWeek] = useState(null)

  useEffect(() => {
    if (selectedGroup) {
      loadWeeks()
    }
  }, [selectedGroup])

  async function loadWeeks() {
    const { data } = await supabase
      .from('weeks')
      .select('*')
      .eq('group_id', selectedGroup.id)
      .order('week_number', { ascending: false })

    if (data && data.length > 0) {
      setCurrentWeek(data[0])
      setWeeks(data.slice(1))
    } else {
      setWeeks([])
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.headerSection}>
        <View style={styles.logoContainer}>
          <Text style={styles.neonText}>THE DROP</Text>
          {selectedGroup && (
            <Text style={styles.groupSubtitle}>{selectedGroup.name}</Text>
          )}
        </View>

        {/* User controls */}
        <View style={styles.userControls}>
          {member?.is_curator && (
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/curator')}
            >
              <Text style={styles.iconButtonText}>⚙️</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.memberEmoji}>{member?.emoji || '👤'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Current Week Card */}
      {currentWeek && (
        <TouchableOpacity
          style={styles.currentWeekCard}
          onPress={() => router.push(`/question/${currentWeek.id}`)}
          activeOpacity={0.9}
        >
          <Text style={styles.currentWeekLabel}>THIS WEEK</Text>
          <Text style={styles.currentWeekCategory}>{currentWeek.category}</Text>
          <Text style={styles.currentWeekQuestion}>{currentWeek.question}</Text>
          <View style={styles.currentWeekFooter}>
            <Text style={styles.tapToPlay}>Tap to play →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Past Weeks */}
      {weeks.length > 0 && (
        <View style={styles.pastWeeksSection}>
          <Text style={styles.pastWeeksTitle}>PAST WEEKS</Text>
          {weeks.map((week) => (
            <TouchableOpacity
              key={week.id}
              style={styles.pastWeekCard}
              onPress={() => router.push(`/question/${week.id}`)}
            >
              <View style={styles.pastWeekContent}>
                <Text style={styles.pastWeekCategory}>{week.category}</Text>
                <Text style={styles.pastWeekQuestion} numberOfLines={1}>
                  {week.question}
                </Text>
              </View>
              <Text style={styles.pastWeekArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {weeks.length === 0 && !currentWeek && (
        <Text style={styles.emptyText}>No questions yet!</Text>
      )}
    </ScrollView>
  )
}

export default function Index() {
  const { groups, selectedGroup, loading } = useGroup()

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  // No groups at all - show welcome screen
  if (groups.length === 0) {
    return <WelcomeScreen />
  }

  // Multiple groups and no selection yet - show group selector
  if (groups.length > 1 && !selectedGroup) {
    return <GroupSelector />
  }

  // Has groups - show home screen (will auto-select if only one group)
  return <HomeScreen />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  
  // Header Section
  headerSection: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 24,
  },
  neonTextContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    marginBottom: 8,
  },
  neonBlurOuter: {
    position: 'absolute',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#a78bfa',
    opacity: 0.6,
  },
  neonBlurInner: {
    position: 'absolute',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#c4b5fd',
    opacity: 0.8,
  },
  neonText: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 6,
    color: '#fff',
    textShadowColor: '#8b5cf6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
    marginBottom: 8,
  },
  groupSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  groupSwitcher: {
    marginTop: 8,
    alignItems: 'center',
  },
  groupName: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  switchText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  groupNameStatic: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  userControls: {
    position: 'absolute',
    top: 55,
    right: 16,
    flexDirection: 'row',
    gap: 12,
    zIndex: 10,
  },
  iconButton: {
    backgroundColor: '#1e293b',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 20,
  },
  memberEmoji: {
    fontSize: 24,
  },
  
  // Group Selector
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 32,
  },
  groupsList: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  groupButton: {
    backgroundColor: '#8b5cf6',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  groupEmoji: {
    fontSize: 32,
  },
  groupInfo: {
    flex: 1,
  },
  groupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  groupSubtext: {
    color: '#e9d5ff',
    fontSize: 14,
  },
  actionsSection: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Current Week Card
  currentWeekCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    padding: 20,
  },
  currentWeekLabel: {
    fontSize: 12,
    color: '#e9d5ff',
    fontWeight: '600',
    marginBottom: 8,
  },
  currentWeekCategory: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  currentWeekQuestion: {
    fontSize: 16,
    color: '#f3e8ff',
    marginBottom: 16,
  },
  currentWeekFooter: {
    alignItems: 'flex-end',
  },
  tapToPlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Past Weeks
  pastWeeksSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  pastWeeksTitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 1,
  },
  pastWeekCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pastWeekContent: {
    flex: 1,
  },
  pastWeekCategory: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
  },
  pastWeekQuestion: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  pastWeekArrow: {
    fontSize: 18,
    color: '#475569',
    marginLeft: 12,
  },
  
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
})