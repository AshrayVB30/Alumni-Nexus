import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  RefreshControl,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/useAuthStore';
import { StatCard } from '../../components/StatCard';
import { SectionHeader } from '../../components/SectionHeader';
import { Avatar } from '../../components/Avatar';
import { AppButton } from '../../components/AppButton';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { AppTabParamList } from '../../navigation/types';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Card } from '../../components/Card';
import { Skeleton } from '../../components/Skeleton';

const { width } = Dimensions.get('window');

const stats = [
  { label: 'Mentors', value: '842', change: '+4%', icon: 'people' as const, color: '#4f46e5', bg: '#eef2ff' },
  { label: 'Projects', value: '24', change: '+12%', icon: 'briefcase' as const, color: '#059669', bg: '#ecfdf5' },
  { label: 'Forum', value: '1.2k', change: '+8%', icon: 'chatbubbles' as const, color: '#d97706', bg: '#fffbeb' },
  { label: 'Connects', value: '3.4k', change: '+2%', icon: 'trending-up' as const, color: '#7c3aed', bg: '#f5f3ff' },
];

export const HomeScreen = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigation = useNavigation<BottomTabNavigationProp<AppTabParamList>>();
  
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMentors = async () => {
    if (!user?.id) return;
    try {
      const response = await api.get(`/users/${user.id}/mentors`);
      setMentors(response.data.slice(0, 5));
    } catch (err) {
      console.error('Error fetching mentors:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMentors();
  };

  const handleConnect = (mentor: any) => {
    // Navigate to Chat screen within the ChatTab
    // We can use navigate('ChatTab', { screen: 'Chat', params: { ... } })
    navigation.navigate('ChatTab', {
      screen: 'Chat',
      params: { 
        otherId: mentor.id || mentor._id, 
        otherName: mentor.name 
      }
    } as any);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const renderMentorItem = ({ item }: { item: any }) => (
    <Card style={styles.mentorCard} variant="outlined" onPress={() => {}}>
      <Avatar name={item.name} size={50} style={styles.mentorAvatar} />
      <Text style={styles.mentorName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.mentorRole} numberOfLines={1}>
        {item.profile?.professional_info?.job_title || 'Alumni'}
      </Text>
      <AppButton 
        title="Connect" 
        variant="outline" 
        onPress={() => handleConnect(item)} 
        style={styles.connectBtn}
        textStyle={{ fontSize: 10 }}
      />
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>{greeting},</Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'User'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')}>
            <Avatar name={user?.name} size={48} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((s, idx) => (
            <StatCard 
              key={idx}
              label={s.label}
              value={s.value}
              change={s.change}
              icon={s.icon}
              iconColor={s.color}
              iconBg={s.bg}
              onPress={s.label === 'Forum' ? () => navigation.navigate('ForumTab' as any) : undefined}
            />
          ))}
        </View>

        {/* AI Banner */}
        <TouchableOpacity 
          style={styles.banner}
          onPress={() => navigation.navigate('MentorMatching' as any)}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerTag}>
              <Ionicons name="sparkles" size={12} color="#a5b4fc" />
              <Text style={styles.bannerTagText}>AI MATCHING ACTIVE</Text>
            </View>
            <Text style={styles.bannerTitle}>Find your perfect mentor</Text>
            <Text style={styles.bannerSubtitle}>Based on your skills and career goals</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.white} />
        </TouchableOpacity>

        {/* Suggested Mentors */}
        <SectionHeader 
          title="Suggested Mentors" 
          onViewAll={() => {}} 
          icon="star" 
          iconColor={Colors.warning} 
        />
        
        {loading ? (
          <View style={styles.horizontalList}>
            {[1, 2, 3].map(i => (
              <View key={i} style={[styles.mentorCard, { borderWidth: 1, borderColor: Colors.border }]}>
                <Skeleton width={50} height={50} borderRadius={16} style={styles.mentorAvatar} />
                <Skeleton width="80%" height={12} style={{ marginBottom: 8 }} />
                <Skeleton width="60%" height={10} style={{ marginBottom: 16 }} />
                <Skeleton width="100%" height={32} borderRadius={8} />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            data={mentors}
            renderItem={renderMentorItem}
            keyExtractor={item => item.id || item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        )}

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.quickActions}>
          <Card style={styles.actionCard} variant="outlined" onPress={() => navigation.navigate('DirectoryTab')}>
            <View style={[styles.actionIcon, { backgroundColor: '#eef2ff' }]}>
              <Ionicons name="people" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.actionText}>Directory</Text>
          </Card>
          <Card style={styles.actionCard} variant="outlined" onPress={() => navigation.navigate('ForumTab')}>
            <View style={[styles.actionIcon, { backgroundColor: '#fffbeb' }]}>
              <Ionicons name="chatbubbles" size={24} color="#d97706" />
            </View>
            <Text style={styles.actionText}>Forum</Text>
          </Card>
          <Card style={styles.actionCard} variant="outlined" onPress={() => navigation.navigate('MarketplaceTab')}>
            <View style={[styles.actionIcon, { backgroundColor: '#ecfdf5' }]}>
              <Ionicons name="briefcase" size={24} color="#059669" />
            </View>
            <Text style={styles.actionText}>Marketplace</Text>
          </Card>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greetingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    ...Typography.display,
    fontSize: 24,
    color: Colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  banner: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 20,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  bannerTagText: {
    ...Typography.small,
    color: '#a5b4fc',
    letterSpacing: 1,
  },
  bannerTitle: {
    ...Typography.subheading,
    color: Colors.white,
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerSubtitle: {
    ...Typography.caption,
    color: Colors.primaryLight,
    opacity: 0.8,
  },
  horizontalList: {
    paddingRight: Spacing.xl,
    gap: Spacing.md,
  },
  mentorCard: {
    width: 140,
    alignItems: 'center',
    padding: Spacing.md,
  },
  mentorAvatar: {
    marginBottom: Spacing.sm,
  },
  mentorName: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 13,
    textAlign: 'center',
  },
  mentorRole: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  connectBtn: {
    height: 32,
    width: '100%',
    paddingHorizontal: 0,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '700',
  },
});
