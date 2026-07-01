import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface CustomSplitInputProps {
  participantId: string;
  name: string;
  amount: string;
  onChangeAmount: (participantId: string, value: string) => void;
  currencySymbol?: string;
  style?: ViewStyle;
}

function getAvatarColor(name: string): string {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
    '#98D8C8',
    '#F7DC6F',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const CustomSplitInput: React.FC<CustomSplitInputProps> = ({
  participantId,
  name,
  amount,
  onChangeAmount,
  currencySymbol = '$',
  style,
}) => {
  const avatarColor = getAvatarColor(name);
  const initials = getInitials(name);

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <View style={styles.inputWrapper}>
        <Text style={styles.currencySymbol}>{currencySymbol}</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={(val) => onChangeAmount(participantId, val)}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#C7C7CC"
          selectTextOnFocus
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  name: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 90,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#8E8E93',
    marginRight: 2,
  },
  input: {
    fontSize: 16,
    color: '#1C1C1E',
    minWidth: 60,
    textAlign: 'right',
    padding: 0,
  },
});