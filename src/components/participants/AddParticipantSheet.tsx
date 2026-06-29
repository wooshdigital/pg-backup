import React, { useCallback, useRef, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

interface AddParticipantSheetProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export function AddParticipantSheet({
  visible,
  onClose,
  onAdd,
}: AddParticipantSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const inputRef = useRef<TextInput>(null);
  const [name, setName] = useState('');

  const snapPoints = useMemo(() => ['40%'], []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
      // Delay focus to let sheet animate in
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } else {
      bottomSheetRef.current?.close();
      setName('');
    }
  }, [visible]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        setName('');
        onClose();
      }
    },
    [onClose]
  );

  const handleAdd = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
    Keyboard.dismiss();
    bottomSheetRef.current?.close();
  }, [name, onAdd]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onChange={handleSheetChange}
      keyboardBehavior="fillParent"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Participant</Text>
          <TouchableOpacity onPress={() => bottomSheetRef.current?.close()} hitSlop={8}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="e.g. Alice Johnson"
            placeholderTextColor="#8E8E93"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleAdd}
            maxLength={60}
          />
        </View>

        <TouchableOpacity
          style={[styles.addButton, !name.trim() && styles.addButtonDisabled]}
          onPress={handleAdd}
          disabled={!name.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>Add Participant</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  closeButton: {
    fontSize: 18,
    color: '#8E8E93',
    padding: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B6B6B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1C1C1E',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AddParticipantSheet;