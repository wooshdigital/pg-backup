import React, { useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useParticipants } from '../hooks/useParticipants';
import { ParticipantRow } from '../components/participants/ParticipantRow';
import { AddParticipantSheet } from '../components/participants/AddParticipantSheet';
import { Participant } from '../types';

interface ParticipantsScreenProps {
  tripId: string;
}

export function ParticipantsScreen({ tripId }: ParticipantsScreenProps) {
  const { participants, addParticipant, removeParticipant } = useParticipants(tripId);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const openSheet = () => {
    bottomSheetRef.current?.expand();
  };

  const handleAdd = (name: string) => {
    addParticipant(name);
  };

  const handleRemove = (participantId: string) => {
    // In a future phase, pass hasExpenses based on actual expense data
    removeParticipant(participantId, false);
  };

  const renderItem = ({ item }: { item: Participant }) => (
    <ParticipantRow participant={item} onRemove={handleRemove} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={styles.emptyTitle}>No participants yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to add people to this trip
      </Text>
    </View>
  );

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container}>
        <FlatList
          data={participants}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          ItemSeparatorComponent={renderSeparator}
          contentContainerStyle={participants.length === 0 ? styles.emptyList : undefined}
        />

        {/* FAB */}
        <TouchableOpacity style={styles.fab} onPress={openSheet} activeOpacity={0.85}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>

        <AddParticipantSheet sheetRef={bottomSheetRef} onAdd={handleAdd} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyList: {
    flex: 1,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginLeft: 72,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
});

export default ParticipantsScreen;