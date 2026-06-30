import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useTripContext } from '../context/TripContext';
import { AmountInput } from '../components/common/AmountInput';
import { StepIndicator } from '../components/expenses/StepIndicator';
import { PayerSelector } from '../components/expenses/PayerSelector';
import { ParticipantMultiSelect } from '../components/expenses/ParticipantMultiSelect';
import { SplitSummary } from '../components/expenses/SplitSummary';
import { computeEqualSplits, getEqualShareAmount } from '../utils/splitCalculator';
import { getCurrencySymbol } from '../utils/currency';
import { generateId } from '../utils/id';

type AddExpenseRouteProp = RouteProp<RootStackParamList, 'AddExpense'>;
type AddExpenseNavProp = NativeStackNavigationProp<RootStackParamList>;

const STEPS = ['Details', 'Payer', 'Split'];

export function AddExpenseScreen() {
  const navigation = useNavigation<AddExpenseNavProp>();
  const route = useRoute<AddExpenseRouteProp>();
  const { tripId } = route.params;

  const { getTripById, addExpense } = useTripContext();
  const trip = getTripById(tripId);

  const currencySymbol = getCurrencySymbol(trip?.currency || 'USD');

  // Step state
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1: Details
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));

  // Step 2: Payer
  const [payerId, setPayerId] = useState<string | null>(
    trip?.participants?.[0]?.id ?? null
  );

  // Step 3: Split participants
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>(
    trip?.participants?.map(p => p.id) ?? []
  );

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const amount = parseFloat(amountStr) || 0;
  const perPersonAmount =
    selectedParticipantIds.length > 0
      ? getEqualShareAmount(amount, selectedParticipantIds.length)
      : 0;

  const splits = computeEqualSplits(amount, selectedParticipantIds);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!title.trim()) newErrors.title = 'Title is required';
      if (!amountStr || parseFloat(amountStr) <= 0)
        newErrors.amount = 'Please enter a valid amount';
      if (!date) newErrors.date = 'Date is required';
    } else if (step === 1) {
      if (!payerId) newErrors.payer = 'Please select who paid';
    } else if (step === 2) {
      if (selectedParticipantIds.length === 0)
        newErrors.participants = 'Select at least one participant';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, amountStr, date, payerId, selectedParticipantIds]);

  const handleNext = useCallback(() => {
    if (!validateStep(currentStep)) return;
    setCurrentStep(prev => prev + 1);
  }, [currentStep, validateStep]);

  const handleBack = useCallback(() => {
    setCurrentStep(prev => prev - 1);
    setErrors({});
  }, []);

  const handleToggleParticipant = useCallback((participantId: string) => {
    setSelectedParticipantIds(prev =>
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  }, []);

  const handleSave = useCallback(() => {
    if (!validateStep(2)) return;
    if (!payerId) {
      Alert.alert('Error', 'Please select a payer');
      return;
    }

    const expense = {
      id: generateId(),
      tripId,
      title: title.trim(),
      amount,
      currency: trip?.currency || 'USD',
      date,
      payerId,
      splitType: 'equal' as const,
      splits,
      createdAt: new Date().toISOString(),
    };

    addExpense(tripId, expense);
    navigation.goBack();
  }, [validateStep, payerId, tripId, title, amount, trip, date, splits, addExpense, navigation]);

  const participants = trip?.participants || [];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <StepIndicator
        currentStep={currentStep}
        totalSteps={STEPS.length}
        stepLabels={STEPS}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Step 0: Details */}
        {currentStep === 0 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Expense Details</Text>
            <Text style={styles.stepSubtitle}>
              What did you spend money on?
            </Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Title</Text>
              <TextInput
                style={[styles.textInput, errors.title ? styles.textInputError : null]}
                value={title}
                onChangeText={text => {
                  setTitle(text);
                  if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                }}
                placeholder="e.g. Dinner, Hotel, Taxi..."
                placeholderTextColor="#9CA3AF"
                returnKeyType="next"
                autoFocus
              />
              {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
            </View>

            <AmountInput
              label="Amount"
              value={amountStr}
              onChangeValue={val => {
                setAmountStr(val);
                if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
              }}
              currencySymbol={currencySymbol}
              error={errors.amount}
            />

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Date</Text>
              <TextInput
                style={[styles.textInput, errors.date ? styles.textInputError : null]}
                value={date}
                onChangeText={text => {
                  setDate(text);
                  if (errors.date) setErrors(prev => ({ ...prev, date: '' }));
                }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />
              {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}
            </View>
          </View>
        )}

        {/* Step 1: Payer */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Who paid?</Text>
            <Text style={styles.stepSubtitle}>
              Select the person who paid {currencySymbol}{amount.toFixed(2)}
            </Text>
            {errors.payer ? (
              <Text style={[styles.errorText, styles.errorTextCenter]}>{errors.payer}</Text>
            ) : null}
            <PayerSelector
              participants={participants}
              selectedPayerId={payerId}
              onSelect={id => {
                setPayerId(id);
                if (errors.payer) setErrors(prev => ({ ...prev, payer: '' }));
              }}
            />
          </View>
        )}

        {/* Step 2: Split participants */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Split between</Text>
            <Text style={styles.stepSubtitle}>
              Who's sharing this expense?
            </Text>
            {errors.participants ? (
              <Text style={[styles.errorText, styles.errorTextCenter]}>
                {errors.participants}
              </Text>
            ) : null}
            <ParticipantMultiSelect
              participants={participants}
              selectedIds={selectedParticipantIds}
              onToggle={id => {
                handleToggleParticipant(id);
                if (errors.participants)
                  setErrors(prev => ({ ...prev, participants: '' }));
              }}
              perPersonAmount={perPersonAmount}
              currencySymbol={currencySymbol}
            />
            {selectedParticipantIds.length > 0 && (
              <SplitSummary
                splits={splits}
                participants={participants}
                totalAmount={amount}
                currencySymbol={currencySymbol}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.footer}>
        {currentStep > 0 ? (
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        )}

        {currentStep < STEPS.length - 1 ? (
          <Pressable style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next →</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Expense</Text>
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
  },
  field: {
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
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  textInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  errorTextCenter: {
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    backgroundColor: '#6366F1',
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: '#6366F1',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AddExpenseScreen;