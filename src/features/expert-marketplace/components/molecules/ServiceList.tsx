import React from 'react';
import { FC } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import {
  AccessTime,
  CheckCircle,
  TrendingUp,
} from '@mui/icons-material';
import { Grid } from '@mui/material';
import { Service } from '../../types';
import { PriceDisplay } from '../atoms';

interface ServiceListProps {
  services: Service[];
  expertId: string;
  onServiceSelect?: (service: Service) => void;
}

export const ServiceList: FC<ServiceListProps> = ({
  services,
  expertId: _expertId,
  onServiceSelect,
}) => {
  if (services.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          No services available yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {services.map((service) => (
        <Grid size={{ xs: 12, md: 6 }} key={service.id}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3,
              },
            }}
            onClick={() => onServiceSelect?.(service)}
          >
            <CardContent sx={{ flex: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Box flex={1}>
                  <Typography variant="h6" gutterBottom>
                    {service.name}
                  </Typography>
                  <Box display="flex" gap={1} alignItems="center" mb={1}>
                    <Chip
                      label={service.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    {service.subcategory && (
                      <Chip
                        label={service.subcategory}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
                {service.pricing.type === 'fixed' && (
                  <Chip
                    icon={<TrendingUp />}
                    label="Popular"
                    size="small"
                    color="success"
                  />
                )}
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                paragraph
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {service.description}
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Deliverables:
                  </Typography>
                  <Stack spacing={0.5}>
                    {service.deliverables.slice(0, 3).map((deliverable, index) => (
                      <Box key={index} display="flex" alignItems="center" gap={0.5}>
                        <CheckCircle fontSize="small" color="success" />
                        <Typography variant="body2">{deliverable}</Typography>
                      </Box>
                    ))}
                    {service.deliverables.length > 3 && (
                      <Typography variant="body2" color="text.secondary">
                        +{service.deliverables.length - 3} more
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Divider />

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {service.duration.value} {service.duration.unit}
                      {service.duration.isEstimate && ' (est.)'}
                    </Typography>
                  </Box>
                  <PriceDisplay
                    amount={service.pricing.amount}
                    currency={service.pricing.currency}
                    period={service.pricing.type === 'hourly' ? 'hour' : 'project'}
                  />
                </Box>

                {service.tags.length > 0 && (
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {service.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Box>
                )}
              </Stack>
            </CardContent>

            <Box sx={{ p: 2, pt: 0 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  onServiceSelect?.(service);
                }}
              >
                Book This Service
              </Button>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};