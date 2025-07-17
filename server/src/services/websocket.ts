import { WebSocketServer, WebSocket } from 'ws';
import { logger } from './logger';

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket> = new Map();

  constructor(wss: WebSocketServer) {
    this.wss = wss;
  }

  initialize() {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);
      
      logger.info('WebSocket client connected', { clientId });

      ws.on('message', (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleMessage(clientId, data);
        } catch (error) {
          logger.error('Invalid WebSocket message', error as Error, { clientId });
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        logger.info('WebSocket client disconnected', { clientId });
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error', error, { clientId });
      });
    });
  }

  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleMessage(clientId: string, data: any) {
    logger.info('WebSocket message received', { clientId, data });
    
    // Echo the message back for now
    const ws = this.clients.get(clientId);
    if (ws) {
      ws.send(JSON.stringify({ type: 'echo', data }));
    }
  }

  broadcast(message: any) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach((ws, clientId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }

  sendToClient(clientId: string, message: any) {
    const ws = this.clients.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}