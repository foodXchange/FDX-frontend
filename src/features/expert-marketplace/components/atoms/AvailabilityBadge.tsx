import React from 'react';
import { FC } from 'react';
import { Chip, ChipProps } from '@mui/material';
import { Circle } from '@mui/icons-material';

interface AvailabilityBadgeProps extends Omit<ChipProps, 'color'> {
  isAvailable: boolean;
  nextAvailable?: string;
}

export const AvailabilityBadge: FC<AvailabilityBadgeProps> = ({
  isAvailable,
  nextAvailable,
  ...chipProps
}) => {
  const formatNextAvailable = (date?: string) => {
    if (!date) return '';
    const nextDate = new Date(date);
    const today = new Date();
    const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Available today';
    if (diffDays === 1) return 'Available tomorrow';
    if (diffDays <= 7) return `Available in ${diffDays} days`;
    return `Available ${nextDate.toLocaleDateString()}`;
  };

  if (isAvailable) {
    return (
      <Chip
        icon={<Circle sx={{ fontSize: 8 }} />}
        label="Available"
        size="small"
        color="success"
        sx={{
          '& .MuiChip-icon': {
            color: 'success.main',
          },
        }}
        {...chipProps}
      />
    );
  }

  return (
    <Chip
      icon={<Circle sx={{ fontSize: 8 }} />}
      label={nextAvailable ? formatNextAvailable(nextAvailable) : 'Unavailable'}
      size="small"
      color="default"
      sx={{
        '& .MuiChip-icon': {
          color: 'text.disabled',
        },
      }}
      {...chipProps}
    />
  );
};