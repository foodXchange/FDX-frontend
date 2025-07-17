import React from 'react';
import { FC } from 'react';
import { Box, Typography } from '@mui/material';

interface PriceDisplayProps {
  amount: number;
  currency?: string;
  period?: 'hour' | 'day' | 'project' | 'month';
  variant?: 'default' | 'prominent' | 'compact';
}

export const PriceDisplay: FC<PriceDisplayProps> = ({
  amount,
  currency = 'USD',
  period = 'hour',
  variant = 'default',
}) => {
  const formatCurrency = (value: number, curr: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const periodMap = {
    hour: '/hr',
    day: '/day',
    project: ' per project',
    month: '/mo',
  };

  if (variant === 'prominent') {
    return (
      <Box>
        <Typography variant="h4" component="span" fontWeight="bold" color="primary">
          {formatCurrency(amount, currency)}
        </Typography>
        <Typography variant="body1" component="span" color="text.secondary" ml={0.5}>
          {periodMap[period]}
        </Typography>
      </Box>
    );
  }

  if (variant === 'compact') {
    return (
      <Typography variant="body2" color="text.secondary">
        {formatCurrency(amount, currency)}{periodMap[period]}
      </Typography>
    );
  }

  return (
    <Box display="flex" alignItems="baseline" gap={0.5}>
      <Typography variant="h6" component="span" fontWeight="medium">
        {formatCurrency(amount, currency)}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {periodMap[period]}
      </Typography>
    </Box>
  );
};