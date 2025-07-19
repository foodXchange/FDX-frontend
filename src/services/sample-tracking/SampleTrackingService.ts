import { ApiIntegration } from '../ApiIntegration';
import {
  Sample,
  SampleStatus,
  CreateSampleRequest,
  UpdateSampleRequest,
  SampleSearchFilters,
  SampleAnalytics,
  RealTimeTrackingData,
  TrackingAlert,
  CustodyRecord,
  TemperatureReading,
  LocationUpdate,
  SampleEvent,
  TestResult,
  SampleFeedback,
  MonitoringDevice,
  SensorReading
} from '../../types/sample-tracking';

export class SampleTrackingService {
  private static baseUrl = '/api/samples';

  // Core Sample Management
  static async createSample(request: CreateSampleRequest): Promise<Sample> {
    try {
      const response = await ApiIntegration.samples.create(request);
      
      // Initialize tracking
      this.initializeTracking(response.id);
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to create sample');
    }
  }

  static async getSample(sampleId: string): Promise<Sample> {
    try {
      const response = await ApiIntegration.samples.getById(sampleId);
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to fetch sample ${sampleId}`);
    }
  }

  static async updateSample(sampleId: string, updates: UpdateSampleRequest): Promise<Sample> {
    try {
      const response = await ApiIntegration.samples.update(sampleId, updates);
      
      // Log status change if applicable
      if (updates.status) {
        this.logStatusChange(sampleId, updates.status);
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to update sample ${sampleId}`);
    }
  }

  static async searchSamples(
    filters: SampleSearchFilters = {},
    page = 1,
    limit = 20
  ): Promise<{ samples: Sample[]; total: number; pages: number }> {
    try {
      const response = await ApiIntegration.samples.getAll({
        ...filters,
        page,
        limit
      });
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to search samples');
    }
  }

  // Real-time Tracking
  static async getTrackingData(sampleId: string): Promise<RealTimeTrackingData> {
    try {
      const response = await ApiIntegration.samples.getTracking(sampleId);
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to get tracking data for sample ${sampleId}`);
    }
  }

  static async updateLocation(
    sampleId: string,
    location: {
      coordinates: { latitude: number; longitude: number };
      address?: string;
      timestamp?: string;
      method?: string;
    }
  ): Promise<LocationUpdate> {
    try {
      const locationUpdate = {
        timestamp: location.timestamp || new Date().toISOString(),
        location: {
          address: location.address || 'Unknown',
          coordinates: location.coordinates,
          type: 'current'
        },
        method: location.method || 'gps',
        verified: true
      };

      const response = await ApiIntegration.samples.updateLocation(sampleId, locationUpdate);
      
      // Trigger real-time update
      this.broadcastLocationUpdate(sampleId, response);
      
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to update location for sample ${sampleId}`);
    }
  }

  static async addTrackingEvent(
    sampleId: string,
    event: {
      type: string;
      description: string;
      location?: any;
      performedBy?: string;
      impact?: string;
    }
  ): Promise<SampleEvent> {
    try {
      const trackingEvent = {
        timestamp: new Date().toISOString(),
        type: event.type,
        description: event.description,
        location: event.location,
        performedBy: event.performedBy || 'system',
        impact: event.impact || 'none',
        automaticEvent: !event.performedBy,
        requiresAction: event.impact === 'high' || event.impact === 'critical'
      };

      const response = await ApiIntegration.samples.addTrackingEvent(sampleId, trackingEvent);
      
      // Broadcast event to real-time subscribers
      this.broadcastTrackingEvent(sampleId, response);
      
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to add tracking event for sample ${sampleId}`);
    }
  }

  // Temperature and Environmental Monitoring
  static async addTemperatureReading(
    sampleId: string,
    reading: {
      temperature: number;
      humidity?: number;
      location?: any;
      deviceId?: string;
    }
  ): Promise<TemperatureReading> {
    try {
      const temperatureReading = {
        timestamp: new Date().toISOString(),
        temperature: reading.temperature,
        humidity: reading.humidity,
        location: reading.location,
        device: {
          id: reading.deviceId || 'manual',
          type: 'temperature_sensor',
          status: 'active'
        },
        withinRange: this.isTemperatureWithinRange(reading.temperature),
        alertTriggered: !this.isTemperatureWithinRange(reading.temperature)
      };

      const response = await ApiIntegration.samples.addTemperatureReading(sampleId, temperatureReading);
      
      // Check for temperature alerts
      if (!temperatureReading.withinRange) {
        await this.triggerTemperatureAlert(sampleId, reading.temperature);
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to add temperature reading for sample ${sampleId}`);
    }
  }

  static async getTemperatureLog(sampleId: string): Promise<TemperatureReading[]> {
    try {
      const response = await ApiIntegration.samples.getTemperatureLog(sampleId);
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to get temperature log for sample ${sampleId}`);
    }
  }

  // Chain of Custody
  static async updateCustody(
    sampleId: string,
    custodyData: {
      from: string;
      to: string;
      location: any;
      purpose: string;
      conditions?: any;
      witnessedBy?: string;
    }
  ): Promise<CustodyRecord> {
    try {
      const custodyRecord = {
        timestamp: new Date().toISOString(),
        from: { 
          type: 'organization',
          organizationId: custodyData.from,
          organizationName: custodyData.from,
          contactPerson: 'Unknown',
          contactDetails: {},
          authorization: { valid: true }
        },
        to: {
          type: 'organization',
          organizationId: custodyData.to,
          organizationName: custodyData.to,
          contactPerson: 'Unknown',
          contactDetails: {},
          authorization: { valid: true }
        },
        location: custodyData.location,
        purpose: custodyData.purpose,
        conditions: custodyData.conditions || { temperature: 'controlled', humidity: 'monitored' },
        witnessedBy: custodyData.witnessedBy,
        integrity: { intact: true, verified: true, issues: [] }
      };

      const response = await ApiIntegration.samples.updateCustody(sampleId, custodyRecord);
      
      // Log custody change event
      await this.addTrackingEvent(sampleId, {
        type: 'custody_transfer',
        description: `Custody transferred from ${custodyData.from} to ${custodyData.to}`,
        location: custodyData.location,
        performedBy: custodyData.witnessedBy,
        impact: 'medium'
      });
      
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to update custody for sample ${sampleId}`);
    }
  }

  static async getChainOfCustody(sampleId: string): Promise<CustodyRecord[]> {
    try {
      const response = await ApiIntegration.samples.getChainOfCustody(sampleId);
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to get chain of custody for sample ${sampleId}`);
    }
  }

  // Barcode and QR Code Management
  static async generateBarcode(sampleId: string): Promise<{ barcode: string; qrCode: string }> {
    try {
      const response = await ApiIntegration.samples.generateBarcode(sampleId);
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to generate barcode for sample ${sampleId}`);
    }
  }

  static async scanBarcode(barcode: string): Promise<Sample> {
    try {
      const response = await ApiIntegration.samples.scanBarcode(barcode);
      
      // Log scan event
      await this.addTrackingEvent(response.id, {
        type: 'barcode_scan',
        description: `Sample scanned with barcode: ${barcode}`,
        performedBy: 'scanner',
        impact: 'low'
      });
      
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to scan barcode ${barcode}`);
    }
  }

  // Analytics and Reporting
  static async getSampleAnalytics(
    dateRange?: { start: string; end: string },
    filters?: SampleSearchFilters
  ): Promise<SampleAnalytics> {
    try {
      const response = await ApiIntegration.samples.getAnalyticsData({
        dateRange,
        ...filters
      });
      return response;
    } catch (error) {
      console.warn('Sample analytics service unavailable, using mock data');
      return this.getMockAnalytics();
    }
  }

  static async exportSampleData(
    sampleIds: string[],
    format: 'csv' | 'excel' | 'pdf' = 'excel',
    includeTracking = true
  ): Promise<{ url: string; filename: string }> {
    try {
      const response = await ApiIntegration.samples.exportData?.({
        sampleIds,
        format,
        includeTracking
      }) || { url: '', filename: 'samples-export.xlsx' };
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to export sample data');
    }
  }

  // Feedback and Results
  static async submitFeedback(
    sampleId: string,
    feedback: {
      category: string;
      rating: number;
      comments: string;
      recommendations?: string[];
      approvalStatus?: string;
    }
  ): Promise<SampleFeedback> {
    try {
      const response = await ApiIntegration.samples.submitFeedback(sampleId, {
        providedBy: 'current_user',
        role: 'buyer',
        timestamp: new Date().toISOString(),
        category: feedback.category,
        rating: feedback.rating,
        comments: feedback.comments,
        recommendations: feedback.recommendations,
        approvalStatus: feedback.approvalStatus
      });
      
      // Update sample status based on feedback
      if (feedback.approvalStatus === 'approved') {
        await this.updateSample(sampleId, { status: SampleStatus.APPROVED_FOR_USE });
      } else if (feedback.approvalStatus === 'rejected') {
        await this.updateSample(sampleId, { status: SampleStatus.REJECTED });
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error, `Failed to submit feedback for sample ${sampleId}`);
    }
  }

  // Device Management
  static async getMonitoringDevices(): Promise<MonitoringDevice[]> {
    try {
      const response = await ApiIntegration.devices?.getAll?.() || [];
      return response;
    } catch (error) {
      console.warn('Device management service unavailable');
      return [];
    }
  }

  static async addSensorReading(
    deviceId: string,
    sampleId: string,
    reading: {
      type: string;
      value: number;
      unit: string;
      location?: any;
    }
  ): Promise<SensorReading> {
    try {
      const sensorReading = {
        deviceId,
        timestamp: new Date().toISOString(),
        type: reading.type as any,
        value: reading.value,
        unit: reading.unit,
        location: reading.location,
        quality: 'good' as any,
        validated: true
      };

      // Store sensor reading and associate with sample
      const response = await ApiIntegration.sensors?.addReading?.(sensorReading) || sensorReading;
      
      // If temperature reading, also update sample temperature log
      if (reading.type === 'temperature') {
        await this.addTemperatureReading(sampleId, {
          temperature: reading.value,
          deviceId,
          location: reading.location
        });
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to add sensor reading');
    }
  }

  // Private helper methods
  private static initializeTracking(sampleId: string): void {
    console.log(`Initializing tracking for sample ${sampleId}`);
    
    // Initialize real-time tracking
    setTimeout(() => {
      this.addTrackingEvent(sampleId, {
        type: 'created',
        description: 'Sample tracking initialized',
        impact: 'low'
      });
    }, 1000);
  }

  private static logStatusChange(sampleId: string, status: SampleStatus): void {
    this.addTrackingEvent(sampleId, {
      type: 'status_change',
      description: `Sample status changed to ${status}`,
      impact: 'medium'
    });
  }

  private static isTemperatureWithinRange(temperature: number): boolean {
    // Default temperature range: 2-8°C for most samples
    return temperature >= 2 && temperature <= 8;
  }

  private static async triggerTemperatureAlert(sampleId: string, temperature: number): Promise<void> {
    const alert: TrackingAlert = {
      id: `alert-${Date.now()}`,
      type: 'temperature_deviation',
      severity: temperature < 0 || temperature > 15 ? 'critical' : 'warning',
      message: `Temperature deviation detected: ${temperature}°C`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false,
      actions: [
        {
          type: 'notify',
          description: 'Notify stakeholders of temperature deviation',
          assignedTo: 'quality_team'
        },
        {
          type: 'investigate',
          description: 'Investigate cause of temperature deviation',
          assignedTo: 'logistics_team'
        }
      ]
    };

    // Broadcast alert to real-time subscribers
    this.broadcastAlert(sampleId, alert);
  }

  private static broadcastLocationUpdate(sampleId: string, update: LocationUpdate): void {
    // In real implementation, this would use WebSocket/SignalR
    console.log(`Broadcasting location update for sample ${sampleId}`, update);
  }

  private static broadcastTrackingEvent(sampleId: string, event: SampleEvent): void {
    // In real implementation, this would use WebSocket/SignalR
    console.log(`Broadcasting tracking event for sample ${sampleId}`, event);
  }

  private static broadcastAlert(sampleId: string, alert: TrackingAlert): void {
    // In real implementation, this would use WebSocket/SignalR
    console.log(`Broadcasting alert for sample ${sampleId}`, alert);
  }

  private static getMockAnalytics(): SampleAnalytics {
    return {
      totalSamples: 89,
      byStatus: {
        requested: 5,
        approved: 8,
        preparing: 3,
        ready_for_pickup: 2,
        in_transit: 7,
        delivered: 12,
        received: 9,
        testing_in_progress: 6,
        testing_complete: 4,
        results_available: 8,
        approved_for_use: 18,
        rejected: 5,
        returned: 2,
        disposed: 0
      },
      byType: {
        initial: 25,
        validation: 18,
        production: 15,
        quality_check: 12,
        regulatory: 8,
        customer_approval: 6,
        trial_batch: 3,
        reference: 2
      },
      byPriority: {
        low: 23,
        medium: 34,
        high: 21,
        urgent: 8,
        critical: 3
      },
      averageProcessingTime: 7.2,
      averageTestingTime: 3.5,
      approvalRate: 0.83,
      onTimeDeliveryRate: 0.91,
      qualityPassRate: 0.87,
      costAnalysis: {
        totalCost: 45600,
        averageCostPerSample: 512,
        costByType: {
          preparation: 15200,
          shipping: 8900,
          testing: 18500,
          other: 3000
        }
      },
      trendData: []
    };
  }

  private static handleError(error: any, defaultMessage: string): Error {
    console.error('Sample tracking service error:', error);
    
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error(defaultMessage);
  }
}

export default SampleTrackingService;