import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Heading, Body, Caption } from '../components/common/Typography';

// ─── Component ────────────────────────────────────────────────────────────────

export function TripsScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Heading level={2}>My Trips</Heading>
        <Button
          title="+ New Trip"
          onPress={() => {
            // Wire up navigation in Phase 2
          }}
          variant="primary"
          size="sm"
        />
      </View>

      {/* Empty State */}
      <View style={styles.emptyState}>
        <Body style={styles.emptyEmoji}>🗺️</Body>
        <Heading level={3} align="center" style={{ marginBottom: 8 }}>
          No trips yet
        </Heading>
        <Body
          size="sm"
          color={theme.colors.textSecondary}
          align="center"
          style={{ marginBottom: 24, paddingHorizontal: 32 }}
        >
          Start your first adventure! Create a trip and invite your travel
          companions to track expenses together.
        </Body>
        <Button
          title="Create Your First Trip"
          onPress={() => {
            // Wire up navigation in Phase 2
          }}
          variant="primary"
        />

        {/* Preview Card */}
        <Card
          variant="outlined"
          style={styles.previewCard}
          contentStyle={styles.previewCardContent}
        >
          <Caption style={{ marginBottom: 4 }}>PREVIEW</Caption>
          <Heading level={4} style={{ marginBottom: 4 }}>
            🇯🇵 Tokyo Adventure
          </Heading>
          <Caption color={theme.colors.textTertiary}>
            Jun 2026 · 4 participants · ¥0 spent
          </Caption>
          <View
            style={[
              styles.previewDivider,
              { backgroundColor: theme.colors.border },
            ]}
          />
          <Body size="sm" color={theme.colors.textSecondary}>
            Your trips will look like this card. Tap to see details, expenses,
            and balances.
          </Body>
        </Card>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
    textAlign: 'center',
  },
  previewCard: {
    marginTop: 32,
    width: '100%',
  },
  previewCardContent: {
    padding: 16,
  },
  previewDivider: {
    height: 1,
    width: '100%',
    marginVertical: 12,
  },
});