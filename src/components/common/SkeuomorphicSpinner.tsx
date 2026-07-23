import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface SkeuomorphicSpinnerProps {
  size?: number;
  color?: string;
}

export const SkeuomorphicSpinner: React.FC<SkeuomorphicSpinnerProps> = ({
  size = 24,
  color = '#000000',
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 900,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.spinnerTrack,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: '#E0E0E0',
            borderTopColor: color,
            borderRightColor: color,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerTrack: {
    borderWidth: 3,
  },
});
