import React from 'react';
import { Box } from '@mui/material';

interface LogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'small' | 'medium' | 'large';
  color?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'full',
  size = 'medium',
  color = 'dark'
}) => {
  const sizeMap = {
    small: { iconSize: 58 },
    medium: { iconSize: 86 },
    large: { iconSize: 115 }
  };

  const { iconSize } = sizeMap[size];

  const LogoIcon = () => (
    <Box
      component="img"
      src="/Logo.png"
      alt="FOOD CHANGE Logo"
      sx={{
        width: iconSize,
        height: iconSize,
        objectFit: 'contain',
        display: 'inline-block',
        mr: variant === 'full' ? 1 : 0,
      }}
    />
  );

  if (variant === 'icon') {
    return <LogoIcon />;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <LogoIcon />
      {variant === 'full' && (
        <Box
          component="span"
          sx={{
            fontWeight: 'bold',
            fontSize: size === 'small' ? '1rem' : size === 'medium' ? '1.25rem' : '1.5rem',
            color: color === 'light' ? 'white' : 'text.primary',
          }}
        >
          FOOD CHANGE
        </Box>
      )}
    </Box>
  );
};

export default Logo;