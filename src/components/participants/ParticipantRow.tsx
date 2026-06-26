import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import { AvatarCircle } from './AvatarCircle';
import { Participant } from '../../types';

interface ParticipantRowProps {
  participant: Participant;
  onRemove: (participantId: string) => void;
}

const SWIPE_THRESHOLD = -80;

export function ParticipantRow({ participant, onRemove }: ParticipantRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 20,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: -120,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleDelete = () => {
    Alert.alert(
      'Remove Participant',
      `Remove ${participant.name} from this trip?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          },
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onRemove(participant.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Delete button behind the row */}
      <View style={styles.deleteBackground}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>Remove</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[styles.row, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <AvatarCircle name={participant.name} color={participant.avatarColor} size={44} />
        <View style={styles.nameContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {participant.name}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 120,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  deleteText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
});

export default ParticipantRow;