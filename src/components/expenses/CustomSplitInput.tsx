import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Participant } from '../../types';
import { Split } from '../../utils/splitCalculator';

interface CustomSplitInputProps {
  participant: Participant;
  split: Split;
  currency: string;
  onChangeAmount: (participantId: string, amount: string) => void;
  style?: ViewStyle;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function CustomSplitInput({
  participant,
  split,
  currency,
  onChangeAmount,
  style,
}: CustomSplitInputProps) {
  const inputRef = useRef<TextInput>(null);

  const avatarColor = participant.avatarColor || '#6366F1';

  return (
    <View style={[styles.row, style]}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{getInitials(participant.name)}</Text>
      </View>

      {/* Name */}
      <Text style={styles.name} numberOfLines={1}>
        {participant.name}
      </Text>

      {/* Amount input */}
      <View style={styles.inputWrapper}>
        <Text style={styles.currencySymbol}>{getCurrencySymbol(currency)}</Text>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={split.amount === 0 ? '' : split.amount.toString()}
          onChangeText={(text) => onChangeAmount(participant.id, text)}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#94A3B8"
          accessibilityLabel={`${participant.name}'s share`}
          selectTextOnFocus
        />
      </View>
    </View>
  );
}

function getCurrencySymbol(currency: string): string {
  try {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(0);
    return formatted.replace(/[\d,.\s]/g, '').trim();
  } catch {
    return currency;
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
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
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 100,
    backgroundColor: '#F8FAFC',
  },
  currencySymbol: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 4,
  },
  input: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    minWidth: 60,
    padding: 0,
    textAlign: 'right',
  },
});