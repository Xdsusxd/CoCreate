/**
 * CoCreate Liquid Glassmorphism Editorial Palette
 * Premium frosted glass aesthetic over chalk white.
 * Klein Blue logo/accent, Marigold Yellow primary, zero shadows.
 */
export const COLORS = {
  // Base background & surfaces
  background: '#FAF9F5',        // Clean Chalk White Background
  surface: '#FFFFFF',           // Pure White Container/Form Panel

  // Liquid Glass
  glassBackground: 'rgba(255, 255, 255, 0.15)',   // Frosted liquid glass fill
  glassBorder: 'rgba(255, 255, 255, 0.4)',         // Brilliant fine glass border
  glossyHighlightStart: 'rgba(255, 255, 255, 0.45)', // Diagonal refraction start
  glossyHighlightEnd: 'rgba(255, 255, 255, 0.0)',    // Diagonal refraction end

  // Accent & Logo
  kleinBlue: '#2C4EC2',         // Klein Blue / Muted Ultramarine
  primary: '#FFC72C',           // Marigold Yellow (Amarillo Caléndula)
  primaryText: '#000000',       // Absolute Black Text on Marigold
  primaryTextInverted: '#FFFFFF',

  // Secondary & Buttons
  secondary: '#FFFFFF',
  secondaryText: '#000000',
  whiteButton: '#FFFFFF',

  // Status
  errorBackground: '#FFF0F0',
  errorBorder: '#D32F2F',
  errorText: '#D32F2F',
  successBackground: '#FAF9F5',
  successText: '#000000',

  // Typography & Fine Lines
  textPrimary: '#000000',       // Absolute Black
  textSecondary: '#5A5A5C',     // Ash Grey
  textMuted: '#5A5A5C',
  textPlaceholder: '#9E9E9E',
  borderLine: 'rgba(0, 0, 0, 0.12)',  // Subtle 1px line (not harsh black)
  borderFocus: '#2C4EC2',       // Klein Blue Line on Focus
} as const;

export type ColorType = typeof COLORS;
