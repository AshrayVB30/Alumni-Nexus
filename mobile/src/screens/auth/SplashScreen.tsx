import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const SplashScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="school" size={60} color={Colors.white} />
        </View>
        <Text style={styles.title}>Alumni Nexus</Text>
        <Text style={styles.subtitle}>Empowering Connections</Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Ready to connect?</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    ...Typography.display,
    color: Colors.white,
    letterSpacing: 1,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.primaryLight,
    marginTop: 8,
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.white,
    opacity: 0.6,
  },
});
