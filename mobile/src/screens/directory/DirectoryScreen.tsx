import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DirectoryStackParamList } from '../../navigation/types';

export const DirectoryScreen = () => {
  const navigation = useNavigation<StackNavigationProp<DirectoryStackParamList>>();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Student' | 'Alumni'>('All');

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/');
      setUsers(response.data);
      applyFilters(response.data, searchQuery, activeFilter);
    } catch (err) {
      console.error('Error fetching directory:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const applyFilters = (data: any[], query: string, role: string) => {
    let filtered = data;
    
    if (role !== 'All') {
      filtered = filtered.filter(u => u.role === role);
    }
    
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(q) || 
        u.email?.toLowerCase().includes(q) ||
        u.profile?.professional_info?.job_title?.toLowerCase().includes(q)
      );
    }
    
    setFilteredUsers(filtered);
  };

  useEffect(() => {
    applyFilters(users, searchQuery, activeFilter);
  }, [searchQuery, activeFilter, users]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const renderUserItem = ({ item }: { item: any }) => (
    <Card 
      style={styles.userCard} 
      variant="outlined" 
      onPress={() => navigation.navigate('UserProfile', { userId: item.id || item._id })}
    >
      <Avatar name={item.name} size={56} style={styles.avatar} />
      <View style={styles.userInfo}>
        <View style={styles.userNameRow}>
          <Text style={styles.userName}>{item.name}</Text>
          <Badge 
            label={item.role} 
            variant={item.role === 'Alumni' ? 'primary' : 'gray'} 
          />
        </View>
        <Text style={styles.userRole}>
          {item.role === 'Alumni' 
            ? item.profile?.professional_info?.job_title || 'Professional Alumni'
            : item.profile?.academic_info?.branch || 'Student'}
        </Text>
        {item.profile?.skills && item.profile.skills.length > 0 ? (
          <View style={styles.skillsContainer}>
            {item.profile.skills.slice(0, 3).map((skill: string, idx: number) => (
              <Text key={idx} style={styles.skillText}>#{skill}</Text>
            ))}
            {item.profile.skills.length > 3 ? (
              <Text style={styles.skillText}>+{item.profile.skills.length - 3} more</Text>
            ) : null}
          </View>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alumni Directory</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, role, or skill..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textMuted}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filters}>
          {(['All', 'Student', 'Alumni'] as const).map((filter) => (
            <TouchableOpacity 
              key={filter}
              style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterTabText, activeFilter === filter && styles.filterTabTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={item => item.id || item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={Colors.border} />
              <Text style={styles.emptyText}>No users found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.heading,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    height: 48,
    backgroundColor: Colors.background,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
  },
  filters: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: Colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.xl,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  avatar: {
    marginRight: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  userName: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  userRole: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillText: {
    ...Typography.small,
    color: Colors.primary,
    fontSize: 9,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    ...Typography.subheading,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
