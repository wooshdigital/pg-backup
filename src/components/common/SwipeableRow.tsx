import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
}

export const SwipeableRow: React.FC<SwipeableRowProps> = ({ children, onDelete }) => {
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = () => {
    swipeableRef.current?.close();
    onDelete();
  };

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.8],
      extrapolate: 'clamp',
    });

    return (
      <RectButton style={styles.deleteAction} onPress={handleDelete}>
        <Animated.View style={[styles.actionContent, { transform: [{ scale }] }]}>
          <Text style={styles.deleteIcon}>🗑</Text>
          <Text style={styles.deleteText}>Delete</Text>
        </Animated.View>
      </RectButton>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
      friction={2}
    >
      {children}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 16,
    marginVertical: 4,
    marginRight: 4,
  },
  actionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});