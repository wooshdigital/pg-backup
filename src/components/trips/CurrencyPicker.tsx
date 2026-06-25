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
} from 'react-native';
import { CURRENCIES } from '../../constants/currencies';
import { Currency } from '../../types';

interface CurrencyPickerProps {
  value: string;
  onChange: (currencyCode: string) => void;
  label?: string;
}

export const CurrencyPicker: React.FC<CurrencyPickerProps> = ({
  value,
  onChange,
  label = 'Currency',
}) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCurrency = CURRENCIES.find((c) => c.code === value);

  const filtered = search.trim()
    ? CURRENCIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.toLowerCase().includes(search.toLowerCase()),
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
        accessibilityLabel={`${label}: ${selectedCurrency?.name ?? 'Select currency'}`}
        accessibilityRole="button"
      >
        {selectedCurrency ? (
          <View style={styles.selectedRow}>
            <Text style={styles.flag}>{selectedCurrency.flag}</Text>
            <Text style={styles.selectorText}>
              {selectedCurrency.code} – {selectedCurrency.name}
            </Text>
          </View>
        ) : (
          <Text style={styles.placeholder}>Select currency</Text>
        )}
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVisible(false)}
      >
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <TouchableOpacity
              onPress={() => {
                setVisible(false);
                setSearch('');
              }}
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
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.item, item.code === value && styles.itemSelected]}
                onPress={() => handleSelect(item)}
                accessibilityRole="button"
                accessibilityLabel={`${item.name} (${item.code})`}
                accessibilityState={{ selected: item.code === value }}
              >
                <Text style={styles.itemFlag}>{item.flag}</Text>
                <View style={styles.itemText}>
                  <Text style={[styles.itemCode, item.code === value && styles.itemCodeSelected]}>
                    {item.code}
                  </Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                </View>
                <Text style={styles.itemSymbol}>{item.symbol}</Text>
                {item.code === value && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

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
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  flag: {
    fontSize: 22,
  },
  selectorText: {
    fontSize: 15,
    color: '#111827',
  },
  placeholder: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  chevron: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  // Modal
  modal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  itemSelected: {
    backgroundColor: '#EEF2FF',
  },
  itemFlag: {
    fontSize: 24,
  },
  itemText: {
    flex: 1,
  },
  itemCode: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  itemCodeSelected: {
    color: '#6366F1',
  },
  itemName: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 1,
  },
  itemSymbol: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
    minWidth: 32,
    textAlign: 'right',
  },
  checkmark: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '700',
    marginLeft: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 68,
  },
});