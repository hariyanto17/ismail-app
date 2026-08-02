import { Dimensions } from 'react-native';

export const isTablet = () => {
  const { width, height } = Dimensions.get('window');
  // Use the smaller dimension or standard width check
  return Math.min(width, height) >= 768;
};
