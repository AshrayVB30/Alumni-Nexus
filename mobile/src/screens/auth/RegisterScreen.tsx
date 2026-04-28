import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { AppInput } from '../../components/AppInput';
import { AppButton } from '../../components/AppButton';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { authService } from '../../services/authService';
import { Ionicons } from '@expo/vector-icons';

export const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usn, setUsn] = useState('');
  const [yearOfPassing, setYearOfPassing] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<'Student' | 'Alumni'>('Student');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();

  const handleRegister = async () => {
    if (!name || !email || !password || !usn || !yearOfPassing) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Email, Password, USN, Year of Passing)');
      return;
    }

    setLoading(true);
    try {
      await authService.register({ 
        name, 
        email, 
        password, 
        role, 
        usn, 
        year_of_passing: yearOfPassing, 
        department 
      });
      Alert.alert(
        'Success', 
        'Account created successfully! Please sign in.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', error.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Alumni Nexus community today</Text>
        </View>

        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>I am a:</Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'Student' && styles.roleButtonActive]}
              onPress={() => setRole('Student')}
            >
              <Ionicons 
                name="school-outline" 
                size={20} 
                color={role === 'Student' ? Colors.white : Colors.textSecondary} 
              />
              <Text style={[styles.roleButtonText, role === 'Student' && styles.roleButtonTextActive]}>Student</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roleButton, role === 'Alumni' && styles.roleButtonActive]}
              onPress={() => setRole('Alumni')}
            >
              <Ionicons 
                name="briefcase-outline" 
                size={20} 
                color={role === 'Alumni' ? Colors.white : Colors.textSecondary} 
              />
              <Text style={[styles.roleButtonText, role === 'Alumni' && styles.roleButtonTextActive]}>Alumni</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.form}>
          <AppInput
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
            icon="person-outline"
          />
          <AppInput
            label="Email Address"
            placeholder="example@college.edu"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            icon="mail-outline"
          />
          <AppInput
            label="USN (Required)"
            placeholder="1AB22CS001"
            value={usn}
            onChangeText={setUsn}
            autoCapitalize="characters"
            icon="card-outline"
          />
          <AppInput
            label="Year of Passing (Required)"
            placeholder="2026"
            value={yearOfPassing}
            onChangeText={setYearOfPassing}
            keyboardType="numeric"
            icon="calendar-outline"
          />
          <AppInput
            label="Department"
            placeholder="Computer Science"
            value={department}
            onChangeText={setDepartment}
            icon="business-outline"
          />
          <AppInput
            label="Password"
            placeholder="Min. 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="lock-closed-outline"
          />

          <AppButton 
            title="Create Account" 
            onPress={handleRegister} 
            loading={loading}
            style={styles.registerBtn}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    ...Typography.display,
    color: Colors.text,
    fontSize: 26,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  roleContainer: {
    marginBottom: 32,
  },
  roleLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleButtonText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  roleButtonTextActive: {
    color: Colors.white,
  },
  form: {
    width: '100%',
  },
  registerBtn: {
    height: 56,
    marginTop: 8,
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  link: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
});
