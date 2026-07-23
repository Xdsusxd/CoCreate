/**
 * CoCreate Theme Palette - Harmonized Cyber-Editorial & Klein Blue
 * Main Identity: Klein Blue (#2C4EC2) + Off-White (#FAF9F6)
 * Subtle Accents: Neon Pink/Rose (#FF2A85) for refractions & active highlights
 */
export const COLORS = {
  // Base background & surfaces
  background: '#FAF9F6',              // Off-white Chalk Background
  surface: '#FFFFFF',                 // Pure White Container Surface
  surfaceGlass: 'rgba(255, 255, 255, 0.82)',

  // Core Brand & Accents
  kleinBlue: '#2C4EC2',               // Institutional Klein Blue (Primary Brand)
  kleinBlueDark: '#1A338B',           // Deep Klein Blue for 3D press edges
  neonPink: '#FF2A85',                // Subtle Extra Accent: Neon Rose Pink
  magentaIridescent: '#FF75C3',      // Soft Pink Light Specular Reflection
  mintGreen: '#00F5D4',               // Mint Green Success / Available Royalties
  vibrantGreen: '#00F5D4',            // Vibrant Green / Success Accent
  deepViolet: '#7B2CBF',              // Deep Violet Refraction Accent

  // Primaries for Components
  primary: '#2C4EC2',                 // Default Primary CTA is Klein Blue #2C4EC2
  primaryText: '#FFFFFF',             // White Text on Primary CTA
  primaryTextInverted: '#080808',

  // Liquid Pink Crystal Tokens (Subtle Pink Tinting)
  glassPinkBg: 'rgba(255, 42, 133, 0.04)',
  glassPinkBorder: 'rgba(255, 42, 133, 0.28)',
  glassPinkRefraction: 'rgba(255, 117, 195, 0.35)',
  glassWhiteBg: 'rgba(255, 255, 255, 0.75)',
  glassWhiteBorder: 'rgba(255, 255, 255, 0.95)',
  glassBackground: 'rgba(255, 255, 255, 0.80)',
  glassBorder: 'rgba(44, 78, 194, 0.20)',

  // Secondary & Neutral
  secondary: '#FFFFFF',
  secondaryText: '#080808',
  whiteButton: '#FFFFFF',

  // Neo-Brutalist & Cyber Micro-Borders (1.5px / 2px)
  borderNeo: '#080808',               // Absolute Dark Border
  shadowNeo: '#080808',               // Solid Flat Shadow
  borderLine: 'rgba(8, 8, 8, 0.10)',

  // Status & Errors
  errorBackground: '#FFF0F3',
  errorBorder: '#FF2A85',
  errorText: '#FF2A85',
  errorNeo: '#FF2A85',
  successBackground: '#E6FFF9',
  successText: '#00A892',

  // Typography
  textPrimary: '#080808',             // Absolute Black #080808
  textSecondary: '#5A5A5C',           // Ash Grey
  textMuted: '#888888',
  textPlaceholder: '#AAAAAA',
  borderFocus: '#2C4EC2',             // Klein Blue Line on Focus
  borderFocusPink: '#FF2A85',         // Rose Pink Line on Active Focus
} as const;

export type ColorType = typeof COLORS;
