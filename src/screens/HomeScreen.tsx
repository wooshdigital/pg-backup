import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Heading, Body, Caption } from '../components/common/Typography';

// ─── Quick Stats Data ─────────────────────────────────────────────────────────

const quickStats = [
  { label: 'Active Trips', value: '0', emoji: '✈️' },
  { label: 'Total Spent', value: '$0', emoji: '💰' },
  { label: 'You Owe', value: '$0', emoji: '📤' },
  { label: 'Owed to You', value: '$0', emoji: '📥' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function HomeScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={[styles.hero, { backgroundColor: theme.colors.primary }]}>
          <Caption style={{ color: theme.colors.textOnPrimary, opacity: 0.8 }}>
            Welcome back 👋
          </Caption>
          <Heading
            level={1}
            style={{ color: theme.colors.textOnPrimary, marginTop: 4 }}
          >
            SplitWise Travel
          </Heading>
          <Body
            style={{
              color: theme.colors.textOnPrimary,
              opacity: 0.85,
              marginTop: 8,
            }}
          >
            Split travel expenses effortlessly with friends and family.
          </Body>
        </View>

        <View style={styles.content}>
          {/* Quick Stats */}
          <View style={[styles.statsGrid]}>
            {quickStats.map((stat) => (
              <Card
                key={stat.label}
                variant="elevated"
                style={styles.statCard}
                contentStyle={styles.statCardContent}
              >
                <Body style={styles.statEmoji}>{stat.emoji}</Body>
                <Heading level={3} style={{ color: theme.colors.primary }}>
                  {stat.value}
                </Heading>
                <Caption>{stat.label}</Caption>
              </Card>
            ))}
          </View>

          {/* Getting Started Card */}
          <Card variant="outlined" style={styles.gettingStarted}>
            <Heading level={3} style={{ marginBottom: 8 }}>
              🚀 Get Started
            </Heading>
            <Body size="sm" color={theme.colors.textSecondary} style={{ marginBottom: 16 }}>
              Create your first trip and invite friends to start splitting expenses.
            </Body>
            <Button
              title="Create Your First Trip"
              onPress={() => {
                // Navigation to create trip will be wired up in Phase 2
              }}
              variant="primary"
              fullWidth
            />
          </Card>

          {/* Features Card */}
          <Card variant="flat" style={styles.featuresCard}>
            <Heading level={4} style={{ marginBottom: 12 }}>
              ✨ Features
            </Heading>
            {[
              { icon: '💳', text: 'Track expenses in any currency' },
              { icon: '⚖️', text: 'Flexible split methods: equal, exact, or percentage' },
              { icon: '📊', text: 'Real-time balance calculations' },
              { icon: '🤝', text: 'Easy settlement suggestions' },
            ].map((feature) => (
              <View key={feature.text} style={styles.featureRow}>
                <Body style={styles.featureIcon}>{feature.icon}</Body>
                <Body size="sm" color={theme.colors.textSecondary} style={styles.featureText}>
                  {feature.text}
                </Body>
              </View>
            ))}
          </Card>
        </View>
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
    flexGrow: 1,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 48,
  },
  content: {
    padding: 20,
    marginTop: -24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
  },
  statCardContent: {
    padding: 12,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  gettingStarted: {
    marginBottom: 16,
  },
  featuresCard: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 18,
    marginRight: 10,
    width: 28,
  },
  featureText: {
    flex: 1,
  },
});