import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Avatar } from '../../components/Avatar';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useRoute, useNavigation } from '@react-navigation/native';

export const PostDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { post: initialPost } = route.params;
  const [post, setPost] = useState(initialPost);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const user = useAuthStore((s) => s.user);

  const fetchPostDetails = async () => {
    try {
      const response = await api.get('/posts/');
      const updatedPost = response.data.find((p: any) => p._id === post._id);
      if (updatedPost) setPost(updatedPost);
    } catch (error) {
      console.error('Error fetching post details:', error);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !user?.id) return;
    setSubmitting(true);
    try {
      await api.post(`/posts/${post._id}/comments`, {
        content: comment.trim(),
        author: user.id
      });
      setComment('');
      fetchPostDetails();
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const timeAgo = (dateString: string) => {
    if (!dateString) return 'Recently';
    const now = new Date();
    const then = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 8400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return then.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discussion</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Post */}
        <View style={styles.mainPost}>
          <View style={styles.postAuthorRow}>
            <Avatar name={post.author_name} size={44} />
            <View style={styles.authorMeta}>
              <Text style={styles.authorName}>{post.author_name}</Text>
              <Text style={styles.timestamp}>{timeAgo(post.timestamp)} • {post.category}</Text>
            </View>
          </View>
          <Text style={styles.postContent}>{post.content}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="heart" size={16} color={Colors.error} />
              <Text style={styles.statText}>{post.likes?.length || 0} Likes</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="chatbubble" size={15} color={Colors.primary} />
              <Text style={styles.statText}>{post.comments?.length || 0} Comments</Text>
            </View>
          </View>
        </View>

        {/* Comments List */}
        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>Comments</Text>
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((item: any, index: number) => (
              <View key={index} style={styles.commentItem}>
                <Avatar name={item.author_name} size={32} />
                <View style={styles.commentContentArea}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{item.author_name}</Text>
                    <Text style={styles.commentTime}>{timeAgo(item.timestamp)}</Text>
                  </View>
                  <Text style={styles.commentText}>{item.content}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noComments}>
              <Text style={styles.noCommentsText}>No comments yet. Be the first to reply!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.inputArea}>
          <Avatar name={user?.name} size={32} />
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Write a comment..."
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              onPress={handleAddComment} 
              disabled={!comment.trim() || submitting}
              style={[styles.sendBtn, !comment.trim() && { opacity: 0.5 }]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Ionicons name="send" size={18} color={Colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    ...Typography.subheading,
    color: Colors.text,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  mainPost: {
    padding: Spacing.xl,
    borderBottomWidth: 8,
    borderBottomColor: Colors.background,
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  authorMeta: {
    marginLeft: Spacing.md,
  },
  authorName: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  timestamp: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  postContent: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  commentsSection: {
    padding: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.xl,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  commentContentArea: {
    flex: 1,
    marginLeft: Spacing.md,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    ...Typography.small,
    fontWeight: '700',
    color: Colors.text,
  },
  commentTime: {
    ...Typography.small,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  commentText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  noCommentsText: {
    ...Typography.body,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
    gap: Spacing.md,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    ...Typography.body,
    fontSize: 14,
    maxHeight: 100,
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  }
});
