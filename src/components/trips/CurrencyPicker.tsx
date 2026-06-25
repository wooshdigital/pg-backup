import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { CURRENCIES } from '../../constants/currencies';
import { Currency } from '../../types';

interface CurrencyPickerProps {
  value: string;
  onChange: (code: string) => void;
  label?: string;
}

export function CurrencyPicker({ value, onChange, label = 'Currency' }: CurrencyPickerProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selected = CURRENCIES.find((c) => c.code === value);

  const filtered = search.trim()
    ? CURRENCIES.filter(
        (c) =>
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.name.toLowerCase().includes(search.toLowerCase()),
      )
    : CURRENCIES;

  const handleSelect = (currency: Currency) => {
    onChange(currency.code);
    setVisible(false);
    setSearch('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`Select currency, currently ${selected?.name ?? value}`}
      >
        <View style={styles.selectorLeft}>
          <Text style={styles.flag}>{selected?.flag ?? '🌍'}</Text>
          <View>
            <Text style={styles.code}>{selected?.code ?? value}</Text>
            <Text style={styles.name}>{selected?.name ?? ''}</Text>
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <TouchableOpacity onPress={() => { setVisible(false); setSearch(''); }}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search currencies…"
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              autoFocus
              autoCorrect={false}
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.currencyItem, item.code === value && styles.selectedItem]}
                onPress={() => handleSelect(item)}
                accessibilityRole="button"
                accessibilityState={{ selected: item.code === value }}
              >
                <Text style={styles.itemFlag}>{item.flag}</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemCode}>{item.code}</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                </View>
                <Text style={styles.itemSymbol}>{item.symbol}</Text>
                {item.code === value && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  } as ViewStyle,
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  } as TextStyle,
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  } as ViewStyle,
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  } as ViewStyle,
  flag: {
    fontSize: 24,
  } as TextStyle,
  code: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  } as TextStyle,
  name: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 1,
  } as TextStyle,
  chevron: {
    fontSize: 20,
    color: '#9CA3AF',
  } as TextStyle,
  modal: {
    flex: 1,
    backgroundColor: '#fff',
  } as ViewStyle,
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  } as ViewStyle,
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  } as TextStyle,
  closeButton: {
    fontSize: 18,
    color: '#6B7280',
    padding: 4,
  } as TextStyle,
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
  } as ViewStyle,
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  } as TextStyle,
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 10,
  } as TextStyle,
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  } as ViewStyle,
  selectedItem: {
    backgroundColor: '#EEF2FF',
  } as ViewStyle,
  itemFlag: {
    fontSize: 24,
    marginRight: 14,
  } as TextStyle,
  itemInfo: {
    flex: 1,
  } as ViewStyle,
  itemCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  } as TextStyle,
  itemName: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 1,
  } as TextStyle,
  itemSymbol: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  } as TextStyle,
  checkmark: {
    fontSize: 18,
    color: '#6366F1',
    fontWeight: '700',
  } as TextStyle,
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 20,
  } as ViewStyle,
});