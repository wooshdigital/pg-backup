import React, { useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useParticipants } from '../hooks/useParticipants';
import { ParticipantRow } from '../components/participants/ParticipantRow';
import { AddParticipantSheet, AddParticipantSheetRef } from '../components/participants/AddParticipantSheet';
import { Participant } from '../types';

interface ParticipantsScreenProps {
  route: {
    params: {
      tripId: string;
    };
  };
}

export function ParticipantsScreen({ route }: ParticipantsScreenProps) {
  const { tripId } = route.params;
  const { participants, addParticipant, removeParticipant } = useParticipants(tripId);
  const sheetRef = useRef<AddParticipantSheetRef>(null);

  const handleOpenSheet = useCallback(() => {
    sheetRef.current?.open();
  }, []);

  const handleAdd = useCallback(
    (name: string) => {
      addParticipant(name);
    },
    [addParticipant]
  );

  const handleRemove = useCallback(
    (participantId: string) => {
      removeParticipant(participantId);
    },
    [removeParticipant]
  );

  const renderItem = useCallback(
    ({ item }: { item: Participant }) => (
      <ParticipantRow participant={item} onRemove={handleRemove} />
    ),
    [handleRemove]
  );

  const keyExtractor = useCallback((item: Participant) => item.id, []);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={styles.emptyTitle}>No Participants Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add friends and family to split expenses on this trip.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={participants}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          participants.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={handleOpenSheet}
        accessibilityLabel="Add participant"
        accessibilityRole="button"
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <AddParticipantSheet ref={sheetRef} onAdd={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
});

export default ParticipantsScreen;