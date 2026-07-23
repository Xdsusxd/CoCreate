/**
 * CoCreate Minimalist Editorial / Fine Art Style Palette
 * High contrast, sharp edges, flat UI, zero shadows.
 * Chalk white background, marigold primary, klein blue logo/accent, absolute black, ash grey secondary.
 */
export const COLORS = {
  // Base background & surfaces
  background: '#FAF9F5',        // Clean Chalk White Background
  surface: '#FFFFFF',           // Pure White Container/Form Panel
  surfacePop: '#FFFFFF',

  // Accent & Logo
  kleinBlue: '#2C4EC2',         // Klein Blue / Muted Ultramarine
  primary: '#FFC72C',           // Marigold Yellow Primary Button
  primaryText: '#000000',       // Absolute Black Text
  primaryTextInverted: '#FFFFFF',// White Text for Chromatic Inversion

  // Secondary & Buttons
  secondary: '#FFFFFF',
  secondaryText: '#000000',
  whiteButton: '#FFFFFF',

  // Status & Badges
  errorBackground: '#FFF0F0',
  errorBorder: '#000000',
  errorText: '#000000',
  successBackground: '#FAF9F5',
  successText: '#000000',

  // Typography & Fine Lines
  textPrimary: '#000000',       // Absolute Black
  textSecondary: '#5A5A5C',     // Ash Grey
  textMuted: '#5A5A5C',         // Ash Grey
  textPlaceholder: '#5A5A5C',   // Ash Grey
  textBronze: '#000000',        // Text accent alias
  borderLine: '#000000',        // Absolute Black 1px Line
  borderFocus: '#2C4EC2',       // Klein Blue Line on Focus
} as const;

export type ColorType = typeof COLORS;
