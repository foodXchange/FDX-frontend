import React, { memo } from 'react';
import { Paper, Box, Typography, Chip, Avatar } from '@mui/material';
import { Phone as PhoneIcon, AttachMoney as MoneyIcon } from '@mui/icons-material';
import { Lead } from '../../../types';

interface LeadDetailsHeaderProps {
  lead: Lead;
  formatCurrency: (amount: number) => string;
}

const getStatusColor = (status: string) => {
  const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    hot: 'error',
    warm: 'warning',
    cold: 'info',
    qualified: 'success',
    converted: 'success',
    lost: 'default',
  };
  return statusColors[status] || 'default';
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const LeadDetailsHeader = memo<LeadDetailsHeaderProps>(({ lead, formatCurrency }) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
          {getInitials(lead.company)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {lead.company}
            </Typography>
            <Chip 
              label={lead.status} 
              size="small" 
              color={getStatusColor(lead.status)} 
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {lead.contactPerson}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MoneyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {formatCurrency(lead.dealValue || 0)}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Last contact: {new Date(lead.lastContact).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
});