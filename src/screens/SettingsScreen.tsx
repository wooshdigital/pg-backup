import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Heading, Body, Caption } from '../components/common/Typography';
import { Card } from '../components/common/Card';

interface SettingsRowProps {
  emoji: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isLast?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  emoji,
  label,
  value,
  onPress,
  rightElement,
  isLast = false,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.settingsRow,
        !isLast && { borderBottomWidth: 1, borderBottomColor: theme.colors.border.subtle },
      ]}
      accessibilityRole={onPress ? 'button' : 'none'}
    >
      <View style={styles.settingsRowLeft}>
        <View
          style={[
            styles.settingsRowIcon,
            { backgroundColor: theme.colors.surface.secondary },
          ]}
        >
          <Body style={{ fontSize: 18 }}>{emoji}</Body>
        </View>
        <View>
          <Body style={{ color: theme.colors.text.primary }}>{label}</Body>
          {value !== undefined && (
            <Caption style={{ color: theme.colors.text.secondary }}>{value}</Caption>
          )}
        </View>
      </View>
      <View style={styles.settingsRowRight}>
        {rightElement ?? (
          onPress && (
            <Caption style={{ color: theme.colors.text.tertiary }}>›</Caption>
          )
        )}
      </View>
    </TouchableOpacity>
  );
};

export const SettingsScreen: React.FC = () => {
  const { theme, isDark, toggleTheme, preference, setPreference } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background.primary }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface.primary,
            borderBottomColor: theme.colors.border.subtle,
          },
        ]}
      >
        <Heading level={2} style={{ color: theme.colors.text.primary }}>
          Settings
        </Heading>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <Caption style={[styles.sectionLabel, { color: theme.colors.text.tertiary }]}>
          APPEARANCE
        </Caption>
        <Card elevation="sm" style={styles.settingsCard}>
          <SettingsRow
            emoji="🌙"
            label="Dark Mode"
            value={preference === 'system' ? 'Following system' : undefined}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{
                  false: theme.colors.border.default,
                  true: theme.colors.brand.primary,
                }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingsRow
            emoji="📱"
            label="Follow System Theme"
            isLast
            rightElement={
              <Switch
                value={preference === 'system'}
                onValueChange={val => setPreference(val ? 'system' : isDark ? 'dark' : 'light')}
                trackColor={{
                  false: theme.colors.border.default,
                  true: theme.colors.brand.primary,
                }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </Card>

        {/* Preferences Section */}
        <Caption style={[styles.sectionLabel, { color: theme.colors.text.tertiary }]}>
          PREFERENCES
        </Caption>
        <Card elevation="sm" style={styles.settingsCard}>
          <SettingsRow
            emoji="💱"
            label="Default Currency"
            value="USD ($)"
            onPress={() => {}}
          />
          <SettingsRow
            emoji="🌍"
            label="Language"
            value="English"
            onPress={() => {}}
          />
          <SettingsRow
            emoji="📳"
            label="Haptic Feedback"
            isLast
            rightElement={
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{
                  false: theme.colors.border.default,
                  true: theme.colors.brand.primary,
                }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </Card>

        {/* Data & Privacy Section */}
        <Caption style={[styles.sectionLabel, { color: theme.colors.text.tertiary }]}>
          DATA & PRIVACY
        </Caption>
        <Card elevation="sm" style={styles.settingsCard}>
          <SettingsRow
            emoji="📤"
            label="Export Data"
            value="Download your trips as CSV"
            onPress={() => {}}
          />
          <SettingsRow
            emoji="🗑️"
            label="Clear All Data"
            value="Remove all trips and expenses"
            onPress={() => {}}
            isLast
          />
        </Card>

        {/* About Section */}
        <Caption style={[styles.sectionLabel, { color: theme.colors.text.tertiary }]}>
          ABOUT
        </Caption>
        <Card elevation="sm" style={styles.settingsCard}>
          <SettingsRow
            emoji="ℹ️"
            label="About TripSplit"
            onPress={() => {}}
          />
          <SettingsRow
            emoji="⭐"
            label="Rate the App"
            onPress={() => {}}
          />
          <SettingsRow
            emoji="🐛"
            label="Report a Bug"
            onPress={() => {}}
            isLast
          />
        </Card>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Caption style={{ color: theme.colors.text.tertiary, textAlign: 'center' }}>
            TripSplit v1.0.0
          </Caption>
          <Caption style={{ color: theme.colors.text.tertiary, textAlign: 'center' }}>
            Built with ❤️ using Expo & React Native
          </Caption>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    marginBottom: 8,
    marginTop: 8,
    letterSpacing: 1,
    fontWeight: '600',
  },
  settingsCard: {
    marginBottom: 24,
    padding: 0,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingsRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsRowRight: {
    marginLeft: 12,
  },
  versionContainer: {
    gap: 4,
    marginTop: 8,
  },
});