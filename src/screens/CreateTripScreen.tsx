import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTrips } from '../hooks/useTrips';
import { CurrencyPicker } from '../components/trips/CurrencyPicker';
import { DatePicker } from '../components/common/DatePicker';
import { DEFAULT_CURRENCY } from '../constants/currencies';

export function CreateTripScreen() {
  const navigation = useNavigation<any>();
  const { createTrip } = useTrips();

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY.code);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  });
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  const handleStartDateChange = useCallback((date: Date) => {
    setStartDate(date);
    if (date > endDate) {
      const newEnd = new Date(date);
      newEnd.setDate(newEnd.getDate() + 1);
      setEndDate(newEnd);
    }
  }, [endDate]);

  const handleSave = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Trip name is required.');
      return;
    }
    if (endDate < startDate) {
      Alert.alert('Invalid Dates', 'End date must be on or after start date.');
      return;
    }

    setSaving(true);
    try {
      createTrip({
        name: trimmedName,
        currency,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create trip. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [name, currency, startDate, endDate, createTrip, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Trip</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Save trip"
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
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
          {/* Trip name */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TRIP NAME</Text>
            <TextInput
              style={[styles.textInput, nameError ? styles.textInputError : undefined]}
              placeholder="e.g. Summer in Europe"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (v.trim()) setNameError('');
              }}
              maxLength={60}
              returnKeyType="done"
              autoFocus
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>

          {/* Currency */}
          <View style={styles.section}>
            <CurrencyPicker value={currency} onChange={setCurrency} />
          </View>

          {/* Dates */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DATES</Text>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={handleStartDateChange}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              minimumDate={startDate}
            />
          </View>

          {/* Summary card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📋 Summary</Text>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Trip: </Text>
              {name.trim() || '—'}
            </Text>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Currency: </Text>
              {currency}
            </Text>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>From: </Text>
              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>To: </Text>
              {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  } as ViewStyle,
  flex: {
    flex: 1,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  } as ViewStyle,
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  } as TextStyle,
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    minWidth: 60,
  } as ViewStyle,
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
  } as TextStyle,
  saveButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  } as ViewStyle,
  saveButtonDisabled: {
    opacity: 0.6,
  } as ViewStyle,
  saveText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  } as TextStyle,
  scroll: {
    flex: 1,
  } as ViewStyle,
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  } as ViewStyle,
  section: {
    marginBottom: 24,
  } as ViewStyle,
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as TextStyle,
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  } as TextStyle,
  textInputError: {
    borderColor: '#EF4444',
  } as ViewStyle,
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 4,
  } as TextStyle,
  summaryCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  } as ViewStyle,
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4338CA',
    marginBottom: 10,
  } as TextStyle,
  summaryText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  } as TextStyle,
  summaryLabel: {
    fontWeight: '600',
    color: '#111827',
  } as TextStyle,
});