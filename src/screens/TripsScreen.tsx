import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '@context/ThemeContext';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { Body, Caption, H2, H3 } from '@components/common/Typography';
import { spacing } from '@constants/theme';

// ─── Placeholder Data ─────────────────────────────────────────────────────────

const PLACEHOLDER_TRIPS = [
  {
    id: '1',
    name: 'Tokyo Adventure',
    destination: 'Tokyo, Japan',
    emoji: '🗼',
    participants: 4,
    status: 'active' as const,
    totalExpenses: 328500, // in cents JPY
    dateRange: 'Mar 15 – Mar 22, 2024',
  },
  {
    id: '2',
    name: 'Barcelona Weekend',
    destination: 'Barcelona, Spain',
    emoji: '🏖️',
    participants: 3,
    status: 'planning' as const,
    totalExpenses: 0,
    dateRange: 'Apr 5 – Apr 8, 2024',
  },
  {
    id: '3',
    name: 'NYC Trip',
    destination: 'New York, USA',
    emoji: '🗽',
    participants: 6,
    status: 'completed' as const,
    totalExpenses: 245000,
    dateRange: 'Feb 1 – Feb 5, 2024',
  },
] as const;

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'active' | 'planning' | 'completed' }) {
  const { theme } = useTheme();

  const statusConfig = {
    active: { label: 'Active', color: theme.colors.success, bg: theme.colors.successLight },
    planning: { label: 'Planning', color: theme.colors.warning, bg: theme.colors.warningLight },
    completed: { label: 'Done', color: theme.colors.textSecondary, bg: theme.colors.surfaceSecondary },
  };

  const config = statusConfig[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Caption color={config.color} style={styles.badgeText}>
        {config.label}
      </Caption>
    </View>
  );
}

// ─── Trip Card ────────────────────────────────────────────────────────────────

function TripCard({ trip }: { trip: (typeof PLACEHOLDER_TRIPS)[number] }) {
  const { theme } = useTheme();

  return (
    <Card style={styles.tripCard} elevation="base" bordered>
      <View style={styles.tripCardHeader}>
        <View style={[styles.tripEmoji, { backgroundColor: theme.colors.primaryLight }]}>
          <Body style={styles.tripEmojiText}>{trip.emoji}</Body>
        </View>
        <View style={styles.tripInfo}>
          <H3>{trip.name}</H3>
          <Caption>{trip.destination}</Caption>
        </View>
        <StatusBadge status={trip.status} />
      </View>

      <View style={[styles.tripCardFooter, { borderTopColor: theme.colors.border }]}>
        <View style={styles.tripMeta}>
          <Caption>👥 {trip.participants} people</Caption>
        </View>
        <Caption>{trip.dateRange}</Caption>
      </View>
    </Card>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TripsScreen(): JSX.Element {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <H2>My Trips</H2>
            <Caption color={theme.colors.textSecondary}>
              {PLACEHOLDER_TRIPS.length} trips total
            </Caption>
          </View>
          <Button label="+ New Trip" variant="primary" size="sm" />
        </View>

        {/* Trip List */}
        <View style={styles.list}>
          {PLACEHOLDER_TRIPS.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </View>

        {/* Empty State Hint */}
        <Card style={styles.emptyHint} elevation="none" bordered>
          <Body align="center" style={styles.emptyEmoji}>
            🚀
          </Body>
          <Body align="center" weight="semibold">
            More features coming soon
          </Body>
          <Caption align="center" style={styles.emptyCaption}>
            Add expenses, track balances, and settle up — all in one place.
          </Caption>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[10],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
  },
  list: {
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  tripCard: {
    gap: spacing[3],
  },
  tripCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  tripEmoji: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripEmojiText: {
    fontSize: 24,
  },
  tripInfo: {
    flex: 1,
  },
  tripCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tripMeta: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  badge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 99,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyHint: {
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[6],
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyCaption: {
    maxWidth: 260,
  },
});