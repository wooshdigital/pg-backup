import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTrips } from '../hooks/useTrips';
import { DatePicker } from '../components/common/DatePicker';
import { CurrencyPicker } from '../components/trips/CurrencyPicker';

type RootStackParamList = {
  TripsList: undefined;
  CreateTrip: undefined;
  TripDetail: { tripId: string };
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateTrip'>;
};

function toDateOnly(date: Date): string {
  // Return YYYY-MM-DD without timezone offset issues
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function CreateTripScreen({ navigation }: Props) {
  const { createTrip } = useTrips();

  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextWeek);
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  const validateName = (value: string): boolean => {
    if (!value.trim()) {
      setNameError('Trip name is required');
      return false;
    }
    if (value.trim().length < 2) {
      setNameError('Trip name must be at least 2 characters');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleStartDateChange = useCallback((date: Date) => {
    setStartDate(date);
    // Ensure end date is never before start date
    if (date > endDate) {
      const newEnd = new Date(date);
      newEnd.setDate(date.getDate() + 1);
      setEndDate(newEnd);
    }
  }, [endDate]);

  const handleSave = async () => {
    if (!validateName(name)) return;

    if (endDate < startDate) {
      Alert.alert('Invalid dates', 'End date must be on or after start date.');
      return;
    }

    setIsSaving(true);
    try {
      createTrip({
        name: name.trim(),
        currency,
        startDate: toDateOnly(startDate),
        endDate: toDateOnly(endDate),
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save the trip. Please try again.');
      console.error('[CreateTripScreen] Failed to create trip:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Trip</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Save trip"
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Trip Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trip Details</Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Trip Name *</Text>
              <TextInput
                style={[styles.textInput, nameError ? styles.textInputError : null]}
                placeholder="e.g. Summer Europe Trip"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (nameError) validateName(text);
                }}
                onBlur={() => validateName(name)}
                maxLength={100}
                returnKeyType="done"
                autoCorrect={false}
              />
              {nameError ? (
                <Text style={styles.errorText}>{nameError}</Text>
              ) : null}
              <Text style={styles.charCount}>{name.length}/100</Text>
            </View>

            {/* Currency Picker */}
            <CurrencyPicker
              label="Currency"
              value={currency}
              onChange={setCurrency}
            />
          </View>

          {/* Dates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dates</Text>

            <DatePicker
              label="Start Date"
              value={startDate}
              maximumDate={endDate}
              onChange={handleStartDateChange}
            />

            <DatePicker
              label="End Date"
              value={endDate}
              minimumDate={startDate}
              onChange={setEndDate}
            />
          </View>

          {/* Summary Card */}
          {name.trim().length > 0 && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Preview</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Trip:</Text>
                <Text style={styles.summaryValue}>{name.trim()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Currency:</Text>
                <Text style={styles.summaryValue}>{currency}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>From:</Text>
                <Text style={styles.summaryValue}>
                  {startDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>To:</Text>
                <Text style={styles.summaryValue}>
                  {endDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  cancelButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textInputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  charCount: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});