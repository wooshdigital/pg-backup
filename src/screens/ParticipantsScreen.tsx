import React, { useRef } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ListRenderItem,
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
  const sheetRef = useRef<BottomSheet>(null);

  const openSheet = () => {
    sheetRef.current?.expand();
  };

  const closeSheet = () => {
    sheetRef.current?.close();
  };

  const renderItem: ListRenderItem<Participant> = ({ item }) => (
    <ParticipantRow participant={item} onDelete={removeParticipant} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={styles.emptyTitle}>No participants yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button below to add friends to this trip.
      </Text>
    </View>
  );

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={participants}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          ItemSeparatorComponent={renderSeparator}
          contentContainerStyle={
            participants.length === 0 ? styles.emptyList : styles.list
          }
        />

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={openSheet}
          accessibilityRole="button"
          accessibilityLabel="Add participant"
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>

        {/* Bottom Sheet */}
        <AddParticipantSheet
          sheetRef={sheetRef}
          onAdd={addParticipant}
          onClose={closeSheet}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 22,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E0E0E0',
    marginLeft: 74, // indent past avatar
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3F51B5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '400',
  },
});