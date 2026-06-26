import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getAvatarInitials } from '../../utils/avatarColors';

interface AvatarCircleProps {
  name: string;
  color: string;
  size?: number;
  fontSize?: number;
}

export function AvatarCircle({ name, color, size = 44, fontSize }: AvatarCircleProps) {
  const initials = getAvatarInitials(name);
  const computedFontSize = fontSize ?? Math.round(size * 0.38);

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: computedFontSize }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default AvatarCircle;