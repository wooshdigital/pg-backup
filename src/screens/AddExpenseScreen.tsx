import React, { useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';
import { useExpenseForm } from '../hooks/useExpenseForm';
import { CURRENCIES } from '../constants/currencies';
import { SplitTypeToggle } from '../components/expenses/SplitTypeToggle';
import { CustomSplitInput } from '../components/expenses/CustomSplitInput';
import { SplitBalanceIndicator } from '../components/expenses/SplitBalanceIndicator';

// Inline simple components to keep the file self-contained
import {
  TextInput,
  View as RNView,
  Text as RNText,
  TouchableOpacity as RNTO,
  StyleSheet as SS,
} from 'react-native';

type AddExpenseRouteProp = RouteProp<RootStackParamList, 'AddExpense'>;
type AddExpenseNavProp = NativeStackNavigationProp<RootStackParamList, 'AddExpense'>;

export default function AddExpenseScreen() {
  const navigation = useNavigation<AddExpenseNavProp>();
  const route = useRoute<AddExpenseRouteProp>();
  const { tripId, expenseId } = route.params;

  const {
    step,
    values,
    errors,
    participants,
    existingExpense,
    splitDiff,
    setValue,
    handleParticipantToggle,
    handleSplitTypeChange,
    handleCustomSplitChange,
    handleAutoAdjustLast,
    goNext,
    goBack,
    handleSubmit,
  } = useExpenseForm(tripId, expenseId);

  const isEditing = !!expenseId;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Expense' : 'Add Expense',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>Cancel</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isEditing]);

  const onSubmit = useCallback(async () => {
    const success = await handleSubmit();
    if (success) {
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Please fix the errors before saving.');
    }
  }, [handleSubmit, navigation]);

  const selectedParticipants = participants.filter((p) =>
    values.selectedParticipantIds.includes(p.id)
  );

  // ── Step Indicator ──────────────────────────────────────────────
  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((s) => (
        <View key={s} style={styles.stepRow}>
          <View style={[styles.stepDot, s === step && styles.stepDotActive, s < step && styles.stepDotDone]}>
            <Text style={[styles.stepDotText, (s === step || s < step) && styles.stepDotTextActive]}>
              {s < step ? '✓' : s}
            </Text>
          </View>
          {s < 3 && <View style={[styles.stepLine, s < step && styles.stepLineDone]} />}
        </View>
      ))}
    </View>
  );

  // ── Step 1: Details ─────────────────────────────────────────────
  const renderStep1 = () => (
    <ScrollView style={styles.stepContent} keyboardShouldPersistTaps="handled">
      <Text style={styles.stepTitle}>Expense Details</Text>

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, errors.description ? styles.inputError : null]}
        value={values.description}
        onChangeText={(v) => setValue('description', v)}
        placeholder="e.g. Dinner at Trattoria"
        placeholderTextColor="#94A3B8"
        returnKeyType="next"
        autoFocus
      />
      {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}

      <Text style={styles.label}>Amount *</Text>
      <View style={styles.amountRow}>
        <View style={styles.currencyPicker}>
          <Text style={styles.currencyText}>{values.currency}</Text>
        </View>
        <TextInput
          style={[styles.input, styles.amountInput, errors.amount ? styles.inputError : null]}
          value={values.amount}
          onChangeText={(v) => setValue('amount', v)}
          placeholder="0.00"
          placeholderTextColor="#94A3B8"
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
      </View>
      {errors.amount ? <Text style={styles.errorText}>{errors.amount}</Text> : null}

      <Text style={styles.label}>Currency</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyList}>
        {CURRENCIES.slice(0, 12).map((c) => (
          <TouchableOpacity
            key={c.code}
            style={[styles.currencyChip, values.currency === c.code && styles.currencyChipActive]}
            onPress={() => setValue('currency', c.code)}
          >
            <Text style={[styles.currencyChipText, values.currency === c.code && styles.currencyChipTextActive]}>
              {c.code}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        value={values.date}
        onChangeText={(v) => setValue('date', v)}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#94A3B8"
      />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        value={values.notes}
        onChangeText={(v) => setValue('notes', v)}
        placeholder="Optional notes..."
        placeholderTextColor="#94A3B8"
        multiline
        numberOfLines={3}
      />
    </ScrollView>
  );

  // ── Step 2: Paid By ─────────────────────────────────────────────
  const renderStep2 = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={styles.stepTitle}>Who Paid?</Text>
      {errors.paidById ? <Text style={styles.errorText}>{errors.paidById}</Text> : null}
      {participants.map((p) => {
        const isSelected = values.paidById === p.id;
        return (
          <TouchableOpacity
            key={p.id}
            style={[styles.participantRow, isSelected && styles.participantRowSelected]}
            onPress={() => setValue('paidById', p.id)}
          >
            <View style={[styles.avatar, { backgroundColor: p.avatarColor || '#6366F1' }]}>
              <Text style={styles.avatarText}>
                {p.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
              </Text>
            </View>
            <Text style={[styles.participantName, isSelected && styles.participantNameSelected]}>
              {p.name}
            </Text>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // ── Step 3: Split ────────────────────────────────────────────────
  const renderStep3 = () => {
    const total = parseFloat(values.amount) || 0;

    return (
      <ScrollView style={styles.stepContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.stepTitle}>Split Between</Text>

        {/* Split type toggle */}
        <SplitTypeToggle
          value={values.splitType}
          onChange={handleSplitTypeChange}
          style={styles.splitToggle}
        />

        {/* Participant selection */}
        <Text style={styles.subLabel}>Participants</Text>
        {errors.selectedParticipantIds ? (
          <Text style={styles.errorText}>{errors.selectedParticipantIds}</Text>
        ) : null}

        {participants.map((p) => {
          const isSelected = values.selectedParticipantIds.includes(p.id);
          return (
            <TouchableOpacity
              key={p.id}
              style={[styles.participantRow, isSelected && styles.participantRowSelected]}
              onPress={() => handleParticipantToggle(p.id)}
            >
              <View style={[styles.avatar, { backgroundColor: p.avatarColor || '#6366F1' }]}>
                <Text style={styles.avatarText}>
                  {p.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                </Text>
              </View>
              <Text style={[styles.participantName, isSelected && styles.participantNameSelected]}>
                {p.name}
              </Text>
              {values.splitType === 'equal' && isSelected && (
                <Text style={styles.equalAmount}>
                  {values.currency}{' '}
                  {selectedParticipants.length > 0
                    ? (total / selectedParticipants.length).toFixed(2)
                    : '0.00'}
                </Text>
              )}
              {isSelected && values.splitType !== 'custom' && (
                <Text style={styles.checkmark}>✓</Text>
              )}
              {!isSelected && <View style={styles.unchecked} />}
            </TouchableOpacity>
          );
        })}

        {/* Custom split inputs */}
        {values.splitType === 'custom' && selectedParticipants.length > 0 && (
          <View style={styles.customSplitSection}>
            <View style={styles.customSplitHeader}>
              <Text style={styles.subLabel}>Enter Amounts</Text>
              <TouchableOpacity onPress={handleAutoAdjustLast} style={styles.autoAdjustBtn}>
                <Text style={styles.autoAdjustText}>Auto-adjust last</Text>
              </TouchableOpacity>
            </View>

            <SplitBalanceIndicator
              diff={splitDiff}
              currency={values.currency}
            />

            {selectedParticipants.map((p) => {
              const split = values.customSplits.find((s) => s.participantId === p.id) || {
                participantId: p.id,
                amount: 0,
              };
              return (
                <CustomSplitInput
                  key={p.id}
                  participant={p}
                  split={split}
                  currency={values.currency}
                  onChangeAmount={handleCustomSplitChange}
                />
              );
            })}

            {errors.customSplits ? (
              <Text style={styles.errorText}>{errors.customSplits}</Text>
            ) : null}
          </View>
        )}
      </ScrollView>
    );
  };

  // ── Navigation Buttons ───────────────────────────────────────────
  const renderNavButtons = () => {
    const isLastStep = step === 3;
    const canSaveCustom =
      !isLastStep || values.splitType !== 'custom' || splitDiff === 0;

    return (
      <View style={styles.navButtons}>
        {step > 1 && (
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.nextBtn,
            isLastStep && !canSaveCustom && styles.nextBtnDisabled,
            step === 1 && styles.nextBtnFull,
          ]}
          onPress={isLastStep ? onSubmit : goNext}
          disabled={isLastStep && !canSaveCustom}
        >
          <Text style={styles.nextBtnText}>
            {isLastStep ? (isEditing ? 'Save Changes' : 'Add Expense') : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {renderStepIndicator()}

        <View style={styles.flex}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </View>

        {renderNavButtons()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBtn: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  headerBtnText: {
    color: '#6366F1',
    fontSize: 16,
  },

  // Step indicator
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: '#6366F1',
  },
  stepDotDone: {
    backgroundColor: '#22C55E',
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  stepDotTextActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  stepLineDone: {
    backgroundColor: '#22C55E',
  },

  // Step content
  stepContent: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 24,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  amountRow: {
    flexDirection: 'row',
    gap: 8,
  },
  currencyPicker: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  amountInput: {
    flex: 1,
  },
  currencyList: {
    marginTop: 8,
    marginBottom: 4,
  },
  currencyChip: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  currencyChipActive: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  currencyChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  currencyChipTextActive: {
    color: '#6366F1',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },

  // Participant rows
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  participantRowSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#FAFAFE',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  participantName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
  },
  participantNameSelected: {
    color: '#1E293B',
    fontWeight: '600',
  },
  equalAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366F1',
    marginRight: 8,
  },
  checkmark: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '700',
  },
  unchecked: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },

  // Custom split
  splitToggle: {
    marginBottom: 8,
  },
  customSplitSection: {
    marginTop: 16,
  },
  customSplitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  autoAdjustBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  autoAdjustText: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '600',
  },

  // Nav buttons
  navButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  backBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  nextBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#6366F1',
  },
  nextBtnFull: {
    flex: 1,
  },
  nextBtnDisabled: {
    backgroundColor: '#A5B4FC',
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});