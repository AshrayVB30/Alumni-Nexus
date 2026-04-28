import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';

export const MentorsScreen = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation<any>();

  const fetchMentors = async () => {
    try {
      const response = await api.get('/users/mentors');
      setMentors(response.data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMentors();
  };

  const filteredMentors = mentors.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.profile?.professional_info?.job_title || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.profile?.skills || []).some((s: string) => s.toLowerCase().includes(search.toLowerCase()))
  );

  const renderMentor = ({ item }: { item: any }) => (
    <Card 
      style={styles.mentorCard} 
      onPress={() => navigation.navigate('UserProfile', { userId: item.id || item._id })}
    >
      <View style={styles.cardHeader}>
        <Avatar name={item.name} size={60} />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.role}>
            {item.profile?.professional_info?.job_title || 'Alumni'} @ {item.profile?.professional_info?.company_name || 'N/A'}
          </Text>
          <View style={styles.matchBadge}>
            <Ionicons name="sparkles" size={12} color={Colors.primary} />
            <Text style={styles.matchText}>98% Match</Text>
          </View>
        </View>
      </View>

      <View style={styles.skillsContainer}>
        {(item.profile?.skills || []).slice(0, 3).map((skill: string, idx: number) => (
          <Badge key={idx} label={skill} variant="gray" style={styles.skillBadge} />
        ))}
        {(item.profile?.skills?.length > 3) && (
          <Text style={styles.moreSkills}>+{item.profile.skills.length - 3} more</Text>
        )}
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={styles.messageBtn}
          onPress={() => navigation.navigate('ChatTab', { 
            screen: 'Chat', 
            params: { otherId: item.id || item._id, otherName: item.name } 
          })}
        >
          <Ionicons name="chatbubble-outline" size={18} color={Colors.primary} />
          <Text style={styles.messageBtnText}>Message</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.connectBtn}>
          <Text style={styles.connectBtnText}>Connect</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Mentors</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, role or skill..."
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
          data={filteredMentors}
          renderItem={renderMentor}
          keyExtractor={item => item.id || item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={Colors.border} />
              <Text style={styles.emptyText}>No mentors found</Text>
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
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
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
  mentorCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  name: {
    ...Typography.bodyBold,
    fontSize: 16,
    color: Colors.text,
  },
  role: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  matchText: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: '700',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  skillBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  moreSkills: {
    ...Typography.small,
    color: Colors.textSecondary,
    alignSelf: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  messageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  messageBtnText: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.primary,
  },
  connectBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 10,
  },
  connectBtnText: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.white,
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
