import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Participant } from '../../types';

interface PayerSelectorProps {
  participants: Participant[];
  selectedPayerId: string | null;
  onSelect: (participantId: string) => void;
}

export function PayerSelector({ participants, selectedPayerId, onSelect }: PayerSelectorProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {participants.map((participant) => {
        const isSelected = participant.id === selectedPayerId;
        return (
          <TouchableOpacity
            key={participant.id}
            style={[styles.row, isSelected && styles.rowSelected]}
            onPress={() => onSelect(participant.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.avatar, { backgroundColor: participant.avatarColor || '#6366F1' }]}>
              <Text style={styles.avatarText}>
                {participant.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.name, isSelected && styles.nameSelected]}>
              {participant.name}
            </Text>
            <View style={[styles.radio, isSelected && styles.radioSelected]}>
              {isSelected && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rowSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  name: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  nameSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#6366F1',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366F1',
  },
});