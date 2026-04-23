import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';

export const EditProfileScreen = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        const data = await userService.getUser(user.id);
        setProfileData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await userService.updateProfile(user.id, {
        name: profileData.name,
        profile: profileData.profile
      });
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const updateNestedProfile = (key: string, value: any, section?: string) => {
    setProfileData((prev: any) => {
      const newData = { ...prev };
      if (!newData.profile) newData.profile = {};
      
      if (section) {
        if (!newData.profile[section]) newData.profile[section] = {};
        newData.profile[section] = { ...newData.profile[section], [key]: value };
      } else {
        newData.profile[key] = value;
      }
      return newData;
    });
  };

  const updateSocialLinks = (key: string, value: string) => {
    setProfileData((prev: any) => {
      const newData = { ...prev };
      if (!newData.profile) newData.profile = {};
      if (!newData.profile.social_links) newData.profile.social_links = {};
      newData.profile.social_links = { ...newData.profile.social_links, [key]: value };
      return newData;
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color={Colors.primary} /> : <Text style={styles.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <AppInput 
              label="Full Name"
              value={profileData.name}
              onChangeText={(t) => setProfileData({...profileData, name: t})}
            />
            <AppInput 
              label="Bio"
              value={profileData.profile?.bio || ''}
              onChangeText={(t) => updateNestedProfile('bio', t)}
              placeholder="Tell us about yourself..."
              multiline
            />
            <AppInput 
              label="Skills (comma separated)"
              value={profileData.profile?.skills?.join(', ') || ''}
              onChangeText={(t) => updateNestedProfile('skills', t.split(',').map(s => s.trim()))}
              placeholder="e.g. React, Python, UI Design"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social Links</Text>
            <AppInput 
              label="LinkedIn URL"
              value={profileData.profile?.social_links?.linkedin || ''}
              onChangeText={(t) => updateSocialLinks('linkedin', t)}
              placeholder="https://linkedin.com/in/username"
              icon="logo-linkedin"
            />
            <AppInput 
              label="GitHub URL"
              value={profileData.profile?.social_links?.github || ''}
              onChangeText={(t) => updateSocialLinks('github', t)}
              placeholder="https://github.com/username"
              icon="logo-github"
            />
          </View>

          {profileData.role === 'Alumni' ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Professional Details</Text>
              <AppInput 
                label="Current Job Title"
                value={profileData.profile?.professional_info?.job_title || ''}
                onChangeText={(t) => updateNestedProfile('job_title', t, 'professional_info')}
              />
              <AppInput 
                label="Company Name"
                value={profileData.profile?.professional_info?.company_name || ''}
                onChangeText={(t) => updateNestedProfile('company_name', t, 'professional_info')}
              />
              <AppInput 
                label="Years of Experience"
                value={String(profileData.profile?.professional_info?.years_experience || '0')}
                onChangeText={(t) => updateNestedProfile('years_experience', parseInt(t) || 0, 'professional_info')}
                keyboardType="numeric"
              />
              <AppInput 
                label="Graduation Year"
                value={profileData.profile?.education_info?.graduation_year || ''}
                onChangeText={(t) => updateNestedProfile('graduation_year', t, 'education_info')}
                placeholder="e.g. 2020"
                keyboardType="numeric"
              />
              <AppInput 
                label="Degree / Major"
                value={profileData.profile?.education_info?.branch || ''}
                onChangeText={(t) => updateNestedProfile('branch', t, 'education_info')}
                placeholder="e.g. B.Tech Computer Science"
              />
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Academic Details</Text>
              <AppInput 
                label="College Name"
                value={profileData.profile?.academic_info?.college_name || ''}
                onChangeText={(t) => updateNestedProfile('college_name', t, 'academic_info')}
              />
              <AppInput 
                label="Branch / Major"
                value={profileData.profile?.academic_info?.branch || ''}
                onChangeText={(t) => updateNestedProfile('branch', t, 'academic_info')}
              />
              <AppInput 
                label="Current Year"
                value={String(profileData.profile?.academic_info?.current_year || '1')}
                onChangeText={(t) => updateNestedProfile('current_year', t, 'academic_info')}
                keyboardType="numeric"
              />
              <AppInput 
                label="CGPA"
                value={String(profileData.profile?.academic_info?.cgpa || '')}
                onChangeText={(t) => updateNestedProfile('cgpa', t, 'academic_info')}
                placeholder="e.g. 8.5"
                keyboardType="numeric"
              />
            </View>
          )}

          <AppButton 
            title="Save Changes" 
            onPress={handleSave} 
            loading={saving}
            style={styles.bottomSaveBtn}
          />
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  saveBtnText: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bottomSaveBtn: {
    marginTop: Spacing.lg,
  },
});
