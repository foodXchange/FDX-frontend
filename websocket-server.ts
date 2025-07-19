import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';
import { parse } from 'url';

const app = express();
const PORT = process.env.WS_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ 
  server,
  path: '/ws'
});

// Track connected clients
interface Client {
  id: string;
  ws: WebSocket;
  userId?: string;
  agentId?: string;
  role?: string;
  isAlive: boolean;
  subscriptions: Set<string>;
}

const clients = new Map<string, Client>();
const rooms = new Map<string, Set<string>>(); // room -> Set of client IDs

// Helper to generate unique client ID
const generateClientId = () => `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Verify JWT token
const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Broadcast message to all clients in a room
const broadcastToRoom = (room: string, message: any, excludeClientId?: string) => {
  const clientIds = rooms.get(room);
  if (!clientIds) return;

  const messageStr = JSON.stringify(message);
  clientIds.forEach(clientId => {
    if (clientId === excludeClientId) return;
    const client = clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(messageStr);
    }
  });
};

// Broadcast message to specific clients
const broadcastToClients = (clientIds: string[], message: any) => {
  const messageStr = JSON.stringify(message);
  clientIds.forEach(clientId => {
    const client = clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(messageStr);
    }
  });
};

// Join a room
const joinRoom = (clientId: string, room: string) => {
  if (!rooms.has(room)) {
    rooms.set(room, new Set());
  }
  rooms.get(room)!.add(clientId);
  
  const client = clients.get(clientId);
  if (client) {
    client.subscriptions.add(room);
  }
};

// Leave a room
const leaveRoom = (clientId: string, room: string) => {
  const roomClients = rooms.get(room);
  if (roomClients) {
    roomClients.delete(clientId);
    if (roomClients.size === 0) {
      rooms.delete(room);
    }
  }
  
  const client = clients.get(clientId);
  if (client) {
    client.subscriptions.delete(room);
  }
};

// Handle WebSocket connection
wss.on('connection', (ws: WebSocket, req) => {
  const clientId = generateClientId();
  const client: Client = {
    id: clientId,
    ws,
    isAlive: true,
    subscriptions: new Set(),
  };
  
  // Parse query parameters
  const { query } = parse(req.url || '', true);
  const token = query.token as string;
  const agentId = query.agentId as string;
  
  // Verify authentication
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      client.userId = decoded.userId;
      client.role = decoded.role;
    }
  }
  
  if (agentId) {
    client.agentId = agentId;
  }
  
  clients.set(clientId, client);
  
  console.log(`Client connected: ${clientId}, User: ${client.userId}, Agent: ${client.agentId}`);
  
  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'connected',
    data: {
      clientId,
      timestamp: new Date().toISOString(),
    },
  }));
  
  // Handle ping/pong for connection health
  ws.on('pong', () => {
    client.isAlive = true;
  });
  
  // Handle incoming messages
  ws.on('message', (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      handleMessage(clientId, message);
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Invalid message format' },
      }));
    }
  });
  
  // Handle client disconnect
  ws.on('close', () => {
    console.log(`Client disconnected: ${clientId}`);
    
    // Leave all rooms
    client.subscriptions.forEach(room => {
      leaveRoom(clientId, room);
    });
    
    // Notify other clients about agent going offline
    if (client.agentId) {
      broadcastToRoom('agents', {
        type: 'agent_online_status',
        data: {
          agentId: client.agentId,
          isOnline: false,
          timestamp: new Date().toISOString(),
        },
      });
    }
    
    clients.delete(clientId);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
  });
});

// Handle incoming messages
const handleMessage = (clientId: string, message: any) => {
  const client = clients.get(clientId);
  if (!client) return;
  
  const { type, data } = message;
  
  switch (type) {
    case 'ping':
      client.ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      break;
      
    case 'authenticate':
      if (data.agentId) {
        joinRoom(clientId, 'agents');
        joinRoom(clientId, `agent-${data.agentId}`);
        
        // Notify other clients about agent coming online
        broadcastToRoom('agents', {
          type: 'agent_online_status',
          data: {
            agentId: data.agentId,
            isOnline: true,
            timestamp: new Date().toISOString(),
          },
        }, clientId);
      }
      break;
      
    case 'subscribe':
      if (data.channel) {
        joinRoom(clientId, data.channel);
        client.ws.send(JSON.stringify({
          type: 'subscribed',
          data: { channel: data.channel },
        }));
      }
      break;
      
    case 'unsubscribe':
      if (data.channel) {
        leaveRoom(clientId, data.channel);
        client.ws.send(JSON.stringify({
          type: 'unsubscribed',
          data: { channel: data.channel },
        }));
      }
      break;
      
    case 'update_lead':
      // Broadcast lead update to all agents
      broadcastToRoom('agents', {
        type: 'lead_update',
        data: {
          ...data,
          updatedBy: client.userId,
          timestamp: new Date().toISOString(),
        },
      }, clientId);
      break;
      
    case 'lead_status_change':
      broadcastToRoom('agents', {
        type: 'lead_status_change',
        data: {
          ...data,
          changedBy: client.userId,
          timestamp: new Date().toISOString(),
        },
      }, clientId);
      break;
      
    case 'typing_indicator':
      // Send typing indicator to specific lead room
      broadcastToRoom(`lead-${data.leadId}`, {
        type: 'typing_indicator',
        data: {
          ...data,
          agentId: client.agentId,
          timestamp: new Date().toISOString(),
        },
      }, clientId);
      break;
      
    case 'agent_status_update':
      broadcastToRoom('agents', {
        type: 'agent_status_update',
        data: {
          agentId: client.agentId,
          status: data.status,
          timestamp: new Date().toISOString(),
        },
      }, clientId);
      break;
      
    case 'rfq_update':
      // Broadcast RFQ updates to relevant parties
      broadcastToRoom(`rfq-${data.rfqId}`, {
        type: 'rfq_update',
        data: {
          ...data,
          updatedBy: client.userId,
          timestamp: new Date().toISOString(),
        },
      });
      break;
      
    case 'new_proposal':
      // Notify about new proposals
      broadcastToRoom(`rfq-${data.rfqId}`, {
        type: 'new_proposal',
        data: {
          ...data,
          submittedBy: client.userId,
          timestamp: new Date().toISOString(),
        },
      });
      break;
      
    case 'order_status_update':
      // Broadcast order status updates
      broadcastToRoom(`order-${data.orderId}`, {
        type: 'order_status_update',
        data: {
          ...data,
          updatedBy: client.userId,
          timestamp: new Date().toISOString(),
        },
      });
      break;
      
    case 'notification':
      // Send notification to specific user
      const targetClients = Array.from(clients.values()).filter(
        c => c.userId === data.targetUserId
      );
      broadcastToClients(
        targetClients.map(c => c.id),
        {
          type: 'new_notification',
          data: {
            ...data,
            timestamp: new Date().toISOString(),
          },
        }
      );
      break;
      
    case 'whatsapp_message':
      // Handle WhatsApp integration messages
      broadcastToRoom(`agent-${client.agentId}`, {
        type: 'whatsapp_message',
        data: {
          ...data,
          timestamp: new Date().toISOString(),
        },
      });
      break;
      
    case 'collaboration_update':
      // Handle Expert Marketplace collaboration updates
      broadcastToRoom(`collaboration-${data.projectId}`, {
        type: 'collaboration_update',
        data: {
          ...data,
          updatedBy: client.userId,
          timestamp: new Date().toISOString(),
        },
      });
      break;
      
    case 'chat_message':
      // Handle chat messages in collaboration workspace
      broadcastToRoom(`chat-${data.roomId}`, {
        type: 'chat_message',
        data: {
          ...data,
          senderId: client.userId,
          timestamp: new Date().toISOString(),
        },
      });
      break;
      
    default:
      console.log(`Unknown message type: ${type}`);
      client.ws.send(JSON.stringify({
        type: 'error',
        data: { message: `Unknown message type: ${type}` },
      }));
  }
};

// Heartbeat to check connection health
const interval = setInterval(() => {
  clients.forEach((client) => {
    if (!client.isAlive) {
      client.ws.terminate();
      return;
    }
    
    client.isAlive = false;
    client.ws.ping();
  });
}, 30000);

// Cleanup on server close
wss.on('close', () => {
  clearInterval(interval);
});

// Health check endpoint
app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    clients: clients.size,
    rooms: rooms.size,
    timestamp: new Date().toISOString(),
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`WebSocket Server running on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
});