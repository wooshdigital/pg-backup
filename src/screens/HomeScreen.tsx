import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Heading, Body, Caption } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

interface QuickStatProps {
  emoji: string;
  value: string;
  label: string;
}

const QuickStat: React.FC<QuickStatProps> = ({ emoji, value, label }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.quickStat, { backgroundColor: theme.colors.surface.secondary }]}>
      <Body style={styles.quickStatEmoji}>{emoji}</Body>
      <Heading level={3} style={{ color: theme.colors.text.primary }}>
        {value}
      </Heading>
      <Caption style={{ color: theme.colors.text.secondary }}>{label}</Caption>
    </View>
  );
};

export const HomeScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background.primary }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Caption style={{ color: theme.colors.text.secondary }}>Welcome back 👋</Caption>
            <Heading level={1} style={{ color: theme.colors.text.primary }}>
              TripSplit
            </Heading>
          </View>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              styles.themeToggle,
              { backgroundColor: theme.colors.surface.secondary },
            ]}
            accessibilityLabel="Toggle theme"
            accessibilityRole="button"
          >
            <Body>{isDark ? '☀️' : '🌙'}</Body>
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <Card style={styles.heroCard} elevation="lg">
          <View
            style={[
              styles.heroGradient,
              { backgroundColor: theme.colors.brand.primary },
            ]}
          >
            <Body style={styles.heroEmoji}>✈️</Body>
            <Heading
              level={2}
              style={[styles.heroTitle, { color: '#FFFFFF' }]}
            >
              Split expenses,{'\n'}not friendships.
            </Heading>
            <Body style={[styles.heroSubtitle, { color: 'rgba(255,255,255,0.85)' }]}>
              Track shared costs on trips, settle up easily, and keep everyone in the loop.
            </Body>
            <Button
              label="Create your first trip"
              onPress={() => {}}
              variant="secondary"
              style={styles.heroButton}
            />
          </View>
        </Card>

        {/* Quick Stats */}
        <Heading
          level={3}
          style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
        >
          Overview
        </Heading>
        <View style={styles.quickStats}>
          <QuickStat emoji="🗺️" value="0" label="Trips" />
          <QuickStat emoji="💸" value="$0" label="Spent" />
          <QuickStat emoji="🤝" value="$0" label="Settled" />
        </View>

        {/* Recent Activity Placeholder */}
        <Heading
          level={3}
          style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
        >
          Recent Activity
        </Heading>
        <Card elevation="sm">
          <View style={styles.emptyState}>
            <Body style={styles.emptyEmoji}>🌍</Body>
            <Body style={{ color: theme.colors.text.secondary, textAlign: 'center' }}>
              No trips yet. Start planning your first adventure!
            </Body>
            <Button
              label="Plan a trip"
              onPress={() => {}}
              variant="primary"
              size="sm"
              style={styles.emptyButton}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    marginBottom: 28,
    padding: 0,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 28,
    borderRadius: 16,
  },
  heroEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  heroTitle: {
    marginBottom: 8,
  },
  heroSubtitle: {
    marginBottom: 20,
    lineHeight: 22,
  },
  heroButton: {
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    marginBottom: 12,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  quickStat: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  quickStatEmoji: {
    fontSize: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyButton: {
    marginTop: 8,
  },
});