import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../constants/typography';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Ionicons } from '@expo/vector-icons';

interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  onViewAll,
  icon,
  iconColor = Colors.primary
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        {icon && <Ionicons name={icon} size={18} color={iconColor} style={styles.icon} />}
        <Text style={styles.title}>{title}</Text>
      </View>
      {onViewAll && (
        <TouchableOpacity onPress={onViewAll} style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>View all</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: Spacing.xs,
  },
  title: {
    ...Typography.subheading,
    color: Colors.text,
    fontWeight: '700',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
});
