import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Schedule as ClockIcon,
  BarChart as ChartBarIcon,
  LocationOn as MapPinIcon,
  Tag as TagIcon,
  Whatshot as FireIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/format';

interface RFQ {
  id: string;
  title: string;
  description: string;
  category: string;
  buyerName: string;
  buyerLocation: string;
  estimatedValue: number;
  createdAt: Date;
  expiresAt: Date;
  status: string;
}

interface AgentRFQCardProps {
  rfq: RFQ;
  matchScore?: number;
  estimatedCommission?: number;
  claimDeadline?: Date;
  onClaim?: (rfqId: string) => void;
  children?: React.ReactNode;
}

export const AgentRFQCard: React.FC<AgentRFQCardProps> = ({
  rfq,
  matchScore,
  estimatedCommission,
  claimDeadline,
  onClaim,
  children
}) => {
  const { user } = useAuth();
  
  const isAgent = user?.isAgent || user?.role === 'agent';
  const showAgentFeatures = isAgent && matchScore !== undefined;
  
  const [claiming, setClaiming] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState('');

  // Calculate time left for claiming
  React.useEffect(() => {
    if (!claimDeadline) return;

    const updateTimer = () => {
      const now = Date.now();
      const deadline = new Date(claimDeadline).getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      if (minutes > 60) {
        const hours = Math.floor(minutes / 60);
        setTimeLeft(`${hours}h ${minutes % 60}m`);
      } else {
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [claimDeadline]);

  const handleClaim = async () => {
    if (!onClaim) return;
    
    setClaiming(true);
    try {
      await onClaim(rfq.id);
    } catch (error) {
      console.error('Failed to claim lead:', error);
    } finally {
      setClaiming(false);
    }
  };

  // Determine border color based on match score
  const getBorderColor = () => {
    if (!matchScore) return 'grey.300';
    if (matchScore >= 90) return 'success.main';
    if (matchScore >= 70) return 'warning.main';
    return 'grey.400';
  };

  const getMatchBadgeColor = (): 'success' | 'warning' | 'default' => {
    if (!matchScore) return 'default';
    if (matchScore >= 90) return 'success';
    if (matchScore >= 70) return 'warning';
    return 'default';
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      style={{ width: '100%' }}
    >
      <Card 
        sx={{ 
          border: 2, 
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
                {rfq.title}
                {timeLeft === 'Expired' && (
                  <FireIcon sx={{ color: 'error.main', fontSize: 20 }} />
                )}
              </Typography>
              <Typography variant="body2" color="grey.600">
                {rfq.buyerName}
              </Typography>
            </Box>
            
            {/* Match Score Badge */}
            {showAgentFeatures && (
              <Chip
                label={`${matchScore}% Match`}
                color={getMatchBadgeColor()}
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Box>

          {/* Description */}
          <Typography variant="body2" color="grey.700" sx={{ mb: 2 }}>
            {rfq.description}
          </Typography>

          {/* Details */}
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'grey.600' }}>
              <MapPinIcon sx={{ fontSize: 16, mr: 1.5, color: 'grey.400' }} />
              <Typography variant="body2">
                {rfq.buyerLocation}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'grey.600' }}>
              <TagIcon sx={{ fontSize: 16, mr: 1.5, color: 'grey.400' }} />
              <Typography variant="body2">
                {rfq.category}
              </Typography>
            </Box>
          </Stack>

          {/* Value and Commission */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="caption" color="grey.500">
                Estimated Value
              </Typography>
              <Typography variant="h6" sx={{ color: 'grey.900', fontWeight: 'bold' }}>
                {formatCurrency(rfq.estimatedValue)}
              </Typography>
            </Box>
            
            {showAgentFeatures && estimatedCommission && (
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="grey.500">
                  Your Commission
                </Typography>
                <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                  {formatCurrency(estimatedCommission)}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Agent Action Bar */}
          {showAgentFeatures && onClaim && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {timeLeft !== 'Expired' ? (
                    <>
                      <ClockIcon sx={{ fontSize: 16, mr: 1.5, color: 'grey.400' }} />
                      <Typography variant="body2" sx={{ color: 'grey.600', mr: 1 }}>
                        Claim in
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                        {timeLeft}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 'medium' }}>
                      Claiming period expired
                    </Typography>
                  )}
                </Box>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    color={timeLeft === 'Expired' ? 'inherit' : 'warning'}
                    onClick={handleClaim}
                    disabled={claiming || timeLeft === 'Expired'}
                    startIcon={<ChartBarIcon />}
                    sx={{ 
                      minWidth: 120,
                      bgcolor: timeLeft === 'Expired' ? 'grey.100' : undefined,
                      color: timeLeft === 'Expired' ? 'grey.400' : undefined,
                      '&:hover': {
                        bgcolor: timeLeft === 'Expired' ? 'grey.100' : undefined,
                      }
                    }}
                  >
                    {claiming ? 'Claiming...' : 'Claim Lead'}
                  </Button>
                </motion.div>
              </Box>
            </Box>
          )}

          {/* Custom children (for non-agent view) */}
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
};