import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { TextInput } from '../components/TextInput';
import { NativeSelect } from '../components/NativeSelect';
import { Checkbox } from '../components/Checkbox';
import { SplitTypeToggle } from '../components/expenses/SplitTypeToggle';
import { CustomSplitInput } from '../components/expenses/CustomSplitInput';
import { SplitBalanceIndicator } from '../components/expenses/SplitBalanceIndicator';
import { useExpenseForm } from '../hooks/useExpenseForm';
import { CURRENCIES } from '../constants/currencies';

type AddExpenseRouteParams = {
  AddExpense: {
    tripId: string;
    expenseId?: string;
  };
};

type AddExpenseRouteProp = RouteProp<AddExpenseRouteParams, 'AddExpense'>;

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'food', label: 'Food & Drinks' },
  { value: 'transport', label: 'Transport' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'activities', label: 'Activities' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'health', label: 'Health' },
  { value: 'other', label: 'Other' },
];

export const AddExpenseScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<AddExpenseRouteProp>();
  const { tripId, expenseId } = route.params;

  const {
    step,
    values,
    errors,
    isEditing,
    participants,
    setValue,
    setCustomSplitAmount,
    applyAutoAdjust,
    getCustomSplitDiff,
    nextStep,
    prevStep,
    submit,
  } = useExpenseForm({
    tripId,
    expenseId,
    onSuccess: () => navigation.goBack(),
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Expense' : 'Add Expense',
    });
  }, [navigation, isEditing]);

  const currencySymbol =
    CURRENCIES.find((c) => c.code === values.currency)?.symbol ?? '$';

  const { diff } = getCustomSplitDiff();

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((s) => (
        <View key={s} style={styles.stepDotWrapper}>
          <View
            style={[
              styles.stepDot,
              step === s && styles.stepDotActive,
              step > s && styles.stepDotCompleted,
            ]}
          >
            <Text
              style={[
                styles.stepDotText,
                (step === s || step > s) && styles.stepDotTextActive,
              ]}
            >
              {s}
            </Text>
          </View>
          {s < 3 && (
            <View
              style={[styles.stepLine, step > s && styles.stepLineCompleted]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Expense Details</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          value={values.description}
          onChangeText={(val) => setValue('description', val)}
          placeholder="e.g. Dinner at restaurant"
          autoFocus
        />
        {errors.description ? (
          <Text style={styles.errorText}>{errors.description}</Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Amount *</Text>
        <TextInput
          value={values.amount}
          onChangeText={(val) => setValue('amount', val)}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
        {errors.amount ? (
          <Text style={styles.errorText}>{errors.amount}</Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Currency</Text>
        <NativeSelect
          value={values.currency}
          onValueChange={(val) => setValue('currency', val)}
          items={CURRENCIES.map((c) => ({
            value: c.code,
            label: `${c.code} (${c.symbol})`,
          }))}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Date</Text>
        <TextInput
          value={values.date}
          onChangeText={(val) => setValue('date', val)}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Category</Text>
        <NativeSelect
          value={values.category}
          onValueChange={(val) => setValue('category', val)}
          items={CATEGORIES}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Who Paid?</Text>
      {participants.map((p) => (
        <TouchableOpacity
          key={p.id}
          style={[
            styles.participantRow,
            values.paidBy === p.id && styles.participantRowSelected,
          ]}
          onPress={() => setValue('paidBy', p.id)}
          activeOpacity={0.7}
        >
          <View style={styles.radioOuter}>
            {values.paidBy === p.id && <View style={styles.radioInner} />}
          </View>
          <Text style={styles.participantName}>{p.name}</Text>
        </TouchableOpacity>
      ))}
      {errors.paidBy ? (
        <Text style={[styles.errorText, { marginTop: 8, marginLeft: 16 }]}>
          {errors.paidBy}
        </Text>
      ) : null}
    </View>
  );

  const renderStep3 = () => {
    const total = parseFloat(values.amount) || 0;

    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>Split Between</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Split Type</Text>
          <SplitTypeToggle
            value={values.splitType}
            onChange={(type) => {
              setValue('splitType', type);
              if (type === 'custom') {
                // Initialize custom splits from equal split when switching
                const equalAmount =
                  values.selectedParticipants.length > 0
                    ? (total / values.selectedParticipants.length).toFixed(2)
                    : '0.00';
                const initialSplits: Record<string, string> = {};
                values.selectedParticipants.forEach((id) => {
                  initialSplits[id] = equalAmount;
                });
                setValue('customSplits', initialSplits);
              }
            }}
            style={styles.splitToggle}
          />
        </View>

        <Text style={[styles.label, { marginBottom: 4, marginTop: 8 }]}>
          Participants
        </Text>

        {participants.map((p) => (
          <View key={p.id} style={styles.participantCheckRow}>
            <Checkbox
              checked={values.selectedParticipants.includes(p.id)}
              onPress={() => {
                const next = values.selectedParticipants.includes(p.id)
                  ? values.selectedParticipants.filter((id) => id !== p.id)
                  : [...values.selectedParticipants, p.id];
                setValue('selectedParticipants', next);

                // Update customSplits when toggling
                if (values.splitType === 'custom') {
                  const newSplits = { ...values.customSplits };
                  if (!next.includes(p.id)) {
                    delete newSplits[p.id];
                  } else if (!newSplits[p.id]) {
                    newSplits[p.id] = '0.00';
                  }
                  setValue('customSplits', newSplits);
                }
              }}
              label={p.name}
            />
          </View>
        ))}

        {errors.selectedParticipants ? (
          <Text style={[styles.errorText, { marginTop: 4 }]}>
            {errors.selectedParticipants}
          </Text>
        ) : null}

        {values.splitType === 'custom' &&
          values.selectedParticipants.length > 0 && (
            <View style={styles.customSplitSection}>
              <Text style={[styles.label, { marginBottom: 0 }]}>
                Custom Amounts
              </Text>
              <View style={styles.customSplitList}>
                {values.selectedParticipants.map((id) => {
                  const participant = participants.find((p) => p.id === id);
                  if (!participant) return null;
                  return (
                    <CustomSplitInput
                      key={id}
                      participantId={id}
                      name={participant.name}
                      amount={values.customSplits[id] ?? '0.00'}
                      onChangeAmount={setCustomSplitAmount}
                      currencySymbol={currencySymbol}
                    />
                  );
                })}
              </View>

              <SplitBalanceIndicator
                diff={diff}
                currencySymbol={currencySymbol}
              />

              <TouchableOpacity
                style={styles.autoAdjustButton}
                onPress={applyAutoAdjust}
                activeOpacity={0.7}
              >
                <Text style={styles.autoAdjustText}>
                  Auto-adjust last person
                </Text>
              </TouchableOpacity>

              {errors.customSplits ? (
                <Text style={[styles.errorText, { marginHorizontal: 16 }]}>
                  {errors.customSplits}
                </Text>
              ) : null}
            </View>
          )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={prevStep}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        {step < 3 ? (
          <TouchableOpacity
            style={[styles.nextButton, step === 1 && styles.nextButtonFull]}
            onPress={nextStep}
            activeOpacity={0.7}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={submit}
            activeOpacity={0.7}
          >
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Save Changes' : 'Add Expense'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  stepDotWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: '#007AFF',
  },
  stepDotCompleted: {
    backgroundColor: '#34C759',
  },
  stepDotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  stepDotTextActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#34C759',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  stepContent: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3C3C43',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  participantRowSelected: {
    backgroundColor: '#F0F8FF',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  participantName: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  participantCheckRow: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  splitToggle: {
    marginTop: 4,
  },
  customSplitSection: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  customSplitList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  autoAdjustButton: {
    margin: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  autoAdjustText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#007AFF',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#34C759',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AddExpenseScreen;