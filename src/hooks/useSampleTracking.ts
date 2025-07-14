import React, { useState, useEffect, useCallback } from 'react';
import { websocket } from '../services/websocket';

export interface SampleUpdate {
  id: string;
  trackingNumber: string;
  status: 'requested' | 'preparing' | 'in_transit' | 'delivered' | 'cancelled';
  currentLocation?: string;
  currentTemperature?: number;
  timeline: TimelineEvent[];
  timestamp: Date;
}

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

interface UseSampleTrackingOptions {
  autoConnect?: boolean;
  reconnectOnError?: boolean;
}

export const useSampleTracking = (options: UseSampleTrackingOptions = {}) => {
  const { autoConnect = true, reconnectOnError = true } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [sampleUpdates, setSampleUpdates] = useState<SampleUpdate[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Handle sample updates from WebSocket
  const handleSampleUpdate = useCallback((data: SampleUpdate) => {
    setSampleUpdates(prev => {
      const existingIndex = prev.findIndex(update => update.id === data.id);
      if (existingIndex >= 0) {
        // Update existing sample
        const updated = [...prev];
        updated[existingIndex] = data;
        return updated;
      } else {
        // Add new sample update
        return [...prev, data];
      }
    });
  }, []);

  // Handle location updates
  const handleLocationUpdate = useCallback((data: { sampleId: string; location: string; temperature?: number }) => {
    setSampleUpdates(prev => prev.map(update => 
      update.id === data.sampleId 
        ? { 
            ...update, 
            currentLocation: data.location, 
            currentTemperature: data.temperature,
            timestamp: new Date()
          }
        : update
    ));
  }, []);

  // Handle temperature alerts
  const handleTemperatureAlert = useCallback((data: { sampleId: string; temperature: number; threshold: { min: number; max: number } }) => {
    setSampleUpdates(prev => prev.map(update => 
      update.id === data.sampleId 
        ? { 
            ...update, 
            currentTemperature: data.temperature,
            timestamp: new Date()
          }
        : update
    ));
  }, []);

  // Subscribe to sample-specific updates
  const subscribeToSample = useCallback((sampleId: string) => {
    if (isConnected) {
      websocket.send('subscribe', { channel: 'sample_tracking', sampleId });
    }
  }, [isConnected]);

  // Unsubscribe from sample updates
  const unsubscribeFromSample = useCallback((sampleId: string) => {
    if (isConnected) {
      websocket.send('unsubscribe', { channel: 'sample_tracking', sampleId });
    }
  }, [isConnected]);

  // Clear updates for a specific sample
  const clearSampleUpdates = useCallback((sampleId?: string) => {
    if (sampleId) {
      setSampleUpdates(prev => prev.filter(update => update.id !== sampleId));
    } else {
      setSampleUpdates([]);
    }
  }, []);

  // Get updates for a specific sample
  const getSampleUpdates = useCallback((sampleId: string): SampleUpdate[] => {
    return sampleUpdates.filter(update => update.id === sampleId);
  }, [sampleUpdates]);

  // Get latest update for a sample
  const getLatestSampleUpdate = useCallback((sampleId: string): SampleUpdate | null => {
    const updates = getSampleUpdates(sampleId);
    return updates.length > 0 ? updates[updates.length - 1] : null;
  }, [getSampleUpdates]);

  useEffect(() => {
    if (!autoConnect) return;

    // Connection event handlers
    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleError = (error: any) => {
      setConnectionError(error?.message || 'WebSocket connection error');
      if (reconnectOnError) {
        setTimeout(() => {
          websocket.connect();
        }, 3000);
      }
    };

    // Register event listeners
    websocket.on('connected', handleConnect);
    websocket.on('disconnected', handleDisconnect);
    websocket.on('error', handleError);
    
    // Sample tracking specific events
    websocket.on('sample_update', handleSampleUpdate);
    websocket.on('sample_location_update', handleLocationUpdate);
    websocket.on('temperature_alert', handleTemperatureAlert);

    // Connect if not already connected
    websocket.connect();

    // Cleanup on unmount
    return () => {
      websocket.off('connected', handleConnect);
      websocket.off('disconnected', handleDisconnect);
      websocket.off('error', handleError);
      websocket.off('sample_update', handleSampleUpdate);
      websocket.off('sample_location_update', handleLocationUpdate);
      websocket.off('temperature_alert', handleTemperatureAlert);
    };
  }, [autoConnect, reconnectOnError, handleSampleUpdate, handleLocationUpdate, handleTemperatureAlert]);

  return {
    isConnected,
    connectionError,
    sampleUpdates,
    subscribeToSample,
    unsubscribeFromSample,
    clearSampleUpdates,
    getSampleUpdates,
    getLatestSampleUpdate,
    // Connection control
    connect: () => websocket.connect(),
    disconnect: () => websocket.disconnect(),
  };
};