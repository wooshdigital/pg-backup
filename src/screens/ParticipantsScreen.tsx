import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ListRenderItem,
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
  const { participants, addParticipant, removeParticipant } = useParticipants(tripId);
  const sheetRef = useRef<BottomSheet>(null);

  const openSheet = useCallback(() => {
    sheetRef.current?.snapToIndex(0);
  }, []);

  const renderItem: ListRenderItem<Participant> = useCallback(
    ({ item }) => (
      <ParticipantRow
        participant={item}
        onRemove={removeParticipant}
      />
    ),
    [removeParticipant]
  );

  const keyExtractor = useCallback((item: Participant) => item.id, []);

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={styles.emptyTitle}>No participants yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to add friends to this trip.
      </Text>
    </View>
  );

  const ItemSeparator = () => <View style={styles.separator} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={participants}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmpty}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={
          participants.length === 0 ? styles.emptyList : styles.list
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openSheet}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <AddParticipantSheet sheetRef={sheetRef} onAdd={addParticipant} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flexGrow: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 72,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
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
    lineHeight: 32,
    fontWeight: '300',
  },
});