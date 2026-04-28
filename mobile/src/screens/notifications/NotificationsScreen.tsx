import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
}

export const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    // Placeholder since backend might not have notifications yet
    try {
      // const response = await api.get('/notifications');
      // setNotifications(response.data);
      
      // Temporary mock data
      setNotifications([
        { 
          id: '1', 
          title: 'Welcome to Alumni Nexus!', 
          message: 'Explore the community and connect with mentors.', 
          type: 'success', 
          timestamp: new Date().toISOString(),
          isRead: false 
        },
        { 
          id: '2', 
          title: 'New Mentor Match', 
          message: 'We found a perfect mentor for your Career goals.', 
          type: 'info', 
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          isRead: true 
        }
      ]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity style={[styles.card, !item.isRead && styles.unreadCard]}>
      <View style={[styles.iconContainer, styles[item.type]]}>
        <Ionicons 
          name={
            item.type === 'success' ? 'checkmark-circle' : 
            item.type === 'warning' ? 'warning' : 
            item.type === 'error' ? 'close-circle' : 'information-circle'
          } 
          size={24} 
          color={Colors.white} 
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemMessage}>{item.message}</Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity>
          <Text style={styles.markReadText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={64} color={Colors.border} />
              <Text style={styles.emptyText}>No notifications yet</Text>
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
    fontSize: 24,
    color: Colors.text,
  },
  markReadText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unreadCard: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: { backgroundColor: Colors.primary },
  success: { backgroundColor: '#10b981' },
  warning: { backgroundColor: '#f59e0b' },
  error: { backgroundColor: '#ef4444' },
  content: {
    flex: 1,
  },
  itemTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 2,
  },
  itemMessage: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  timestamp: {
    ...Typography.small,
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: 8,
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
