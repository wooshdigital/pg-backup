import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface CustomSplitInputProps {
  participantId: string;
  name: string;
  amount: number;
  currency?: string;
  onChange: (participantId: string, amount: number) => void;
  isLast?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#3B82F6', '#14B8A6',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export const CustomSplitInput: React.FC<CustomSplitInputProps> = ({
  participantId,
  name,
  amount,
  currency = '$',
  onChange,
  isLast = false,
}) => {
  const initials = getInitials(name);
  const avatarColor = getAvatarColor(name);

  const handleChange = (text: string) => {
    const parsed = parseFloat(text);
    onChange(participantId, isNaN(parsed) ? 0 : parsed);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <View style={styles.inputWrapper}>
        <Text style={styles.currencySymbol}>{currency}</Text>
        <TextInput
          style={[styles.input, isLast && styles.inputLast]}
          value={amount === 0 ? '' : amount.toString()}
          onChangeText={handleChange}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#9CA3AF"
          accessibilityLabel={`${name}'s share`}
          editable={!isLast}
          selectTextOnFocus
        />
      </View>
      {isLast && (
        <Text style={styles.autoLabel}>auto</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  name: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 90,
  },
  currencySymbol: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 2,
  },
  input: {
    fontSize: 15,
    color: '#111827',
    minWidth: 60,
    padding: 0,
    textAlign: 'right',
  },
  inputLast: {
    color: '#6B7280',
  },
  autoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

export default CustomSplitInput;