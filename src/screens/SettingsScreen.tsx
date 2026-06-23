import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/common/Card';
import { Heading, Body, Caption, Label } from '../components/common/Typography';
import { spacing, borderRadius, typography } from '../constants/theme';

// ─── Setting Row ─────────────────────────────────────────────────────────────

interface SettingRowProps {
  emoji: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  showChevron?: boolean;
}

function SettingRow({ emoji, title, subtitle, onPress, right, showChevron = false }: SettingRowProps) {
  const { colors } = useTheme();
  const Inner = (
    <View style={[styles.settingRow, { borderBottomColor: colors.borderLight }]}>
      <View style={[styles.settingIcon, { backgroundColor: colors.surfaceElevated }]}>
        <Text style={styles.settingEmoji}>{emoji}</Text>
      </View>
      <View style={styles.settingContent}>
        <Body weight="medium">{title}</Body>
        {subtitle !== undefined && (
          <Caption>{subtitle}</Caption>
        )}
      </View>
      <View style={styles.settingRight}>
        {right}
        {showChevron && (
          <Text style={{ color: colors.textDisabled, fontSize: 18 }}>›</Text>
        )}
      </View>
    </View>
  );

  if (onPress !== undefined) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        accessibilityRole="button"
      >
        {Inner}
      </TouchableOpacity>
    );
  }

  return Inner;
}

// ─── Section ─────────────────────────────────────────────────────────────────

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <View style={styles.section}>
      <Label size="sm" style={styles.sectionTitle} uppercase>
        {title}
      </Label>
      <Card elevation="sm" padding={0} radius="lg">
        {children}
      </Card>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function SettingsScreen() {
  const { colors, isDark, toggleTheme, useSystemTheme, setUseSystemTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Heading level={1}>Settings</Heading>
          <Caption>Customize your TripSplit experience</Caption>
        </View>

        {/* Profile placeholder */}
        <Card elevation="md" style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
            <View style={styles.profileInfo}>
              <Body weight="semibold">Guest User</Body>
              <Caption>No account · Local storage only</Caption>
            </View>
          </View>
        </Card>

        {/* Appearance */}
        <SettingSection title="Appearance">
          <SettingRow
            emoji="🌙"
            title="Dark Mode"
            subtitle={useSystemTheme ? 'Following system' : isDark ? 'Enabled' : 'Disabled'}
            right={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            }
          />
          <SettingRow
            emoji="📱"
            title="Use System Theme"
            subtitle="Automatically match device appearance"
            right={
              <Switch
                value={useSystemTheme}
                onValueChange={setUseSystemTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            }
          />
        </SettingSection>

        {/* Currency */}
        <SettingSection title="Preferences">
          <SettingRow
            emoji="💱"
            title="Default Currency"
            subtitle="USD — US Dollar"
            showChevron
            onPress={() => {
              /* Navigate to currency picker */
            }}
          />
          <SettingRow
            emoji="🌐"
            title="Language"
            subtitle="English"
            showChevron
            onPress={() => {
              /* Navigate to language picker */
            }}
          />
          <SettingRow
            emoji="🔔"
            title="Notifications"
            subtitle="Coming soon"
          />
        </SettingSection>

        {/* Data */}
        <SettingSection title="Data">
          <SettingRow
            emoji="☁️"
            title="Export Data"
            subtitle="Download your trips as JSON"
            showChevron
            onPress={() => {
              /* Handle export */
            }}
          />
          <SettingRow
            emoji="🗑️"
            title="Clear All Data"
            subtitle="Permanently delete all trips"
            onPress={() => {
              /* Show confirmation */
            }}
            right={
              <Caption color={colors.error} weight="semibold">
                Danger
              </Caption>
            }
          />
        </SettingSection>

        {/* About */}
        <SettingSection title="About">
          <SettingRow
            emoji="ℹ️"
            title="App Version"
            subtitle="1.0.0 (Phase 1)"
          />
          <SettingRow
            emoji="📜"
            title="Privacy Policy"
            showChevron
            onPress={() => {
              /* Open web link */
            }}
          />
          <SettingRow
            emoji="⚖️"
            title="Terms of Service"
            showChevron
            onPress={() => {
              /* Open web link */
            }}
          />
          <SettingRow
            emoji="💌"
            title="Send Feedback"
            showChevron
            onPress={() => {
              /* Open mail or form */
            }}
          />
        </SettingSection>

        <Caption align="center" style={styles.footer}>
          Made with ❤️ for travellers everywhere
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
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  header: {
    marginBottom: spacing[5],
    paddingTop: spacing[2],
    gap: spacing[1],
  },
  profileCard: {
    marginBottom: spacing[6],
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  profileInfo: {
    flex: 1,
    gap: spacing[0.5],
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionTitle: {
    marginBottom: spacing[2],
    marginLeft: spacing[1],
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing[3],
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingEmoji: {
    fontSize: 18,
  },
  settingContent: {
    flex: 1,
    gap: spacing[0.5],
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  footer: {
    marginTop: spacing[4],
    paddingBottom: spacing[4],
  },
});

export default SettingsScreen;