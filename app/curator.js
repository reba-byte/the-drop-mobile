import * as Clipboard from 'expo-clipboard'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import GroupSwitcher from '../components/GroupSwitcher'
import { useGroup } from '../context/GroupContext'
import { supabase } from '../lib/supabase'

export default function CuratorDashboard() {
  const router = useRouter()
  const { selectedGroup, member, groups } = useGroup()
  const [weeks, setWeeks] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGroupSwitcher, setShowGroupSwitcher] = useState(false)

  useEffect(() => {
    // Check if user is curator
    if (!member?.is_curator) {
      Alert.alert('Access Denied', 'Only curators can access this page')
      router.back()
      return
    }
    
    loadDashboardData()
  }, [selectedGroup])

  async function loadDashboardData() {
    if (!selectedGroup) return
    
    setLoading(true)

    // Load all weeks for this group
    const { data: weeksData } = await supabase
      .from('weeks')
      .select('*')
      .eq('group_id', selectedGroup.id)
      .order('week_number', { ascending: true })

    setWeeks(weeksData || [])

    // Load all members
    const { data: membersData } = await supabase
      .from('members')
      .select('*')
      .eq('group_id', selectedGroup.id)
      .order('name')

    setMembers(membersData || [])
    setLoading(false)
  }

  async function copyInviteCode() {
    await Clipboard.setStringAsync(selectedGroup.invite_code)
    Alert.alert('Copied!', `Invite code ${selectedGroup.invite_code} copied to clipboard`)
  }

  async function shareInviteCode() {
    try {
      await Share.share({
        message: `Join "${selectedGroup.name}" on The Drop!\n\nInvite Code: ${selectedGroup.invite_code}\n\nDownload the app and enter this code to join our group.`,
        title: `Join ${selectedGroup.name}`,
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  async function activateWeek(weekId) {
    const { error } = await supabase
      .from('weeks')
      .update({ 
        status: 'active',
        drops_at: new Date().toISOString(),
        reveals_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', weekId)

    if (error) {
      Alert.alert('Error', error.message)
      return
    }

    Alert.alert('Success', 'Question activated!')
    loadDashboardData()
  }

  async function deactivateWeek(weekId) {
    const { error } = await supabase
      .from('weeks')
      .update({ status: 'draft' })
      .eq('id', weekId)

    if (error) {
      Alert.alert('Error', error.message)
      return
    }

    Alert.alert('Success', 'Question deactivated')
    loadDashboardData()
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  const activeWeeks = weeks.filter(w => w.status === 'active')
  const draftWeeks = weeks.filter(w => w.status === 'draft')
  const scheduledWeeks = weeks.filter(w => w.status === 'scheduled')

  return (
    <>
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Group Selector */}
        <TouchableOpacity 
          style={styles.groupSelector}
          onPress={() => setShowGroupSwitcher(true)}
        >
          <View>
            <Text style={styles.groupSelectorLabel}>Current Group</Text>
            <Text style={styles.groupSelectorName}>{selectedGroup.name}</Text>
          </View>
          {groups.length > 1 && (
            <View style={styles.groupSelectorBadge}>
              <Text style={styles.groupSelectorBadgeText}>{groups.length} groups</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.title}>Curator Dashboard</Text>

        {/* Group Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{members.length}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{activeWeeks.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{scheduledWeeks.length}</Text>
            <Text style={styles.statLabel}>Scheduled</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{draftWeeks.length}</Text>
            <Text style={styles.statLabel}>Drafts</Text>
          </View>
        </View>

        {/* Invite Code Section with Share Options */}
        <View style={styles.inviteCodeCard}>
          <Text style={styles.inviteCodeLabel}>Invite Code</Text>
          <Text style={styles.inviteCodeText}>{selectedGroup.invite_code}</Text>
          
          <View style={styles.shareButtons}>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={copyInviteCode}
            >
              <Text style={styles.shareButtonText}>📋 Copy Code</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={shareInviteCode}
            >
              <Text style={styles.shareButtonText}>📤 Share Invite</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Members Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Members</Text>
          {members.map(m => (
            <View key={m.id} style={styles.memberCard}>
              <Text style={styles.memberName}>
                {m.emoji} {m.name}
              </Text>
              {m.is_curator && <Text style={styles.curatorBadge}>Curator</Text>}
              {m.is_lurker && <Text style={styles.lurkerBadge}>Lurker</Text>}
            </View>
          ))}
        </View>

        {/* Active Questions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Questions ({activeWeeks.length})</Text>
          {activeWeeks.map(week => (
            <View key={week.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.weekNumber}>Week {week.week_number}</Text>
                <Text style={styles.categoryBadge}>{week.category}</Text>
              </View>
              <Text style={styles.questionText}>{week.question}</Text>
              <View style={styles.questionActions}>
                <Text style={styles.questionType}>{week.type}</Text>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => router.push(`/curator/edit-question/${week.id}`)}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deactivateButton}
                    onPress={() => deactivateWeek(week.id)}
                  >
                    <Text style={styles.buttonText}>Deactivate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          {activeWeeks.length === 0 && (
            <Text style={styles.emptyText}>No active questions</Text>
          )}
        </View>

        {/* Scheduled Questions Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Questions</Text>
          {scheduledWeeks.slice(0, 5).map(week => (
            <View key={week.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.weekNumber}>Week {week.week_number}</Text>
                <Text style={styles.categoryBadge}>{week.category}</Text>
              </View>
              <Text style={styles.questionText}>{week.question}</Text>
              <Text style={styles.scheduledDate}>
                📅 Drops {new Date(week.drops_at).toLocaleDateString()}
              </Text>
            </View>
          ))}
          {scheduledWeeks.length === 0 && (
            <Text style={styles.emptyText}>No scheduled questions</Text>
          )}
          {scheduledWeeks.length > 5 && (
            <Text style={styles.moreText}>+ {scheduledWeeks.length - 5} more scheduled...</Text>
          )}
        </View>

        {/* Draft Questions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Draft Questions ({draftWeeks.length})</Text>
          {draftWeeks.slice(0, 10).map(week => (
            <View key={week.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.weekNumber}>Week {week.week_number}</Text>
                <Text style={styles.categoryBadge}>{week.category}</Text>
              </View>
              <Text style={styles.questionText}>{week.question}</Text>
              <View style={styles.questionActions}>
                <Text style={styles.questionType}>{week.type}</Text>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => router.push(`/curator/edit-question/${week.id}`)}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.activateButton}
                    onPress={() => activateWeek(week.id)}
                  >
                    <Text style={styles.buttonText}>Activate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          {draftWeeks.length === 0 && (
            <Text style={styles.emptyText}>No draft questions</Text>
          )}
          {draftWeeks.length > 10 && (
            <Text style={styles.moreText}>+ {draftWeeks.length - 10} more...</Text>
          )}
        </View>
      </ScrollView>

      {/* Group Switcher Modal */}
      <GroupSwitcher 
        visible={showGroupSwitcher}
        onClose={() => setShowGroupSwitcher(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 20,
  },
  backText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  groupSelector: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  groupSelectorLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  groupSelectorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  groupSelectorBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  groupSelectorBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  memberCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  curatorBadge: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  lurkerBadge: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  questionCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weekNumber: {
    fontSize: 12,
    color: '#94a3b8',
  },
  categoryBadge: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
  },
  scheduledDate: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  questionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  questionType: {
    fontSize: 12,
    color: '#64748b',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activateButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deactivateButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    padding: 20,
  },
  moreText: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
  inviteCodeCard: {
    backgroundColor: '#1e3a8a',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  inviteCodeLabel: {
    fontSize: 12,
    color: '#93c5fd',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  inviteCodeText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 16,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  copyButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
})