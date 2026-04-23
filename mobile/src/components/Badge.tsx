import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'gray';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({ 
  label, 
  variant = 'gray', 
  style,
  textStyle 
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return { container: styles.primaryContainer, text: styles.primaryText };
      case 'success':
        return { container: styles.successContainer, text: styles.successText };
      case 'warning':
        return { container: styles.warningContainer, text: styles.warningText };
      case 'error':
        return { container: styles.errorContainer, text: styles.errorText };
      default:
        return { container: styles.grayContainer, text: styles.grayText };
    }
  };

  const currentStyles = getStyles();

  return (
    <View style={[styles.container, currentStyles.container, style]}>
      <Text style={[styles.text, currentStyles.text, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  text: {
    ...Typography.small,
    letterSpacing: 0.5,
  },
  primaryContainer: {
    backgroundColor: Colors.primaryLight,
    borderColor: '#c7d2fe',
  },
  primaryText: {
    color: Colors.primary,
  },
  successContainer: {
    backgroundColor: Colors.successLight,
    borderColor: '#bbf7d0',
  },
  successText: {
    color: Colors.success,
  },
  warningContainer: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  warningText: {
    color: Colors.warning,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  errorText: {
    color: Colors.error,
  },
  grayContainer: {
    backgroundColor: '#f8fafc',
    borderColor: Colors.border,
  },
  grayText: {
    color: Colors.textSecondary,
  },
});
