import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, StyleProp, ViewStyle, ActivityIndicator } from 'react-native';
import { COLORS } from '../../theme/colors';

export type NeoButtonVariant =
  | 'primary'
  | 'magenta'
  | 'klein'
  | 'mint'
  | 'pinkGlass'
  | 'secondary'
  | 'metal'
  | 'danger';

interface NeoButtonProps {
  title: string;
  onPress: () => void;
  variant?: NeoButtonVariant;
  loading?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const NeoButton: React.FC<NeoButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  isLoading = false,
  disabled = false,
  icon,
  fullWidth = true,
  style,
}) => {
  const isBusy = loading || isLoading;

  const getColors = () => {
    switch (variant) {
      case 'primary':
      case 'klein':
        return { bg: COLORS.kleinBlue, text: '#FFFFFF' };
      case 'magenta':
        return { bg: COLORS.neonPink, text: '#FFFFFF' };
      case 'mint':
        return { bg: COLORS.mintGreen, text: '#080808' };
      case 'danger':
        return { bg: '#E53935', text: '#FFFFFF' };
      case 'pinkGlass':
      case 'metal':
      case 'secondary':
      default:
        return { bg: 'transparent', text: COLORS.textSecondary };
    }
  };

  const colors = getColors();
  const isOutline = variant === 'secondary' || variant === 'metal' || variant === 'pinkGlass';

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || isBusy}
      style={[
        styles.button,
        { backgroundColor: colors.bg },
        isOutline && styles.outlineButton,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      {isBusy ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={[styles.buttonText, { color: colors.text }]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

