import { TextStyle } from 'react-native';
import { COLORS } from './colors';

export const TYPOGRAPHY = {
  // Monumental Headings (54px, -2px letterSpacing)
  monumental: {
    fontSize: 54,
    lineHeight: 58,
    letterSpacing: -2,
    color: COLORS.kleinBlue,
  } as TextStyle,

  logoCo: {
    fontSize: 54,
    lineHeight: 58,
    letterSpacing: -2,
    fontWeight: '300',
    fontStyle: 'italic',
    color: COLORS.kleinBlue,
  } as TextStyle,

  logoCreate: {
    fontSize: 54,
    lineHeight: 58,
    letterSpacing: -2,
    fontWeight: '900',
    fontStyle: 'normal',
    color: COLORS.kleinBlue,
  } as TextStyle,

  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: COLORS.textPrimary,
  } as TextStyle,

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    letterSpacing: -0.2,
    color: COLORS.textSecondary,
  } as TextStyle,

  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: COLORS.textPrimary,
  } as TextStyle,

  bodyBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  } as TextStyle,

  label: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.textPrimary,
  } as TextStyle,

  button: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.textPrimary,
  } as TextStyle,
} as const;
