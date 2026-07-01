import React, { useCallback } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { TextInput } from '../components/TextInput';
import { SplitTypeToggle } from '../components/expenses/SplitTypeToggle';
import { CustomSplitInput } from '../components/expenses/CustomSplitInput';
import { SplitBalanceIndicator } from '../components/expenses/SplitBalanceIndicator';
import { useTrip } from '../context/TripContext';
import { useExpenseForm } from '../hooks/useExpenseForm';
import { roundCurrency } from '../utils/splitCalculator';

interface RouteParams {
  tripId: string;
  expenseId?: string;
}

const STEPS = ['Details', 'Paid by', 'Split'];

export const AddExpenseScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { tripId, expenseId } = route.params as RouteParams;

  const { state } = useTrip();
  const trip = state.trips.find((t: any) => t.id === tripId);
  const participants = trip?.participants || [];

  const {
    step,
    values,
    isEditing,
    splitDifference,
    nextStep,
    prevStep,
    updateField,
    toggleParticipant,
    updateCustomSplit,
    handleSplitTypeChange,
    submit,
    canProceed,
  } = useExpenseForm({
    tripId,
    expenseId,
    onSuccess: () => navigation.goBack(),
  });

  const numericAmount = parseFloat(values.amount) || 0;

  const assignedTotal = values.selectedParticipantIds.reduce((sum: number, id: string) => {
    return sum + (parseFloat(values.customSplits[id] || '0') || 0);
  }, 0);

  const handleSubmit = useCallback(() => {
    if (!canProceed) return;
    if (step < 3) {
      nextStep();
    } else {
      submit();
    }
  }, [canProceed, step, nextStep, submit]);

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = step === stepNum;
        const isComplete = step > stepNum;
        return (
          <React.Fragment key={label}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isActive && styles.stepCircleActive,
                  isComplete && styles.stepCircleComplete,
                ]}
              >
                {isComplete ? (
                  <Text style={styles.stepCircleTextComplete}>✓</Text>
                ) : (
                  <Text style={[styles.stepCircleText, isActive && styles.stepCircleTextActive]}>
                    {stepNum}
                  </Text>
                )}
              </View>
              <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                {label}
              </Text>
            </View>
            {idx < STEPS.length - 1 && (
              <View style={[styles.stepLine, isComplete && styles.stepLineComplete]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Expense Details</Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Description *</Text>
        <TextInput
          value={values.description}
          onChangeText={(text) => updateField('description', text)}
          placeholder="e.g. Dinner at Trattoria"
          autoFocus={!isEditing}
          returnKeyType="next"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Amount *</Text>
        <View style={styles.amountRow}>
          <View style={styles.currencyBadge}>
            <Text style={styles.currencyBadgeText}>{values.currency}</Text>
          </View>
          <View style={styles.amountInputWrap}>
            <TextInput
              value={values.amount}
              onChangeText={(text) => updateField('amount', text)}
              placeholder="0.00"
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          </View>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Date</Text>
        <TextInput
          value={values.date}
          onChangeText={(text) => updateField('date', text)}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Category</Text>
        <TextInput
          value={values.category}
          onChangeText={(text) => updateField('category', text)}
          placeholder="e.g. Food, Transport, Accommodation"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Notes</Text>
        <TextInput
          value={values.notes}
          onChangeText={(text) => updateField('notes', text)}
          placeholder="Optional notes"
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Who Paid?</Text>
      <View style={styles.participantList}>
        {participants.map((p: any) => {
          const isSelected = values.paidById === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              style={[styles.participantRow, isSelected && styles.participantRowSelected]}
              onPress={() => updateField('paidById', p.id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
            >
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.participantName, isSelected && styles.participantNameSelected]}>
                {p.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep3 = () => {
    const lastParticipantId = values.selectedParticipantIds[values.selectedParticipantIds.length - 1];

    return (
      <View style={styles.stepContent}>
        <Text style={styles.sectionTitle}>How to Split?</Text>

        {numericAmount > 0 && (
          <Text style={styles.totalLabel}>
            Total: {values.currency} {numericAmount.toFixed(2)}
          </Text>
        )}

        <View style={styles.fieldGroup}>
          <SplitTypeToggle value={values.splitType} onChange={handleSplitTypeChange} />
        </View>

        <Text style={styles.subSectionTitle}>Include participants</Text>
        <View style={styles.participantList}>
          {participants.map((p: any) => {
            const isSelected = values.selectedParticipantIds.includes(p.id);
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.participantCheckRow, isSelected && styles.participantCheckRowSelected]}
                onPress={() => toggleParticipant(p.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.participantName, isSelected && styles.participantNameSelected]}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {values.splitType === 'custom' && values.selectedParticipantIds.length > 0 && (
          <View style={styles.customSplitsSection}>
            <Text style={styles.subSectionTitle}>Enter each person's share</Text>
            <Text style={styles.autoHint}>
              The last person's share is auto-calculated.
            </Text>

            {values.selectedParticipantIds.map((id: string, index: number) => {
              const participant = participants.find((p: any) => p.id === id);
              if (!participant) return null;
              const isLast = id === lastParticipantId;
              const amount = isLast
                ? Math.max(0, roundCurrency(numericAmount - values.selectedParticipantIds.slice(0, -1).reduce((sum: number, pid: string) => {
                    return sum + (parseFloat(values.customSplits[pid] || '0') || 0);
                  }, 0)))
                : parseFloat(values.customSplits[id] || '0') || 0;

              return (
                <CustomSplitInput
                  key={id}
                  participantId={id}
                  name={participant.name}
                  amount={amount}
                  currency={values.currency === 'USD' ? '$' : values.currency}
                  onChange={(pid, val) => updateCustomSplit(pid, val.toString())}
                  isLast={isLast}
                />
              );
            })}

            <SplitBalanceIndicator
              total={numericAmount}
              assigned={assignedTotal}
              currency={values.currency === 'USD' ? '$' : values.currency}
            />
          </View>
        )}

        {values.splitType === 'equal' && values.selectedParticipantIds.length > 0 && numericAmount > 0 && (
          <View style={styles.equalSplitPreview}>
            <Text style={styles.equalSplitPreviewText}>
              Each person pays:{' '}
              <Text style={styles.equalSplitAmount}>
                {values.currency === 'USD' ? '$' : values.currency}
                {roundCurrency(numericAmount / values.selectedParticipantIds.length).toFixed(2)}
              </Text>
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={88}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Expense' : 'Add Expense'}
        </Text>
      </View>

      {renderStepIndicator()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
          onPress={handleSubmit}
          disabled={!canProceed}
        >
          <Text style={styles.nextButtonText}>
            {step < 3 ? 'Next →' : isEditing ? 'Save Changes' : 'Add Expense'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  stepCircleComplete: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  stepCircleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  stepCircleTextActive: {
    color: '#6366F1',
  },
  stepCircleTextComplete: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
    marginHorizontal: 4,
  },
  stepLineComplete: {
    backgroundColor: '#10B981',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  stepContent: {
    padding: 20,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  fieldGroup: {
    marginBottom: 16,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currencyBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  currencyBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  amountInputWrap: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 8,
  },
  participantList: {
    gap: 6,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  participantRowSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#6366F1',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366F1',
  },
  participantCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  participantCheckRowSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#6366F1',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  participantName: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  participantNameSelected: {
    color: '#4338CA',
    fontWeight: '500',
  },
  customSplitsSection: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 2,
  },
  autoHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  equalSplitPreview: {
    marginTop: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  equalSplitPreviewText: {
    fontSize: 14,
    color: '#374151',
  },
  equalSplitAmount: {
    fontWeight: '700',
    color: '#4338CA',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#C7D2FE',
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AddExpenseScreen;