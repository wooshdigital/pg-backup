import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import RNDateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

interface DatePickerProps {
  label: string;
  value: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onChange: (date: Date) => void;
}

export function DatePicker({
  label,
  value,
  minimumDate,
  maximumDate,
  onChange,
}: DatePickerProps) {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  const formatted = value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (selectedDate) {
        onChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleIOSConfirm = () => {
    setShow(false);
    onChange(tempDate);
  };

  const handleIOSCancel = () => {
    setShow(false);
    setTempDate(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setTempDate(value);
          setShow(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatted}`}
      >
        <Text style={styles.dateText}>{formatted}</Text>
        <Text style={styles.calendarIcon}>📅</Text>
      </TouchableOpacity>

      {/* Android: inline picker */}
      {Platform.OS === 'android' && show && (
        <RNDateTimePicker
          value={value}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      )}

      {/* iOS: modal with picker */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={show}
          transparent
          animationType="slide"
          onRequestClose={handleIOSCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleIOSCancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={handleIOSConfirm}>
                  <Text style={styles.confirmText}>Done</Text>
                </TouchableOpacity>
              </View>
              <RNDateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onChange={handleChange}
                style={styles.iosPicker}
              />
            </View>
          </View>
        </Modal>
      )}
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
  button: {
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
  dateText: {
    fontSize: 16,
    color: '#111827',
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  confirmText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
  },
  iosPicker: {
    height: 200,
  },
});