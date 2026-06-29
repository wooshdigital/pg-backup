import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getAvatarInitials } from '../../utils/avatarColors';

interface AvatarCircleProps {
  name: string;
  color: string;
  size?: number;
  fontSize?: number;
}

export function AvatarCircle({ name, color, size = 44, fontSize = 16 }: AvatarCircleProps) {
  const initials = getAvatarInitials(name);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
      accessibilityLabel={`Avatar for ${name}`}
    >
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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