import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { theme } from '../utils/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  isLoading = false,
  style,
  disabled,
  ...props
}) => {
  const isButtonDisabled = disabled || isLoading;

  const getButtonStyles = () => {
    if (isButtonDisabled) {
      return {
        backgroundColor: '#E5E7EB',
        borderColor: '#E5E7EB',
      };
    }

    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: '#FFFFFF',
          borderColor: '#0F5936',
          borderWidth: 1,
        };
      case 'danger':
        return {
          backgroundColor: '#DC2626',
          borderColor: '#DC2626',
        };
      default:
        return {
          backgroundColor: '#0F5936',
          borderColor: '#0F5936',
        };
    }
  };

  const getTextColor = () => {
    if (isButtonDisabled) return '#9CA3AF';
    if (variant === 'secondary') return '#0F5936';
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyles(),
        style,
      ]}
      disabled={isButtonDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: theme.spacing.xs,
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default Button;
