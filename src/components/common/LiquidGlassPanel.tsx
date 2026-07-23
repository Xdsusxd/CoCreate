import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../../theme/colors';

interface LiquidGlassPanelProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

/**
 * Liquid Glassmorphism Panel.
 * Frosted glass container with:
 * - Translucent background rgba(255,255,255,0.15)
 * - Fine brilliant border 1.5px rgba(255,255,255,0.4)
 * - Micro-rounded corners borderRadius: 4
 * - 90-degree sharp edges with subtle curve
 */
export const LiquidGlassPanel: React.FC<LiquidGlassPanelProps> = ({
  children,
  style,
  intensity = 40,
}) => {
  return (
    <View style={[styles.outerFrame, style]}>
      <BlurView intensity={intensity} tint="light" style={styles.blurFill}>
        <View style={styles.glassOverlay}>
          {/* Glossy Liquid Highlight — diagonal refraction stripe */}
          <View style={styles.glossyStripe} />
          <View style={styles.contentContainer}>
            {children}
          </View>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerFrame: {
    borderRadius: 4,            // Micro-rounded 90° edges
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,  // rgba(255,255,255,0.4)
    overflow: 'hidden',
    width: '100%',
  },
  blurFill: {
    width: '100%',
  },
  glassOverlay: {
    backgroundColor: COLORS.glassBackground,  // rgba(255,255,255,0.15)
    position: 'relative',
  },
  glossyStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    transform: [{ skewY: '-3deg' }],
  },
  contentContainer: {
    padding: 28,
    width: '100%',
  },
});
