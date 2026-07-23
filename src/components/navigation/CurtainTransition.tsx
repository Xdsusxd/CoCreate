import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CurtainTransitionProps {
  activeKey: string;
  children: React.ReactNode;
}

export const CurtainTransition: React.FC<CurtainTransitionProps> = ({
  activeKey,
  children,
}) => {
  const lineTranslateX = useSharedValue(-10);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    // Reset values on key change
    lineTranslateX.value = -10;
    contentOpacity.value = 0;

    // 1px black line horizontal curtain sweep
    lineTranslateX.value = withTiming(SCREEN_WIDTH + 10, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });

    // Content smooth opacity fade-in
    contentOpacity.value = withTiming(1, {
      duration: 350,
      easing: Easing.out(Easing.quad),
    });
  }, [activeKey]);

  const lineAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: lineTranslateX.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        {children}
      </Animated.View>

      {/* 1px Vertical Black Line Horizontal Curtain Sweep */}
      <Animated.View style={[styles.curtainLine, lineAnimatedStyle]} pointerEvents="none" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  curtainLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 1,
    backgroundColor: '#000000',
    zIndex: 999,
  },
});
