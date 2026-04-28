import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, Platform } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'flat';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  onPress,
  variant = 'elevated' 
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container 
      style={[
        styles.card, 
        styles[variant],
        style
      ]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
  elevated: {
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)',
      },
      default: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
      }
    }),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  flat: {
    backgroundColor: Colors.background,
  },
});
