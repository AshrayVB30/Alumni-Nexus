import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { AppButton } from '../../components/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { DirectoryStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/useAuthStore';
import { userService } from '../../services/userService';
import api from '../../services/api';

type UserProfileRouteProp = RouteProp<DirectoryStackParamList, 'UserProfile'>;

export const UserProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<UserProfileRouteProp>();
  const { userId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getUser(userId);
        setUserData(data);
        setIsFollowing(data.profile?.followers?.includes(currentUser?.id) || false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId, currentUser?.id]);

  const handleMessage = () => {
    if (!userData) return;
    navigation.navigate('ChatTab' as any, {
      screen: 'Chat',
      params: { 
        otherId: userId, 
        otherName: userData.name 
      }
    });
  };

  const handleFollow = async () => {
    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      await api.post(`/social/${userId}/${endpoint}`);
      setIsFollowing(!isFollowing);
      // Refresh user data to get updated counts
      const data = await userService.getUser(userId);
      setUserData(data);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Action failed";
      alert(msg);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={Typography.body}>User not found</Text>
      </View>
    );
  }

  const profile = userData.profile || {};
  const isAlumni = userData.role === 'Alumni';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Avatar name={userData.name} size={100} style={styles.avatar} />
          <Text style={styles.name}>{userData.name}</Text>
          <Badge label={userData.role} variant={isAlumni ? 'primary' : 'gray'} style={styles.roleBadge} />
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.followers_count || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.following_count || 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          <Text style={styles.bio}>{profile.bio || 'No bio provided'}</Text>
          
          <View style={styles.socialRow}>
            {profile.social_links?.linkedin && (
              <TouchableOpacity onPress={() => Linking.openURL(profile.social_links.linkedin)}>
                <Ionicons name="logo-linkedin" size={24} color={Colors.primary} />
              </TouchableOpacity>
            )}
            {profile.social_links?.github && (
              <TouchableOpacity onPress={() => Linking.openURL(profile.social_links.github)}>
                <Ionicons name="logo-github" size={24} color={Colors.text} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.actionRow}>
          {isAlumni && currentUser?.role === 'Student' && (
            <AppButton 
              title={isFollowing ? "Unfollow" : "Follow"} 
              onPress={handleFollow} 
              variant={isFollowing ? "outline" : "primary"}
              style={styles.followBtn}
              icon={isFollowing ? "person-remove-outline" : "person-add-outline"}
            />
          )}
          <AppButton 
            title="Message" 
            onPress={handleMessage} 
            icon="chatbubble-outline"
            style={styles.messageBtn}
            variant="outline"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isAlumni ? 'Professional Experience' : 'Academic Details'}
          </Text>
          {isAlumni ? (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Company</Text>
              <Text style={styles.infoValue}>{profile.professional_info?.company_name || 'Not specified'}</Text>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>{profile.professional_info?.job_title || 'Alumni'}</Text>
              <Text style={styles.infoLabel}>Experience</Text>
              <Text style={styles.infoValue}>{profile.professional_info?.years_experience || 0} Years</Text>
            </View>
          ) : (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>College</Text>
              <Text style={styles.infoValue}>{profile.academic_info?.college_name || 'Not specified'}</Text>
              <Text style={styles.infoLabel}>Branch</Text>
              <Text style={styles.infoValue}>{profile.academic_info?.branch || 'Not specified'}</Text>
              <Text style={styles.infoLabel}>Current Year</Text>
              <Text style={styles.infoValue}>{profile.academic_info?.current_year || 'N/A'}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {profile.skills?.length > 0 ? (
              profile.skills.map((skill: string, idx: number) => (
                <View key={idx} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No skills listed</Text>
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.subheading,
    color: Colors.text,
    fontWeight: '700',
  },
  backBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    marginBottom: Spacing.lg,
  },
  name: {
    ...Typography.heading,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  roleBadge: {
    marginBottom: Spacing.md,
  },
  bio: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  followBtn: {
    flex: 1,
    height: 48,
  },
  messageBtn: {
    flex: 1,
    height: 48,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...Typography.bodyBold,
    fontSize: 18,
    color: Colors.text,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  infoCard: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  skillText: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
});
