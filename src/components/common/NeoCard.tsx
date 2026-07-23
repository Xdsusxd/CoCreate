import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp, Platform } from 'react-native';
import { COLORS } from '../../theme/colors';

interface NeoCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  offsetY?: number;
}

/**
 * Soft Neo-Brutalist Card with solid 2px black border, 16px rounded corners,
 * and reliable cross-platform solid 0-blur flat shadow offset.
 */
export const NeoCard: React.FC<NeoCardProps> = ({
  children,
  style,
  backgroundColor = COLORS.surface,
  borderColor = COLORS.borderNeo,
  borderRadius = 16,
  offsetY = 4,
}) => {
  return (
    <View style={[styles.shadowWrapper, { marginBottom: offsetY }]}>
      {/* Black 3D Flat Shadow Offset Box (Android / iOS uniform simulation) */}
      <View
        style={[
          styles.flatShadowOffset,
          {
            borderRadius,
            top: offsetY,
            left: 0,
            right: 0,
            bottom: -offsetY,
          },
        ]}
      />

      {/* Main Front Card Surface */}
      <View
        style={[
          styles.cardFront,
          {
            backgroundColor,
            borderColor,
            borderRadius,
          },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowWrapper: {
    position: 'relative',
    marginVertical: 6,
  },
  flatShadowOffset: {
    position: 'absolute',
    backgroundColor: COLORS.shadowNeo,
  },
  cardFront: {
    borderWidth: 2,
    borderStyle: 'solid',
    padding: 16,
    position: 'relative',
    zIndex: 2,
  },
});
