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
  const rowHeight = useRef(new Animated.Value(68)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 5 && Math.abs(gestureState.dy) < 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD) {
          confirmRemove();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  function confirmRemove() {
    Alert.alert(
      'Remove Participant',
      `Remove "${participant.name}" from this trip?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: false,
            }).start();
          },
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            Animated.parallel([
              Animated.timing(rowHeight, {
                toValue: 0,
                duration: 250,
                useNativeDriver: false,
              }),
              Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
              }),
            ]).start(() => {
              onRemove(participant.id);
            });
          },
        },
      ]
    );
  }

  return (
    <Animated.View style={[styles.wrapper, { height: rowHeight, opacity }]}>
      {/* Delete background */}
      <View style={styles.deleteBackground}>
        <Text style={styles.deleteText}>Remove</Text>
      </View>

      {/* Swipeable row */}
      <Animated.View
        style={[styles.row, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <AvatarCircle
          name={participant.name}
          color={participant.avatarColor}
          size={44}
        />
        <Text style={styles.name} numberOfLines={1}>
          {participant.name}
        </Text>
        <TouchableOpacity
          onPress={confirmRemove}
          style={styles.removeButton}
          accessibilityLabel={`Remove ${participant.name}`}
          accessibilityRole="button"
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  deleteBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EF4444',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 24,
  },
  deleteText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
  },
  name: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ParticipantRow;