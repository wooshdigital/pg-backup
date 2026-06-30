import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTripContext } from '../context/TripContext';
import { computeEqualSplits } from '../utils/splitCalculator';
import { AmountInput } from '../components/common/AmountInput';
import { StepIndicator } from '../components/expenses/StepIndicator';
import { PayerSelector } from '../components/expenses/PayerSelector';
import { ParticipantMultiSelect } from '../components/expenses/ParticipantMultiSelect';
import { SplitSummary } from '../components/expenses/SplitSummary';
import { generateId } from '../utils/id';
import { Expense } from '../types';

type RootStackParamList = {
  AddExpense: { tripId: string };
};

type AddExpenseRouteProp = RouteProp<RootStackParamList, 'AddExpense'>;

const TOTAL_STEPS = 3;

export function AddExpenseScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<AddExpenseRouteProp>();
  const { tripId } = route.params;
  const { state, dispatch } = useTripContext();

  const trip = state.trips.find((t) => t.id === tripId);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(todayIso());
  const [payerId, setPayerId] = useState<string | null>(
    trip?.participants[0]?.id ?? null
  );
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>(
    trip?.participants.map((p) => p.id) ?? []
  );

  // ── Errors ──────────────────────────────────────────────────────────────────
  const [titleError, setTitleError] = useState('');
  const [amountError, setAmountError] = useState('');

  if (!trip) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.errorText}>Trip not found.</Text>
      </SafeAreaView>
    );
  }

  const currency = trip.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  const amount = parseFloat(amountStr) || 0;
  const splits = computeEqualSplits(amount, selectedParticipantIds);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateStep0 = () => {
    let valid = true;
    if (!title.trim()) {
      setTitleError('Title is required');
      valid = false;
    } else {
      setTitleError('');
    }
    if (!amountStr || parseFloat(amountStr) <= 0) {
      setAmountError('Enter a valid amount');
      valid = false;
    } else {
      setAmountError('');
    }
    return valid;
  };

  const validateStep1 = () => {
    if (!payerId) {
      Alert.alert('Select Payer', 'Please select who paid for this expense.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (selectedParticipantIds.length === 0) {
      Alert.alert('Select Participants', 'Please select at least one participant.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
    else navigation.goBack();
  };

  const handleSave = () => {
    if (!validateStep2()) return;

    const expense: Expense = {
      id: generateId(),
      tripId,
      title: title.trim(),
      amount,
      currency,
      date,
      payerId: payerId!,
      splitType: 'equal',
      splits,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'TRIP_ADD_EXPENSE', payload: { tripId, expense } });
    navigation.goBack();
  };

  const toggleParticipant = useCallback((id: string) => {
    setSelectedParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }, []);

  // ── Render steps ─────────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Expense Details</Text>
            <Text style={styles.stepSubtitle}>What did you spend on?</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={[styles.textInput, !!titleError && styles.textInputError]}
                value={title}
                onChangeText={(t) => {
                  setTitle(t);
                  if (t.trim()) setTitleError('');
                }}
                placeholder="e.g. Dinner, Hotel, Taxi..."
                placeholderTextColor="#9CA3AF"
                returnKeyType="next"
              />
              {!!titleError && <Text style={styles.errorMsg}>{titleError}</Text>}
            </View>

            <AmountInput
              label="Amount"
              value={amountStr}
              onChangeText={(v) => {
                setAmountStr(v);
                if (parseFloat(v) > 0) setAmountError('');
              }}
              currencySymbol={currencySymbol}
              error={amountError}
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.textInput}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                keyboardType={Platform.OS === 'ios' ? 'default' : 'default'}
              />
              <Text style={styles.hint}>Format: YYYY-MM-DD</Text>
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Who Paid?</Text>
            <Text style={styles.stepSubtitle}>Select the person who paid for this expense.</Text>
            <PayerSelector
              participants={trip.participants}
              selectedPayerId={payerId}
              onSelect={setPayerId}
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Split Between</Text>
            <Text style={styles.stepSubtitle}>
              Select who shares this expense. Cost is split equally.
            </Text>
            <ParticipantMultiSelect
              participants={trip.participants}
              selectedIds={selectedParticipantIds}
              onToggle={toggleParticipant}
            />
            <View style={styles.splitPreview}>
              <SplitSummary
                splits={splits}
                participants={trip.participants}
                currency={currency}
              />
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>
            {step === 0 ? '✕' : '← Back'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Expense</Text>
        <View style={styles.backBtn} />
      </View>

      <StepIndicator totalSteps={TOTAL_STEPS} currentStep={step} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {step < TOTAL_STEPS - 1 ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
            <Text style={styles.primaryBtnText}>Next →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
            <Text style={styles.primaryBtnText}>Save Expense</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
  };
  return symbols[currency] ?? currency;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  backBtn: {
    width: 70,
  },
  backBtnText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  stepContent: {
    gap: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: -12,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  textInputError: {
    borderColor: '#EF4444',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  errorMsg: {
    fontSize: 12,
    color: '#EF4444',
  },
  splitPreview: {
    marginTop: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  primaryBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#EF4444',
    fontSize: 16,
  },
});