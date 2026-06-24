import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  H1,
  H3,
  Body,
  BodySmall,
  Caption,
  Overline,
} from '../components/common/Typography';
import { spacing } from '../constants/theme';

// ─── Feature Highlights ───────────────────────────────────────────────────────

const FEATURES = [
  {
    emoji: '✈️',
    title: 'Trip Management',
    description: 'Create trips, invite friends, and keep everything organised in one place.',
  },
  {
    emoji: '💸',
    title: 'Smart Splitting',
    description: 'Split equally, by exact amounts, percentages, or custom shares.',
  },
  {
    emoji: '📊',
    title: 'Live Balances',
    description: 'See who owes what in real-time, with suggested settlements.',
  },
  {
    emoji: '💱',
    title: 'Multi-Currency',
    description: 'Add expenses in any currency — we handle the conversions.',
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function HomeScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={[styles.logoContainer, { backgroundColor: theme.primary }]}>
            <Caption style={styles.logoEmoji}>✈️</Caption>
          </View>
          <H1 align="center" style={styles.heroTitle}>
            SplitEase
          </H1>
          <Body align="center" color={theme.textSecondary} style={styles.heroTagline}>
            Travel together, settle smarter.{'\n'}
            Split group expenses without the drama.
          </Body>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <Button label="Create a Trip" variant="primary" size="lg" fullWidth />
          <Button
            label="Join a Trip"
            variant="outline"
            size="lg"
            fullWidth
            style={styles.secondaryCta}
          />
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Overline color={theme.primary} align="center" style={styles.sectionLabel}>
            Why SplitEase
          </Overline>
          <H3 align="center" style={styles.sectionTitle}>
            Everything you need for group travel
          </H3>

          <View style={styles.featuresGrid}>
            {FEATURES.map((feature) => (
              <Card key={feature.title} elevation="sm" style={styles.featureCard}>
                <Caption style={styles.featureEmoji}>{feature.emoji}</Caption>
                <Body style={styles.featureTitle}>{feature.title}</Body>
                <BodySmall color={theme.textSecondary}>{feature.description}</BodySmall>
              </Card>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Caption align="center" color={theme.textTertiary} style={styles.footer}>
          SplitEase v1.0.0 · Built with ❤️
        </Caption>
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
  hero: {
    alignItems: 'center',
    paddingTop: spacing[10],
    paddingBottom: spacing[8],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  logoEmoji: {
    fontSize: 36,
  },
  heroTitle: {
    marginBottom: spacing[3],
  },
  heroTagline: {
    lineHeight: 24,
  },
  ctaContainer: {
    gap: spacing[3],
    marginBottom: spacing[10],
  },
  secondaryCta: {
    marginTop: spacing[1],
  },
  featuresSection: {
    marginBottom: spacing[8],
  },
  sectionLabel: {
    marginBottom: spacing[2],
  },
  sectionTitle: {
    marginBottom: spacing[6],
  },
  featuresGrid: {
    gap: spacing[3],
  },
  featureCard: {
    gap: spacing[1.5],
  },
  featureEmoji: {
    fontSize: 28,
    lineHeight: 36,
    marginBottom: spacing[1],
  },
  featureTitle: {
    fontWeight: '600',
  },
  footer: {
    marginTop: spacing[4],
  },
});