import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTrips } from '../hooks/useTrips';
import { DatePicker } from '../components/common/DatePicker';
import { CurrencyPicker } from '../components/trips/CurrencyPicker';

export const CreateTripScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { addTrip } = useTrips();

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Trip name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Trip name must be at least 2 characters';
    }

    if (!currency) {
      newErrors.currency = 'Please select a currency';
    }

    if (startDate && endDate && startDate > endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = useCallback(async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const today = new Date();
      addTrip({
        name: name.trim(),
        currency,
        startDate: (startDate ?? today).toISOString(),
        endDate: (endDate ?? today).toISOString(),
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create trip. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [name, currency, startDate, endDate, addTrip, navigation]);

  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
    if (errors.endDate) {
      setErrors((prev) => ({ ...prev, endDate: '' }));
    }
    // Auto-adjust end date if it's before start date
    if (endDate && date > endDate) {
      setEndDate(date);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={88}
      >
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.headerButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Trip</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.headerButton, styles.saveButton]}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Save trip"
          >
            {saving ? (
              <ActivityIndicator size="small" color="#6366F1" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Trip Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Trip Name *</Text>
            <TextInput
              style={[styles.textInput, errors.name ? styles.inputError : null]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Summer Europe Trip"
              placeholderTextColor="#9CA3AF"
              maxLength={60}
              returnKeyType="done"
              accessibilityLabel="Trip name"
              autoFocus
            />
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
          </View>

          {/* Currency */}
          <View style={errors.currency ? styles.fieldError : undefined}>
            <CurrencyPicker
              value={currency}
              onChange={(code) => {
                setCurrency(code);
                if (errors.currency)
                  setErrors((prev) => ({ ...prev, currency: '' }));
              }}
              label="Currency *"
            />
            {errors.currency ? (
              <Text style={styles.errorText}>{errors.currency}</Text>
            ) : null}
          </View>

          {/* Date Section */}
          <View style={styles.sectionDivider}>
            <Text style={styles.sectionLabel}>Trip Dates</Text>
            <Text style={styles.sectionHint}>Optional — you can set these later</Text>
          </View>

          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={handleStartDateChange}
            maximumDate={endDate ?? undefined}
          />

          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(date) => {
              setEndDate(date);
              if (errors.endDate)
                setErrors((prev) => ({ ...prev, endDate: '' }));
            }}
            minimumDate={startDate ?? undefined}
          />
          {errors.endDate ? (
            <Text style={[styles.errorText, styles.errorTextSpaced]}>
              {errors.endDate}
            </Text>
          ) : null}

          {/* Preview Card */}
          {name.trim() ? (
            <View style={styles.previewCard}>
              <Text style={styles.previewLabel}>Preview</Text>
              <View style={styles.previewContent}>
                <Text style={styles.previewName}>{name.trim()}</Text>
                <Text style={styles.previewMeta}>{currency}</Text>
                {startDate && (
                  <Text style={styles.previewMeta}>
                    {startDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {endDate
                      ? ` – ${endDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}`
                      : ''}
                  </Text>
                )}
              </View>
            </View>
          ) : null}
        </ScrollView>

        {/* Bottom Save Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.createButton, saving && styles.createButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Create trip"
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.createButtonIcon}>✈️</Text>
                <Text style={styles.createButtonText}>Create Trip</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  headerButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    minWidth: 60,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveButton: {
    alignItems: 'flex-end',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  fieldError: {
    // wrapper for field with error styling if needed
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  errorTextSpaced: {
    marginTop: -8,
    marginBottom: 12,
  },
  sectionDivider: {
    marginTop: 8,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  sectionHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  previewCard: {
    marginTop: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  previewContent: {
    gap: 4,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  previewMeta: {
    fontSize: 14,
    color: '#6B7280',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  createButton: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonIcon: {
    fontSize: 18,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});