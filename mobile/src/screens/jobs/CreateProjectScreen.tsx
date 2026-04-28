import React, { useState } from 'react';
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
import { projectService } from '../../services/projectService';
import { useNavigation } from '@react-navigation/native';

export const CreateProjectScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    type: 'Job',
    skills_required: '',
    stipend: '',
    duration: '',
    effort_level: '',
    location_type: 'Remote',
    students_needed: 1,
    deadline: ''
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.skills_required) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        skills_required: formData.skills_required.split(',').map(s => s.trim()).filter(s => s !== '')
      };
      
      await projectService.createProject(payload);
      Alert.alert('Success', 'Project posted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to post project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post New Opportunity</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <AppInput 
              label="Title"
              placeholder="e.g. Senior Frontend Developer"
              value={formData.title}
              onChangeText={(t) => setFormData({...formData, title: t})}
            />
            
            <AppInput 
              label="Short Tagline"
              placeholder="e.g. Design a backend system using NLP"
              value={formData.tagline}
              onChangeText={(t) => setFormData({...formData, tagline: t})}
            />

            <View style={styles.typeContainer}>
              <Text style={styles.label}>Opportunity Type</Text>
              <View style={styles.typeButtons}>
                {['Job', 'Internship'].map((type) => (
                  <TouchableOpacity 
                    key={type}
                    style={[styles.typeBtn, formData.type === type && styles.typeBtnActive]}
                    onPress={() => setFormData({...formData, type})}
                  >
                    <Text style={[styles.typeBtnText, formData.type === type && styles.typeBtnTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <AppInput 
              label="Description"
              placeholder="Describe the role, responsibilities, and requirements..."
              value={formData.description}
              onChangeText={(t) => setFormData({...formData, description: t})}
              multiline
              numberOfLines={4}
            />

            <AppInput 
              label="Skills Required (comma separated)"
              placeholder="e.g. React, TypeScript, Node.js"
              value={formData.skills_required}
              onChangeText={(t) => setFormData({...formData, skills_required: t})}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <AppInput 
                  label="Stipend"
                  placeholder="e.g. $500/mo"
                  value={formData.stipend}
                  onChangeText={(t) => setFormData({...formData, stipend: t})}
                />
              </View>
              <View style={{ width: Spacing.md }} />
              <View style={{ flex: 1 }}>
                <AppInput 
                  label="Duration"
                  placeholder="e.g. 6 Months"
                  value={formData.duration}
                  onChangeText={(t) => setFormData({...formData, duration: t})}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <AppInput 
                  label="Effort"
                  placeholder="e.g. Part-time"
                  value={formData.effort_level}
                  onChangeText={(t) => setFormData({...formData, effort_level: t})}
                />
              </View>
              <View style={{ width: Spacing.md }} />
              <View style={{ flex: 1 }}>
                <AppInput 
                  label="Deadline"
                  placeholder="e.g. Dec 31"
                  value={formData.deadline}
                  onChangeText={(t) => setFormData({...formData, deadline: t})}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <AppInput 
                  label="Location"
                  placeholder="e.g. Remote"
                  value={formData.location_type}
                  onChangeText={(t) => setFormData({...formData, location_type: t})}
                />
              </View>
              <View style={{ width: Spacing.md }} />
              <View style={{ flex: 1 }}>
                <AppInput 
                  label="Slots"
                  placeholder="e.g. 2"
                  value={String(formData.students_needed)}
                  onChangeText={(t) => setFormData({...formData, students_needed: parseInt(t) || 1})}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <AppButton 
            title="Post Opportunity" 
            onPress={handleSubmit} 
            loading={loading}
            style={styles.submitBtn}
          />
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
  section: {
    marginBottom: Spacing.xl,
  },
  label: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    fontSize: 14,
  },
  typeContainer: {
    marginBottom: Spacing.lg,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  typeBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  typeBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  typeBtnText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: Colors.primary,
  },
  row: {
    flexDirection: 'row',
  },
  submitBtn: {
    marginTop: Spacing.lg,
    height: 56,
  },
});
