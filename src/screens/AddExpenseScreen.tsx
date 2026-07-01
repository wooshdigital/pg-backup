import React, { useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { TripContext } from '../context/TripContext';
import { useExpenseForm } from '../hooks/useExpenseForm';
import { SplitTypeToggle } from '../components/expenses/SplitTypeToggle';
import { CustomSplitInput } from '../components/expenses/CustomSplitInput';
import { SplitBalanceIndicator } from '../components/expenses/SplitBalanceIndicator';
import { getAvatarColor } from '../utils/avatarColors';

type AddExpenseRouteParams = {
  AddExpense: {
    tripId: string;
    expenseId?: string;
  };
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const AddExpenseScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<AddExpenseRouteParams, 'AddExpense'>>();
  const { tripId, expenseId } = route.params;

  const { state } = useContext(TripContext);
  const trip = state.trips.find(t => t.id === tripId);

  const existingExpense = useMemo(() => {
    if (!expenseId || !trip) return null;
    return trip.expenses?.find(e => e.id === expenseId) ?? null;
  }, [expenseId, trip]);

  const participantIds = useMemo(
    () => trip?.participants?.map(p => p.id) ?? [],
    [trip]
  );

  const {
    step,
    values,
    errors,
    isEditing,
    updateValue,
    handleParticipantToggle,
    handleSplitTypeChange,
    handleCustomSplitChange,
    handleAutoAdjust,
    nextStep,
    prevStep,
    handleSubmit,
  } = useExpenseForm({
    tripId,
    existingExpense,
    defaultCurrency: trip?.currency ?? 'USD',
    participantIds,
    onSuccess: () => navigation.goBack(),
  });

  if (!trip) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Trip not found</Text>
      </View>
    );
  }

  const participants = trip.participants ?? [];
  const totalAmount = parseFloat(values.amount) || 0;

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Expense Details</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <View style={[styles.inputWrapper, errors.description ? styles.inputError : null]}>
          <Text style={styles.inputPrefix}>📝</Text>
          <View style={styles.textInputContainer}>
            <Text
              style={[styles.fakeInput, !values.description && styles.placeholder]}
              onPress={() => {
                Alert.prompt(
                  'Description',
                  'Enter expense description',
                  (text) => updateValue('description', text || ''),
                  'plain-text',
                  values.description
                );
              }}
            >
              {values.description || 'e.g. Dinner at restaurant'}
            </Text>
          </View>
        </View>
        {errors.description ? (
          <Text style={styles.errorText}>{errors.description}</Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Amount</Text>
        <View style={[styles.inputWrapper, errors.amount ? styles.inputError : null]}>
          <Text style={styles.inputPrefix}>{values.currency}</Text>
          <View style={styles.textInputContainer}>
            <Text
              style={[styles.fakeInput, !values.amount && styles.placeholder]}
              onPress={() => {
                Alert.prompt(
                  'Amount',
                  'Enter the expense amount',
                  (text) => {
                    const cleaned = text?.replace(/[^0-9.]/g, '') ?? '';
                    updateValue('amount', cleaned);
                  },
                  'plain-text',
                  values.amount
                );
              }}
            >
              {values.amount || '0.00'}
            </Text>
          </View>
        </View>
        {errors.amount ? (
          <Text style={styles.errorText}>{errors.amount}</Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Paid by</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.paidByRow}>
            {participants.map(participant => {
              const isSelected = values.paidBy === participant.id;
              const color = getAvatarColor(participant.id);
              return (
                <TouchableOpacity
                  key={participant.id}
                  style={[styles.paidByChip, isSelected && { borderColor: color, backgroundColor: color + '15' }]}
                  onPress={() => updateValue('paidBy', participant.id)}
                >
                  <View style={[styles.chipAvatar, { backgroundColor: color }]}>
                    <Text style={styles.chipAvatarText}>{getInitials(participant.name)}</Text>
                  </View>
                  <Text style={[styles.chipName, isSelected && { color, fontWeight: '700' }]}>
                    {participant.name.split(' ')[0]}
                  </Text>
                  {isSelected && <Text style={[styles.chipCheck, { color }]}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
        {errors.paidBy ? (
          <Text style={styles.errorText}>{errors.paidBy}</Text>
        ) : null}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Who's Involved?</Text>
      <Text style={styles.stepSubtitle}>Select participants sharing this expense</Text>

      {errors.selectedParticipants ? (
        <Text style={styles.errorText}>{errors.selectedParticipants}</Text>
      ) : null}

      {participants.map(participant => {
        const isSelected = values.selectedParticipants.includes(participant.id);
        const color = getAvatarColor(participant.id);
        return (
          <TouchableOpacity
            key={participant.id}
            style={[styles.participantRow, isSelected && styles.participantRowSelected]}
            onPress={() => handleParticipantToggle(participant.id)}
          >
            <View style={[styles.participantAvatar, { backgroundColor: color }]}>
              <Text style={styles.participantAvatarText}>{getInitials(participant.name)}</Text>
            </View>
            <Text style={styles.participantName}>{participant.name}</Text>
            <View style={[styles.checkbox, isSelected && { backgroundColor: '#4F46E5', borderColor: '#4F46E5' }]}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderStep3 = () => {
    const selectedParticipantObjects = participants.filter(p =>
      values.selectedParticipants.includes(p.id)
    );

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>How to Split?</Text>

        <SplitTypeToggle
          value={values.splitType}
          onChange={handleSplitTypeChange}
        />

        {values.splitType === 'equal' ? (
          <View style={styles.equalSplitInfo}>
            <Text style={styles.equalSplitTitle}>Equal Split</Text>
            {selectedParticipantObjects.map((p, index) => {
              const split = values.customSplits.find(s => s.participantId === p.id);
              const displayAmount = totalAmount > 0
                ? (totalAmount / selectedParticipantObjects.length).toFixed(2)
                : '0.00';
              const color = getAvatarColor(p.id);
              return (
                <View key={p.id} style={styles.equalSplitRow}>
                  <View style={[styles.participantAvatar, { backgroundColor: color }]}>
                    <Text style={styles.participantAvatarText}>{getInitials(p.name)}</Text>
                  </View>
                  <Text style={styles.equalSplitName}>{p.name}</Text>
                  <Text style={styles.equalSplitAmount}>
                    {values.currency} {displayAmount}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View>
            <SplitBalanceIndicator
              splits={values.customSplits}
              total={totalAmount}
              currency={values.currency}
            />

            {selectedParticipantObjects.map((p, index) => {
              const split = values.customSplits.find(s => s.participantId === p.id);
              const amount = split?.amount ?? 0;
              const isLast = index === selectedParticipantObjects.length - 1;
              return (
                <CustomSplitInput
                  key={p.id}
                  participant={p}
                  amount={amount}
                  currency={values.currency}
                  onChange={handleCustomSplitChange}
                />
              );
            })}

            <TouchableOpacity
              style={styles.autoAdjustButton}
              onPress={handleAutoAdjust}
            >
              <Text style={styles.autoAdjustText}>
                ⚡ Auto-adjust last participant
              </Text>
            </TouchableOpacity>

            {errors.customSplits ? (
              <Text style={[styles.errorText, { marginTop: 8, textAlign: 'center' }]}>
                {errors.customSplits}
              </Text>
            ) : null}
          </View>
        )}
      </View>
    );
  };

  const stepTitles = ['Details', 'Participants', 'Split'];

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <Text style={styles.headerBackText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Expense' : 'Add Expense'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepIndicator}>
        {stepTitles.map((title, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === step;
          const isCompleted = stepNum < step;
          return (
            <React.Fragment key={stepNum}>
              {index > 0 && (
                <View style={[styles.stepLine, isCompleted && styles.stepLineCompleted]} />
              )}
              <View style={styles.stepDotContainer}>
                <View style={[
                  styles.stepDot,
                  isActive && styles.stepDotActive,
                  isCompleted && styles.stepDotCompleted,
                ]}>
                  <Text style={[
                    styles.stepDotText,
                    (isActive || isCompleted) && styles.stepDotTextActive,
                  ]}>
                    {isCompleted ? '✓' : stepNum}
                  </Text>
                </View>
                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                  {title}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        {step > 1 ? (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}

        {step < 3 ? (
          <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
            <Text style={styles.nextButtonText}>Next →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              {isEditing ? '✓ Save Changes' : '✓ Add Expense'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerBack: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackText: {
    fontSize: 18,
    color: '#6B7280',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  headerRight: {
    width: 36,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stepDotContainer: {
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepDotActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  stepDotCompleted: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  stepDotTextActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 6,
    marginBottom: 20,
  },
  stepLineCompleted: {
    backgroundColor: '#059669',
  },
  stepLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  stepLabelActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  stepContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputPrefix: {
    fontSize: 16,
    marginRight: 10,
    color: '#6B7280',
  },
  textInputContainer: {
    flex: 1,
  },
  fakeInput: {
    fontSize: 16,
    color: '#111827',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  paidByRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  paidByChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 50,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    gap: 7,
  },
  chipAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipAvatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chipName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  chipCheck: {
    fontSize: 13,
    fontWeight: '700',
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  participantRowSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  participantAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  participantAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  participantName: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  equalSplitInfo: {
    marginTop: 8,
  },
  equalSplitTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  equalSplitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  equalSplitName: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    marginLeft: 10,
  },
  equalSplitAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4F46E5',
  },
  autoAdjustButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C4B5FD',
  },
  autoAdjustText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 12,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AddExpenseScreen;