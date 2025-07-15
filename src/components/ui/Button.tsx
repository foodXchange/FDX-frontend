import { forwardRef } from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress, Box, SxProps, Theme } from '@mui/material';
import { useTheme } from '@mui/material/styles';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning' | 'gold';
type ButtonSize = 'default' | 'sm' | 'lg' | 'xl' | 'icon';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  sx?: SxProps<Theme>;
}

const getButtonStyles = (theme: any, variant: ButtonVariant, size: ButtonSize) => {
  const baseStyles = {
    borderRadius: 2,
    textTransform: 'none' as const,
    fontWeight: 500,
    transition: 'all 0.2s ease',
    minWidth: 'auto',
    '&:focus-visible': {
      outline: 'none',
      ring: 2,
      ringColor: theme.palette.primary.main,
      ringOffset: 2,
    },
    '&:disabled': {
      pointerEvents: 'none',
      opacity: 0.5,
    },
    '&:hover': {
      transform: 'scale(1.02)',
    },
    '&:active': {
      transform: 'scale(0.98)',
    },
  };

  const variantStyles = {
    default: {
      background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
      color: 'white',
      boxShadow: theme.shadows[4],
      '&:hover': {
        ...baseStyles['&:hover'],
        background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
        boxShadow: theme.shadows[8],
      },
    },
    destructive: {
      bgcolor: 'error.main',
      color: 'white',
      boxShadow: theme.shadows[4],
      '&:hover': {
        ...baseStyles['&:hover'],
        bgcolor: 'error.dark',
        boxShadow: theme.shadows[8],
      },
    },
    outline: {
      border: `1px solid ${theme.palette.divider}`,
      bgcolor: 'background.paper',
      color: 'text.primary',
      '&:hover': {
        ...baseStyles['&:hover'],
        bgcolor: 'action.hover',
        borderColor: theme.palette.text.secondary,
      },
    },
    secondary: {
      bgcolor: 'grey.100',
      color: 'text.primary',
      '&:hover': {
        ...baseStyles['&:hover'],
        bgcolor: 'grey.200',
      },
    },
    ghost: {
      bgcolor: 'transparent',
      color: 'text.primary',
      '&:hover': {
        ...baseStyles['&:hover'],
        bgcolor: 'action.hover',
      },
    },
    link: {
      color: 'primary.main',
      bgcolor: 'transparent',
      textDecoration: 'underline',
      textUnderlineOffset: '4px',
      '&:hover': {
        ...baseStyles['&:hover'],
        textDecoration: 'underline',
      },
    },
    success: {
      background: `linear-gradient(to right, ${theme.palette.success.main}, ${theme.palette.success.light})`,
      color: 'white',
      boxShadow: theme.shadows[4],
      '&:hover': {
        ...baseStyles['&:hover'],
        background: `linear-gradient(to right, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
        boxShadow: theme.shadows[8],
      },
    },
    warning: {
      background: `linear-gradient(to right, ${theme.palette.warning.main}, ${theme.palette.warning.light})`,
      color: 'white',
      boxShadow: theme.shadows[4],
      '&:hover': {
        ...baseStyles['&:hover'],
        background: `linear-gradient(to right, ${theme.palette.warning.dark}, ${theme.palette.warning.main})`,
        boxShadow: theme.shadows[8],
      },
    },
    gold: {
      background: 'linear-gradient(to right, #B08D57, #D4A574)',
      color: 'white',
      boxShadow: theme.shadows[4],
      '&:hover': {
        ...baseStyles['&:hover'],
        background: 'linear-gradient(to right, #9A7A4A, #C19560)',
        boxShadow: theme.shadows[8],
      },
    },
  };

  const sizeStyles = {
    default: {
      height: 40,
      px: 2,
      py: 1,
      fontSize: '0.875rem',
    },
    sm: {
      height: 32,
      px: 1.5,
      fontSize: '0.75rem',
      borderRadius: 1.5,
    },
    lg: {
      height: 48,
      px: 4,
      fontSize: '1rem',
      borderRadius: 2,
    },
    xl: {
      height: 56,
      px: 5,
      fontSize: '1.125rem',
      borderRadius: 3,
    },
    icon: {
      height: 40,
      width: 40,
      minWidth: 40,
      p: 0,
    },
  };

  return {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
  };
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'default', 
    size = 'default', 
    loading, 
    leftIcon, 
    rightIcon, 
    children, 
    disabled, 
    sx,
    ...props 
  }, ref) => {
    const theme = useTheme();
    const buttonStyles = getButtonStyles(theme, variant, size);

    return (
      <MuiButton
        ref={ref}
        disabled={disabled || loading}
        sx={{
          ...buttonStyles,
          ...sx,
        }}
        {...props}
      >
        {loading ? (
          <CircularProgress 
            size={16} 
            sx={{ 
              color: 'currentColor',
              mr: 1,
            }} 
          />
        ) : leftIcon ? (
          <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
            {leftIcon}
          </Box>
        ) : null}
        {children}
        {rightIcon && (
          <Box component="span" sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
            {rightIcon}
          </Box>
        )}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';

export { Button };