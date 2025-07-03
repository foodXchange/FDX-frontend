import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Users, 
  MessageCircle, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';

// Using relative imports since absolute imports might not be configured yet
// You can change these to @shared/hooks/use-websocket after path mapping is working
import { useWebSocket, useRFQUpdates, useCollaboration, useNotifications } from '../shared/hooks/use-websocket';

interface RFQ {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'receiving_bids' | 'evaluating' | 'awarded';
  bidCount: number;
  complianceScore: number;
  bestPrice?: number;
  deadline: string;
  lastActivity: string;
}

interface RealTimeRFQDashboardProps {
  userId: string;
  userName: string;
}

const RealTimeRFQDashboard: React.FC<RealTimeRFQDashboardProps> = ({ 
  userId, 
  userName 
}) => {
  const [rfqs, setRfqs] = useState<RFQ[]>([
    {
      id: 'rfq_001',
      title: 'Premium Cornflakes Supply',
      status: 'receiving_bids',
      bidCount: 5,
      complianceScore: 95,
      bestPrice: 8.5,
      deadline: '2025-02-15',
      lastActivity: '2 minutes ago'
    },
    {
      id: 'rfq_002', 
      title: 'Organic Wheat Flour',
      status: 'draft',
      bidCount: 0,
      complianceScore: 88,
      deadline: '2025-02-20',
      lastActivity: '1 hour ago'
    }
  ]);

  const [selectedRfq, setSelectedRfq] = useState<string | null>(null);

  // WebSocket connection
  const { 
    isConnected, 
    isConnecting, 
    connectionState, 
    error: connectionError,
    connect,
    retry 
  } = useWebSocket({
    userId,
    autoConnect: true,
    onConnect: () => console.log('🔗 Connected to FoodXchange real-time'),
    onError: (error) => console.error('❌ WebSocket error:', error)
  });

  // RFQ real-time updates
  const { 
    rfqUpdates, 
    updateRFQStatus 
  } = useRFQUpdates(rfqs.map(rfq => rfq.id));

  // Collaboration for selected RFQ
  const collaboration = useCollaboration(selectedRfq || '');

  // Notifications
  const { 
    notifications, 
    unreadCount, 
    markAsRead 
  } = useNotifications();

  // Update RFQs when real-time updates arrive
  useEffect(() => {
    Object.entries(rfqUpdates).forEach(([rfqId, update]) => {
      setRfqs(prev => prev.map(rfq => 
        rfq.id === rfqId ? {
          ...rfq,
          status: update.status,
          bidCount: update.bidCount,
          bestPrice: update.bestPrice,
          complianceScore: update.complianceScore || rfq.complianceScore,
          lastActivity: 'Just now'
        } : rfq
      ));
    });
  }, [rfqUpdates]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'receiving_bids': return 'bg-green-100 text-green-800';
      case 'evaluating': return 'bg-yellow-100 text-yellow-800';
      case 'awarded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (rfqId: string, newStatus: string) => {
    // Optimistically update UI
    setRfqs(prev => prev.map(rfq => 
      rfq.id === rfqId ? { ...rfq, status: newStatus as any, lastActivity: 'Just now' } : rfq
    ));
    
    // Send real-time update
    updateRFQStatus(rfqId, newStatus, { updatedBy: userId, updatedAt: new Date().toISOString() });
  };

  const ConnectionIndicator = () => (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-600">Live</span>
        </>
      ) : isConnecting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm text-blue-600">Connecting...</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-600">Offline</span>
          <button 
            onClick={retry}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Retry
          </button>
        </>
      )}
    </div>
  );

  const NotificationBell = () => (
    <div className="relative">
      <Bell className="h-5 w-5 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );

  const CollaborationPanel = () => {
    if (!selectedRfq) return null;

    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Live Collaboration</h3>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">{collaboration.activeUsers.length} active</span>
          </div>
        </div>

        {/* Active Users */}
        <div className="mb-4">
          <div className="flex -space-x-2">
            {collaboration.activeUsers.slice(0, 5).map(user => (
              <div
                key={user.userId}
                className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                title={user.userName}
              >
                {user.userName.substring(0, 2).toUpperCase()}
              </div>
            ))}
            {collaboration.activeUsers.length > 5 && (
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                +{collaboration.activeUsers.length - 5}
              </div>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {collaboration.messages.slice(-3).map(message => (
            <div key={message.id} className="text-sm">
              <span className="font-medium text-gray-900">{message.userName}:</span>
              <span className="text-gray-700 ml-2">{message.message}</span>
              <span className="text-xs text-gray-500 ml-2">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>

        {/* Typing Indicator */}
        {collaboration.typingUsers.length > 0 && (
          <div className="text-xs text-gray-500 mt-2">
            {collaboration.typingUsers.join(', ')} {collaboration.typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}

        {/* Quick Message Input */}
        <div className="mt-3 pt-3 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 text-sm border rounded px-2 py-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  if (target.value.trim()) {
                    collaboration.sendMessage(target.value);
                    target.value = '';
                  }
                }
              }}
              onChange={(e) => collaboration.setTyping(e.target.value.length > 0)}
            />
            <MessageCircle className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🚀 Real-time RFQ Dashboard</h1>
          <p className="text-gray-600">Live collaboration and instant updates</p>
        </div>
        <div className="flex items-center space-x-4">
          <NotificationBell />
          <ConnectionIndicator />
        </div>
      </div>

      {/* Connection Error */}
      {connectionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">Connection Error: {connectionError}</span>
          </div>
        </div>
      )}

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active RFQs</p>
              <p className="text-2xl font-bold text-blue-600">
                {rfqs.filter(rfq => ['receiving_bids', 'evaluating'].includes(rfq.status)).length}
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bids</p>
              <p className="text-2xl font-bold text-green-600">
                {rfqs.reduce((sum, rfq) => sum + rfq.bidCount, 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Compliance</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(rfqs.reduce((sum, rfq) => sum + rfq.complianceScore, 0) / rfqs.length)}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Connection</p>
              <p className="text-2xl font-bold text-gray-900">{connectionState}</p>
            </div>
            {isConnected ? <Wifi className="h-8 w-8 text-green-600" /> : <WifiOff className="h-8 w-8 text-red-600" />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RFQ List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Live RFQ Updates</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {rfqs.map(rfq => (
                  <div 
                    key={rfq.id} 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedRfq === rfq.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRfq(rfq.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{rfq.title}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rfq.status)}`}>
                        {rfq.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Bids:</span> {rfq.bidCount}
                      </div>
                      <div>
                        <span className="font-medium">Compliance:</span> {rfq.complianceScore}%
                      </div>
                      <div>
                        <span className="font-medium">Best Price:</span> {rfq.bestPrice ? `$${rfq.bestPrice}` : 'N/A'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {rfq.lastActivity}
                      </div>
                      
                      <div className="flex space-x-2">
                        <select
                          value={rfq.status}
                          onChange={(e) => handleStatusChange(rfq.id, e.target.value)}
                          className="text-xs border rounded px-2 py-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="receiving_bids">Receiving Bids</option>
                          <option value="evaluating">Evaluating</option>
                          <option value="awarded">Awarded</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Collaboration Panel */}
        <div>
          <CollaborationPanel />
          
          {/* Recent Notifications */}
          {notifications.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4 mt-6">
              <h3 className="font-medium text-gray-900 mb-4">Recent Notifications</h3>
              <div className="space-y-2">
                {notifications.slice(0, 5).map(notification => (
                  <div 
                    key={notification.id}
                    className="text-sm p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-gray-600">{notification.message}</div>
                    <div className="text-xs text-gray-500">{notification.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTimeRFQDashboard;