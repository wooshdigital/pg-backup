import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useParticipants } from '../hooks/useParticipants';
import { Participant } from '../types';
import {
  ParticipantRow,
  AddParticipantSheet,
  AddParticipantSheetRef,
} from '../components/participants';

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

  const handleRemove = useCallback(
    (participant: Participant) => {
      // Pass empty array – expense validation will be wired in Phase 4
      removeParticipant(participant.id, []);
    },
    [removeParticipant]
  );

  const renderItem: ListRenderItem<Participant> = useCallback(
    ({ item }) => (
      <ParticipantRow participant={item} onRemove={handleRemove} />
    ),
    [handleRemove]
  );

  const keyExtractor = useCallback((item: Participant) => item.id, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        {participants.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No participants yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to add people to this trip.
            </Text>
          </View>
        ) : (
          <FlatList
            data={participants}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => sheetRef.current?.open()}
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>

        <AddParticipantSheet ref={sheetRef} onAdd={addParticipant} />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  list: {
    paddingVertical: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginLeft: 72,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
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
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '400',
  },
});