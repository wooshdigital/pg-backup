import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { getAvatarInitials } from '../../utils/avatarColors';

interface AvatarCircleProps {
  name: string;
  color: string;
  size?: number;
}

export function AvatarCircle({ name, color, size = 44 }: AvatarCircleProps) {
  const initials = getAvatarInitials(name);
  const fontSize = size * 0.38;

  const circleStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <View style={circleStyle}>
      <Text style={[styles.initials, { fontSize, lineHeight: size }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
});