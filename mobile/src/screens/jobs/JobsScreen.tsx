import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { AppButton } from '../../components/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { projectService } from '../../services/projectService';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { JobsStackParamList } from '../../navigation/types';

export const JobsScreen = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<StackNavigationProp<JobsStackParamList>>();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'Jobs' | 'Internships'>('All');

  const fetchProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const handleApply = async (projectId: string, title: string) => {
    if (user?.role !== 'Student') {
      Alert.alert('Restricted', 'Only students can apply to projects.');
      return;
    }

    try {
      await projectService.applyToProject(projectId);
      Alert.alert('Success', `You have applied to "${title}" successfully!`);
      // Refresh projects to update application status in UI
      fetchProjects();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Application Failed', err.response?.data?.detail || 'Something went wrong');
    }
  };

  const filteredProjects = projects.filter(p => {
    if (activeTab === 'All') return true;
    return p.type === activeTab.slice(0, -1); // 'Job' or 'Internship'
  });

  const renderProjectItem = ({ item }: { item: any }) => (
    <Card style={styles.projectCard} variant="outlined">
      <View style={styles.projectHeader}>
        <View style={styles.titleArea}>
          <Text style={styles.projectTitle}>{item.title}</Text>
          <Text style={styles.companyName}>{item.company_name || 'Alumni Venture'}</Text>
        </View>
        <Badge 
          label={item.type || 'Job'} 
          variant={item.type === 'Internship' ? 'warning' : 'success'} 
        />
      </View>
      
      <Text style={styles.description} numberOfLines={3}>
        {item.description}
      </Text>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.detailText}>{item.location || 'Remote'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.detailText}>{item.stipend || 'Competitive'}</Text>
        </View>
      </View>

      {item.skills_required && item.skills_required.length > 0 ? (
        <View style={styles.tagsRow}>
          {item.skills_required.slice(0, 3).map((skill: string, idx: number) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>{skill}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.footer}>
        {item.posted_by === user?.id ? (
          <AppButton 
            title="Manage Project" 
            onPress={() => {
              // Alumni can manage their own projects
              Alert.alert('Project Owner', 'You are the owner of this project.');
            }} 
            style={styles.applyBtn}
            variant="outline"
          />
        ) : (
          <AppButton 
            title={item.applicants?.includes(user?.id) ? "Applied" : "Apply Now"} 
            onPress={() => handleApply(item.id, item.title)} 
            disabled={item.applicants?.includes(user?.id)}
            style={styles.applyBtn}
            variant={item.applicants?.includes(user?.id) ? "outline" : "primary"}
          />
        )}
        <TouchableOpacity style={styles.saveBtn}>
          <Ionicons name="bookmark-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Marketplace</Text>
          {user?.role === 'Alumni' ? (
            <TouchableOpacity 
              style={styles.addBtn}
              onPress={() => navigation.navigate('CreateProject')}
            >
              <Ionicons name="add-circle" size={32} color={Colors.primary} />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.tabs}>
          {(['All', 'Jobs', 'Internships'] as const).map((tab) => (
            <TouchableOpacity 
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
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
          data={filteredProjects}
          renderItem={renderProjectItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="briefcase-outline" size={64} color={Colors.border} />
              <Text style={styles.emptyText}>No listings available</Text>
              <Text style={styles.emptySubtext}>Check back later for new opportunities</Text>
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  addBtn: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  tab: {
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.primary,
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
  projectCard: {
    padding: Spacing.lg,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  titleArea: {
    flex: 1,
    marginRight: Spacing.md,
  },
  projectTitle: {
    ...Typography.subheading,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: 2,
  },
  companyName: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  tag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    ...Typography.small,
    color: Colors.primary,
    fontSize: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  applyBtn: {
    flex: 1,
    height: 44,
  },
  saveBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
