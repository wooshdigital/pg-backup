import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/common/Card';
import { Body, Caption, Heading } from '../components/common/Typography';
import type { ThemeMode } from '../context/ThemeContext';
import type { Theme } from '../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingsItemProps {
  label: string;
  description?: string;
  value?: string;
  emoji: string;
  onPress?: () => void;
  showChevron?: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SettingsItem({
  label,
  description,
  value,
  emoji,
  onPress,
  showChevron = true,
}: SettingsItemProps) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
      accessibilityRole="button"
    >
      <View style={styles.settingsItemIcon}>
        <Body size="md">{emoji}</Body>
      </View>
      <View style={styles.settingsItemContent}>
        <Body size="md">{label}</Body>
        {description ? (
          <Caption color="secondary">{description}</Caption>
        ) : null}
      </View>
      {value ? <Caption color="secondary">{value}</Caption> : null}
      {showChevron && onPress ? (
        <Body size="sm" color="secondary" style={styles.chevron}>
          ›
        </Body>
      ) : null}
    </TouchableOpacity>
  );
}

function SettingsSectionHeader({ title }: { title: string }) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  return (
    <Caption uppercase color="secondary" style={styles.sectionHeader}>
      {title}
    </Caption>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function SettingsScreen() {
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const styles = makeStyles(theme);

  const themeModeOptions: { label: string; value: ThemeMode; emoji: string }[] = [
    { label: 'Light', value: 'light', emoji: '☀️' },
    { label: 'Dark', value: 'dark', emoji: '🌙' },
    { label: 'System', value: 'system', emoji: '📱' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Heading level={2}>Settings</Heading>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <SettingsSectionHeader title="Appearance" />
        <Card variant="elevated" padding={0} style={styles.section}>
          <SettingsItem
            emoji={isDark ? '🌙' : '☀️'}
            label="Theme"
            description="Choose your preferred color scheme"
            value={themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
            onPress={() => undefined}
          />
          <View style={styles.themeModeRow}>
            {themeModeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.themeModeOption,
                  themeMode === option.value && styles.themeModeOptionActive,
                ]}
                onPress={() => setThemeMode(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: themeMode === option.value }}
              >
                <Body size="md">{option.emoji}</Body>
                <Caption
                  color={themeMode === option.value ? 'primary' : 'secondary'}
                >
                  {option.label}
                </Caption>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Preferences */}
        <SettingsSectionHeader title="Preferences" />
        <Card variant="elevated" padding={0} style={styles.section}>
          <SettingsItem
            emoji="💱"
            label="Default Currency"
            description="Used when creating new trips"
            value="USD"
            onPress={() => undefined}
          />
          <View style={styles.divider} />
          <SettingsItem
            emoji="🌍"
            label="Language"
            value="English"
            onPress={() => undefined}
          />
        </Card>

        {/* Data */}
        <SettingsSectionHeader title="Data" />
        <Card variant="elevated" padding={0} style={styles.section}>
          <SettingsItem
            emoji="📤"
            label="Export Data"
            description="Download all your trips as CSV"
            onPress={() => undefined}
          />
          <View style={styles.divider} />
          <SettingsItem
            emoji="🗑️"
            label="Clear All Data"
            description="Permanently delete all trips and expenses"
            onPress={() => undefined}
          />
        </Card>

        {/* About */}
        <SettingsSectionHeader title="About" />
        <Card variant="elevated" padding={0} style={styles.section}>
          <SettingsItem
            emoji="ℹ️"
            label="About SplitMate"
            onPress={() => undefined}
          />
          <View style={styles.divider} />
          <SettingsItem
            emoji="📋"
            label="Version"
            value="1.0.0 (Phase 1)"
            showChevron={false}
          />
          <View style={styles.divider} />
          <SettingsItem
            emoji="⭐"
            label="Rate the App"
            onPress={() => undefined}
          />
        </Card>

        <Caption align="center" style={styles.footer}>
          Made with ❤️ — SplitMate v1.0.0
        </Caption>
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
    header: {
      paddingHorizontal: theme.spacing[4],
      paddingTop: theme.spacing[4],
      paddingBottom: theme.spacing[2],
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing[4],
      paddingBottom: theme.spacing[8],
    },
    sectionHeader: {
      marginTop: theme.spacing[4],
      marginBottom: theme.spacing[2],
      marginLeft: theme.spacing[1],
    },
    section: {
      marginBottom: theme.spacing[2],
      overflow: 'hidden',
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing[4],
      gap: theme.spacing[3],
    },
    settingsItemIcon: {
      width: 36,
      height: 36,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingsItemContent: {
      flex: 1,
      gap: theme.spacing[0.5],
    },
    chevron: {
      fontSize: 20,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginLeft: theme.spacing[4] + 36 + theme.spacing[3],
    },
    themeModeRow: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing[4],
      paddingBottom: theme.spacing[4],
      gap: theme.spacing[2],
    },
    themeModeOption: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing[2.5],
      borderRadius: theme.radii.md,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      gap: theme.spacing[1],
    },
    themeModeOptionActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceVariant,
    },
    footer: {
      marginTop: theme.spacing[6],
      marginBottom: theme.spacing[2],
    },
  });
}