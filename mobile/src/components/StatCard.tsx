import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Card } from './Card';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  change, 
  icon, 
  iconColor, 
  iconBg 
}) => {
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <View style={styles.changeBadge}>
          <Ionicons name="arrow-up" size={10} color={Colors.success} />
          <Text style={styles.changeText}>{change}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
    minWidth: 150,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    gap: 2,
  },
  changeText: {
    ...Typography.small,
    color: Colors.success,
  },
  footer: {
    marginTop: Spacing.xs,
  },
  value: {
    ...Typography.heading,
    fontSize: 24,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  label: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
});
