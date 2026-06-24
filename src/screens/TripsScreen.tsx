import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Heading, Body, Caption } from '../components/common/Typography';
import type { Theme } from '../constants/theme';

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Body size="lg" style={styles.emptyEmoji}>
          🧳
        </Body>
      </View>
      <Heading level={3} align="center">
        No trips yet
      </Heading>
      <Body size="md" color="secondary" align="center" style={styles.emptyDescription}>
        Create your first trip to start tracking shared expenses with friends.
      </Body>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function TripsScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Heading level={2}>My Trips</Heading>
        <Button label="+ New Trip" variant="primary" size="sm" onPress={() => undefined} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Coming Soon Notice */}
        <Card variant="filled" padding={4} style={styles.noticeCard}>
          <Caption uppercase color="secondary">
            Coming in Phase 2
          </Caption>
          <Body size="md" style={styles.noticeText}>
            Trip management is under construction 🚧
          </Body>
          <Body size="sm" color="secondary">
            You'll be able to create trips, invite participants, and log expenses.
          </Body>
        </Card>

        {/* Empty State */}
        <EmptyState />

        {/* Placeholder Trip Cards */}
        {PLACEHOLDER_TRIPS.map((trip) => (
          <Card key={trip.id} variant="elevated" padding={4} style={styles.tripCard}>
            <View style={styles.tripHeader}>
              <View style={styles.tripEmoji}>
                <Body size="md">{trip.emoji}</Body>
              </View>
              <View style={styles.tripInfo}>
                <Body size="md" bold>
                  {trip.name}
                </Body>
                <Caption color="secondary">{trip.destination}</Caption>
              </View>
              <View style={[styles.tripBadge, { backgroundColor: theme.colors.primaryLight }]}>
                <Caption color="primary">{trip.status}</Caption>
              </View>
            </View>
            <View style={styles.tripStats}>
              <View style={styles.tripStat}>
                <Caption color="secondary">Expenses</Caption>
                <Body size="sm" bold>
                  {trip.expenses}
                </Body>
              </View>
              <View style={styles.tripStat}>
                <Caption color="secondary">Total</Caption>
                <Body size="sm" bold>
                  {trip.total}
                </Body>
              </View>
              <View style={styles.tripStat}>
                <Caption color="secondary">Participants</Caption>
                <Body size="sm" bold>
                  {trip.participants}
                </Body>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Placeholder Data ─────────────────────────────────────────────────────────

const PLACEHOLDER_TRIPS = [
  {
    id: '1',
    emoji: '🗼',
    name: 'Paris Weekend',
    destination: 'Paris, France',
    status: 'Planning',
    expenses: '0',
    total: '$0.00',
    participants: '3',
  },
  {
    id: '2',
    emoji: '🏖️',
    name: 'Beach Trip',
    destination: 'Miami, FL',
    status: 'Planning',
    expenses: '0',
    total: '$0.00',
    participants: '5',
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing[4],
      paddingTop: theme.spacing[4],
      paddingBottom: theme.spacing[2],
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing[4],
      paddingBottom: theme.spacing[8],
    },
    noticeCard: {
      marginBottom: theme.spacing[4],
      gap: theme.spacing[1],
    },
    noticeText: {
      marginTop: theme.spacing[1],
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing[8],
    },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: theme.radii['2xl'],
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing[4],
    },
    emptyEmoji: {
      fontSize: 32,
    },
    emptyDescription: {
      marginTop: theme.spacing[2],
      maxWidth: 280,
    },
    tripCard: {
      marginBottom: theme.spacing[3],
    },
    tripHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing[3],
    },
    tripEmoji: {
      width: 44,
      height: 44,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing[3],
    },
    tripInfo: {
      flex: 1,
      gap: theme.spacing[0.5],
    },
    tripBadge: {
      paddingHorizontal: theme.spacing[2],
      paddingVertical: theme.spacing[0.5],
      borderRadius: theme.radii.full,
    },
    tripStats: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing[3],
      gap: theme.spacing[4],
    },
    tripStat: {
      gap: theme.spacing[0.5],
    },
  });
}