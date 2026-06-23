import React from 'react';
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/common/Card';
import { Heading, Body, Caption, Label } from '../components/common/Typography';

// ─── Settings Row ─────────────────────────────────────────────────────────────

interface SettingsRowProps {
  label: string;
  description?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  showDivider?: boolean;
}

function SettingsRow({
  label,
  description,
  rightElement,
  onPress,
  showDivider = true,
}: SettingsRowProps) {
  const { theme } = useTheme();

  const content = (
    <View
      style={[
        styles.row,
        showDivider && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border },
      ]}
    >
      <View style={styles.rowLeft}>
        <Body weight="medium">{label}</Body>
        {description ? (
          <Caption style={styles.rowDescription}>{description}</Caption>
        ) : null}
      </View>
      {rightElement && <View style={styles.rowRight}>{rightElement}</View>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// ─── Settings Section ─────────────────────────────────────────────────────────

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingsSection({ title, children }: SettingsSectionProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.section}>
      <Label style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>{title}</Label>
      <Card noPadding elevation={1}>
        {children}
      </Card>
    </View>
  );
}

// ─── Settings Screen ──────────────────────────────────────────────────────────

export function SettingsScreen() {
  const { theme, isDark, themeMode, setThemeMode, toggleTheme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View
        style={[
          styles.header,
          { paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md },
        ]}
      >
        <Heading level={1}>Settings</Heading>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Appearance ──────────────────────────────────────────────────── */}
        <SettingsSection title="Appearance">
          <SettingsRow
            label="Dark Mode"
            description={`Theme: ${themeMode === 'system' ? 'Following system' : isDark ? 'Dark' : 'Light'}`}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={() => void toggleTheme()}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.surface}
              />
            }
            showDivider={false}
          />
        </SettingsSection>

        {/* ── Currency ────────────────────────────────────────────────────── */}
        <SettingsSection title="Currency & Region">
          <SettingsRow
            label="Default Currency"
            description="USD – US Dollar"
            onPress={() => {}}
            rightElement={<Caption>›</Caption>}
          />
          <SettingsRow
            label="Language"
            description="English"
            onPress={() => {}}
            rightElement={<Caption>›</Caption>}
            showDivider={false}
          />
        </SettingsSection>

        {/* ── Notifications ───────────────────────────────────────────────── */}
        <SettingsSection title="Notifications">
          <SettingsRow
            label="Push Notifications"
            description="Get reminded about unsettled balances"
            rightElement={
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.surface}
              />
            }
            showDivider={false}
          />
        </SettingsSection>

        {/* ── About ───────────────────────────────────────────────────────── */}
        <SettingsSection title="About">
          <SettingsRow
            label="Version"
            rightElement={<Caption>1.0.0 (Phase 1)</Caption>}
          />
          <SettingsRow
            label="Privacy Policy"
            onPress={() => {}}
            rightElement={<Caption>›</Caption>}
          />
          <SettingsRow
            label="Terms of Service"
            onPress={() => {}}
            rightElement={<Caption>›</Caption>}
            showDivider={false}
          />
        </SettingsSection>

        {/* ── Danger Zone ─────────────────────────────────────────────────── */}
        <SettingsSection title="Data">
          <SettingsRow
            label="Clear All Data"
            description="Permanently delete all trips and expenses"
            onPress={() => {}}
            rightElement={<Caption color={theme.colors.error}>›</Caption>}
            showDivider={false}
          />
        </SettingsSection>

        {/* ── Theme Mode Selector ─────────────────────────────────────────── */}
        <SettingsSection title="Theme Mode">
          {(['light', 'dark', 'system'] as const).map((mode, i, arr) => (
            <SettingsRow
              key={mode}
              label={mode.charAt(0).toUpperCase() + mode.slice(1)}
              description={
                mode === 'system' ? 'Follows your device setting' : undefined
              }
              onPress={() => void setThemeMode(mode)}
              rightElement={
                themeMode === mode ? (
                  <Body color={theme.colors.primary}>✓</Body>
                ) : undefined
              }
              showDivider={i < arr.length - 1}
            />
          ))}
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
  },
  scrollContent: {
    paddingTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    marginBottom: 8,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
  },
  rowDescription: {
    marginTop: 2,
  },
  rowRight: {
    flexShrink: 0,
  },
});