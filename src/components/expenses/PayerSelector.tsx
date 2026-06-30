import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Participant } from '../../types';

interface PayerSelectorProps {
  participants: Participant[];
  selectedPayerId: string | null;
  onSelect: (participantId: string) => void;
}

export function PayerSelector({
  participants,
  selectedPayerId,
  onSelect,
}: PayerSelectorProps) {
  return (
    <FlatList
      data={participants}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      renderItem={({ item }) => {
        const isSelected = item.id === selectedPayerId;
        const initials = getInitials(item.name);
        return (
          <TouchableOpacity
            style={[styles.row, isSelected && styles.selectedRow]}
            onPress={() => onSelect(item.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.avatar, { backgroundColor: item.avatarColor || '#6366F1' }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={[styles.radio, isSelected && styles.radioSelected]}>
              {isSelected && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        );
      }}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  selectedRow: {
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
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  name: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
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
  separator: {
    height: 8,
  },
});