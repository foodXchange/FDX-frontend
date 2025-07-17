import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  LinearProgress,
  Stack,
  CircularProgress,
  Avatar,
  Paper
} from '@mui/material';
import { 
  Schedule as Clock, 
  Error as AlertCircle, 
  Inventory as Package, 
  LocalShipping as Truck, 
  Home,
  LocationOn,
  Thermostat
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useSampleTracking } from '../../hooks/useSampleTracking';


interface TimelineEvent {
  id: string;
  timestamp: Date;
  status: 'completed' | 'active' | 'pending';
  title: string;
  description?: string;
  location?: string;
  temperature?: number;
  icon: React.ElementType;
}

interface Sample {
  id: string;
  trackingNumber: string;
  orderId: string;
  productName: string;
  quantity: number;
  unit: string;
  status: 'requested' | 'preparing' | 'in_transit' | 'delivered' | 'cancelled';
  currentLocation: string;
  currentTemperature?: number;
  requiredTemperature?: {
    min: number;
    max: number;
  };
  timeline: TimelineEvent[];
  estimatedDelivery?: Date;
  actualDelivery?: Date;
}

const statusConfig = {
  requested: { label: 'Requested', color: 'default' as const },
  preparing: { label: 'Preparing', color: 'warning' as const },
  in_transit: { label: 'In Transit', color: 'info' as const },
  delivered: { label: 'Delivered', color: 'success' as const },
  cancelled: { label: 'Cancelled', color: 'error' as const },
};

// const getTimelineIcon = (status: string): React.ElementType => {
//   switch (status) {
//     case 'requested':
//       return Package;
//     case 'preparing':
//       return Clock;
//     case 'in_transit':
//       return Truck;
//     case 'delivered':
//       return Home;
//     default:
//       return CheckCircle;
//   }
// };

export const SampleTracker: React.FC = () => {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [loading, setLoading] = useState(true);
  
  // WebSocket integration for real-time updates
  const { 
    isConnected, 
    sampleUpdates, 
    connectionError,
    subscribeToSample,
    unsubscribeFromSample 
  } = useSampleTracking();

  // Mock data for demonstration
  useEffect(() => {
    const mockSamples: Sample[] = [
      {
        id: '1',
        trackingNumber: 'FDX-SAMP-2024-001',
        orderId: 'ORD-2024-1234',
        productName: 'Organic Wheat Flour Sample',
        quantity: 500,
        unit: 'g',
        status: 'in_transit',
        currentLocation: 'Distribution Center - Frankfurt',
        currentTemperature: 22,
        requiredTemperature: { min: 18, max: 25 },
        estimatedDelivery: new Date('2024-12-20'),
        timeline: [
          {
            id: '1',
            timestamp: new Date('2024-12-15T10:00:00'),
            status: 'completed',
            title: 'Sample Requested',
            description: 'Sample request received from buyer',
            icon: Package,
          },
          {
            id: '2',
            timestamp: new Date('2024-12-16T14:30:00'),
            status: 'completed',
            title: 'Sample Prepared',
            description: 'Sample packaged and ready for shipping',
            location: 'Supplier Warehouse - Munich',
            temperature: 21,
            icon: Clock,
          },
          {
            id: '3',
            timestamp: new Date('2024-12-17T09:15:00'),
            status: 'active',
            title: 'In Transit',
            description: 'Sample picked up by courier',
            location: 'Distribution Center - Frankfurt',
            temperature: 22,
            icon: Truck,
          },
          {
            id: '4',
            timestamp: new Date('2024-12-20T15:00:00'),
            status: 'pending',
            title: 'Estimated Delivery',
            description: 'Expected delivery to buyer',
            icon: Home,
          },
        ],
      },
      {
        id: '2',
        trackingNumber: 'FDX-SAMP-2024-002',
        orderId: 'ORD-2024-1235',
        productName: 'Premium Coffee Beans Sample',
        quantity: 250,
        unit: 'g',
        status: 'delivered',
        currentLocation: 'Delivered',
        currentTemperature: 20,
        requiredTemperature: { min: 15, max: 22 },
        actualDelivery: new Date('2024-12-14'),
        timeline: [
          {
            id: '1',
            timestamp: new Date('2024-12-10T10:00:00'),
            status: 'completed',
            title: 'Sample Requested',
            icon: Package,
          },
          {
            id: '2',
            timestamp: new Date('2024-12-11T14:30:00'),
            status: 'completed',
            title: 'Sample Prepared',
            icon: Clock,
          },
          {
            id: '3',
            timestamp: new Date('2024-12-12T09:15:00'),
            status: 'completed',
            title: 'In Transit',
            icon: Truck,
          },
          {
            id: '4',
            timestamp: new Date('2024-12-14T11:30:00'),
            status: 'completed',
            title: 'Delivered',
            description: 'Sample delivered successfully',
            icon: Home,
          },
        ],
      },
    ];
    
    setSamples(mockSamples);
    setSelectedSample(mockSamples[0]);
    setLoading(false);
    
    // Subscribe to sample updates for each sample
    mockSamples.forEach(sample => {
      subscribeToSample(sample.id);
    });
  }, [subscribeToSample]);

  // Handle real-time sample updates
  useEffect(() => {
    if (sampleUpdates.length > 0) {
      // Update samples with real-time data
      setSamples(prevSamples => {
        return prevSamples.map(sample => {
          const update = sampleUpdates.find(u => u.id === sample.id);
          if (update) {
            return {
              ...sample,
              status: update.status,
              currentLocation: update.currentLocation || sample.currentLocation,
              currentTemperature: update.currentTemperature || sample.currentTemperature,
              timeline: update.timeline || sample.timeline,
            };
          }
          return sample;
        });
      });
    }
  }, [sampleUpdates]);

  // Clean up subscriptions on unmount
  useEffect(() => {
    return () => {
      samples.forEach(sample => {
        unsubscribeFromSample(sample.id);
      });
    };
  }, [samples, unsubscribeFromSample]);

  const getProgressPercentage = (timeline: TimelineEvent[]) => {
    const completed = timeline.filter(event => event.status === 'completed').length;
    return (completed / timeline.length) * 100;
  };

  const isTemperatureInRange = (current?: number, required?: { min: number; max: number }) => {
    if (!current || !required) return true;
    return current >= required.min && current <= required.max;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography>Loading samples...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Connection Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: isConnected ? 'success.main' : 'error.main'
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {isConnected ? "Real-time updates active" : "Disconnected"}
        </Typography>
        {connectionError && (
          <Typography variant="caption" color="error">
            ({connectionError})
          </Typography>
        )}
      </Box>
      <Stack spacing={2}>
        {samples.map((sample) => (
          <Card
            key={sample.id}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: 3
              },
              ...(selectedSample?.id === sample.id && {
                outline: 2,
                outlineColor: 'primary.main',
                outlineOffset: 2
              })
            }}
            onClick={() => setSelectedSample(sample)}
          >
            <CardHeader
              title={sample.trackingNumber}
              titleTypographyProps={{ variant: 'h6' }}
              action={
                <Chip
                  label={statusConfig[sample.status].label}
                  color={statusConfig[sample.status].color}
                  size="small"
                />
              }
            />
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="body2" fontWeight="medium">
                  {sample.productName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {sample.quantity} {sample.unit}
                </Typography>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {Math.round(getProgressPercentage(sample.timeline))}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressPercentage(sample.timeline)}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
                {sample.currentTemperature && sample.requiredTemperature && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {!isTemperatureInRange(sample.currentTemperature, sample.requiredTemperature) && 
                      <AlertCircle sx={{ fontSize: 16, color: 'error.main' }} />
                    }
                    <Typography variant="caption">
                      Temp: {sample.currentTemperature}°C
                      {sample.requiredTemperature && (
                        <Typography component="span" variant="caption" color="text.secondary">
                          {' '}({sample.requiredTemperature.min}-{sample.requiredTemperature.max}°C)
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {selectedSample && (
        <Card>
          <CardHeader
            title={`Timeline for ${selectedSample.trackingNumber}`}
            subheader={`Order: ${selectedSample.orderId} | ${selectedSample.productName}`}
          />
          <CardContent>
            <Box sx={{ position: 'relative' }}>
              {selectedSample.timeline.map((event, index) => {
                const Icon = event.icon;
                const isLast = index === selectedSample.timeline.length - 1;
                const isCompleted = event.status === 'completed';
                const isActive = event.status === 'active';
                
                return (
                  <Box key={event.id} sx={{ display: 'flex', pb: isLast ? 0 : 4 }}>
                    {/* Timeline line */}
                    {!isLast && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 20,
                          top: 44,
                          bottom: 0,
                          width: 2,
                          bgcolor: 'grey.300',
                          zIndex: 0
                        }}
                      />
                    )}
                    
                    {/* Icon */}
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        mr: 2,
                        zIndex: 1,
                        bgcolor: isCompleted ? 'success.light' :
                                isActive ? 'primary.light' :
                                'grey.200',
                        color: isCompleted ? 'success.main' :
                               isActive ? 'primary.main' :
                               'text.disabled',
                        ...(isActive && {
                          boxShadow: theme => `0 0 0 4px ${theme.palette.primary.light}40`
                        })
                      }}
                    >
                      <Icon sx={{ fontSize: 20 }} />
                    </Avatar>
                    
                    {/* Content */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {event.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(event.timestamp, 'MMM dd, yyyy HH:mm')}
                        </Typography>
                      </Box>
                      
                      {event.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {event.description}
                        </Typography>
                      )}
                      
                      <Stack direction="row" spacing={2}>
                        {event.location && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {event.location}
                            </Typography>
                          </Box>
                        )}
                        {event.temperature && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Thermostat sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {event.temperature}°C
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                      
                      {isActive && (
                        <Chip
                          label="Current Status"
                          color="primary"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
            
            {selectedSample.estimatedDelivery && selectedSample.status !== 'delivered' && (
              <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.light' }}>
                <Typography variant="body2" fontWeight="medium">
                  Estimated Delivery: {format(selectedSample.estimatedDelivery, 'MMMM dd, yyyy')}
                </Typography>
              </Paper>
            )}
            
            {selectedSample.actualDelivery && (
              <Paper sx={{ p: 2, mt: 3, bgcolor: 'success.light' }}>
                <Typography variant="body2" fontWeight="medium" color="success.dark">
                  Delivered on: {format(selectedSample.actualDelivery, 'MMMM dd, yyyy')}
                </Typography>
              </Paper>
            )}
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};