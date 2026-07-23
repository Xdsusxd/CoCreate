import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text, StyleProp, ViewStyle } from 'react-native';
import { COLORS } from '../../theme/colors';

interface NeoInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  error?: string | null;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const NeoInput: React.FC<NeoInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines,
  error,
  disabled = false,
  style,
  testID,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, error ? styles.labelError : null]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputBox,
          isFocused && styles.inputBoxFocused,
          error ? styles.inputBoxError : null,
          style,
        ]}
      >
        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textPlaceholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          style={styles.textInput}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  labelError: {
    color: '#E53935',
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
    justifyContent: 'center',
  },
  inputBoxFocused: {
    borderColor: COLORS.kleinBlue,
  },
  inputBoxError: {
    borderColor: '#E53935',
  },
  textInput: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
    padding: 0,
    margin: 0,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#E53935',
    marginTop: 6,
  },
});
