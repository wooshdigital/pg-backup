import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '@context/ThemeContext';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { Body, Caption, Display, H3 } from '@components/common/Typography';
import { spacing } from '@constants/theme';

// ─── Feature Card Data ────────────────────────────────────────────────────────

const FEATURES = [
  {
    id: '1',
    emoji: '✈️',
    title: 'Group Trips',
    description: 'Create trips and invite friends to split costs together.',
  },
  {
    id: '2',
    emoji: '💸',
    title: 'Smart Splitting',
    description: 'Split equally, by percentage, exact amounts, or custom shares.',
  },
  {
    id: '3',
    emoji: '📊',
    title: 'Clear Balances',
    description: 'See who owes what at a glance with instant balance summaries.',
  },
  {
    id: '4',
    emoji: '🌍',
    title: 'Multi-Currency',
    description: 'Track expenses in any currency with automatic conversion.',
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function HomeScreen(): JSX.Element {
  const { theme, isDark, toggleColorMode } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <Body style={styles.logoEmoji}>💰</Body>
          </View>
          <Display align="center" color={theme.colors.primary}>
            SplitEase
          </Display>
          <Body align="center" color={theme.colors.textSecondary} style={styles.tagline}>
            Split expenses effortlessly.{'\n'}No awkward money conversations.
          </Body>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <Button label="Create a Trip" variant="primary" size="lg" fullWidth />
          <View style={styles.ctaGap} />
          <Button label="Join a Trip" variant="outline" size="lg" fullWidth />
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <H3 color={theme.colors.textPrimary}>Why SplitEase?</H3>
          <Caption style={styles.sectionSubtitle}>Everything you need for group travel</Caption>

          <View style={styles.featureGrid}>
            {FEATURES.map((feature) => (
              <Card key={feature.id} style={styles.featureCard} elevation="sm" bordered>
                <Body style={styles.featureEmoji}>{feature.emoji}</Body>
                <Body weight="semibold" style={styles.featureTitle}>
                  {feature.title}
                </Body>
                <Caption>{feature.description}</Caption>
              </Card>
            ))}
          </View>
        </View>

        {/* Theme Toggle (dev helper) */}
        <View style={styles.devSection}>
          <Caption align="center" color={theme.colors.textDisabled}>
            Dev Tools
          </Caption>
          <Button
            label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            variant="ghost"
            size="sm"
            onPress={toggleColorMode}
          />
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[10],
  },
  hero: {
    alignItems: 'center',
    paddingTop: spacing[10],
    paddingBottom: spacing[8],
  },
  logoContainer: {
    marginBottom: spacing[4],
  },
  logoEmoji: {
    fontSize: 64,
  },
  tagline: {
    marginTop: spacing[3],
    lineHeight: 24,
  },
  ctaContainer: {
    marginBottom: spacing[8],
  },
  ctaGap: {
    height: spacing[3],
  },
  section: {
    marginBottom: spacing[8],
  },
  sectionSubtitle: {
    marginTop: spacing[1],
    marginBottom: spacing[4],
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  featureCard: {
    flex: 1,
    minWidth: 140,
  },
  featureEmoji: {
    fontSize: 28,
    marginBottom: spacing[2],
  },
  featureTitle: {
    marginBottom: spacing[1],
  },
  devSection: {
    alignItems: 'center',
    gap: spacing[2],
    paddingTop: spacing[4],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});