import React, { ReactNode, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  PanResponder,
  PanResponderGestureState,
  PanResponderInstance,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

type Props = {
  children: ReactNode;
  isActive?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  style?: StyleProp<ViewStyle>;
};

const SWIPE_THRESHOLD = 120;
const SWIPE_OUT_DURATION = 220;

export default function SwipeCard({
  children,
  isActive = false,
  onSwipeLeft,
  onSwipeRight,
  style,
}: Props) {
  const position = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    if (!isActive) {
      position.setValue({ x: 0, y: 0 });
    }
  }, [isActive, position]);

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      bounciness: 10,
      useNativeDriver: false,
    }).start();
  };

  const swipeComplete = (direction: 'left' | 'right') => {
    Animated.timing(position, {
      toValue: {
        x: direction === 'right' ? 400 : -400,
        y: 0,
      },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => {
      if (direction === 'right') {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
      position.setValue({ x: 0, y: 0 });
    });
  };

  const panResponder: PanResponderInstance = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gesture) => {
          if (!isActive) {
            return false;
          }
          const { dx, dy } = gesture;
          return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 4;
        },
        onPanResponderMove: Animated.event(
          [
            null,
            {
              dx: position.x,
              dy: position.y,
            },
          ],
          { useNativeDriver: false },
        ),
        onPanResponderRelease: (_evt, gestureState: PanResponderGestureState) => {
          if (gestureState.dx > SWIPE_THRESHOLD) {
            swipeComplete('right');
          } else if (gestureState.dx < -SWIPE_THRESHOLD) {
            swipeComplete('left');
          } else {
            resetPosition();
          }
        },
        onPanResponderTerminate: resetPosition,
        onPanResponderTerminationRequest: () => false,
      }),
    [isActive, position],
  );

  const cardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      {
        rotate: position.x.interpolate({
          inputRange: [-400, 0, 400],
          outputRange: ['-10deg', '0deg', '10deg'],
        }),
      },
    ],
  };

  return (
    <Animated.View
      style={[styles.card, cardStyle, style]}
      {...(isActive ? panResponder.panHandlers : {})}
      pointerEvents={isActive ? 'auto' : 'none'}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
});
