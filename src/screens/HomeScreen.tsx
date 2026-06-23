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
import { spacing } from '../constants/theme';

// ─── Quick Stat Card ──────────────────────────────────────────────────────────

interface QuickStatProps {
  emoji: string;
  label: string;
  value: string;
}

function QuickStat({ emoji, label, value }: QuickStatProps) {
  const { colors } = useTheme();
  return (
    <Card elevation="sm" style={styles.statCard} padding={3}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Heading level={3} style={{ color: colors.primary }}>
        {value}
      </Heading>
      <Caption>{label}</Caption>
    </Card>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function HomeScreen() {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Caption uppercase weight="semibold" color={colors.primary}>
              Welcome back
            </Caption>
            <Heading level={1}>TripSplit 🌍</Heading>
            <Body secondary style={styles.tagline}>
              Split expenses effortlessly with friends and family on any adventure.
            </Body>
          </View>

          <Button
            label={isDark ? '☀️ Light' : '🌙 Dark'}
            variant="ghost"
            size="sm"
            onPress={toggleTheme}
          />
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Caption uppercase weight="semibold" style={styles.sectionLabel}>
            Quick Overview
          </Caption>
          <View style={styles.statsRow}>
            <QuickStat emoji="✈️" label="Total Trips" value="0" />
            <QuickStat emoji="💸" label="Total Spent" value="$0" />
            <QuickStat emoji="👥" label="Friends" value="0" />
          </View>
        </View>

        {/* Getting Started */}
        <View style={styles.section}>
          <Caption uppercase weight="semibold" style={styles.sectionLabel}>
            Get Started
          </Caption>
          <Card elevation="md">
            <Text style={styles.heroEmoji}>🗺️</Text>
            <Heading level={2} style={styles.cardTitle}>
              Plan your first trip
            </Heading>
            <Body secondary size="sm" style={styles.cardBody}>
              Add a trip, invite your travel companions, and start tracking expenses in real time.
              TripSplit handles the math so you can focus on the memories.
            </Body>
            <View style={styles.cardActions}>
              <Button
                label="Create a Trip"
                variant="primary"
                size="md"
                onPress={() => {
                  /* Navigate to trip creation */
                }}
              />
              <Button
                label="Learn more"
                variant="ghost"
                size="md"
                style={styles.learnMore}
                onPress={() => {
                  /* Navigate to onboarding */
                }}
              />
            </View>
          </Card>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Caption uppercase weight="semibold" style={styles.sectionLabel}>
            Features
          </Caption>
          {FEATURES.map((f) => (
            <Card key={f.title} elevation="sm" style={styles.featureCard}>
              <View style={styles.featureRow}>
                <Text style={styles.featureEmoji}>{f.emoji}</Text>
                <View style={styles.featureText}>
                  <Body weight="semibold">{f.title}</Body>
                  <Body size="sm" secondary>
                    {f.description}
                  </Body>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    emoji: '⚡',
    title: 'Instant Splitting',
    description: 'Split by equal shares, exact amounts, or percentages.',
  },
  {
    emoji: '💱',
    title: 'Multi-Currency',
    description: 'Track expenses in any currency with automatic conversion.',
  },
  {
    emoji: '📊',
    title: 'Smart Summaries',
    description: 'See who owes what at a glance with clear breakdowns.',
  },
  {
    emoji: '📸',
    title: 'Receipt Capture',
    description: 'Attach photos of receipts to any expense.',
  },
] as const;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[6],
    paddingTop: spacing[2],
  },
  tagline: {
    marginTop: spacing[1],
    maxWidth: 240,
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionLabel: {
    marginBottom: spacing[3],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: spacing[1],
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: spacing[3],
  },
  cardTitle: {
    marginBottom: spacing[2],
  },
  cardBody: {
    marginBottom: spacing[4],
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  learnMore: {
    marginLeft: spacing[1],
  },
  featureCard: {
    marginBottom: spacing[2],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 28,
    marginRight: spacing[3],
  },
  featureText: {
    flex: 1,
    gap: spacing[0.5],
  },
});

export default HomeScreen;