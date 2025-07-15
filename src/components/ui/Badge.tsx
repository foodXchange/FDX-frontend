import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { BRAND_COLORS } from '@/constants';

export type BadgeVariant = 
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'certification'
  | 'safety'
  | 'premium';

export type BadgeSize = 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';

export interface BadgeProps extends Omit<ChipProps, 'variant' | 'size' | 'children'> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactElement;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  variant = 'default', 
  size = 'medium', 
  icon, 
  children, 
  sx,
  ...props 
}) => {
  const theme = useTheme();

  const getVariantStyles = (variant: BadgeVariant) => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: theme.palette.grey[100],
          color: theme.palette.grey[800],
          '&:hover': {
            backgroundColor: theme.palette.grey[200],
          },
        };
      case 'primary':
        return {
          backgroundColor: BRAND_COLORS.secondary,
          color: 'white',
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        };
      case 'success':
        return {
          backgroundColor: BRAND_COLORS.success,
          color: 'white',
          '&:hover': {
            backgroundColor: theme.palette.success.dark,
          },
        };
      case 'warning':
        return {
          backgroundColor: BRAND_COLORS.primary,
          color: 'white',
          '&:hover': {
            backgroundColor: BRAND_COLORS.primaryDark,
          },
        };
      case 'error':
        return {
          backgroundColor: theme.palette.error.main,
          color: 'white',
          '&:hover': {
            backgroundColor: theme.palette.error.dark,
          },
        };
      case 'info':
        return {
          backgroundColor: theme.palette.info.main,
          color: 'white',
          '&:hover': {
            backgroundColor: theme.palette.info.dark,
          },
        };
      case 'certification':
        return {
          backgroundColor: `${BRAND_COLORS.success}20`,
          color: BRAND_COLORS.success,
          border: `1px solid ${BRAND_COLORS.success}40`,
          '&:hover': {
            backgroundColor: `${BRAND_COLORS.success}30`,
          },
        };
      case 'safety':
        return {
          backgroundColor: `${BRAND_COLORS.secondary}20`,
          color: BRAND_COLORS.secondary,
          border: `1px solid ${BRAND_COLORS.secondary}40`,
          '&:hover': {
            backgroundColor: `${BRAND_COLORS.secondary}30`,
          },
        };
      case 'premium':
        return {
          backgroundColor: '#FFD70020',
          color: '#B8860B',
          border: '1px solid #FFD70040',
          '&:hover': {
            backgroundColor: '#FFD70030',
          },
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (size: BadgeSize) => {
    switch (size) {
      case 'small':
      case 'sm':
        return {
          height: 24,
          fontSize: '0.75rem',
          '& .MuiChip-label': {
            paddingLeft: 8,
            paddingRight: 8,
          },
        };
      case 'medium':
      case 'md':
        return {
          height: 32,
          fontSize: '0.875rem',
          '& .MuiChip-label': {
            paddingLeft: 12,
            paddingRight: 12,
          },
        };
      case 'large':
      case 'lg':
        return {
          height: 40,
          fontSize: '1rem',
          '& .MuiChip-label': {
            paddingLeft: 16,
            paddingRight: 16,
          },
        };
      default:
        return {};
    }
  };

  return (
    <Chip
      label={children}
      icon={icon}
      sx={{
        borderRadius: 3,
        fontWeight: 500,
        transition: 'all 0.2s ease',
        ...getVariantStyles(variant),
        ...getSizeStyles(size),
        ...sx,
      }}
      {...props}
    />
  );
};

export default Badge;