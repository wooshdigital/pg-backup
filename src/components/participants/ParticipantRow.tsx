import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  I18nManager,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { AvatarCircle } from './AvatarCircle';
import { Participant } from '../../types';

interface ParticipantRowProps {
  participant: Participant;
  onRemove: (id: string) => void;
}

export function ParticipantRow({ participant, onRemove }: ParticipantRowProps) {
  const swipeableRef = useRef<Swipeable>(null);

  function handleDelete() {
    Alert.alert(
      'Remove Participant',
      `Remove ${participant.name} from this trip?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => swipeableRef.current?.close(),
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            swipeableRef.current?.close();
            onRemove(participant.id);
          },
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
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={handleDelete}
        activeOpacity={0.8}
      >
        <Animated.Text
          style={[styles.deleteActionText, { transform: [{ scale }] }]}
        >
          Remove
        </Animated.Text>
      </TouchableOpacity>
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={40}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <View style={styles.row}>
        <AvatarCircle
          name={participant.name}
          color={participant.avatarColor}
          size={44}
        />
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
    color: '#1C1C1E',
    fontWeight: '500',
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteActionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ParticipantRow;