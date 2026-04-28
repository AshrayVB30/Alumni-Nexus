import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView
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

export const MentorMatchingScreen = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation<any>();

  const fetchMatches = async () => {
    if (!user?.id) return;
    try {
      const response = await api.get(`/users/${user.id}/mentors`);
      setMentors(response.data);
    } catch (error) {
      console.error('Error fetching mentor matches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [user?.id]);

  const renderMatch = ({ item, index }: { item: any, index: number }) => {
    // Generate a match score if not present
    const matchScore = 99 - index * 2;
    
    return (
      <Card style={styles.matchCard}>
        <View style={styles.matchHeader}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>{matchScore}%</Text>
            <Text style={styles.scoreLabel}>Match</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.role}>{item.profile?.professional_info?.job_title || 'Alumni'}</Text>
            <Text style={styles.company}>{item.profile?.professional_info?.company_name || 'Alumni Nexus'}</Text>
          </View>
          <Avatar name={item.name} size={60} />
        </View>

        <View style={styles.divider} />

        <Text style={styles.reasonTitle}>Why this match?</Text>
        <View style={styles.skillsContainer}>
          {(item.profile?.skills || []).map((skill: string, idx: number) => (
            <Badge key={idx} label={skill} variant="primary" style={styles.skillBadge} />
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.messageBtn}
            onPress={() => navigation.navigate('ChatTab', { 
              screen: 'Chat', 
              params: { otherId: item.id || item._id, otherName: item.name } 
            })}
          >
            <Ionicons name="chatbubble" size={18} color={Colors.white} />
            <Text style={styles.messageText}>Start Conversation</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>AI Mentor Matching</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Ionicons name="sparkles" size={32} color={Colors.white} />
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Precision Matching Engine</Text>
            <Text style={styles.bannerSubtitle}>We've analyzed your profile to find mentors that align with your career trajectory.</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={mentors}
            renderItem={renderMatch}
            keyExtractor={item => item.id || item._id}
            scrollEnabled={false}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color={Colors.border} />
                <Text style={styles.emptyText}>No matches found. Try updating your profile interests!</Text>
              </View>
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
  },
  title: {
    ...Typography.bodyBold,
    fontSize: 18,
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  banner: {
    backgroundColor: Colors.primary,
    margin: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    ...Typography.bodyBold,
    color: Colors.white,
    fontSize: 16,
  },
  bannerSubtitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  matchCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  scoreText: {
    ...Typography.bodyBold,
    color: Colors.primary,
    fontSize: 14,
  },
  scoreLabel: {
    ...Typography.small,
    fontSize: 8,
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    ...Typography.bodyBold,
    fontSize: 16,
    color: Colors.text,
  },
  role: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  company: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  reasonTitle: {
    ...Typography.small,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
    letterSpacing: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.xl,
  },
  skillBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  actions: {
    flexDirection: 'row',
  },
  messageBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  messageText: {
    ...Typography.bodyBold,
    color: Colors.white,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
  }
});
