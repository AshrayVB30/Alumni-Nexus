import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';

interface Post {
  _id: string;
  content: string;
  author: string;
  author_name: string;
  category: string;
  likes: string[];
  comments: any[];
  timestamp: string;
}

export const ForumScreen = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation<any>();

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts/');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handleLike = async (postId: string) => {
    if (!user?.id) return;
    try {
      await api.post(`/posts/${postId}/like?user_id=${user.id}`);
      fetchPosts(); // Refresh to get updated likes
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const timeAgo = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return then.toLocaleDateString();
  };

  const filteredPosts = posts.filter(p => 
    p.content.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const renderPost = ({ item }: { item: Post }) => {
    const isLiked = item.likes?.includes(user?.id || '');
    
    return (
      <Card style={styles.postCard}>
        <View style={styles.postHeader}>
          <Avatar name={item.author_name} size={40} />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{item.author_name}</Text>
            <View style={styles.metaInfo}>
              <Text style={styles.timestamp}>{timeAgo(item.timestamp)}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => handleLike(item._id)}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={20} 
              color={isLiked ? Colors.error : Colors.textSecondary} 
            />
            <Text style={[styles.actionText, isLiked && { color: Colors.error }]}>
              {item.likes?.length || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.actionText}>{item.comments?.length || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="share-social-outline" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Forum</Text>
        <TouchableOpacity 
          style={styles.createBtn}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search discussions..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={renderPost}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={Colors.border} />
              <Text style={styles.emptyText}>No discussions found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  title: {
    ...Typography.subheading,
    color: Colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  createBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 8px rgba(79, 70, 229, 0.2)',
      },
      default: {
        elevation: 4,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      }
    }),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    ...Typography.body,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  postCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  authorInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  authorName: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timestamp: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    ...Typography.small,
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  postContent: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: Spacing.md,
    gap: Spacing.xl,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  }
});
