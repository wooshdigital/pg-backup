import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import { AvatarCircle } from './AvatarCircle';
import { Participant } from '../../types';

interface ParticipantRowProps {
  participant: Participant;
  onRemove: (id: string) => void;
}

const SWIPE_THRESHOLD = 80;

export function ParticipantRow({ participant, onRemove }: ParticipantRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const rowOpacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 8 && Math.abs(gestureState.dy) < 20,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -SWIPE_THRESHOLD) {
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

  return (
    <View style={styles.container}>
      <View style={styles.deleteBackground}>
        <Text style={styles.deleteText}>Remove</Text>
      </View>
      <Animated.View
        style={[
          styles.row,
          { transform: [{ translateX }], opacity: rowOpacity },
        ]}
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
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#FAFAFA',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  name: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
});