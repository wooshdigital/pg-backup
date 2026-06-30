import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { Participant } from '../../types';
import { getAvatarColor } from '../../utils/avatarColors';

interface PayerSelectorProps {
  participants: Participant[];
  selectedPayerId: string | null;
  onSelect: (participantId: string) => void;
}

export function PayerSelector({ participants, selectedPayerId, onSelect }: PayerSelectorProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {participants.map(participant => {
        const isSelected = participant.id === selectedPayerId;
        const avatarColor = participant.avatarColor || getAvatarColor(participant.name);
        const initials = getInitials(participant.name);

        return (
          <Pressable
            key={participant.id}
            style={[styles.row, isSelected && styles.rowSelected]}
            onPress={() => onSelect(participant.id)}
            android_ripple={{ color: '#EEF2FF' }}
          >
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, isSelected && styles.nameSelected]}>
                {participant.name}
              </Text>
              {participant.email ? (
                <Text style={styles.email}>{participant.email}</Text>
              ) : null}
            </View>
            <View style={[styles.radio, isSelected && styles.radioSelected]}>
              {isSelected && <View style={styles.radioDot} />}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  rowSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  nameSelected: {
    color: '#4338CA',
  },
  email: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioSelected: {
    borderColor: '#6366F1',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366F1',
  },
});

export default PayerSelector;