import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Heading, Body, Caption } from '../components/common/Typography';

// ─── Quick Stat Card ──────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  subtitle: string;
}

function StatCard({ label, value, subtitle }: StatCardProps) {
  const { theme } = useTheme();
  return (
    <Card style={styles.statCard} elevation={2}>
      <Caption>{label}</Caption>
      <Heading level={2} color={theme.colors.primary} style={styles.statValue}>
        {value}
      </Heading>
      <Caption>{subtitle}</Caption>
    </Card>
  );
}

// ─── Home Screen ─────────────────────────────────────────────────────────────

export function HomeScreen() {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Caption color={theme.colors.primary} weight="medium">
            WELCOME BACK
          </Caption>
          <Heading level={1} style={styles.title}>
            SplitWise
          </Heading>
          <Body color={theme.colors.textSecondary} style={styles.tagline}>
            Split expenses effortlessly with friends and family. No more awkward money
            conversations.
          </Body>
        </View>

        {/* ── Quick Stats ──────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <StatCard label="TOTAL TRIPS" value="0" subtitle="Start your first trip!" />
          <View style={{ width: theme.spacing.sm }} />
          <StatCard label="YOU ARE OWED" value="$0.00" subtitle="All settled up" />
        </View>

        {/* ── CTA Card ─────────────────────────────────────────────────────── */}
        <Card
          style={[styles.ctaCard, { backgroundColor: theme.colors.primary }]}
          elevation={3}
          noPadding
        >
          <View style={{ padding: theme.spacing.md }}>
            <Heading level={2} color={theme.colors.textInverse}>
              Plan your next trip ✈️
            </Heading>
            <Body color="rgba(255,255,255,0.8)" style={styles.ctaSubtext} size="sm">
              Create a trip, invite friends, and start tracking shared expenses in seconds.
            </Body>
            <Button
              label="Create a Trip"
              onPress={() => {}}
              variant="outline"
              style={styles.ctaButton}
            />
          </View>
        </Card>

        {/* ── Recent Activity ───────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Heading level={3} style={styles.sectionTitle}>
            Recent Activity
          </Heading>
          <Card style={styles.emptyCard}>
            <Body color={theme.colors.textSecondary} align="center">
              No activity yet.{'\n'}Create a trip to get started!
            </Body>
          </Card>
        </View>

        {/* ── Dev: Theme Toggle ─────────────────────────────────────────────── */}
        <Button
          label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          onPress={() => void toggleTheme()}
          variant="ghost"
          size="sm"
          style={styles.themeToggle}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    paddingTop: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    marginTop: 4,
    marginBottom: 8,
  },
  tagline: {
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
  },
  statValue: {
    marginVertical: 4,
  },
  ctaCard: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  ctaSubtext: {
    marginTop: 6,
    marginBottom: 16,
  },
  ctaButton: {
    borderColor: 'rgba(255,255,255,0.7)',
    alignSelf: 'flex-start',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  themeToggle: {
    alignSelf: 'center',
    marginTop: 8,
  },
});