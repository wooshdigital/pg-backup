import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ListRenderItemInfo,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useParticipants } from '../hooks/useParticipants';
import { ParticipantRow } from '../components/participants/ParticipantRow';
import { AddParticipantSheet, AddParticipantSheetRef } from '../components/participants/AddParticipantSheet';
import { Participant } from '../types';
import { TripDetailTabParamList } from '../types';

type ParticipantsRouteProp = RouteProp<TripDetailTabParamList, 'Participants'>;

export function ParticipantsScreen() {
  const route = useRoute<ParticipantsRouteProp>();
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
    ({ item }: ListRenderItemInfo<Participant>) => (
      <ParticipantRow participant={item} onRemove={handleRemove} />
    ),
    [handleRemove]
  );

  const keyExtractor = useCallback((item: Participant) => item.id, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={participants}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={participants.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No participants yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button below to add friends to this trip.
            </Text>
          </View>
        }
      />

      {/* FAB */}
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
    backgroundColor: '#F9FAFB',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
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
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 30,
    fontWeight: '400',
  },
});

export default ParticipantsScreen;