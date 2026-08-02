export const Colors = {
  primary: '#0F5936',
  primaryDark: '#0A472B',
  primaryLight: '#2D7A56',

  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceLight: '#F3F4F6', // Alias for backward compatibility

  text: '#1F2937',      // Alias for backward compatibility (dark gray)
  textMuted: '#6B7280', // Alias for backward compatibility (slate gray)
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',

  border: '#E5E7EB',

  success: '#16A34A',
  secondary: '#0F5936', // Alias mapping old secondary green to primary brand green
  warning: '#F59E0B',
  danger: '#DC2626',

  white: '#FFFFFF',
  grayLight: '#F3F4F6',
  gray: '#9CA3AF',
  cartFooterBg: '#EAF5EF',
};
export type ColorsType = typeof Colors;
