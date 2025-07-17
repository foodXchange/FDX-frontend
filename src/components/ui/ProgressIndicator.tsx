import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, LinearProgress, CircularProgress } from '@mui/material';

interface ProgressIndicatorProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'linear' | 'circular' | 'steps';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'linear',
  color = 'primary',
  showLabel = false,
  label,
  animated = true,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeMap = {
    linear: {
      sm: 2,
      md: 6,
      lg: 12,
    },
    circular: {
      sm: 48,
      md: 64,
      lg: 96,
    },
  };

  const colorMap = {
    primary: 'primary',
    success: 'success',
    warning: 'warning',
    danger: 'error',
  };

  if (variant === 'linear') {
    return (
      <Box sx={{ width: '100%' }}>
        {(showLabel || label) && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              {label || 'Progress'}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              {Math.round(percentage)}%
            </Typography>
          </Box>
        )}
        <LinearProgress
          variant="determinate"
          value={percentage}
          color={colorMap[color] as any}
          sx={{
            height: sizeMap.linear[size],
            borderRadius: 1,
            '& .MuiLinearProgress-bar': {
              borderRadius: 1,
              background: color === 'primary' 
                ? 'linear-gradient(to right, #1E4C8A, #2E6BB8)'
                : undefined,
            }
          }}
        />
      </Box>
    );
  }

  if (variant === 'circular') {
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={percentage}
          size={sizeMap.circular[size]}
          thickness={size === 'sm' ? 3.6 : size === 'md' ? 3.2 : 2.8}
          color={colorMap[color] as any}
          sx={{
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }}
        />
        {showLabel && (
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography 
              variant={size === 'sm' ? 'caption' : size === 'md' ? 'body2' : 'h6'} 
              component="div" 
              sx={{ fontWeight: 600 }}
            >
              {`${Math.round(percentage)}%`}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  if (variant === 'steps') {
    const steps = 5;
    const activeStep = Math.floor((percentage / 100) * steps);

    return (
      <Box sx={{ width: '100%' }}>
        {label && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              {label}
            </Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {Array.from({ length: steps }).map((_, index) => (
            <Box
              key={index}
              component={animated ? motion.div : 'div'}
              sx={{
                flex: 1,
                height: size === 'sm' ? 32 : size === 'md' ? 40 : 48,
                borderRadius: 2,
                bgcolor: index < activeStep ? colorMap[color] + '.main' : 'grey.200',
                background: index < activeStep && color === 'primary' 
                  ? 'linear-gradient(to right, #1E4C8A, #2E6BB8)'
                  : undefined,
              }}
              initial={animated ? { scale: 0.8, opacity: 0 } : {}}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            />
          ))}
        </Box>
        {showLabel && (
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
              Step {activeStep} of {steps}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  return null;
};

// Loading Spinner Component
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}> = ({ size = 'md', color = 'primary' }) => {
  const sizeMap = {
    sm: 16,
    md: 32,
    lg: 48,
  };

  return (
    <CircularProgress
      size={sizeMap[size]}
      color={color as any}
      sx={{
        color: color === 'text-[#1E4C8A]' ? '#1E4C8A' : undefined
      }}
    />
  );
};

// Page Loading Component
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(4px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <LoadingSpinner size="lg" />
        <Typography sx={{ mt: 2, color: 'text.secondary', fontWeight: 500 }}>
          {message}
        </Typography>
      </Box>
    </Box>
  );
};