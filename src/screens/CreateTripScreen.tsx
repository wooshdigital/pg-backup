import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTrips } from '../hooks/useTrips';
import { CURRENCIES } from '../constants/currencies';

export function CreateTripScreen() {
  const navigation = useNavigation();
  const { addTrip } = useTrips();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD');

  const handleCreate = () => {
    if (!name.trim()) return;
    addTrip({ name: name.trim(), description: description.trim(), currency });
    navigation.goBack();
  };

  const canSubmit = name.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Trip Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Summer Vacation 2025"
          placeholderTextColor="#8E8E93"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Optional description"
          placeholderTextColor="#8E8E93"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          returnKeyType="done"
        />

        <Text style={styles.label}>Currency</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.currencyRow}
        >
          {CURRENCIES.slice(0, 8).map((c) => (
            <TouchableOpacity
              key={c.code}
              style={[
                styles.currencyChip,
                currency === c.code && styles.currencyChipSelected,
              ]}
              onPress={() => setCurrency(c.code)}
            >
              <Text
                style={[
                  styles.currencyChipText,
                  currency === c.code && styles.currencyChipTextSelected,
                ]}
              >
                {c.code}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.createButton, !canSubmit && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!canSubmit}
        >
          <Text style={styles.createButtonText}>Create Trip</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flex: 1, backgroundColor: '#F2F2F7' },
  container: {
    padding: 20,
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C6C70',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  currencyRow: {
    gap: 8,
    paddingVertical: 4,
  },
  currencyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
  },
  currencyChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  currencyChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  currencyChipTextSelected: {
    color: '#FFFFFF',
  },
  createButton: {
    marginTop: 32,
    height: 52,
    backgroundColor: '#007AFF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default CreateTripScreen;