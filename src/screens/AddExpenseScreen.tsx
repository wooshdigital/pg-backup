import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TripStackParamList } from '../navigation/TripStackNavigator';
import { useTripContext } from '../context/TripContext';
import { generateId } from '../utils/id';
import { computeEqualSplits } from '../utils/splitCalculator';
import { AmountInput } from '../components/common/AmountInput';
import { StepIndicator } from '../components/expenses/StepIndicator';
import { PayerSelector } from '../components/expenses/PayerSelector';
import { ParticipantMultiSelect } from '../components/expenses/ParticipantMultiSelect';
import { SplitSummary } from '../components/expenses/SplitSummary';

type Nav = NativeStackNavigationProp<TripStackParamList>;
type RouteType = RouteProp<TripStackParamList, 'AddExpense'>;

const TOTAL_STEPS = 3;

export function AddExpenseScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteType>();
  const { tripId } = route.params;
  const { getTrip, dispatch } = useTripContext();
  const trip = getTrip(tripId);

  const [step, setStep] = useState(0);

  // Step 1 state
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // Step 2 state
  const [payerId, setPayerId] = useState<string | null>(
    trip?.participants[0]?.id || null
  );

  // Step 3 state
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>(
    trip?.participants.map((p) => p.id) || []
  );

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Trip not found</Text>
      </SafeAreaView>
    );
  }

  const currency = trip.currency || 'USD';
  const amount = parseFloat(amountStr) || 0;

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!title.trim()) newErrors.title = 'Title is required';
      if (!amountStr || amount <= 0) newErrors.amount = 'Enter a valid amount';
      if (!date) newErrors.date = 'Date is required';
    } else if (step === 1) {
      if (!payerId) newErrors.payer = 'Please select a payer';
    } else if (step === 2) {
      if (selectedParticipantIds.length === 0) {
        newErrors.participants = 'Select at least one participant';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleToggleParticipant = (participantId: string) => {
    setSelectedParticipantIds((prev) =>
      prev.includes(participantId)
        ? prev.filter((id) => id !== participantId)
        : [...prev, participantId]
    );
  };

  const handleSave = () => {
    if (!validateStep()) return;
    if (!payerId) return;

    const splits = computeEqualSplits(amount, selectedParticipantIds);

    const expense = {
      id: generateId(),
      tripId,
      title: title.trim(),
      amount,
      currency,
      date,
      payerId,
      splitType: 'equal' as const,
      splits,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'TRIP_ADD_EXPENSE', payload: { tripId, expense } });
    navigation.goBack();
  };

  const splits = computeEqualSplits(amount, selectedParticipantIds);

  const stepTitles = ['Expense Details', 'Who Paid?', "Who's Involved?"];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>
              {step === 0 ? 'Cancel' : '← Back'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{stepTitles[step]}</Text>
          <View style={styles.headerRight} />
        </View>

        <StepIndicator steps={TOTAL_STEPS} currentStep={step} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step 0: Details */}
          {step === 0 && (
            <View style={styles.stepContent}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Title</Text>
                <TextInput
                  style={[styles.textInput, errors.title ? styles.textInputError : null]}
                  placeholder="e.g. Dinner at Trattoria"
                  placeholderTextColor="#9CA3AF"
                  value={title}
                  onChangeText={(t) => {
                    setTitle(t);
                    if (errors.title) setErrors((e) => ({ ...e, title: '' }));
                  }}
                  autoFocus
                />
                {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
              </View>

              <AmountInput
                label="Amount"
                value={amountStr}
                onChangeText={(v) => {
                  setAmountStr(v);
                  if (errors.amount) setErrors((e) => ({ ...e, amount: '' }));
                }}
                currency={currency}
                error={errors.amount}
              />

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Date</Text>
                <TextInput
                  style={[styles.textInput, errors.date ? styles.textInputError : null]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                  value={date}
                  onChangeText={(t) => {
                    setDate(t);
                    if (errors.date) setErrors((e) => ({ ...e, date: '' }));
                  }}
                  keyboardType="numbers-and-punctuation"
                />
                {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}
              </View>
            </View>
          )}

          {/* Step 1: Payer */}
          {step === 1 && (
            <View style={styles.stepContent}>
              {errors.payer ? (
                <Text style={[styles.errorText, styles.errorTextCentered]}>{errors.payer}</Text>
              ) : null}
              <PayerSelector
                participants={trip.participants}
                selectedPayerId={payerId}
                onSelect={(id) => {
                  setPayerId(id);
                  if (errors.payer) setErrors((e) => ({ ...e, payer: '' }));
                }}
              />
            </View>
          )}

          {/* Step 2: Participants + Preview */}
          {step === 2 && (
            <View style={styles.stepContent}>
              {errors.participants ? (
                <Text style={[styles.errorText, styles.errorTextCentered]}>
                  {errors.participants}
                </Text>
              ) : null}
              <ParticipantMultiSelect
                participants={trip.participants}
                selectedIds={selectedParticipantIds}
                onToggle={(id) => {
                  handleToggleParticipant(id);
                  if (errors.participants)
                    setErrors((e) => ({ ...e, participants: '' }));
                }}
              />
              {selectedParticipantIds.length > 0 && amount > 0 && (
                <SplitSummary
                  splits={splits}
                  participants={trip.participants}
                  currency={currency}
                  totalAmount={amount}
                />
              )}
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {step < TOTAL_STEPS - 1 ? (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Expense</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    minWidth: 70,
  },
  backButtonText: {
    fontSize: 15,
    color: '#6366F1',
    fontWeight: '500',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  headerRight: {
    minWidth: 70,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  stepContent: {
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  textInputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#EF4444',
  },
  errorTextCentered: {
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  nextButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});