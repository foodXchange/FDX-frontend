import { RealtimeMetric, MetricSubscription } from '../types';

class MetricsService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscriptions = new Map<string, (metric: RealtimeMetric) => void>();

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:3001'}/metrics?token=${token}`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Connected to metrics WebSocket');
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.handleReconnect(token);
      };

      this.ws.onmessage = (event) => {
        try {
          const metric: RealtimeMetric = JSON.parse(event.data);
          this.handleMetricUpdate(metric);
        } catch (error) {
          console.error('Failed to parse metric data:', error);
        }
      };
    });
  }

  private handleReconnect(token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(token).catch(console.error);
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private handleMetricUpdate(metric: RealtimeMetric) {
    // Notify all relevant subscribers
    this.subscriptions.forEach((callback, subscriptionId) => {
      if (subscriptionId.includes(metric.metric)) {
        callback(metric);
      }
    });
  }

  subscribe(metric: string, callback: (metric: RealtimeMetric) => void): string {
    const subscriptionId = `${metric}_${Date.now()}`;
    this.subscriptions.set(subscriptionId, callback);

    // Send subscription request to server
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        metric,
      }));
    }

    return subscriptionId;
  }

  unsubscribe(subscriptionId: string) {
    const metric = subscriptionId.split('_')[0];
    this.subscriptions.delete(subscriptionId);

    // Check if there are any remaining subscriptions for this metric
    const hasOtherSubscriptions = Array.from(this.subscriptions.keys())
      .some(id => id.startsWith(metric));

    if (!hasOtherSubscriptions && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        metric,
      }));
    }
  }

  sendMetric(metric: Omit<RealtimeMetric, 'id' | 'timestamp'>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'metric',
        ...metric,
      }));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const metricsService = new MetricsService();