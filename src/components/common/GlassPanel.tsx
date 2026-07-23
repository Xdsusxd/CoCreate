import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme/colors';

interface GlassPanelProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

/**
 * Liquid Glassmorphism Panel.
 * - Frosted glass effect via BlurView (native) or translucent rgba fallback (web).
 * - Fine 1.5px semi-transparent white border.
 * - Micro-rounded 4px corners (90° with subtle softness).
 * - Diagonal glossy refraction highlight overlay.
 */
export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  style,
  intensity = 60,
}) => {
  const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

  return (
    <View style={[styles.outerFrame, style]}>
      {isNative ? (
        <BlurView
          intensity={intensity}
          tint="light"
          style={styles.blurFill}
        >
          {/* Glossy Refraction Highlight Overlay */}
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.35)',
              'rgba(255, 255, 255, 0.0)',
              'rgba(255, 255, 255, 0.08)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.glossOverlay}
          />
          <View style={styles.innerContent}>
            {children}
          </View>
        </BlurView>
      ) : (
        <View style={styles.webFallback}>
          {/* Glossy Refraction Highlight Overlay (web) */}
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.35)',
              'rgba(255, 255, 255, 0.0)',
              'rgba(255, 255, 255, 0.08)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.glossOverlay}
          />
          <View style={styles.innerContent}>
            {children}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerFrame: {
    borderRadius: 4,                          // Micro-rounded 90° corners
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',  // Fine brilliant semi-transparent white border
    overflow: 'hidden',
    width: '100%',
  },
  blurFill: {
    overflow: 'hidden',
  },
  webFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Translucent frosted glass fallback
    overflow: 'hidden',
  },
  glossOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  innerContent: {
    padding: 28,
    zIndex: 1,
  },
});
