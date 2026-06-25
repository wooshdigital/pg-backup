import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CURRENCIES, Currency, getCurrencyByCode } from '../../constants/currencies';

interface CurrencyPickerProps {
  value: string;
  onChange: (code: string) => void;
  label?: string;
}

export const CurrencyPicker: React.FC<CurrencyPickerProps> = ({
  value,
  onChange,
  label = 'Currency',
}) => {
  const [visible, setVisible] = useState(false);
  const selected = getCurrencyByCode(value);

  const handleSelect = (currency: Currency) => {
    onChange(currency.code);
    setVisible(false);
  };

  const renderItem = ({ item }: { item: Currency }) => {
    const isSelected = item.code === value;
    return (
      <TouchableOpacity
        style={[styles.currencyRow, isSelected && styles.currencyRowSelected]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
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
      <Pressable
        style={styles.trigger}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`Currency: ${selected?.name ?? value}`}
      >
        <Text style={styles.flag}>{selected?.flag ?? '🌐'}</Text>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.triggerCode}>{selected?.code ?? value}</Text>
          <Text style={styles.triggerName}>{selected?.name ?? ''}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVisible(false)}
      >
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <Pressable onPress={() => setVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
          <FlatList
            data={CURRENCIES}
            keyExtractor={(item) => item.code}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  flag: {
    fontSize: 22,
  },
  triggerCode: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  triggerName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  chevron: {
    fontSize: 22,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  modal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  closeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  currencyRowSelected: {
    backgroundColor: '#EEF2FF',
  },
  currencyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  currencyCode: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  currencyCodeSelected: {
    color: '#4F6EF7',
  },
  currencyName: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 1,
  },
  currencySymbol: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '500',
    marginRight: 8,
  },
  checkmark: {
    fontSize: 16,
    color: '#4F6EF7',
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 8,
  },
});