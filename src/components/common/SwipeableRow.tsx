import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  deleteLabel?: string;
}

export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  onDelete,
  deleteLabel = 'Delete',
}) => {
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = () => {
    swipeableRef.current?.close();
    onDelete();
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View style={[styles.deleteContainer, { opacity }]}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          accessibilityLabel={deleteLabel}
          accessibilityRole="button"
        >
          <Animated.Text style={[styles.deleteIcon, { transform: [{ scale }] }]}>
            🗑️
          </Animated.Text>
          <Text style={styles.deleteText}>{deleteLabel}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      friction={2}
      overshootRight={false}
    >
      {children}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  deleteContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    borderRadius: 14,
    marginLeft: 8,
  },
  deleteIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});