import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  H2,
  H3,
  Body,
  BodySmall,
  Caption,
  Overline,
} from '../components/common/Typography';
import { spacing, borderRadius } from '../constants/theme';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_TRIPS = [
  {
    id: '1',
    name: 'Tokyo 2024',
    destination: 'Tokyo, Japan',
    emoji: '🇯🇵',
    participants: 4,
    totalExpenses: 2840.5,
    currency: 'USD',
    status: 'active',
    daysAgo: 2,
  },
  {
    id: '2',
    name: 'Barcelona Summer',
    destination: 'Barcelona, Spain',
    emoji: '🇪🇸',
    participants: 6,
    totalExpenses: 1250.0,
    currency: 'EUR',
    status: 'planning',
    daysAgo: 7,
  },
  {
    id: '3',
    name: 'NYC Weekend',
    destination: 'New York, USA',
    emoji: '🗽',
    participants: 3,
    totalExpenses: 980.75,
    currency: 'USD',
    status: 'completed',
    daysAgo: 30,
  },
] as const;

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active: { label: 'Active', emoji: '🟢' },
  planning: { label: 'Planning', emoji: '🟡' },
  completed: { label: 'Completed', emoji: '⚪' },
  archived: { label: 'Archived', emoji: '🗂️' },
} as const;

type TripStatus = keyof typeof STATUS_CONFIG;

// ─── Component ────────────────────────────────────────────────────────────────

export function TripsScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <H2>My Trips</H2>
          <BodySmall color={theme.textSecondary}>
            {MOCK_TRIPS.length} trip{MOCK_TRIPS.length !== 1 ? 's' : ''}
          </BodySmall>
        </View>

        {/* New Trip Button */}
        <Button
          label="+ New Trip"
          variant="primary"
          size="base"
          fullWidth
          style={styles.newTripButton}
        />

        {/* Trips List */}
        <View style={styles.tripsList}>
          {MOCK_TRIPS.map((trip) => {
            const statusInfo = STATUS_CONFIG[trip.status as TripStatus];
            return (
              <TouchableOpacity key={trip.id} activeOpacity={0.85}>
                <Card elevation="base" style={styles.tripCard}>
                  {/* Trip Header */}
                  <View style={styles.tripHeader}>
                    <View
                      style={[
                        styles.tripEmojiContainer,
                        { backgroundColor: theme.surfaceSubtle },
                      ]}
                    >
                      <Body style={styles.tripEmoji}>{trip.emoji}</Body>
                    </View>
                    <View style={styles.tripInfo}>
                      <H3 numberOfLines={1}>{trip.name}</H3>
                      <Caption color={theme.textSecondary}>{trip.destination}</Caption>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: theme.surfaceSubtle },
                      ]}
                    >
                      <Caption color={theme.textSecondary}>
                        {statusInfo.emoji} {statusInfo.label}
                      </Caption>
                    </View>
                  </View>

                  {/* Divider */}
                  <View style={[styles.divider, { backgroundColor: theme.divider }]} />

                  {/* Trip Stats */}
                  <View style={styles.tripStats}>
                    <View style={styles.statItem}>
                      <Overline color={theme.textTertiary}>Participants</Overline>
                      <Body style={styles.statValue}>{trip.participants} people</Body>
                    </View>
                    <View style={styles.statItem}>
                      <Overline color={theme.textTertiary}>Total Spent</Overline>
                      <Body style={[styles.statValue, { color: theme.primary }]}>
                        {trip.currency} {trip.totalExpenses.toLocaleString()}
                      </Body>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Empty State (hidden when trips exist) */}
        {MOCK_TRIPS.length === 0 && (
          <Card elevation="none" style={[styles.emptyState, { borderStyle: 'dashed' }]}>
            <Body style={styles.emptyEmoji}>🧳</Body>
            <H3 align="center">No trips yet</H3>
            <BodySmall align="center" color={theme.textSecondary}>
              Create your first trip and start splitting expenses with your crew.
            </BodySmall>
          </Card>
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
  scrollContent: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[10],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[6],
    marginBottom: spacing[4],
  },
  newTripButton: {
    marginBottom: spacing[5],
  },
  tripsList: {
    gap: spacing[3],
  },
  tripCard: {
    gap: spacing[3],
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  tripEmojiContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tripEmoji: {
    fontSize: 24,
  },
  tripInfo: {
    flex: 1,
    gap: spacing[0.5],
  },
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    flexShrink: 0,
  },
  divider: {
    height: 1,
    marginHorizontal: -spacing[4],
  },
  tripStats: {
    flexDirection: 'row',
    gap: spacing[6],
  },
  statItem: {
    gap: spacing[0.5],
  },
  statValue: {
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[10],
    marginTop: spacing[4],
  },
  emptyEmoji: {
    fontSize: 48,
  },
});