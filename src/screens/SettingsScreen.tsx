import React from 'react';
import { StyleSheet, View, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Heading, Body, Caption, Label } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { Spacing } from '../constants/theme';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SettingsItemProps {
  label: string;
  description?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
}

// ─── Settings Item ────────────────────────────────────────────────────────────

function SettingsItem({ label, description, rightElement, onPress }: SettingsItemProps) {
  const { theme } = useTheme();

  const content = (
    <View style={[styles.settingsItem, { borderBottomColor: theme.colors.divider }]}>
      <View style={styles.settingsItemText}>
        <Body weight="medium">{label}</Body>
        {description && (
          <Caption muted style={styles.settingsDescription}>
            {description}
          </Caption>
        )}
      </View>
      {rightElement && <View style={styles.settingsRight}>{rightElement}</View>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} accessible accessibilityRole="button">
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.divider }]}>
        <Heading level={2}>Settings</Heading>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <Label uppercase style={styles.sectionLabel}>
            Appearance
          </Label>
          <Card elevation="sm" padding={0} style={styles.sectionCard}>
            <SettingsItem
              label="Dark Mode"
              description="Switch between light and dark theme"
              rightElement={
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary,
                  }}
                  thumbColor={theme.colors.surface}
                  accessibilityLabel="Toggle dark mode"
                />
              }
            />
          </Card>
        </View>

        {/* Currency Section */}
        <View style={styles.section}>
          <Label uppercase style={styles.sectionLabel}>
            Preferences
          </Label>
          <Card elevation="sm" padding={0} style={styles.sectionCard}>
            <SettingsItem
              label="Default Currency"
              description="Used when creating new trips"
              rightElement={
                <Body weight="semiBold" color={theme.colors.primary}>
                  USD $
                </Body>
              }
              onPress={() => {}}
            />
            <SettingsItem
              label="Language"
              description="App display language"
              rightElement={
                <Body weight="semiBold" color={theme.colors.textSecondary}>
                  English
                </Body>
              }
              onPress={() => {}}
            />
            <SettingsItem
              label="Notifications"
              description="Reminders and settlement alerts"
              rightElement={
                <Switch
                  value={false}
                  onValueChange={() => {}}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary,
                  }}
                  thumbColor={theme.colors.surface}
                  accessibilityLabel="Toggle notifications"
                />
              }
            />
          </Card>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Label uppercase style={styles.sectionLabel}>
            Data & Storage
          </Label>
          <Card elevation="sm" padding={0} style={styles.sectionCard}>
            <SettingsItem
              label="Export Data"
              description="Download all trips as JSON"
              onPress={() => {}}
              rightElement={
                <Caption color={theme.colors.primary}>›</Caption>
              }
            />
            <SettingsItem
              label="Clear All Data"
              description="Permanently delete all trips and expenses"
              onPress={() => {}}
              rightElement={
                <Caption color={theme.colors.error}>›</Caption>
              }
            />
          </Card>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Label uppercase style={styles.sectionLabel}>
            About
          </Label>
          <Card elevation="sm" padding={0} style={styles.sectionCard}>
            <SettingsItem
              label="Version"
              rightElement={
                <Caption muted>1.0.0 (Phase 1)</Caption>
              }
            />
            <SettingsItem
              label="Privacy Policy"
              onPress={() => {}}
              rightElement={
                <Caption color={theme.colors.primary}>›</Caption>
              }
            />
            <SettingsItem
              label="Terms of Service"
              onPress={() => {}}
              rightElement={
                <Caption color={theme.colors.primary}>›</Caption>
              }
            />
          </Card>
        </View>

        <Caption muted align="center" style={styles.footer}>
          TripSplit © 2026 — Made with ❤️ for travelers
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
  header: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scroll: {
    flexGrow: 1,
    padding: Spacing[4],
    gap: Spacing[1],
    paddingBottom: Spacing[8],
  },
  section: {
    marginBottom: Spacing[4],
    gap: Spacing[1.5],
  },
  sectionLabel: {
    paddingHorizontal: Spacing[1],
    marginBottom: Spacing[1],
  },
  sectionCard: {
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
  settingsItemText: {
    flex: 1,
    marginRight: Spacing[3],
    gap: Spacing[0.5],
  },
  settingsDescription: {
    marginTop: Spacing[0.5],
  },
  settingsRight: {
    alignItems: 'flex-end',
  },
  footer: {
    marginTop: Spacing[4],
  },
});