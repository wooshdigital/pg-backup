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

const TripStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { theme } = useTheme();

  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    planning: {
      color: theme.colors.status.info,
      bg: theme.colors.brand.secondary,
      label: '📋 Planning',
    },
    active: {
      color: theme.colors.status.success,
      bg: '#EDFBF3',
      label: '🟢 Active',
    },
    completed: {
      color: theme.colors.text.secondary,
      bg: theme.colors.surface.secondary,
      label: '✅ Completed',
    },
    archived: {
      color: theme.colors.text.tertiary,
      bg: theme.colors.surface.secondary,
      label: '📦 Archived',
    },
  };

  const config = statusConfig[status] ?? statusConfig.planning;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Caption style={{ color: config.color, fontWeight: '600' }}>{config.label}</Caption>
    </View>
  );
};

export const TripsScreen: React.FC = () => {
  const { theme } = useTheme();

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
          My Trips
        </Heading>
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: theme.colors.brand.primary },
          ]}
          onPress={() => {}}
          accessibilityLabel="Add new trip"
          accessibilityRole="button"
        >
          <Body style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 22 }}>+</Body>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {['All', 'Active', 'Planning', 'Completed'].map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                filter === 'All' && {
                  backgroundColor: theme.colors.brand.primary,
                },
                filter !== 'All' && {
                  backgroundColor: theme.colors.surface.secondary,
                },
              ]}
            >
              <Caption
                style={{
                  color: filter === 'All' ? '#FFFFFF' : theme.colors.text.secondary,
                  fontWeight: '600',
                }}
              >
                {filter}
              </Caption>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Empty State */}
        <Card elevation="md" style={styles.emptyCard}>
          <View style={styles.emptyState}>
            <Body style={styles.emptyEmoji}>✈️</Body>
            <Heading
              level={3}
              style={{ color: theme.colors.text.primary, textAlign: 'center' }}
            >
              No trips yet
            </Heading>
            <Body
              style={{ color: theme.colors.text.secondary, textAlign: 'center', lineHeight: 22 }}
            >
              Create your first trip to start tracking shared expenses with friends and family.
            </Body>
            <Button
              label="✈️  Create a Trip"
              onPress={() => {}}
              variant="primary"
              style={styles.createButton}
            />
          </View>
        </Card>

        {/* Tip Card */}
        <Card
          elevation="sm"
          style={[styles.tipCard, { borderLeftColor: theme.colors.brand.primary }]}
        >
          <Caption style={{ color: theme.colors.text.secondary, marginBottom: 4 }}>
            💡 Pro Tip
          </Caption>
          <Body style={{ color: theme.colors.text.primary }}>
            Invite participants to a trip so everyone can track expenses together in real time.
          </Body>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  filterScroll: {
    marginBottom: 20,
    marginHorizontal: -20,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyCard: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  createButton: {
    marginTop: 8,
    minWidth: 160,
  },
  tipCard: {
    borderLeftWidth: 3,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
});