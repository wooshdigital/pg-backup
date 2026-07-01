import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Participant } from '../../types';
import { getAvatarColor } from '../../utils/avatarColors';

interface CustomSplitInputProps {
  participant: Participant;
  amount: number;
  currency: string;
  onChange: (participantId: string, amount: number) => void;
}

export function CustomSplitInput({
  participant,
  amount,
  currency,
  onChange,
}: CustomSplitInputProps) {
  const initials = participant.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarColor = getAvatarColor(participant.id);

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {participant.name}
      </Text>
      <View style={styles.inputWrapper}>
        <Text style={styles.currencySymbol}>{currency}</Text>
        <TextInput
          style={styles.input}
          value={amount > 0 ? String(amount) : ''}
          onChangeText={(text) => {
            const parsed = parseFloat(text);
            onChange(participant.id, isNaN(parsed) ? 0 : parsed);
          }}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#999"
          accessibilityLabel={`${participant.name}'s share`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  name: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 90,
  },
  currencySymbol: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  input: {
    fontSize: 15,
    color: '#1A1A1A',
    minWidth: 60,
    textAlign: 'right',
    padding: 0,
  },
});