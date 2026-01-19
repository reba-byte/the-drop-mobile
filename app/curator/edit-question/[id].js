import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { supabase } from '../../../lib/supabase'

export default function EditQuestion() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const [week, setWeek] = useState(null)
  const [question, setQuestion] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuestion()
  }, [])

  async function loadQuestion() {
    const { data } = await supabase
      .from('weeks')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      setWeek(data)
      setQuestion(data.question)
      setOptionA(data.option_a || '')
      setOptionB(data.option_b || '')
      setCorrectAnswer(data.correct_answer || '')
    }
    setLoading(false)
  }

  async function saveQuestion() {
    const updates = {
      question,
      option_a: optionA || null,
      option_b: optionB || null,
      correct_answer: correctAnswer || null,
    }

    const { error } = await supabase
      .from('weeks')
      .update(updates)
      .eq('id', id)

    if (error) {
      Alert.alert('Error', error.message)
      return
    }

    Alert.alert('Success', 'Question updated!')
    router.back()
  }

  async function deleteQuestion() {
    Alert.alert(
      'Delete Question',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('weeks')
              .delete()
              .eq('id', id)

            if (error) {
              Alert.alert('Error', error.message)
              return
            }

            Alert.alert('Deleted', 'Question deleted')
            router.back()
          }
        }
      ]
    )
  }

  if (loading || !week) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  const needsOptions = week.type === 'debate' || week.type === 'this-or-that'
  const needsCorrectAnswer = week.type === 'trivia'

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Edit Question</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Week {week.week_number} • {week.category}</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Question</Text>
        <TextInput
          style={styles.input}
          value={question}
          onChangeText={setQuestion}
          multiline
          placeholder="Enter question..."
          placeholderTextColor="#64748b"
        />
      </View>

      {needsOptions && (
        <>
          <View style={styles.formSection}>
            <Text style={styles.label}>Option A</Text>
            <TextInput
              style={styles.input}
              value={optionA}
              onChangeText={setOptionA}
              placeholder="Enter option A..."
              placeholderTextColor="#64748b"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Option B</Text>
            <TextInput
              style={styles.input}
              value={optionB}
              onChangeText={setOptionB}
              placeholder="Enter option B..."
              placeholderTextColor="#64748b"
            />
          </View>
        </>
      )}

      {needsCorrectAnswer && (
        <View style={styles.formSection}>
          <Text style={styles.label}>Correct Answer</Text>
          <TextInput
            style={styles.input}
            value={correctAnswer}
            onChangeText={setCorrectAnswer}
            placeholder="Enter correct answer..."
            placeholderTextColor="#64748b"
          />
        </View>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={saveQuestion}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={deleteQuestion}>
        <Text style={styles.deleteButtonText}>Delete Question</Text>
      </TouchableOpacity>
    </ScrollView>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#1e293b',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 24,
  },
  badgeText: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#fff',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 60,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#7f1d1d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})