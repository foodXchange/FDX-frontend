import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressIndicator } from '../../components/ui/ProgressIndicator';
import { Clock, AlertCircle, Package, Truck, Home } from 'lucide-react';
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
  requested: { label: 'Requested', color: 'bg-gray-500' },
  preparing: { label: 'Preparing', color: 'bg-yellow-500' },
  in_transit: { label: 'In Transit', color: 'bg-blue-500' },
  delivered: { label: 'Delivered', color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' },
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
    return <div className="flex items-center justify-center h-64">Loading samples...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? "Real-time updates active" : "Disconnected"}
          </span>
          {connectionError && (
            <span className="text-sm text-red-600">
              ({connectionError})
            </span>
          )}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {samples.map((sample) => (
          <Card
            key={sample.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${selectedSample?.id === sample.id ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSelectedSample(sample)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{sample.trackingNumber}</CardTitle>
                <Badge className={statusConfig[sample.status].color}>
                  {statusConfig[sample.status].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{sample.productName}</p>
                <p className="text-muted-foreground">
                  {sample.quantity} {sample.unit}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {Math.round(getProgressPercentage(sample.timeline))}%
                  </span>
                </div>
                <ProgressIndicator value={getProgressPercentage(sample.timeline)} className="h-2" />
                {sample.currentTemperature && sample.requiredTemperature && (
                  <div className="flex items-center gap-2 mt-2">
                    {!isTemperatureInRange(sample.currentTemperature, sample.requiredTemperature) && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-xs">
                      Temp: {sample.currentTemperature}°C
                      {sample.requiredTemperature && (
                        <span className="text-muted-foreground">
                          {' '}({sample.requiredTemperature.min}-{sample.requiredTemperature.max}°C)
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSample && (
        <Card>
          <CardHeader>
            <CardTitle>Timeline for {selectedSample.trackingNumber}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Order: {selectedSample.orderId} | {selectedSample.productName}
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {selectedSample.timeline.map((event, index) => {
                const Icon = event.icon;
                const isLast = index === selectedSample.timeline.length - 1;
                
                return (
                  <div key={event.id} className="flex gap-4 pb-8 relative">
                    {!isLast && (
                      <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    
                    <div
                      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${event.status === 'completed' ? "bg-green-100 text-green-600" : event.status === 'active' ? "bg-blue-100 text-blue-600 ring-4 ring-blue-100" : "bg-gray-100 text-gray-400"}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <span className="text-sm text-muted-foreground">
                          {format(event.timestamp, 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {event.description}
                        </p>
                      )}
                      
                      <div className="flex gap-4 text-sm">
                        {event.location && (
                          <span className="text-muted-foreground">
                            📍 {event.location}
                          </span>
                        )}
                        {event.temperature && (
                          <span className="text-muted-foreground">
                            🌡️ {event.temperature}°C
                          </span>
                        )}
                      </div>
                      
                      {event.status === 'active' && (
                        <Badge variant="default" className="mt-2">
                          Current Status
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {selectedSample.estimatedDelivery && selectedSample.status !== 'delivered' && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  Estimated Delivery: {format(selectedSample.estimatedDelivery, 'MMMM dd, yyyy')}
                </p>
              </div>
            )}
            
            {selectedSample.actualDelivery && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-700">
                  Delivered on: {format(selectedSample.actualDelivery, 'MMMM dd, yyyy')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};