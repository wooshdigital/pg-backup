import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Participant } from '../../types';

interface ParticipantMultiSelectProps {
  participants: Participant[];
  selectedIds: string[];
  onToggle: (participantId: string) => void;
}

export function ParticipantMultiSelect({
  participants,
  selectedIds,
  onToggle,
}: ParticipantMultiSelectProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {participants.map((participant) => {
        const isSelected = selectedIds.includes(participant.id);
        return (
          <TouchableOpacity
            key={participant.id}
            style={[styles.row, isSelected && styles.rowSelected]}
            onPress={() => onToggle(participant.id)}
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
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && (
                <Text style={styles.checkmark}>✓</Text>
              )}
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
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#6366F1',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
});