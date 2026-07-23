import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS } from '../../theme/colors';

interface SkeuomorphicPanelProps {
  children: React.ReactNode;
  style?: ViewStyle;
  bgColor?: string;
}

export const SkeuomorphicPanel: React.FC<SkeuomorphicPanelProps> = ({
  children,
  style,
  bgColor = COLORS.surface,
}) => {
  return (
    <View style={[styles.bevelOuterFrame, style]}>
      <View style={[styles.panelSurface, { backgroundColor: bgColor }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bevelOuterFrame: {
    borderRadius: 10, // Soft beveling curve
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    padding: 1, // Subtle micro-bevel inset frame
    width: '100%',
  },
  panelSurface: {
    borderRadius: 9, // Soft inner bevel alignment
    borderWidth: 1,
    borderColor: '#EAE8E1', // Micro inner bevel line
    padding: 24,
    width: '100%',
  },
});
