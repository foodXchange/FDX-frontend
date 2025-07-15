import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  text?: string;
  fullScreen?: boolean;
}

const getSizeValue = (size: 'sm' | 'md' | 'lg') => {
  const sizes = {
    sm: 16,
    md: 32,
    lg: 48
  };
  return sizes[size];
};

const getColorValue = (color: 'primary' | 'white' | 'gray', theme: any) => {
  const colors = {
    primary: theme.palette.primary.main,
    white: '#ffffff',
    gray: theme.palette.text.secondary
  };
  return colors[color];
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  fullScreen = false
}) => {
  const theme = useTheme();
  const sizeValue = getSizeValue(size);
  const colorValue = getColorValue(color, theme);

  const spinnerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <Box
        component={motion.div}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        sx={{
          width: sizeValue,
          height: sizeValue,
          color: colorValue,
        }}
      >
        <Box
          component="svg"
          sx={{
            width: '100%',
            height: '100%',
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </Box>
      </Box>
      
      {text && (
        <Typography
          component={motion.p}
          variant="body2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          sx={{
            fontWeight: 500,
            color: colorValue,
          }}
        >
          {text}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #6B46C1 0%, #1E3A8A 50%, #0891B2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 'modal',
        }}
      >
        <Box
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            borderRadius: 6,
            p: 4,
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {spinnerContent}
        </Box>
      </Box>
    );
  }

  return spinnerContent;
};

export const LoadingDots: React.FC<{ color?: 'primary' | 'white' | 'gray' }> = ({ 
  color = 'primary' 
}) => {
  const theme = useTheme();
  const colorValue = getColorValue(color, theme);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          component={motion.div}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2
          }}
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: colorValue,
          }}
        />
      ))}
    </Box>
  );
};

export default LoadingSpinner;