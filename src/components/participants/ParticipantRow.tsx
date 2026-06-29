import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { AvatarCircle } from './AvatarCircle';
import { Participant } from '../../types';

interface ParticipantRowProps {
  participant: Participant;
  onRemove: (participant: Participant) => void;
}

export function ParticipantRow({ participant, onRemove }: ParticipantRowProps) {
  const swipeableRef = useRef<Swipeable>(null);

  function handleDelete() {
    swipeableRef.current?.close();
    Alert.alert(
      'Remove Participant',
      `Remove "${participant.name}" from this trip?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onRemove(participant),
        },
      ]
    );
  }

  function renderRightActions(
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.8],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity style={styles.deleteAction} onPress={handleDelete}>
        <Animated.Text style={[styles.deleteText, { transform: [{ scale }] }]}>
          Remove
        </Animated.Text>
      </TouchableOpacity>
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <View style={styles.row}>
        <AvatarCircle name={participant.name} color={participant.avatarColor} size={44} />
        <Text style={styles.name} numberOfLines={1}>
          {participant.name}
        </Text>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
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
    color: '#1A1A2E',
    fontWeight: '500',
  },
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
  },
  deleteText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});