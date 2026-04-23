import React from 'react';
import { View, Text, StyleSheet, Image, ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

interface AvatarProps {
  name?: string;
  source?: string;
  size?: number;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  name, 
  source, 
  size = 44, 
  style 
}) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  // Simple hash function to get a consistent color for the same name
  const getColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  };

  const backgroundColor = name ? getColor(name) : Colors.primary;

  return (
    <View 
      style={[
        styles.container, 
        { 
          width: size, 
          height: size, 
          borderRadius: size / 3, // Modern rounded square look
          backgroundColor: source ? Colors.transparent : backgroundColor 
        }, 
        style
      ]}
    >
      {source ? (
        <Image 
          source={{ uri: source }} 
          style={{ width: size, height: size, borderRadius: size / 3 }} 
        />
      ) : (
        <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initials}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    color: Colors.white,
    fontWeight: '700',
  },
});
