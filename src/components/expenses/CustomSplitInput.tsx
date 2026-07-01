import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { getAvatarColor } from '../../utils/avatarColors';

interface Participant {
  id: string;
  name: string;
}

interface CustomSplitInputProps {
  participant: Participant;
  amount: number;
  currency: string;
  onChange: (participantId: string, amount: number) => void;
  isLast?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const CustomSplitInput: React.FC<CustomSplitInputProps> = ({
  participant,
  amount,
  currency,
  onChange,
  isLast = false,
}) => {
  const avatarColor = getAvatarColor(participant.id);
  const [localValue, setLocalValue] = React.useState(
    amount > 0 ? amount.toFixed(2) : ''
  );

  // Sync when amount changes externally
  React.useEffect(() => {
    setLocalValue(amount > 0 ? amount.toFixed(2) : '');
  }, [amount]);

  const handleChange = (text: string) => {
    // Allow numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
    setLocalValue(formatted);
  };

  const handleBlur = () => {
    const parsed = parseFloat(localValue);
    const value = isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
    onChange(participant.id, value);
    setLocalValue(value > 0 ? value.toFixed(2) : '');
  };

  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{getInitials(participant.name)}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {participant.name}
        {isLast && <Text style={styles.lastHint}> (auto-adjusted)</Text>}
      </Text>
      <View style={styles.inputWrapper}>
        <Text style={styles.currencySymbol}>{currency}</Text>
        <TextInput
          style={styles.input}
          value={localValue}
          onChangeText={handleChange}
          onBlur={handleBlur}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#9CA3AF"
          selectTextOnFocus
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    marginRight: 12,
  },
  lastHint: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 90,
  },
  currencySymbol: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  input: {
    fontSize: 15,
    color: '#111827',
    minWidth: 60,
    padding: 0,
    textAlign: 'right',
  },
});