import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useTheme } from '@context/ThemeContext';
import { Card } from '@components/common/Card';
import { Body, Caption, H2, H3, Label } from '@components/common/Typography';
import { borderRadius, spacing } from '@constants/theme';
import type { ColorMode } from '@context/ThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingsRowProps {
  label: string;
  description?: string;
  right?: React.ReactNode;
  showBorder?: boolean;
}

// ─── Settings Row ─────────────────────────────────────────────────────────────

function SettingsRow({ label, description, right, showBorder = true }: SettingsRowProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.row,
        showBorder && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border },
      ]}
    >
      <View style={styles.rowLeft}>
        <Body weight="medium">{label}</Body>
        {description && (
          <Caption color={theme.colors.textSecondary} style={styles.rowDescription}>
            {description}
          </Caption>
        )}
      </View>
      {right && <View style={styles.rowRight}>{right}</View>}
    </View>
  );
}

// ─── Theme Selector ───────────────────────────────────────────────────────────

function ThemeSelector() {
  const { theme, colorMode, setColorMode } = useTheme();

  const modes: Array<{ value: ColorMode; label: string; emoji: string }> = [
    { value: 'light', label: 'Light', emoji: '☀️' },
    { value: 'dark', label: 'Dark', emoji: '🌙' },
    { value: 'system', label: 'System', emoji: '📱' },
  ];

  return (
    <View style={styles.themeSelector}>
      {modes.map((mode) => {
        const isActive = colorMode === mode.value;
        return (
          <View
            key={mode.value}
            style={[
              styles.themeOption,
              {
                backgroundColor: isActive ? theme.colors.primaryLight : theme.colors.surfaceSecondary,
                borderColor: isActive ? theme.colors.primary : 'transparent',
                borderWidth: isActive ? 1.5 : 0,
                borderRadius: borderRadius.base,
              },
            ]}
          >
            <Body
              style={styles.themeEmoji}
              onPress={() => setColorMode(mode.value)}
            >
              {mode.emoji}
            </Body>
            <Caption
              color={isActive ? theme.colors.primary : theme.colors.textSecondary}
              align="center"
            >
              {mode.label}
            </Caption>
          </View>
        );
      })}
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SettingsScreen(): JSX.Element {
  const { theme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [hapticEnabled, setHapticEnabled] = React.useState(true);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <H2>Settings</H2>
          <Caption color={theme.colors.textSecondary}>Customize your experience</Caption>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Label color={theme.colors.textSecondary} style={styles.sectionLabel}>
            APPEARANCE
          </Label>
          <Card elevation="sm" bordered>
            <H3 style={styles.cardTitle}>Theme</H3>
            <Caption color={theme.colors.textSecondary} style={styles.cardSubtitle}>
              Choose your preferred color scheme
            </Caption>
            <ThemeSelector />
          </Card>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Label color={theme.colors.textSecondary} style={styles.sectionLabel}>
            PREFERENCES
          </Label>
          <Card elevation="sm" bordered padding={0}>
            <View style={styles.cardPadded}>
              <SettingsRow
                label="Push Notifications"
                description="Get notified when friends add expenses"
                right={
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                    thumbColor={theme.colors.surface}
                  />
                }
              />
              <SettingsRow
                label="Haptic Feedback"
                description="Vibration on interactions"
                showBorder={false}
                right={
                  <Switch
                    value={hapticEnabled}
                    onValueChange={setHapticEnabled}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                    thumbColor={theme.colors.surface}
                  />
                }
              />
            </View>
          </Card>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Label color={theme.colors.textSecondary} style={styles.sectionLabel}>
            ABOUT
          </Label>
          <Card elevation="sm" bordered padding={0}>
            <View style={styles.cardPadded}>
              <SettingsRow label="Version" right={<Caption>1.0.0</Caption>} />
              <SettingsRow label="Build" right={<Caption>2024.1</Caption>} />
              <SettingsRow
                label="Privacy Policy"
                showBorder={false}
                right={<Caption color={theme.colors.primary}>View →</Caption>}
              />
            </View>
          </Card>
        </View>

        {/* Footer */}
        <Caption align="center" style={styles.footer} color={theme.colors.textDisabled}>
          Made with ❤️ for travelers
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
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[10],
  },
  header: {
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
    gap: spacing[1],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionLabel: {
    marginBottom: spacing[2],
    marginLeft: spacing[1],
  },
  cardTitle: {
    marginBottom: spacing[1],
  },
  cardSubtitle: {
    marginBottom: spacing[3],
  },
  cardPadded: {
    paddingHorizontal: spacing[4],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
  },
  rowLeft: {
    flex: 1,
    marginRight: spacing[4],
  },
  rowRight: {
    flexShrink: 0,
  },
  rowDescription: {
    marginTop: spacing[1],
  },
  themeSelector: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    gap: spacing[1],
  },
  themeEmoji: {
    fontSize: 24,
  },
  footer: {
    marginTop: spacing[4],
  },
});