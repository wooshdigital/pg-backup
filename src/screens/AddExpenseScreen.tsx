import React, { useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTrip } from '../context/TripContext';
import { useParticipants } from '../hooks/useParticipants';
import { useExpenses } from '../hooks/useExpenses';
import { useExpenseForm } from '../hooks/useExpenseForm';
import { SplitTypeToggle } from '../components/expenses/SplitTypeToggle';
import { CustomSplitInput } from '../components/expenses/CustomSplitInput';
import { SplitBalanceIndicator } from '../components/expenses/SplitBalanceIndicator';
import { Split } from '../utils/splitCalculator';
import { ExpenseFormValues } from '../hooks/useExpenseForm';

type RootStackParamList = {
  AddExpense: { tripId: string; expenseId?: string };
};

type AddExpenseRouteProp = RouteProp<RootStackParamList, 'AddExpense'>;
type AddExpenseNavProp = NativeStackNavigationProp<RootStackParamList, 'AddExpense'>;

export function AddExpenseScreen() {
  const navigation = useNavigation<AddExpenseNavProp>();
  const route = useRoute<AddExpenseRouteProp>();
  const { tripId, expenseId } = route.params;

  const { trip } = useTrip();
  const { participants } = useParticipants(tripId);
  const { expenses, addExpense, updateExpense } = useExpenses(tripId);

  const isEditing = !!expenseId;
  const existingExpense = isEditing
    ? expenses.find((e) => e.id === expenseId) ?? null
    : null;

  const handleFormSubmit = useCallback(
    (values: ExpenseFormValues, splits: Split[]) => {
      const amount = parseFloat(values.amount);
      const expenseData = {
        description: values.description.trim(),
        amount,
        currency: values.currency,
        paidById: values.paidById,
        splits: splits.map((s) => ({
          participantId: s.participantId,
          amount: s.amount,
        })),
        date: existingExpense?.date ?? new Date().toISOString(),
      };

      if (isEditing && expenseId) {
        updateExpense({ ...expenseData, id: expenseId });
      } else {
        addExpense(expenseData);
      }
      navigation.goBack();
    },
    [isEditing, expenseId, existingExpense, addExpense, updateExpense, navigation]
  );

  const {
    step,
    values,
    setField,
    toggleParticipant,
    setCustomSplitAmount,
    autoAdjustLastParticipant,
    splitValidation,
    canProceed,
    handleNext,
    handleBack,
    handleSubmit,
  } = useExpenseForm({
    participants,
    tripCurrency: trip?.currency ?? 'USD',
    existingExpense,
    onSubmit: handleFormSubmit,
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Expense' : 'Add Expense',
    });
  }, [navigation, isEditing]);

  const { diff } = splitValidation();
  const totalAmount = parseFloat(values.amount) || 0;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[styles.stepDot, s === step && styles.stepDotActive, s < step && styles.stepDotDone]}
            >
              <Text style={[styles.stepDotText, (s === step || s < step) && styles.stepDotTextActive]}>
                {s}
              </Text>
            </View>
          ))}
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step 1: Description & Amount */}
          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>Expense Details</Text>

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                value={values.description}
                onChangeText={(text) => setField('description', text)}
                placeholder="What was this expense for?"
                placeholderTextColor="#999"
                returnKeyType="next"
                autoFocus
              />

              <Text style={styles.label}>Amount</Text>
              <View style={styles.amountRow}>
                <View style={styles.currencyBadge}>
                  <Text style={styles.currencyBadgeText}>{values.currency}</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.amountInput]}
                  value={values.amount}
                  onChangeText={(text) => setField('amount', text)}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          )}

          {/* Step 2: Paid By */}
          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>Who Paid?</Text>
              {participants.map((participant) => (
                <TouchableOpacity
                  key={participant.id}
                  style={[
                    styles.participantRow,
                    values.paidById === participant.id && styles.participantRowSelected,
                  ]}
                  onPress={() => setField('paidById', participant.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: values.paidById === participant.id }}
                >
                  <View style={styles.radioOuter}>
                    {values.paidById === participant.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.participantName}>{participant.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Step 3: Split */}
          {step === 3 && (
            <View>
              <Text style={styles.stepTitle}>Split Between</Text>

              <SplitTypeToggle
                value={values.splitType}
                onChange={(type) => setField('splitType', type)}
              />

              {/* Participant selection */}
              <Text style={styles.sectionLabel}>Participants</Text>
              {participants.map((participant) => (
                <TouchableOpacity
                  key={participant.id}
                  style={[
                    styles.participantRow,
                    values.selectedParticipantIds.includes(participant.id) &&
                      styles.participantRowSelected,
                  ]}
                  onPress={() => toggleParticipant(participant.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked: values.selectedParticipantIds.includes(participant.id),
                  }}
                >
                  <View
                    style={[
                      styles.checkbox,
                      values.selectedParticipantIds.includes(participant.id) &&
                        styles.checkboxChecked,
                    ]}
                  >
                    {values.selectedParticipantIds.includes(participant.id) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.participantName}>{participant.name}</Text>
                </TouchableOpacity>
              ))}

              {/* Custom split inputs */}
              {values.splitType === 'custom' && values.selectedParticipantIds.length > 0 && (
                <View style={styles.customSplitSection}>
                  <Text style={styles.sectionLabel}>Custom Amounts</Text>
                  {values.customSplits
                    .filter((s) => values.selectedParticipantIds.includes(s.participantId))
                    .map((split) => {
                      const participant = participants.find(
                        (p) => p.id === split.participantId
                      );
                      if (!participant) return null;
                      return (
                        <CustomSplitInput
                          key={split.participantId}
                          participant={participant}
                          amount={split.amount}
                          currency={values.currency}
                          onChange={setCustomSplitAmount}
                        />
                      );
                    })}

                  <TouchableOpacity
                    style={styles.autoAdjustButton}
                    onPress={autoAdjustLastParticipant}
                  >
                    <Text style={styles.autoAdjustButtonText}>
                      Auto-adjust last participant
                    </Text>
                  </TouchableOpacity>

                  <SplitBalanceIndicator
                    total={totalAmount}
                    diff={diff}
                    currency={values.currency}
                  />
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Navigation buttons */}
        <View style={styles.footer}>
          {step > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.nextButton,
              !canProceed(step) && styles.nextButtonDisabled,
              step === 1 && styles.nextButtonFull,
            ]}
            onPress={step === 3 ? handleSubmit : handleNext}
            disabled={!canProceed(step)}
          >
            <Text style={styles.nextButtonText}>
              {step === 3 ? (isEditing ? 'Save Changes' : 'Add Expense') : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: '#2196F3',
  },
  stepDotDone: {
    backgroundColor: '#4CAF50',
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
  },
  stepDotTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  currencyBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  amountInput: {
    flex: 1,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  participantRowSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2196F3',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  participantName: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  customSplitSection: {
    marginTop: 8,
  },
  autoAdjustButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  autoAdjustButtonText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#2196F3',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});