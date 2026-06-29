import React, { useCallback, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

export interface AddParticipantSheetRef {
  open: () => void;
  close: () => void;
}

interface AddParticipantSheetProps {
  onAdd: (name: string) => void;
}

export const AddParticipantSheet = forwardRef<AddParticipantSheetRef, AddParticipantSheetProps>(
  ({ onAdd }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [name, setName] = useState('');
    const inputRef = useRef<TextInput>(null);

    const snapPoints = ['50%'];

    useImperativeHandle(ref, () => ({
      open: () => {
        bottomSheetRef.current?.expand();
        setTimeout(() => inputRef.current?.focus(), 300);
      },
      close: () => {
        bottomSheetRef.current?.close();
      },
    }));

    const handleAdd = useCallback(() => {
      const trimmed = name.trim();
      if (!trimmed) return;
      onAdd(trimmed);
      setName('');
      Keyboard.dismiss();
      bottomSheetRef.current?.close();
    }, [name, onAdd]);

    const handleClose = useCallback(() => {
      setName('');
      Keyboard.dismiss();
    }, []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
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
        onClose={handleClose}
        keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'interactive'}
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetView style={styles.content}>
          <Text style={styles.title}>Add Participant</Text>
          <Text style={styles.subtitle}>Enter the name of the person joining this trip.</Text>

          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#8E8E93"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleAdd}
              accessibilityLabel="Participant name input"
            />
          </View>

          <TouchableOpacity
            style={[styles.addButton, !name.trim() && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={!name.trim()}
            accessibilityLabel="Add participant"
            accessibilityRole="button"
          >
            <Text style={styles.addButtonText}>Add Participant</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              handleClose();
              bottomSheetRef.current?.close();
            }}
            accessibilityLabel="Cancel"
            accessibilityRole="button"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

AddParticipantSheet.displayName = 'AddParticipantSheet';

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    marginBottom: 16,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1C1C1E',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  addButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AddParticipantSheet;