import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { AvatarCircle } from './AvatarCircle';
import { Participant } from '../../types';

interface ParticipantRowProps {
  participant: Participant;
  onRemove: (participantId: string) => void;
}

export function ParticipantRow({ participant, onRemove }: ParticipantRowProps) {
  function handleRemove() {
    Alert.alert(
      'Remove Participant',
      `Remove "${participant.name}" from this trip?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onRemove(participant.id),
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <AvatarCircle name={participant.name} color={participant.avatarColor} size={44} fontSize={16} />
      <Text style={styles.name} numberOfLines={1}>
        {participant.name}
      </Text>
      <TouchableOpacity onPress={handleRemove} style={styles.removeButton} accessibilityLabel={`Remove ${participant.name}`}>
        <Text style={styles.removeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  name: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
  },
  removeText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});

export default ParticipantRow;