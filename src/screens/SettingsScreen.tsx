import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/common/Card';
import { Heading, Body, Label, Caption } from '../components/common/Typography';
import type { ThemeMode } from '../context/ThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingsRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
}

// ─── Settings Row ─────────────────────────────────────────────────────────────

function SettingsRow({ icon, label, value, onPress, isLast = false }: SettingsRowProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[
        styles.row,
        !isLast && { borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
      ]}
    >
      <Body style={styles.rowIcon}>{icon}</Body>
      <Label style={[styles.rowLabel, { color: theme.colors.textPrimary }]}>{label}</Label>
      <View style={styles.rowRight}>
        {value && (
          <Caption color={theme.colors.textTertiary} style={{ marginRight: 4 }}>
            {value}
          </Caption>
        )}
        {onPress && (
          <Caption color={theme.colors.textTertiary}>›</Caption>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();

  const themeModeLabels: Record<ThemeMode, string> = {
    light: '☀️ Light',
    dark: '🌙 Dark',
    system: '⚙️ System',
  };

  const cycleTheme = async () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(themeMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    await setThemeMode(nextMode);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Heading level={2}>Settings</Heading>
          <Body size="sm" color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
            Manage your preferences
          </Body>
        </View>

        {/* Profile Section */}
        <Caption
          style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}
        >
          PROFILE
        </Caption>
        <Card variant="elevated" style={styles.sectionCard} contentStyle={styles.sectionCardContent}>
          <SettingsRow icon="👤" label="Your Name" value="Set name" onPress={() => {}} />
          <SettingsRow icon="📧" label="Email" value="Not set" onPress={() => {}} isLast />
        </Card>

        {/* Appearance Section */}
        <Caption
          style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}
        >
          APPEARANCE
        </Caption>
        <Card variant="elevated" style={styles.sectionCard} contentStyle={styles.sectionCardContent}>
          <SettingsRow
            icon="🎨"
            label="Theme"
            value={themeModeLabels[themeMode]}
            onPress={() => void cycleTheme()}
            isLast
          />
        </Card>

        {/* Preferences Section */}
        <Caption
          style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}
        >
          PREFERENCES
        </Caption>
        <Card variant="elevated" style={styles.sectionCard} contentStyle={styles.sectionCardContent}>
          <SettingsRow icon="💱" label="Default Currency" value="USD" onPress={() => {}} />
          <SettingsRow icon="🔔" label="Notifications" value="On" onPress={() => {}} isLast />
        </Card>

        {/* Data Section */}
        <Caption
          style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}
        >
          DATA
        </Caption>
        <Card variant="elevated" style={styles.sectionCard} contentStyle={styles.sectionCardContent}>
          <SettingsRow icon="📤" label="Export Data" onPress={() => {}} />
          <SettingsRow icon="🗑️" label="Clear All Data" onPress={() => {}} isLast />
        </Card>

        {/* About Section */}
        <Caption
          style={[styles.sectionTitle, { color: theme.colors.textTertiary }]}
        >
          ABOUT
        </Caption>
        <Card variant="elevated" style={styles.sectionCard} contentStyle={styles.sectionCardContent}>
          <SettingsRow icon="ℹ️" label="Version" value="1.0.0" />
          <SettingsRow icon="📄" label="Privacy Policy" onPress={() => {}} />
          <SettingsRow icon="📋" label="Terms of Service" onPress={() => {}} isLast />
        </Card>

        <View style={styles.footer}>
          <Caption align="center" color={theme.colors.textTertiary}>
            SplitWise Travel v1.0.0
          </Caption>
          <Caption align="center" color={theme.colors.textTertiary} style={{ marginTop: 4 }}>
            Made with ❤️ for travelers
          </Caption>
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
  scrollContent: {
    paddingBottom: 40,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: 16,
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  sectionCard: {
    marginHorizontal: 16,
  },
  sectionCardContent: {
    padding: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    paddingTop: 32,
    paddingBottom: 8,
  },
});