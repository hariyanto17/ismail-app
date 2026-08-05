import Branding from '../branding';

export const Colors = {
  primary: Branding.colors.primary,
  primaryDark: Branding.colors.primaryDark,
  primaryLight: Branding.colors.primaryLight,

  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceLight: '#F3F4F6',

  text: '#1F2937',
  textMuted: '#6B7280',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',

  border: '#E5E7EB',

  success: '#16A34A',
  secondary: Branding.colors.secondary,
  warning: '#F59E0B',
  danger: '#DC2626',

  white: '#FFFFFF',
  grayLight: '#F3F4F6',
  gray: '#9CA3AF',
  cartFooterBg: Branding.colors.cartFooterBg,
};

export type ColorsType = typeof Colors;
export default Colors;
