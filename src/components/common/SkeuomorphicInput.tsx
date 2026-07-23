import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { COLORS } from '../../theme/colors';
import { TYPOGRAPHY } from '../../theme/typography';
import { SkeuomorphicInputProps } from '../../types/auth';

export const SkeuomorphicInput: React.FC<SkeuomorphicInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  disabled = false,
  testID,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useSharedValue(0);

  const handleFocus = () => {
    setIsFocused(true);
    focusAnim.value = withSpring(1, { damping: 12, stiffness: 180 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnim.value = withSpring(0, { damping: 15, stiffness: 150 });
  };

  // Fine Line Underline transition: width expands 1px -> 2px, color #000000 -> #2C4EC2
  const underlineAnimatedStyle = useAnimatedStyle(() => {
    const borderBottomColor = interpolateColor(
      focusAnim.value,
      [0, 1],
      [error ? COLORS.errorText : COLORS.borderLine, COLORS.borderFocus]
    );
    const borderBottomWidth = error ? 2 : 1 + focusAnim.value * 1;

    return {
      borderBottomColor,
      borderBottomWidth,
    };
  });

  return (
    <View style={styles.outerContainer}>
      <Text style={[TYPOGRAPHY.label, styles.fieldLabel, error ? styles.labelError : null]}>
        {label}
      </Text>

      <Animated.View style={[styles.inputUnderlineWrapper, underlineAnimatedStyle]}>
        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          style={[TYPOGRAPHY.body, styles.inputField]}
        />
      </Animated.View>

      {error && <Text style={[TYPOGRAPHY.label, styles.errorText]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    marginVertical: 4,
  },
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 6,
    fontWeight: '700',
  },
  labelError: {
    color: COLORS.errorText,
  },
  inputUnderlineWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLine,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
  },
  inputField: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    padding: 0,
    margin: 0,
  },
  errorText: {
    color: COLORS.errorText,
    marginTop: 6,
    fontSize: 10,
    fontWeight: '700',
  },
});
