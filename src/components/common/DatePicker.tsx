import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

interface DatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  placeholder = 'Select date',
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value ?? new Date());

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && selectedDate) {
        onChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirmIOS = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  const handleCancelIOS = () => {
    setShowPicker(false);
    setTempDate(value ?? new Date());
  };

  const displayText = value
    ? value.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : placeholder;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setTempDate(value ?? new Date());
          setShowPicker(true);
        }}
        accessibilityLabel={`${label}: ${displayText}`}
        accessibilityRole="button"
      >
        <Text style={[styles.buttonText, !value && styles.placeholder]}>
          {displayText}
        </Text>
        <Text style={styles.calendarIcon}>📅</Text>
      </TouchableOpacity>

      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal
          transparent
          visible={showPicker}
          animationType="slide"
          onRequestClose={handleCancelIOS}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancelIOS}>
                  <Text style={styles.modalAction}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={handleConfirmIOS}>
                  <Text style={[styles.modalAction, styles.confirmAction]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.iosPicker}
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
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    fontSize: 15,
    color: '#111827',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  calendarIcon: {
    fontSize: 18,
  },
  // Modal (iOS)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  modalAction: {
    fontSize: 16,
    color: '#6B7280',
  },
  confirmAction: {
    color: '#6366F1',
    fontWeight: '600',
  },
  iosPicker: {
    height: 200,
  },
});