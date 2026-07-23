import React from 'react';
import { GlassPanel } from './GlassPanel';
import { ViewStyle } from 'react-native';

interface LiquidGlassPanelProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const LiquidGlassPanel: React.FC<LiquidGlassPanelProps> = ({ children, style }) => {
  return <GlassPanel style={style}>{children}</GlassPanel>;
};
