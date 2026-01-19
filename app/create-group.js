import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useGroup } from '../context/GroupContext'
import { supabase } from '../lib/supabase'

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function calculateDropDates(startDate, dropDay, dropTime, revealDay, revealTime, questionCount, dropInterval = 7) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dropDayIndex = days.indexOf(dropDay.toLowerCase())
  const revealDayIndex = days.indexOf(revealDay.toLowerCase())
  
  const dates = []
  let currentDate = new Date(startDate)
  
  for (let i = 0; i < questionCount; i++) {
    let dropDate
    
    if (dropInterval === 1) {
      // Daily: just add days sequentially
      dropDate = new Date(currentDate)
      dropDate.setDate(currentDate.getDate() + i)
      const [dropHours, dropMinutes] = dropTime.split(':')
      dropDate.setHours(parseInt(dropHours), parseInt(dropMinutes), 0, 0)
    } else {
      // Weekly or custom interval: calculate next occurrence of dropDay
      const daysUntilDrop = i === 0 
        ? 0 // First question drops on start date
        : ((dropDayIndex - currentDate.getDay() + 7) % 7) || 7
      
      dropDate = new Date(currentDate)
      dropDate.setDate(currentDate.getDate() + daysUntilDrop)
      const [dropHours, dropMinutes] = dropTime.split(':')
      dropDate.setHours(parseInt(dropHours), parseInt(dropMinutes), 0, 0)
    }
    
    // Calculate reveal date
    let revealDate = new Date(dropDate)
    
    if (dropInterval === 1) {
      // Daily questions: reveal after 8 hours same day
      revealDate.setHours(revealDate.getHours() + 8)
    } else {
      // Weekly: use reveal day
      const daysUntilReveal = (revealDayIndex - dropDate.getDay() + 7) % 7
      if (daysUntilReveal === 0) {
        revealDate.setDate(revealDate.getDate() + 7)
      } else {
        revealDate.setDate(revealDate.getDate() + daysUntilReveal)
      }
      const [revealHours, revealMinutes] = revealTime.split(':')
      revealDate.setHours(parseInt(revealHours), parseInt(revealMinutes), 0, 0)
    }
    
    dates.push({ drops_at: dropDate.toISOString(), reveals_at: revealDate.toISOString() })
    
    // Move to next interval
    if (dropInterval === 1) {
      // For daily, we handled it above
    } else {
      currentDate.setDate(dropDate.getDate() + dropInterval)
    }
  }
  
  return dates
}

export default function CreateGroup() {
  const router = useRouter()
  const { loadUserGroups } = useGroup()
  
  // Step tracking - now 4 steps
  const [step, setStep] = useState(1) // 1=basics, 2=question bank, 3=duration, 4=review
  
  // Step 1: Group basics
  const [groupName, setGroupName] = useState('')
  const [groupType, setGroupType] = useState('family')
  const [yourName, setYourName] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('👤')
  
  // Step 2: Question bank
  const [questionBanks, setQuestionBanks] = useState([])
  const [selectedBank, setSelectedBank] = useState(null)
  const [loadingBanks, setLoadingBanks] = useState(false)
  
  // Step 3: Duration template
  const [selectedDuration, setSelectedDuration] = useState(null)
  
  // Step 4: Schedule settings (with defaults)
  const [dropDay, setDropDay] = useState('sunday')
  const [dropTime, setDropTime] = useState('09:00')
  const [revealDay, setRevealDay] = useState('wednesday')
  const [revealTime, setRevealTime] = useState('18:00')
  const [gameStartDate, setGameStartDate] = useState('')
  
  // Creating state
  const [creating, setCreating] = useState(false)

  const GROUP_TYPES = [
    { value: 'family', label: '👨‍👩‍👧‍👦 Family' },
    { value: 'friends', label: '👯 Friends' },
    { value: 'coworkers', label: '💼 Coworkers' },
    { value: 'other', label: '🎯 Other' },
  ]

  const DURATION_TEMPLATES = [
    {
      id: 'quick-builder',
      name: 'Quick Team Builder',
      icon: '⚡',
      duration: 5,
      frequency: 'daily',
      dropInterval: 1, // days
      description: '1 question per day for 5 days',
      bestFor: 'Work retreats, team onboarding'
    },
    {
      id: 'monthly',
      name: 'Monthly Check-in',
      icon: '📅',
      duration: 4,
      frequency: 'weekly',
      dropInterval: 7,
      description: '1 question per week for 4 weeks',
      bestFor: 'Monthly challenges, short commitments'
    },
    {
      id: 'quarterly',
      name: 'Quarterly Connection',
      icon: '🌙',
      duration: 12,
      frequency: 'weekly',
      dropInterval: 7,
      description: '1 question per week for 12 weeks',
      bestFor: 'Seasonal check-ins, goal tracking'
    },
    {
      id: 'half-year',
      name: 'Half-Year Journey',
      icon: '🌟',
      duration: 26,
      frequency: 'weekly',
      dropInterval: 7,
      description: '1 question per week for 26 weeks',
      bestFor: 'Long-term friend groups'
    },
    {
      id: 'full-year',
      name: 'Full Year Experience',
      icon: '🎯',
      duration: 52,
      frequency: 'weekly',
      dropInterval: 7,
      description: '1 question per week for 52 weeks',
      bestFor: 'Family connections, committed groups'
    }
  ]

  const EMOJI_OPTIONS = [
    '😀', '😎', '🤓', '🥳', '😇', '🤩', '😴', '🤔',
    '🙃', '😊', '🥰', '😍', '🤗', '🤭', '🤪', '😜',
    '👻', '👽', '🤖', '🎃', '😺', '🦊', '🐶', '🐱',
  ]

  const DAYS = [
    { value: 'sunday', label: 'Sunday' },
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
  ]

  // Load question banks when step 2 is reached
  useEffect(() => {
    if (step === 2 && questionBanks.length === 0) {
      loadQuestionBanks()
    }
  }, [step])

  async function loadQuestionBanks() {
    setLoadingBanks(true)
    const { data, error } = await supabase
      .from('question_bank_templates')
      .select('*')
      .eq('is_active', true)
      .order('bank_id')
    
    if (error) {
      Alert.alert('Error', 'Could not load question banks')
      console.error(error)
    } else {
      setQuestionBanks(data || [])
    }
    setLoadingBanks(false)
  }

  function validateStep1() {
    if (!groupName.trim()) {
      Alert.alert('Missing Info', 'Please enter a group name')
      return false
    }
    if (!yourName.trim()) {
      Alert.alert('Missing Info', 'Please enter your name')
      return false
    }
    return true
  }

  function validateStep2() {
    if (!selectedBank) {
      Alert.alert('Choose a Question Bank', 'Please select a question bank for your group')
      return false
    }
    return true
  }

  function validateStep3() {
    if (!selectedDuration) {
      Alert.alert('Choose Duration', 'Please select how long your game will run')
      return false
    }
    return true
  }

  async function createGroup() {
    setCreating(true)

    try {
      // Generate unique invite code
      let inviteCode = generateInviteCode()
      let { data: existing } = await supabase
        .from('groups')
        .select('invite_code')
        .eq('invite_code', inviteCode)
        .single()
      
      while (existing) {
        inviteCode = generateInviteCode()
        const { data } = await supabase
          .from('groups')
          .select('invite_code')
          .eq('invite_code', inviteCode)
          .single()
        existing = data
      }

      // Calculate game start date
      const gameStartsAt = gameStartDate 
        ? new Date(gameStartDate + 'T' + dropTime + ':00')
        : calculateDropDates(new Date(), dropDay, dropTime, revealDay, revealTime, 1)[0].drops_at

      // Create the group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: groupName.trim(),
          invite_code: inviteCode,
          group_type: groupType,
          question_bank_id: selectedBank.bank_id,
          drop_day: dropDay,
          drop_time: dropTime,
          reveal_day: revealDay,
          reveal_time: revealTime,
          game_starts_at: gameStartsAt,
          member_count_locked: false,
          expected_member_count: 0,
        })
        .select()
        .single()

      if (groupError) throw groupError

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      // Add creator as a member and curator
      const { error: memberError } = await supabase
        .from('members')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          name: yourName.trim(),
          emoji: selectedEmoji,
          is_curator: true,
          is_lurker: false,
        })

      if (memberError) throw memberError

      // Load question templates for this bank (limited by selected duration)
      const { data: templates, error: templatesError } = await supabase
        .from('question_templates')
        .select('*')
        .eq('bank_id', selectedBank.bank_id)
        .order('week_number')
        .limit(selectedDuration.duration) // Only get the number of questions needed

      if (templatesError) throw templatesError

      // Calculate drop and reveal dates based on selected frequency
      const dates = calculateDropDates(
        new Date(gameStartsAt),
        dropDay,
        dropTime,
        revealDay,
        revealTime,
        templates.length,
        selectedDuration.dropInterval // Pass the interval (1 for daily, 7 for weekly)
      )

      // Copy templates to weeks table with calculated dates
      const weeksToInsert = templates.map((template, index) => ({
        group_id: groupData.id,
        week_number: template.week_number,
        type: template.type,
        category: template.category,
        question: template.question,
        option_a: template.option_a,
        option_b: template.option_b,
        items: template.items,
        correct_answer: template.correct_answer,
        status: 'scheduled',
        drops_at: dates[index].drops_at,
        reveals_at: dates[index].reveals_at,
      }))

      const { error: weeksError } = await supabase
        .from('weeks')
        .insert(weeksToInsert)

      if (weeksError) throw weeksError

      // Success!
      Alert.alert(
        'Success! 🎉',
        `${groupName} created with ${templates.length} questions!\n\nInvite Code: ${inviteCode}`,
        [
          {
            text: 'OK',
            onPress: async () => {
              await loadUserGroups()
              router.back()
            }
          }
        ]
      )
    } catch (error) {
      console.error('Error creating group:', error)
      Alert.alert('Error', error.message || 'Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  // Step 1: Group Basics
  if (step === 1) {
    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create a Group</Text>
        <Text style={styles.subtitle}>Step 1 of 3: Group Basics</Text>

        <View style={styles.formSection}>
          <Text style={styles.label}>Group Name</Text>
          <TextInput
            style={styles.input}
            value={groupName}
            onChangeText={setGroupName}
            placeholder="e.g. Smith Family, Work Crew, Book Club..."
            placeholderTextColor="#64748b"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Group Type</Text>
          <View style={styles.typeGrid}>
            {GROUP_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  groupType === type.value && styles.typeButtonSelected
                ]}
                onPress={() => setGroupType(type.value)}
              >
                <Text style={[
                  styles.typeButtonText,
                  groupType === type.value && styles.typeButtonTextSelected
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={yourName}
            onChangeText={setYourName}
            placeholder="Enter your name..."
            placeholderTextColor="#64748b"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Your Emoji</Text>
          <View style={styles.emojiGrid}>
            {EMOJI_OPTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiButton,
                  selectedEmoji === emoji && styles.emojiButtonSelected
                ]}
                onPress={() => setSelectedEmoji(emoji)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Preview:</Text>
          <Text style={styles.previewText}>
            {selectedEmoji} {yourName || 'Your Name'}
          </Text>
          <Text style={styles.previewSubtext}>Curator of {groupName || 'Group Name'}</Text>
        </View>

        <TouchableOpacity 
          style={styles.nextButton}
          onPress={() => {
            if (validateStep1()) setStep(2)
          }}
        >
          <Text style={styles.nextButtonText}>Next: Choose Questions →</Text>
        </TouchableOpacity>
      </ScrollView>
    )
  }

  // Step 2: Question Bank Selection
  if (step === 2) {
    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={() => setStep(1)} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Choose Question Bank</Text>
        <Text style={styles.subtitle}>Step 2 of 3: Pick your vibe</Text>

        {loadingBanks ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading question banks...</Text>
          </View>
        ) : (
          <View style={styles.banksContainer}>
            {questionBanks.map((bank) => (
              <TouchableOpacity
                key={bank.bank_id}
                style={[
                  styles.bankCard,
                  selectedBank?.bank_id === bank.bank_id && styles.bankCardSelected
                ]}
                onPress={() => setSelectedBank(bank)}
              >
                <View style={styles.bankHeader}>
                  <Text style={styles.bankName}>{bank.name}</Text>
                  <Text style={styles.bankCount}>{bank.question_count} weeks</Text>
                </View>
                <Text style={styles.bankDescription}>{bank.description}</Text>
                <Text style={styles.bankAudience}>👥 {bank.audience}</Text>
                <View style={styles.bankVibeTag}>
                  <Text style={styles.bankVibeText}>✨ {bank.vibe}</Text>
                </View>
                {selectedBank?.bank_id === bank.bank_id && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓ Selected</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.backStepButton}
            onPress={() => setStep(1)}
          >
            <Text style={styles.backStepButtonText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.nextButton, { flex: 1 }]}
            onPress={() => {
              if (validateStep2()) setStep(3)
            }}
          >
            <Text style={styles.nextButtonText}>Next: Duration →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  // Step 3: Duration Selection
  if (step === 3) {
    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={() => setStep(2)} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Choose Duration</Text>
        <Text style={styles.subtitle}>Step 3 of 4: How long will this run?</Text>

        <View style={styles.durationContainer}>
          {DURATION_TEMPLATES.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.durationCard,
                selectedDuration?.id === template.id && styles.durationCardSelected
              ]}
              onPress={() => setSelectedDuration(template)}
            >
              <View style={styles.durationHeader}>
                <Text style={styles.durationIcon}>{template.icon}</Text>
                <Text style={styles.durationName}>{template.name}</Text>
              </View>
              <Text style={styles.durationDescription}>{template.description}</Text>
              <Text style={styles.durationBestFor}>Perfect for: {template.bestFor}</Text>
              {selectedDuration?.id === template.id && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>✓ Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.backStepButton}
            onPress={() => setStep(2)}
          >
            <Text style={styles.backStepButtonText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.nextButton, { flex: 1 }]}
            onPress={() => {
              if (validateStep3()) setStep(4)
            }}
          >
            <Text style={styles.nextButtonText}>Next: Schedule →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  // Step 4: Review & Schedule
  if (step === 4) {
    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={() => setStep(3)} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Review & Schedule</Text>
        <Text style={styles.subtitle}>Step 4 of 4: Finalize your group</Text>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Group Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Name:</Text>
            <Text style={styles.summaryValue}>{groupName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Type:</Text>
            <Text style={styles.summaryValue}>
              {GROUP_TYPES.find(t => t.value === groupType)?.label}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Questions:</Text>
            <Text style={styles.summaryValue}>{selectedBank?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Duration:</Text>
            <Text style={styles.summaryValue}>{selectedDuration?.description}</Text>
          </View>
        </View>

        {/* Schedule Settings */}
        <View style={styles.scheduleCard}>
          <Text style={styles.scheduleTitle}>📅 {selectedDuration?.frequency === 'daily' ? 'Daily' : 'Weekly'} Schedule</Text>
          <Text style={styles.scheduleSubtext}>
            {selectedDuration?.frequency === 'daily' 
              ? 'Questions drop daily at the same time'
              : 'Questions drop and reveal on these days each week'
            }
          </Text>

          {selectedDuration?.frequency !== 'daily' && (
            <>
              <View style={styles.scheduleRow}>
                <Text style={styles.scheduleLabel}>Drop Day:</Text>
                <View style={styles.pickerContainer}>
                  {DAYS.map(day => (
                    <TouchableOpacity
                      key={day.value}
                      style={[
                        styles.dayButton,
                        dropDay === day.value && styles.dayButtonSelected
                      ]}
                      onPress={() => setDropDay(day.value)}
                    >
                      <Text style={[
                        styles.dayButtonText,
                        dropDay === day.value && styles.dayButtonTextSelected
                      ]}>
                        {day.label.slice(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Drop Time:</Text>
            <TextInput
              style={styles.timeInput}
              value={dropTime}
              onChangeText={setDropTime}
              placeholder="09:00"
              placeholderTextColor="#64748b"
            />
          </View>

          {selectedDuration?.frequency !== 'daily' && (
            <>
              <View style={styles.scheduleRow}>
                <Text style={styles.scheduleLabel}>Reveal Day:</Text>
                <View style={styles.pickerContainer}>
                  {DAYS.map(day => (
                    <TouchableOpacity
                      key={day.value}
                      style={[
                        styles.dayButton,
                        revealDay === day.value && styles.dayButtonSelected
                      ]}
                      onPress={() => setRevealDay(day.value)}
                    >
                      <Text style={[
                        styles.dayButtonText,
                        revealDay === day.value && styles.dayButtonTextSelected
                      ]}>
                        {day.label.slice(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Reveal Time:</Text>
            <TextInput
              style={styles.timeInput}
              value={revealTime}
              onChangeText={setRevealTime}
              placeholder="18:00"
              placeholderTextColor="#64748b"
            />
          </View>

          {/* Game Start Date */}
          <View style={styles.gameStartSection}>
            <Text style={styles.gameStartTitle}>🎮 Game Start Date</Text>
            <Text style={styles.gameStartSubtext}>
              When does the game start? This is when the first question drops AND when new members can no longer join as players (they'll become lurkers instead).
            </Text>
            <View style={styles.dateInputRow}>
              <Text style={styles.dateLabel}>Start Date:</Text>
              <TextInput
                style={styles.dateInput}
                value={gameStartDate}
                onChangeText={setGameStartDate}
                placeholder="YYYY-MM-DD (e.g., 2026-01-25)"
                placeholderTextColor="#64748b"
              />
            </View>
            {!gameStartDate && (
              <Text style={styles.dateHelpText}>
                💡 Leave blank to start on the next {DAYS.find(d => d.value === dropDay)?.label}
              </Text>
            )}
          </View>

          <Text style={styles.scheduleNote}>
            💡 Results reveal when everyone answers OR at the reveal time, whichever comes first
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.backStepButton}
            onPress={() => setStep(3)}
          >
            <Text style={styles.backStepButtonText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.createButton, creating && styles.createButtonDisabled, { flex: 1 }]}
            onPress={createGroup}
            disabled={creating}
          >
            <Text style={styles.createButtonText}>
              {creating ? 'Creating...' : '🎉 Create Group'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 20,
  },
  backText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 24,
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#fff',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#1e3a8a',
  },
  typeButtonText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  typeButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emojiButton: {
    backgroundColor: '#1e293b',
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiButtonSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#1e3a8a',
  },
  emojiText: {
    fontSize: 32,
  },
  previewCard: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  previewLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  previewText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  previewSubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  nextButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Step 2: Question Banks
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  banksContainer: {
    gap: 16,
    marginBottom: 24,
  },
  bankCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bankCardSelected: {
    borderColor: '#10b981',
    backgroundColor: '#064e3b',
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bankName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  bankCount: {
    fontSize: 12,
    color: '#94a3b8',
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bankDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 12,
    lineHeight: 20,
  },
  bankAudience: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8,
  },
  bankVibeTag: {
    backgroundColor: '#334155',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bankVibeText: {
    fontSize: 12,
    color: '#e2e8f0',
    fontWeight: '600',
  },
  selectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  backStepButton: {
    backgroundColor: '#334155',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  backStepButtonText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
  // Step 3: Review & Schedule
  summaryCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryKey: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  scheduleCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  scheduleTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scheduleSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 20,
  },
  scheduleRow: {
    marginBottom: 16,
  },
  scheduleLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
    fontWeight: '600',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayButtonSelected: {
    backgroundColor: '#1e3a8a',
    borderColor: '#3b82f6',
  },
  dayButtonText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  dayButtonTextSelected: {
    color: '#fff',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginRight: 12,
    fontWeight: '600',
    width: 100,
  },
  timeInput: {
    backgroundColor: '#334155',
    color: '#fff',
    padding: 12,
    borderRadius: 6,
    fontSize: 16,
    flex: 1,
  },
  scheduleNote: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 18,
  },
  gameStartSection: {
    backgroundColor: '#1e3a8a',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  gameStartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  gameStartSubtext: {
    fontSize: 12,
    color: '#93c5fd',
    marginBottom: 16,
    lineHeight: 18,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: '#93c5fd',
    marginRight: 12,
    fontWeight: '600',
    width: 90,
  },
  dateInput: {
    backgroundColor: '#1e40af',
    color: '#fff',
    padding: 12,
    borderRadius: 6,
    fontSize: 14,
    flex: 1,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  dateHelpText: {
    fontSize: 11,
    color: '#93c5fd',
    fontStyle: 'italic',
  },
  durationContainer: {
    gap: 16,
    marginBottom: 24,
  },
  durationCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  durationCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#1e3a8a',
  },
  durationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  durationIcon: {
    fontSize: 32,
  },
  durationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  durationDescription: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 8,
  },
  durationBestFor: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  createButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#334155',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})