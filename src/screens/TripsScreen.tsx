import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Heading, Body, Caption } from '../components/common/Typography';

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState() {
  const { theme } = useTheme();
  return (
    <Card style={styles.emptyCard} elevation={1}>
      <View style={styles.emptyIconContainer}>
        <Heading level={1} align="center">
          🗺️
        </Heading>
      </View>
      <Heading level={3} align="center" style={styles.emptyTitle}>
        No trips yet
      </Heading>
      <Body color={theme.colors.textSecondary} align="center" style={styles.emptySubtext}>
        Create your first trip and start splitting expenses with friends and family.
      </Body>
      <Button
        label="+ Create Trip"
        onPress={() => {}}
        variant="primary"
        fullWidth
        style={styles.emptyButton}
      />
    </Card>
  );
}

// ─── Trips Screen ─────────────────────────────────────────────────────────────

export function TripsScreen() {
  const { theme } = useTheme();
  // Placeholder – trips will come from context/storage in a later phase
  const trips: unknown[] = [];

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View
        style={[
          styles.headerRow,
          {
            paddingHorizontal: theme.spacing.md,
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.sm,
          },
        ]}
      >
        <Heading level={1}>My Trips</Heading>
        {trips.length > 0 && (
          <Button label="+ New" onPress={() => {}} variant="primary" size="sm" />
        )}
      </View>

      {/* ── Filter Pills (placeholder) ───────────────────────────────────── */}
      <View
        style={[
          styles.filterRow,
          { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm },
        ]}
      >
        {(['All', 'Active', 'Planning', 'Completed'] as const).map((filter) => (
          <View
            key={filter}
            style={[
              styles.filterPill,
              {
                backgroundColor: filter === 'All' ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.border,
                marginRight: theme.spacing.xs,
              },
            ]}
          >
            <Caption
              color={filter === 'All' ? theme.colors.textInverse : theme.colors.textSecondary}
              weight="medium"
            >
              {filter}
            </Caption>
          </View>
        ))}
      </View>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {trips.length === 0 ? (
          <EmptyState />
        ) : (
          <Body>Trip list goes here</Body>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  emptyCard: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    marginBottom: 12,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptySubtext: {
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: 0,
  },
});