import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { AppButton } from '../../components/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { ProfileStackParamList } from '../../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';

export const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      const data = await userService.getUser(user.id);
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <Avatar name={profile?.name} size={100} style={styles.avatar} />
          <Text style={styles.name}>{profile?.name}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
          <View style={styles.roleContainer}>
            <Badge label={profile?.role} variant={profile?.role === 'Alumni' ? 'primary' : 'gray'} />
          </View>
          
          <View style={styles.actionRow}>
            <AppButton 
              title="Edit Profile" 
              variant="outline" 
              onPress={() => navigation.navigate('EditProfile')} 
              style={styles.editBtn}
              icon={<Ionicons name="create-outline" size={18} color={Colors.primary} />}
            />
          </View>
        </View>

        {/* Bio */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>
            {profile?.profile?.bio || 'No bio provided yet. Add a short bio to let others know about you.'}
          </Text>
        </Card>

        {/* Info Sections based on role */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            {profile?.role === 'Alumni' ? 'Professional Info' : 'Academic Info'}
          </Text>
          
          {profile?.role === 'Alumni' ? (
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Ionicons name="briefcase-outline" size={20} color={Colors.textSecondary} />
                <View>
                  <Text style={styles.infoLabel}>Current Position</Text>
                  <Text style={styles.infoValue}>
                    {profile?.profile?.professional_info?.job_title || 'Not specified'} at {profile?.profile?.professional_info?.company_name || 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
                <View>
                  <Text style={styles.infoLabel}>Experience</Text>
                  <Text style={styles.infoValue}>
                    {profile?.profile?.professional_info?.years_experience || 0} years in {profile?.profile?.professional_info?.industry || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Ionicons name="school-outline" size={20} color={Colors.textSecondary} />
                <View>
                  <Text style={styles.infoLabel}>College / Branch</Text>
                  <Text style={styles.infoValue}>
                    {profile?.profile?.academic_info?.college_name || 'Not specified'} - {profile?.profile?.academic_info?.branch || 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="ribbon-outline" size={20} color={Colors.textSecondary} />
                <View>
                  <Text style={styles.infoLabel}>Current Year</Text>
                  <Text style={styles.infoValue}>
                    Year {profile?.profile?.academic_info?.current_year || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Card>

        {/* Skills */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Skills & Expertise</Text>
          <View style={styles.skillsContainer}>
            {profile?.profile?.skills?.length > 0 ? (
              profile.profile.skills.map((skill: string, idx: number) => (
                <Badge key={idx} label={skill} variant="gray" style={styles.skillBadge} />
              ))
            ) : (
              <Text style={styles.emptyText}>No skills added yet</Text>
            )}
          </View>
        </Card>

        {/* Social Links */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Social Links</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-linkedin" size={24} color="#0077B5" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-github" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="globe-outline" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Account Actions */}
        <View style={styles.footer}>
          <AppButton 
            title="Sign Out" 
            variant="error" 
            onPress={handleLogout} 
            style={styles.logoutBtn}
            icon={<Ionicons name="log-out-outline" size={20} color={Colors.white} />}
          />
          <Text style={styles.versionText}>Alumni Nexus Mobile v1.0.0</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    marginBottom: Spacing.md,
    borderWidth: 4,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  name: {
    ...Typography.display,
    fontSize: 24,
    color: Colors.text,
  },
  email: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  roleContainer: {
    marginBottom: Spacing.lg,
  },
  actionRow: {
    width: '100%',
    paddingHorizontal: 40,
  },
  editBtn: {
    height: 44,
  },
  sectionCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.md,
    fontSize: 15,
  },
  bioText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  infoList: {
    gap: Spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoLabel: {
    ...Typography.small,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  infoValue: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  emptyText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoutBtn: {
    width: '100%',
    height: 50,
  },
  versionText: {
    ...Typography.small,
    color: Colors.textMuted,
  },
});
