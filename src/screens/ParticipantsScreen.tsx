import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ListRenderItemInfo,
} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useParticipants } from '../hooks/useParticipants';
import { ParticipantRow } from '../components/participants/ParticipantRow';
import { AddParticipantSheet } from '../components/participants/AddParticipantSheet';
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
  const { participants, addParticipant, removeParticipant } =
    useParticipants(tripId);
  const sheetRef = useRef<BottomSheet>(null);

  const openSheet = useCallback(() => {
    sheetRef.current?.expand();
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

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={styles.emptyTitle}>No participants yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button below to add people to this trip.
      </Text>
    </View>
  );

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={participants}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          participants.length === 0 ? styles.emptyList : styles.list
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openSheet}
        accessibilityLabel="Add participant"
        accessibilityRole="button"
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <AddParticipantSheet sheetRef={sheetRef} onAdd={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  list: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 74,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
});

export default ParticipantsScreen;