import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TextInput,
  SafeAreaView,
  Platform,
} from 'react-native';
import { CURRENCIES, Currency } from '../../constants/currencies';

interface CurrencyPickerProps {
  value: string;
  onChange: (currencyCode: string) => void;
  label?: string;
}

export function CurrencyPicker({
  value,
  onChange,
  label = 'Currency',
}: CurrencyPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCurrency = CURRENCIES.find((c) => c.code === value);

  const filtered = CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (currency: Currency) => {
    onChange(currency.code);
    setModalVisible(false);
    setSearch('');
  };

  const renderItem = ({ item }: { item: Currency }) => {
    const isSelected = item.code === value;
    return (
      <TouchableOpacity
        style={[styles.currencyItem, isSelected && styles.currencyItemSelected]}
        onPress={() => handleSelect(item)}
        accessibilityRole="radio"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={`${item.name} (${item.code})`}
      >
        <Text style={styles.flag}>{item.flag}</Text>
        <View style={styles.currencyInfo}>
          <Text style={[styles.currencyCode, isSelected && styles.currencyCodeSelected]}>
            {item.code}
          </Text>
          <Text style={styles.currencyName}>{item.name}</Text>
        </View>
        <Text style={styles.currencySymbol}>{item.symbol}</Text>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
        accessibilityRole="combobox"
        accessibilityLabel={`${label}: ${selectedCurrency?.name ?? value}`}
      >
        {selectedCurrency ? (
          <View style={styles.selectedContent}>
            <Text style={styles.selectedFlag}>{selectedCurrency.flag}</Text>
            <Text style={styles.selectedCode}>{selectedCurrency.code}</Text>
            <Text style={styles.selectedName}>{selectedCurrency.name}</Text>
          </View>
        ) : (
          <Text style={styles.placeholder}>Select currency</Text>
        )}
        <Text style={styles.dropdownIcon}>▾</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setSearch('');
              }}
              accessibilityRole="button"
              accessibilityLabel="Close currency picker"
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search currencies..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  selectedFlag: {
    fontSize: 20,
  },
  selectedCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  selectedName: {
    fontSize: 14,
    color: '#6B7280',
  },
  placeholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  dropdownIcon: {
    fontSize: 16,
    color: '#6B7280',
  },
  modal: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    fontSize: 18,
    color: '#6B7280',
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#111827',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    gap: 12,
  },
  currencyItemSelected: {
    backgroundColor: '#EEF2FF',
  },
  flag: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  currencyCodeSelected: {
    color: '#4F46E5',
  },
  currencyName: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    minWidth: 24,
    textAlign: 'right',
  },
  checkmark: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '700',
  },
  separator: {
    height: 6,
  },
});