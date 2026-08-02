import { Colors } from './colors';
import { Spacing } from './spacing';
import { Typography } from './typography';
import { Radius } from './radius';
import { Shadow } from './shadow';

export const Theme = {
  colors: Colors,
  spacing: Spacing,
  typography: Typography,
  radius: Radius,
  borderRadius: Radius, // Alias for backward compatibility
  shadow: Shadow,
};

export default Theme;
