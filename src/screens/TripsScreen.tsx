import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Heading, Body, Caption } from '../components/common/Typography';
import { spacing, borderRadius } from '../constants/theme';

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>✈️</Text>
      <Heading level={2} align="center" style={styles.emptyTitle}>
        No trips yet
      </Heading>
      <Body secondary align="center" size="sm" style={styles.emptyBody}>
        Create your first trip to start splitting expenses with friends and family.
      </Body>
      <Button
        label="+ Create Trip"
        variant="primary"
        size="lg"
        style={styles.emptyButton}
        onPress={() => {
          /* Navigate to TripCreate */
        }}
      />
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function TripsScreen() {
  const { colors } = useTheme();
  // In future phases, trips will come from context/store
  const trips: unknown[] = [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Floating action header */}
      <View style={[styles.topBar, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <Heading level={1}>My Trips</Heading>
        <Button
          label="+ New"
          variant="primary"
          size="sm"
          onPress={() => {
            /* Navigate to TripCreate */
          }}
        />
      </View>

      {trips.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Trip cards will be rendered here in Phase 2 */}
        </ScrollView>
      )}

      {/* Status bar info */}
      <View style={[styles.footer, { borderTopColor: colors.borderLight, backgroundColor: colors.surface }]}>
        <Caption align="center">
          {trips.length === 0
            ? 'No active trips'
            : `${trips.length} trip${trips.length === 1 ? '' : 's'}`}
        </Caption>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
  },
  emptyEmoji: {
    fontSize: 72,
    marginBottom: spacing[4],
  },
  emptyTitle: {
    marginBottom: spacing[2],
  },
  emptyBody: {
    marginBottom: spacing[6],
    lineHeight: 20,
    maxWidth: 260,
  },
  emptyButton: {
    borderRadius: borderRadius.xl,
    minWidth: 180,
  },
  footer: {
    paddingVertical: spacing[2],
    borderTopWidth: 1,
  },
});

export default TripsScreen;