import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Heading, Body, Caption } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Spacing } from '../constants/theme';

// ─── Component ────────────────────────────────────────────────────────────────

export function HomeScreen() {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <Heading level={1} align="center">
            ✈️ TripSplit
          </Heading>
          <Body size="lg" align="center" color={theme.colors.textSecondary} style={styles.tagline}>
            Split travel expenses with friends & family — effortlessly.
          </Body>
        </View>

        {/* Feature Cards */}
        <View style={styles.cardsContainer}>
          <Card style={styles.card} elevation="md">
            <Heading level={4}>💰 Track Expenses</Heading>
            <Body size="sm" color={theme.colors.textSecondary} style={styles.cardBody}>
              Log every expense with custom categories, receipts, and currency support.
            </Body>
          </Card>

          <Card style={styles.card} elevation="md">
            <Heading level={4}>⚖️ Smart Splits</Heading>
            <Body size="sm" color={theme.colors.textSecondary} style={styles.cardBody}>
              Split equally, by percentage, by shares, or enter exact amounts.
            </Body>
          </Card>

          <Card style={styles.card} elevation="md">
            <Heading level={4}>🤝 Settle Up</Heading>
            <Body size="sm" color={theme.colors.textSecondary} style={styles.cardBody}>
              See who owes what and settle debts with minimal transactions.
            </Body>
          </Card>

          <Card style={styles.card} elevation="md">
            <Heading level={4}>🌍 Multi-Currency</Heading>
            <Body size="sm" color={theme.colors.textSecondary} style={styles.cardBody}>
              Travel internationally with automatic currency conversion.
            </Body>
          </Card>
        </View>

        {/* Theme Toggle */}
        <View style={styles.themeSection}>
          <Caption muted>
            Current theme: {isDark ? '🌙 Dark' : '☀️ Light'}
          </Caption>
          <Button
            label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            onPress={toggleTheme}
            variant="outline"
            style={styles.themeButton}
          />
        </View>

        {/* Version */}
        <Caption muted align="center" style={styles.version}>
          v1.0.0 — Phase 1: Foundation
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[8],
  },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing[8],
    paddingBottom: Spacing[6],
    gap: Spacing[2],
  },
  tagline: {
    maxWidth: 300,
    marginTop: Spacing[2],
  },
  cardsContainer: {
    gap: Spacing[3],
  },
  card: {
    gap: Spacing[1.5],
  },
  cardBody: {
    marginTop: Spacing[1],
  },
  themeSection: {
    alignItems: 'center',
    marginTop: Spacing[8],
    gap: Spacing[3],
  },
  themeButton: {
    alignSelf: 'center',
  },
  version: {
    marginTop: Spacing[6],
  },
});