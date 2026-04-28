import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Card } from '../../components/Card';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export const AdminDashboardScreen = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Ionicons name="people" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{stats?.total_users || 0}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="briefcase" size={24} color="#059669" />
            <Text style={styles.statValue}>{stats?.total_projects || 0}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="chatbubbles" size={24} color="#d97706" />
            <Text style={styles.statValue}>{stats?.total_posts || 0}</Text>
            <Text style={styles.statLabel}>Forum Posts</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="git-network" size={24} color="#7c3aed" />
            <Text style={styles.statValue}>{stats?.total_connections || 0}</Text>
            <Text style={styles.statLabel}>Connections</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>Management</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: '#eef2ff' }]}>
            <Ionicons name="person-add" size={20} color={Colors.primary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>User Verification</Text>
            <Text style={styles.menuSubtitle}>Approve new alumni registrations</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: '#ecfdf5' }]}>
            <Ionicons name="shield-checkmark" size={20} color="#059669" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Content Moderation</Text>
            <Text style={styles.menuSubtitle}>Review flagged posts and comments</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: '#fffbeb' }]}>
            <Ionicons name="analytics" size={20} color="#d97706" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>System Analytics</Text>
            <Text style={styles.menuSubtitle}>View platform growth and engagement</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  title: {
    ...Typography.subheading,
    fontSize: 24,
    color: Colors.text,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: '47%',
    padding: Spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.display,
    fontSize: 20,
    marginTop: 8,
    color: Colors.text,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  sectionTitle: {
    ...Typography.bodyBold,
    marginBottom: Spacing.lg,
    color: Colors.text,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.text,
  },
  menuSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  }
});
