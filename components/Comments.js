import { useEffect, useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useGroup } from '../context/GroupContext'
import { supabase } from '../lib/supabase'
import Reactions from './Reactions'

export default function Comments({ weekId }) {
  const { member } = useGroup()
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadComments()
    
    // Subscribe to new comments
    const subscription = supabase
      .channel(`comments-${weekId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `week_id=eq.${weekId}`
      }, () => {
        loadComments()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [weekId])

  async function loadComments() {
    const { data } = await supabase
      .from('comments')
      .select('*, member:members(name, emoji)')
      .eq('week_id', weekId)
      .order('created_at', { ascending: true })

    setComments(data || [])
    setLoading(false)
  }

  async function postComment() {
    if (!commentText.trim()) return

    const { error } = await supabase
      .from('comments')
      .insert({
        week_id: weekId,
        member_id: member.id,
        text: commentText.trim(),
      })

    if (error) {
      console.error('Error posting comment:', error)
      return
    }

    setCommentText('')
    loadComments()
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading comments...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>

      {comments.length > 0 && (
        <View style={styles.commentsList}>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <Text style={styles.commentAuthor}>
                {`${comment.member.emoji} ${comment.member.name}`}
              </Text>
              <Text style={styles.commentText}>{comment.text}</Text>
              <Text style={styles.commentTime}>
                {new Date(comment.created_at).toLocaleDateString()}
              </Text>
              <Reactions targetId={comment.id} type="comment" />
            </View>
          ))}
        </View>
      )}

      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          placeholderTextColor="#64748b"
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity 
          style={[styles.postButton, !commentText.trim() && styles.postButtonDisabled]}
          onPress={postComment}
          disabled={!commentText.trim()}
        >
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  loadingText: {
    color: '#94a3b8',
    textAlign: 'center',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  commentsList: {
    gap: 12,
    marginBottom: 16,
  },
  commentCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
  },
  commentAuthor: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 8,
  },
  commentText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
    marginBottom: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  inputCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    minHeight: 80,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  postButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#334155',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
})