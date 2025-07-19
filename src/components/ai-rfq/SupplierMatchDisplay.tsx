import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  LocalShipping as LocalShippingIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { SupplierMatch } from '../../types/ai-rfq';

interface SupplierMatchDisplayProps {
  matches: SupplierMatch[];
  onSelectSupplier?: (match: SupplierMatch) => void;
  onRequestQuote?: (match: SupplierMatch) => void;
  onViewDetails?: (supplierId: string) => void;
  loading?: boolean;
}

export const SupplierMatchDisplay: React.FC<SupplierMatchDisplayProps> = ({
  matches,
  onSelectSupplier,
  onRequestQuote,
  onViewDetails,
  loading = false
}) => {
  const [expandedMatches, setExpandedMatches] = useState<string[]>([]);

  const handleMatchToggle = (supplierId: string) => {
    setExpandedMatches(prev =>
      prev.includes(supplierId)
        ? prev.filter(s => s !== supplierId)
        : [...prev, supplierId]
    );
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.9) return 'success';
    if (score >= 0.7) return 'info';
    if (score >= 0.5) return 'warning';
    return 'error';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Finding the best supplier matches...
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <BusinessIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No supplier matches found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your requirements or search criteria
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        AI Supplier Matches ({matches.length})
      </Typography>
      
      {matches.map((match) => (
        <Card key={match.supplierId} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 2 }}>
                <BusinessIcon />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h3">
                  {match.supplierName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Chip
                    label={`${Math.round(match.matchScore * 100)}% Match`}
                    color={getMatchScoreColor(match.matchScore)}
                    size="small"
                  />
                  <Chip
                    label={`${Math.round(match.confidence * 100)}% Confidence`}
                    variant="outlined"
                    size="small"
                  />
                  {match.risk && (
                    <Chip
                      label={`${match.risk.overallRisk || 'Unknown'} Risk`}
                      color={getRiskColor(match.risk.overallRisk || 'unknown')}
                      size="small"
                    />
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onViewDetails?.(match.supplierId)}
                >
                  Details
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onRequestQuote?.(match)}
                >
                  Request Quote
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => onSelectSupplier?.(match)}
                >
                  Select
                </Button>
              </Box>
            </Box>

            {/* Quick Overview */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Estimated Price
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {match.pricing?.estimate || 'Contact for quote'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalShippingIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Delivery Time
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {match.delivery?.estimatedTime || 'TBD'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <StarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Quality Score
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating
                        value={match.quality?.score || 0}
                        max={5}
                        readOnly
                        size="small"
                      />
                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                        ({match.quality?.score?.toFixed(1) || 'N/A'})
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Performance
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {match.pastPerformance?.overallRating?.toFixed(1) || 'New'}/5
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Match Reasons */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Why this supplier matches:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {match.matchReasons?.slice(0, 3).map((reason: any, index: number) => (
                  <Tooltip key={index} title={reason.explanation}>
                    <Chip
                      label={`${reason.factor} (${Math.round(reason.score * 100)}%)`}
                      size="small"
                      variant="outlined"
                    />
                  </Tooltip>
                ))}
              </Box>
            </Box>

            {/* Recommendations & Concerns */}
            {(match.recommendations && match.recommendations.length > 0 || match.concerns && match.concerns.length > 0) && (
              <Box sx={{ mb: 2 }}>
                {match.recommendations?.length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="success.main" fontWeight="medium">
                      ✓ Strengths:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {match.recommendations.slice(0, 2).join(', ')}
                    </Typography>
                  </Box>
                )}
                {match.concerns && match.concerns.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="warning.main" fontWeight="medium">
                      ⚠ Considerations:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {match.concerns?.slice(0, 2).join(', ')}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Detailed Information (Expandable) */}
            <Accordion
              expanded={expandedMatches.includes(match.supplierId)}
              onChange={() => handleMatchToggle(match.supplierId)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2">
                  View detailed analysis
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {/* Capabilities */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Capabilities
                    </Typography>
                    <List dense>
                      {match.capabilities?.slice(0, 5).map((capability, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={capability.name || 'Capability'}
                            secondary={capability.level || 'Standard'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>

                  {/* Compliance Status */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Compliance Status
                    </Typography>
                    <List dense>
                      {match.compliance?.certifications?.slice(0, 3).map((cert: any, index: number) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={cert.name || 'Certification'}
                            secondary={cert.status === 'valid' ? 'Valid' : 'Expired'}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>

                {/* All Match Reasons */}
                {match.matchReasons?.length > 3 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Complete Match Analysis
                    </Typography>
                    <List dense>
                      {match.matchReasons.map((reason, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`${reason.factor} (${Math.round(reason.score * 100)}%)`}
                            secondary={reason.explanation}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default SupplierMatchDisplay;