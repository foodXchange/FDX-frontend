import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Button, Card, CardContent, Chip, Stack, Divider } from '@mui/material';
import { Lead } from '../types';
import { formatCurrency } from '@/utils/format';

interface LeadCardProps {
  lead: Lead;
  onClaim?: (leadId: string) => void;
  onView?: (leadId: string) => void;
  showActions?: boolean;
  variant?: 'available' | 'claimed';
}

export const LeadCard: React.FC<LeadCardProps> = ({ 
  lead, 
  onClaim, 
  onView,
  showActions = true,
  variant = 'available'
}) => {
  const isUrgent = lead.priority === 'urgent';
  const hoursUntilExpiry = Math.max(0, (new Date(lead.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60));
  const isExpiringSoon = hoursUntilExpiry < 2;

  const getMatchScoreColor = () => {
    if (lead.matchScore >= 90) return 'success.main';
    if (lead.matchScore >= 70) return 'warning.main';
    return 'grey.600';
  };

  const getBorderColor = () => {
    if (lead.matchScore >= 90) return 'success.main';
    if (lead.matchScore >= 70) return 'warning.main';
    return 'grey.300';
  };

  const getStatusColor = (): 'primary' | 'warning' | 'success' | 'error' | 'default' => {
    switch (lead.status) {
      case 'contacted': return 'primary';
      case 'negotiating': return 'warning';
      case 'won': return 'success';
      case 'lost': return 'error';
      default: return 'default';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      sx={{ width: '100%' }}
    >
      <Card 
        sx={{ 
          borderLeft: 4, 
          borderColor: getBorderColor(),
          '&:hover': { boxShadow: 6 },
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h6" 
                component="h3" 
                sx={{ 
                  color: 'grey.900', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1
                }}
              >
                {lead.rfqTitle}
                {isUrgent && (
                  <FireIcon 
                    sx={{ 
                      color: 'error.main', 
                      fontSize: 20,
                      animation: 'pulse 2s infinite'
                    }} 
                  />
                )}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                {lead.buyerName}
              </Typography>
            </Box>
            
            {/* Match Score */}
            <Box sx={{ textAlign: 'right' }}>
              <Typography 
                variant="h4" 
                component="div" 
                sx={{ 
                  color: getMatchScoreColor(),
                  fontWeight: 'bold'
                }}
              >
                {lead.matchScore}%
              </Typography>
              <Typography variant="caption" color="grey.500">
                Match
              </Typography>
            </Box>
          </Box>

          {/* Details */}
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'grey.600' }}>
              <MapPinIcon sx={{ fontSize: 16, mr: 1.5, color: 'grey.400' }} />
              <Typography variant="body2">
                {lead.buyerLocation}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'grey.600' }}>
              <CurrencyDollarIcon sx={{ fontSize: 16, mr: 1.5, color: 'grey.400' }} />
              <Typography variant="body2">
                Est. {formatCurrency(lead.estimatedValue)}
              </Typography>
            </Box>
          </Stack>

          {/* Category & Commission */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Chip 
              label={lead.category}
              variant="outlined"
              size="small"
            />
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
              Commission: {formatCurrency(lead.estimatedCommission)}
            </Typography>
          </Box>

          {/* Timer */}
          {variant === 'available' && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              color: isExpiringSoon ? 'error.main' : 'grey.500',
              fontWeight: isExpiringSoon ? 'medium' : 'normal'
            }}>
              <ClockIcon sx={{ fontSize: 16, mr: 1.5 }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  animation: isExpiringSoon ? 'pulse 2s infinite' : 'none'
                }}
              >
                {isExpiringSoon ? (
                  `Expires in ${Math.floor(hoursUntilExpiry)}h ${Math.floor((hoursUntilExpiry % 1) * 60)}m`
                ) : (
                  `Claim within ${Math.floor(hoursUntilExpiry)} hours`
                )}
              </Typography>
            </Box>
          )}

          {/* Status for claimed leads */}
          {variant === 'claimed' && lead.status && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Status
              </Typography>
              <Chip
                label={lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                color={getStatusColor()}
                size="small"
              />
            </Box>
          )}

          <Divider sx={{ mb: 2 }} />
          
          {/* Actions */}
          {showActions && (
            <Stack direction="row" spacing={2}>
              {variant === 'available' && onClaim && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  sx={{ flex: 1 }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => onClaim(lead.id)}
                    startIcon={<ChartBarIcon />}
                    fullWidth
                    sx={{ py: 1.5 }}
                  >
                    Claim Lead
                  </Button>
                </motion.div>
              )}
              
              {onView && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  sx={{ flex: variant === 'available' ? '0 0 auto' : 1 }}
                >
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => onView(lead.id)}
                    fullWidth={variant === 'claimed'}
                    sx={{ py: 1.5 }}
                  >
                    View Details
                  </Button>
                </motion.div>
              )}
            </Stack>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};