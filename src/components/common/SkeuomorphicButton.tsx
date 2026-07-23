import React, { useState } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SkeuomorphicButtonProps } from '../../types/auth';
import { useHaptics } from '../../hooks/useHaptics';
import { SkeuomorphicSpinner } from './SkeuomorphicSpinner';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SkeuomorphicButton: React.FC<SkeuomorphicButtonProps> = ({
  title,
  onPress,
  variant = 'bronze',
  isLoading = false,
  icon,
  disabled = false,
  fullWidth = true,
  style,
  testID,
}) => {
  const { triggerImpact } = useHaptics();
  const pressAnim = useSharedValue(0);
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    if (disabled || isLoading) return;
    setIsPressed(true);
    pressAnim.value = withTiming(1, { duration: 50 }); // Chromatic Inversion to Black #000000
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    if (disabled || isLoading) return;
    setIsPressed(false);
    pressAnim.value = withTiming(0, { duration: 150 });
  };

  const isPrimary = variant === 'bronze' || variant === 'danger';

  // Chromatic Inversion Animated Style
  const animatedButtonStyle = useAnimatedStyle(() => {
    if (isPrimary) {
      const backgroundColor = interpolateColor(
        pressAnim.value,
        [0, 1],
        [COLORS.primary, '#000000']
      );
      return { backgroundColor };
    } else {
      const backgroundColor = interpolateColor(
        pressAnim.value,
        [0, 1],
        [COLORS.whiteButton, '#000000']
      );
      return { backgroundColor };
    }
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    if (isPrimary) {
      const color = interpolateColor(
        pressAnim.value,
        [0, 1],
        [COLORS.primaryText, COLORS.primaryTextInverted]
      );
      return { color };
    } else {
      const color = interpolateColor(
        pressAnim.value,
        [0, 1],
        [COLORS.textPrimary, COLORS.primaryTextInverted]
      );
      return { color };
    }
  });

  return (
    <View style={[styles.containerWrapper, fullWidth && styles.fullWidth, style]}>
      <AnimatedPressable
        testID={testID}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || isLoading}
        style={[
          styles.buttonSurface,
          isPrimary ? styles.primaryBorder : styles.secondaryBorder,
          disabled && styles.disabledSurface,
          animatedButtonStyle,
        ]}
      >
        <View style={styles.glossyHighlight} />
        <View style={styles.contentRow}>
          {isLoading ? (
            <SkeuomorphicSpinner
              size={18}
              color={isPressed ? '#FFFFFF' : '#000000'}
            />
          ) : (
            <>
              {icon && <View style={styles.iconWrapper}>{icon}</View>}
              <Animated.Text style={[TYPOGRAPHY.button, styles.buttonText, animatedTextStyle]}>
                {title}
              </Animated.Text>
            </>
          )}
        </View>
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    marginVertical: 6,
  },
  fullWidth: {
    width: '100%',
  },
  buttonSurface: {
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    overflow: 'hidden',
    position: 'relative',
  },
  primaryBorder: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  secondaryBorder: {
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.8)',
  },
  glossyHighlight: {
    position: 'absolute',
    top: 0,
    left: -20,
    right: -20,
    height: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    transform: [{ rotate: '-12deg' }],
  },
  disabledSurface: {
    opacity: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconWrapper: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
