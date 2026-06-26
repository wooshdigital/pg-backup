import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useTrips } from '../hooks/useTrips';
import { CURRENCIES } from '../constants/currencies';

interface CreateTripScreenProps {
  navigation: any;
}

export function CreateTripScreen({ navigation }: CreateTripScreenProps) {
  const { addTrip } = useTrips();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD');

  const handleCreate = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a trip name.');
      return;
    }
    const trip = addTrip({
      name: name.trim(),
      description: description.trim(),
      currency,
    });
    navigation.goBack();
  }, [name, description, currency, addTrip, navigation]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.field}>
        <Text style={styles.label}>Trip Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Summer in Europe"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          returnKeyType="next"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Optional description..."
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Currency</Text>
        <View style={styles.currencyRow}>
          {['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'].map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.currencyChip,
                currency === c && styles.currencyChipActive,
              ]}
              onPress={() => setCurrency(c)}
            >
              <Text
                style={[
                  styles.currencyChipText,
                  currency === c && styles.currencyChipTextActive,
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, !name.trim() && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={!name.trim()}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Create Trip</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 88,
    paddingTop: 12,
  },
  currencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  currencyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  currencyChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  currencyChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  currencyChipTextActive: {
    color: '#6366F1',
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#C7D2FE',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});