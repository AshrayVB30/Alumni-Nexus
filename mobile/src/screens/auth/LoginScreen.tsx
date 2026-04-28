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
import { useAuthStore } from '../../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

export const LoginScreen = () => {
  const [identifier, setIdentifier] = useState(''); // Can be email or USN
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState<'email' | 'usn'>('email');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const loginData = loginType === 'email' 
        ? { email: identifier, password } 
        : { usn: identifier, password };
        
      const data = await authService.login(loginData.email || '', loginData.password, loginData.usn);
      setAuth(
        {
          id: data.user_id,
          email: loginType === 'email' ? identifier : '',
          role: data.role,
          name: data.name,
        },
        data.access_token
      );
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.response?.data?.detail || 'Something went wrong');
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
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="school-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue to Alumni Nexus</Text>
        </View>

        <View style={styles.loginTypeContainer}>
          <TouchableOpacity 
            style={[styles.loginTypeBtn, loginType === 'email' && styles.loginTypeBtnActive]}
            onPress={() => setLoginType('email')}
          >
            <Text style={[styles.loginTypeBtnText, loginType === 'email' && styles.loginTypeBtnTextActive]}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.loginTypeBtn, loginType === 'usn' && styles.loginTypeBtnActive]}
            onPress={() => setLoginType('usn')}
          >
            <Text style={[styles.loginTypeBtnText, loginType === 'usn' && styles.loginTypeBtnTextActive]}>USN</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <AppInput
            label={loginType === 'email' ? "Email Address" : "University Seat Number (USN)"}
            placeholder={loginType === 'email' ? "example@college.edu" : "1AB22CS001"}
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType={loginType === 'email' ? "email-address" : "default"}
            autoCapitalize={loginType === 'email' ? "none" : "characters"}
            icon={loginType === 'email' ? "mail-outline" : "card-outline"}
          />
          <AppInput
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="lock-closed-outline"
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <AppButton 
            title="Sign In" 
            onPress={handleLogin} 
            loading={loading}
            style={styles.loginBtn}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Create Account</Text>
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
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)',
      },
      default: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
      }
    }),
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
    textAlign: 'center',
  },
  loginTypeContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 4,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loginTypeBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginTypeBtnActive: {
    backgroundColor: Colors.primary,
  },
  loginTypeBtnText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  loginTypeBtnTextActive: {
    color: Colors.white,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  loginBtn: {
    height: 56,
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
