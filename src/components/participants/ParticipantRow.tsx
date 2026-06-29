import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  PanResponder,
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
  const rowOpacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD) {
          // Confirm removal
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
                onPress: () => {
                  Animated.parallel([
                    Animated.timing(translateX, {
                      toValue: -400,
                      duration: 200,
                      useNativeDriver: true,
                    }),
                    Animated.timing(rowOpacity, {
                      toValue: 0,
                      duration: 200,
                      useNativeDriver: true,
                    }),
                  ]).start(() => {
                    onRemove(participant.id);
                  });
                },
              },
            ]
          );
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleRemovePress = () => {
    Alert.alert(
      'Remove Participant',
      `Remove ${participant.name} from this trip?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onRemove(participant.id),
        },
      ]
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.deleteBackground}>
        <Text style={styles.deleteText}>Remove</Text>
      </View>
      <Animated.View
        style={[styles.row, { transform: [{ translateX }], opacity: rowOpacity }]}
        {...panResponder.panHandlers}
      >
        <AvatarCircle name={participant.name} color={participant.avatarColor} size={44} fontSize={16} />
        <Text style={styles.name} numberOfLines={1}>
          {participant.name}
        </Text>
        <TouchableOpacity
          onPress={handleRemovePress}
          style={styles.removeButton}
          accessibilityLabel={`Remove ${participant.name}`}
          accessibilityRole="button"
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
    width: '100%',
  },
  deleteText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  removeButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
});

export default ParticipantRow;