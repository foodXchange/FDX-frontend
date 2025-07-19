// WebSocket type definitions
export interface WebSocketEventMap {
  connected: void;
  disconnected: void;
  error: Error;
  sample_update: {
    sampleId: string;
    status: string;
    location: string;
    temperature?: number;
  };
  sample_location_update: {
    sampleId: string;
    location: string;
    temperature?: number;
  };
  temperature_alert: {
    sampleId: string;
    temperature: number;
    threshold: { min: number; max: number };
  };
  order_update: {
    orderId: string;
    status: string;
    trackingNumber?: string;
  };
  delivery_update: {
    orderId: string;
    estimatedDelivery: string;
    currentLocation: string;
  };
  metrics_update: {
    metrics: Record<string, any>;
  };
  ai_insight_update: {
    insightId: string;
    type: string;
    data: any;
  };
}

export interface TypedWebSocket {
  on<K extends keyof WebSocketEventMap>(
    event: K,
    handler: (data: WebSocketEventMap[K]) => void
  ): void;
  off<K extends keyof WebSocketEventMap>(
    event: K,
    handler: (data: WebSocketEventMap[K]) => void
  ): void;
  connect(): void;
  disconnect(): void;
}
