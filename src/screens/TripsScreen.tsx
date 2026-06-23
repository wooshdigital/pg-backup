import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Heading, Body, Caption } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Spacing } from '../constants/theme';

// ─── Placeholder Trip Data ────────────────────────────────────────────────────

const PLACEHOLDER_TRIPS = [
  {
    id: '1',
    name: 'Weekend in Barcelona',
    destination: 'Barcelona, Spain',
    participants: 4,
    totalExpenses: '$842.50',
    status: 'active',
    emoji: '🇪🇸',
  },
  {
    id: '2',
    name: 'Tokyo Adventure',
    destination: 'Tokyo, Japan',
    participants: 3,
    totalExpenses: '$2,150.00',
    status: 'completed',
    emoji: '🇯🇵',
  },
  {
    id: '3',
    name: 'NYC Road Trip',
    destination: 'New York, USA',
    participants: 6,
    totalExpenses: '$0.00',
    status: 'planning',
    emoji: '🗽',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function TripsScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.divider }]}>
        <Heading level={2}>My Trips</Heading>
        <Button label="+ New Trip" onPress={() => {}} size="sm" variant="primary" />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Trips List */}
        {PLACEHOLDER_TRIPS.map((trip) => (
          <Card key={trip.id} style={styles.tripCard} elevation="md">
            <View style={styles.tripHeader}>
              <View style={styles.tripTitleRow}>
                <Body size="lg" weight="semiBold">
                  {trip.emoji} {trip.name}
                </Body>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        trip.status === 'active'
                          ? theme.colors.success + '20'
                          : trip.status === 'planning'
                            ? theme.colors.info + '20'
                            : theme.colors.surfaceVariant,
                    },
                  ]}
                >
                  <Caption
                    color={
                      trip.status === 'active'
                        ? theme.colors.success
                        : trip.status === 'planning'
                          ? theme.colors.info
                          : theme.colors.textSecondary
                    }
                  >
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </Caption>
                </View>
              </View>

              <Caption muted>{trip.destination}</Caption>
            </View>

            <View style={[styles.tripMeta, { borderTopColor: theme.colors.divider }]}>
              <View style={styles.metaItem}>
                <Caption muted>Participants</Caption>
                <Body size="sm" weight="semiBold">
                  {trip.participants} people
                </Body>
              </View>
              <View style={styles.metaItem}>
                <Caption muted>Total Spent</Caption>
                <Body size="sm" weight="semiBold" color={theme.colors.primary}>
                  {trip.totalExpenses}
                </Body>
              </View>
            </View>
          </Card>
        ))}

        {/* Empty state placeholder */}
        {PLACEHOLDER_TRIPS.length === 0 && (
          <View style={styles.emptyState}>
            <Heading level={3} align="center">
              🗺️ No trips yet
            </Heading>
            <Body color={theme.colors.textSecondary} align="center" style={styles.emptyBody}>
              Create your first trip and start splitting expenses with friends.
            </Body>
            <Button
              label="Create your first trip"
              onPress={() => {}}
              variant="primary"
              size="lg"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scroll: {
    flexGrow: 1,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  tripCard: {
    gap: Spacing[0],
  },
  tripHeader: {
    gap: Spacing[1],
    marginBottom: Spacing[3],
  },
  tripTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[0.5],
    borderRadius: 100,
  },
  tripMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  metaItem: {
    alignItems: 'center',
    gap: Spacing[0.5],
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[12],
    gap: Spacing[4],
  },
  emptyBody: {
    maxWidth: 280,
  },
});