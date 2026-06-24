import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/common/Card';
import {
  H2,
  Body,
  BodySmall,
  Caption,
  Overline,
} from '../components/common/Typography';
import { spacing, borderRadius } from '../constants/theme';
import type { ThemeMode } from '../context/ThemeContext';

// ─── Settings Item ────────────────────────────────────────────────────────────

interface SettingsItemProps {
  emoji: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
}

function SettingsItem({ emoji, label, value, onPress, showChevron = true }: SettingsItemProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={styles.settingsItem}
      accessibilityRole={onPress ? 'button' : 'none'}
    >
      <View style={[styles.itemIcon, { backgroundColor: theme.surfaceSubtle }]}>
        <Body style={styles.itemEmoji}>{emoji}</Body>
      </View>
      <Body style={styles.itemLabel}>{label}</Body>
      <View style={styles.itemRight}>
        {value ? (
          <Caption color={theme.textSecondary}>{value}</Caption>
        ) : null}
        {showChevron && onPress ? (
          <Caption color={theme.textTertiary}> ›</Caption>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────

const THEME_OPTIONS: { label: string; value: ThemeMode; emoji: string }[] = [
  { label: 'Light', value: 'light', emoji: '☀️' },
  { label: 'Dark', value: 'dark', emoji: '🌙' },
  { label: 'System', value: 'system', emoji: '⚙️' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function SettingsScreen() {
  const { theme, mode, setMode } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <H2>Settings</H2>
          <BodySmall color={theme.textSecondary}>Customize your experience</BodySmall>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Overline color={theme.textTertiary} style={styles.sectionLabel}>
            Appearance
          </Overline>
          <Card elevation="sm" style={styles.themeCard}>
            <BodySmall color={theme.textSecondary} style={styles.themeLabel}>
              Choose your preferred theme
            </BodySmall>
            <View style={styles.themeOptions}>
              {THEME_OPTIONS.map((option) => {
                const isSelected = mode === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setMode(option.value)}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: isSelected
                          ? theme.primary
                          : theme.surfaceSubtle,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`${option.label} theme`}
                  >
                    <Body style={styles.themeEmoji}>{option.emoji}</Body>
                    <Caption
                      style={{ color: isSelected ? theme.primaryForeground : theme.textSecondary }}
                    >
                      {option.label}
                    </Caption>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Overline color={theme.textTertiary} style={styles.sectionLabel}>
            Preferences
          </Overline>
          <Card elevation="sm" style={styles.settingsCard}>
            <SettingsItem
              emoji="💱"
              label="Default Currency"
              value="USD"
              onPress={() => undefined}
            />
            <View style={[styles.separator, { backgroundColor: theme.divider }]} />
            <SettingsItem
              emoji="🔔"
              label="Notifications"
              value="Enabled"
              onPress={() => undefined}
            />
            <View style={[styles.separator, { backgroundColor: theme.divider }]} />
            <SettingsItem
              emoji="🌐"
              label="Language"
              value="English"
              onPress={() => undefined}
            />
          </Card>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Overline color={theme.textTertiary} style={styles.sectionLabel}>
            Account
          </Overline>
          <Card elevation="sm" style={styles.settingsCard}>
            <SettingsItem
              emoji="👤"
              label="Profile"
              onPress={() => undefined}
            />
            <View style={[styles.separator, { backgroundColor: theme.divider }]} />
            <SettingsItem
              emoji="🔒"
              label="Privacy & Security"
              onPress={() => undefined}
            />
            <View style={[styles.separator, { backgroundColor: theme.divider }]} />
            <SettingsItem
              emoji="💾"
              label="Export Data"
              onPress={() => undefined}
            />
          </Card>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Overline color={theme.textTertiary} style={styles.sectionLabel}>
            About
          </Overline>
          <Card elevation="sm" style={styles.settingsCard}>
            <SettingsItem
              emoji="ℹ️"
              label="About SplitEase"
              onPress={() => undefined}
            />
            <View style={[styles.separator, { backgroundColor: theme.divider }]} />
            <SettingsItem
              emoji="⭐"
              label="Rate the App"
              onPress={() => undefined}
            />
            <View style={[styles.separator, { backgroundColor: theme.divider }]} />
            <SettingsItem
              emoji="🐛"
              label="Report a Bug"
              onPress={() => undefined}
            />
          </Card>
        </View>

        {/* Version */}
        <Caption align="center" color={theme.textTertiary} style={styles.version}>
          SplitEase v1.0.0 (Build 1)
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
  header: {
    paddingTop: spacing[6],
    marginBottom: spacing[6],
    gap: spacing[1],
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionLabel: {
    marginBottom: spacing[2],
    marginLeft: spacing[1],
  },
  themeCard: {
    gap: spacing[3],
  },
  themeLabel: {
    marginBottom: spacing[1],
  },
  themeOptions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2.5],
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    gap: spacing[1],
  },
  themeEmoji: {
    fontSize: 20,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[3],
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemEmoji: {
    fontSize: 18,
  },
  itemLabel: {
    flex: 1,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    marginLeft: spacing[4] + 36 + spacing[3],
  },
  version: {
    marginTop: spacing[4],
  },
});