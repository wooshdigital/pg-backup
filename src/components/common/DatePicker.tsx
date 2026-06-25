import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RNDateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { formatShortDate } from '../../utils/formatters';

interface DatePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (selectedDate) onChange(selectedDate);
    } else {
      if (selectedDate) setTempDate(selectedDate);
    }
  };

  const handleConfirmIOS = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  const handleCancelIOS = () => {
    setTempDate(value);
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={styles.trigger}
        onPress={() => {
          setTempDate(value);
          setShowPicker(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatShortDate(value.toISOString())}`}
      >
        <Text style={styles.triggerText}>{formatShortDate(value.toISOString())}</Text>
        <Text style={styles.calendarIcon}>📅</Text>
      </Pressable>

      {/* Android: inline picker shown in a modal */}
      {Platform.OS === 'android' && showPicker && (
        <RNDateTimePicker
          mode="date"
          value={value}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          display="default"
        />
      )}

      {/* iOS: modal with confirm/cancel */}
      {Platform.OS === 'ios' && (
        <Modal
          transparent
          animationType="slide"
          visible={showPicker}
          onRequestClose={handleCancelIOS}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable onPress={handleCancelIOS}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </Pressable>
                <Text style={styles.modalTitle}>{label}</Text>
                <Pressable onPress={handleConfirmIOS}>
                  <Text style={styles.modalConfirm}>Done</Text>
                </Pressable>
              </View>
              <RNDateTimePicker
                mode="date"
                value={tempDate}
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                display="spinner"
              />
            </View>
          </View>
        </Modal>
      )}
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
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  triggerText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  calendarIcon: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalConfirm: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F6EF7',
  },
});