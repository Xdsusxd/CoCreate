import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS } from '../../theme/colors';

interface GlassPanelProps {
  children: React.ReactNode;
  style?: ViewStyle;
  pinkBevel?: boolean;
}

/**
 * Minimalist Fine Art Panel
 * Clean white surface container with ultra-fine border and soft ambient shadow.
 * Zero skeuomorphism, zero neobrutalism, zero heavy glass blur.
 */
export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.panel, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    padding: 24,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
});
