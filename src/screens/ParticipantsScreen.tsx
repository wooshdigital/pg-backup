import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
  const [sheetVisible, setSheetVisible] = useState(false);

  const handleAdd = useCallback(
    (name: string) => {
      addParticipant(name);
      setSheetVisible(false);
    },
    [addParticipant]
  );

  const renderItem: ListRenderItem<Participant> = useCallback(
    ({ item }) => (
      <ParticipantRow participant={item} onRemove={removeParticipant} />
    ),
    [removeParticipant]
  );

  const keyExtractor = useCallback((item: Participant) => item.id, []);

  const ItemSeparator = () => <View style={styles.separator} />;

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={styles.emptyTitle}>No participants yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to add friends to this trip.
      </Text>
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        <FlatList
          data={participants}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={ItemSeparator}
          ListEmptyComponent={EmptyComponent}
          contentContainerStyle={
            participants.length === 0 ? styles.emptyList : styles.list
          }
        />

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setSheetVisible(true)}
          activeOpacity={0.85}
          accessibilityLabel="Add participant"
          accessibilityRole="button"
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>

        <AddParticipantSheet
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          onAdd={handleAdd}
        />
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
    backgroundColor: '#F2F2F7',
  },
  list: {
    paddingTop: 12,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginLeft: 72,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyIcon: {
    fontSize: 48,
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
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 32,
    fontWeight: '400',
  },
});

export default ParticipantsScreen;