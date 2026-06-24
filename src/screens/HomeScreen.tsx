import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Heading, Body, Caption } from '../components/common/Typography';
import type { Theme } from '../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeatureItemProps {
  emoji: string;
  title: string;
  description: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeatureItem({ emoji, title, description }: FeatureItemProps) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureEmoji}>
        <Body size="lg">{emoji}</Body>
      </View>
      <View style={styles.featureText}>
        <Body size="md" bold>
          {title}
        </Body>
        <Body size="sm" color="secondary">
          {description}
        </Body>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function HomeScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const styles = makeStyles(theme);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.logoContainer}>
            <Body size="lg" style={styles.logoEmoji}>
              ✈️
            </Body>
          </View>
          <Heading level={1} align="center">
            SplitMate
          </Heading>
          <Body size="lg" color="secondary" align="center" style={styles.tagline}>
            Split expenses with friends, stress-free.
          </Body>
        </View>

        {/* Feature Cards */}
        <Card variant="elevated" style={styles.featureCard}>
          <Heading level={3} style={styles.sectionTitle}>
            What you can do
          </Heading>
          <FeatureItem
            emoji="🧳"
            title="Create Trips"
            description="Organize expenses by trip or event"
          />
          <FeatureItem
            emoji="💸"
            title="Track Expenses"
            description="Log who paid and split automatically"
          />
          <FeatureItem
            emoji="🤝"
            title="Settle Up"
            description="See who owes whom at a glance"
          />
          <FeatureItem
            emoji="💱"
            title="Multi-Currency"
            description="Support for 150+ currencies"
          />
        </Card>

        {/* Status Card */}
        <Card variant="outlined" padding={4} style={styles.statusCard}>
          <Caption uppercase color="secondary" style={styles.statusLabel}>
            Development Status
          </Caption>
          <Body size="md" style={styles.statusText}>
            Phase 1 complete — Foundation & Setup ✅
          </Body>
          <Body size="sm" color="secondary">
            Navigation, theming, and project structure are all in place.
          </Body>
        </Card>

        {/* Theme Toggle */}
        <Button
          label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          variant="outline"
          onPress={toggleTheme}
          fullWidth
          style={styles.themeButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing[4],
      paddingBottom: theme.spacing[8],
    },
    hero: {
      alignItems: 'center',
      paddingTop: theme.spacing[8],
      paddingBottom: theme.spacing[6],
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: theme.radii['2xl'],
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing[4],
      ...theme.shadows.lg,
    },
    logoEmoji: {
      fontSize: 36,
    },
    tagline: {
      marginTop: theme.spacing[2],
      maxWidth: 260,
    },
    featureCard: {
      marginBottom: theme.spacing[4],
    },
    sectionTitle: {
      marginBottom: theme.spacing[4],
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing[3],
    },
    featureEmoji: {
      width: 40,
      height: 40,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing[3],
    },
    featureText: {
      flex: 1,
      gap: theme.spacing[0.5],
    },
    statusCard: {
      marginBottom: theme.spacing[4],
      gap: theme.spacing[1],
    },
    statusLabel: {
      marginBottom: theme.spacing[1],
    },
    statusText: {
      marginBottom: theme.spacing[1],
    },
    themeButton: {
      marginTop: theme.spacing[2],
    },
  });
}