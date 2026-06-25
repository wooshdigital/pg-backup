import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTrips } from '../hooks/useTrips';
import { DatePicker } from '../components/common/DatePicker';
import { CurrencyPicker } from '../components/trips/CurrencyPicker';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const today = () => new Date();
const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
};

export const CreateTripScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { addTrip } = useTrips();

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [startDate, setStartDate] = useState<Date>(today());
  const [endDate, setEndDate] = useState<Date>(tomorrow());
  const [nameError, setNameError] = useState('');

  const handleSave = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError('Trip name is required.');
      return;
    }

    if (endDate < startDate) {
      Alert.alert('Invalid Dates', 'End date must be on or after start date.');
      return;
    }

    setNameError('');
    addTrip({
      name: trimmedName,
      currency,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Trip</Text>
            <Text style={styles.headerSubtitle}>
              Set up your trip details to start tracking shared expenses.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Trip Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Trip Name</Text>
              <TextInput
                style={[styles.textInput, nameError ? styles.textInputError : null]}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (text.trim()) setNameError('');
                }}
                placeholder="e.g. Japan Summer 2026"
                placeholderTextColor="#9CA3AF"
                returnKeyType="done"
                autoFocus
                accessibilityLabel="Trip name"
              />
              {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}
            </View>

            {/* Currency */}
            <CurrencyPicker value={currency} onChange={setCurrency} />

            {/* Date Range */}
            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(d) => {
                    setStartDate(d);
                    if (d > endDate) setEndDate(d);
                  }}
                />
              </View>
              <View style={styles.dateSeparator}>
                <Text style={styles.dateSeparatorText}>→</Text>
              </View>
              <View style={styles.dateField}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  minimumDate={startDate}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
            onPress={handleSave}
          >
            <Text style={styles.saveText}>Create Trip</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  header: {
    marginBottom: 28,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  form: {
    gap: 4,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  textInputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 4,
  },
  dateField: {
    flex: 1,
  },
  dateSeparator: {
    paddingBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSeparatorText: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#fff',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#4F6EF7',
    alignItems: 'center',
    shadowColor: '#4F6EF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.55,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },
});