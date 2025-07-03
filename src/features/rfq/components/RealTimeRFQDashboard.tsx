// File: /src/features/rfq/components/RealTimeRFQDashboard.tsx
import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Users, 
  Bell, 
  Activity,
  TrendingUp, 
  CheckCircle
} from 'lucide-react';

interface RealTimeRFQDashboardProps {
  userId: string;
  userName: string;
}

const RealTimeRFQDashboard: React.FC<RealTimeRFQDashboardProps> = ({ userId, userName }) => {
  const [isConnected] = useState(false);
  const [rfqs] = useState([
    {
      id: 'rfq_001',
      title: 'Premium Cornflakes Supply',
      status: 'receiving_bids',
      bidCount: 5,
      complianceScore: 95,
      bestPrice: 8.5,
      deadline: '2025-02-15',
      lastActivity: '2 minutes ago'
    }
  ]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real-time RFQ Dashboard</h1>
          <p className="text-gray-600">Live collaboration and instant updates</p>
        </div>
        <div className="flex items-center space-x-4">
          <Bell className="h-5 w-5 text-gray-600" />
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active RFQs</p>
              <p className="text-2xl font-bold text-blue-600">3</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bids</p>
              <p className="text-2xl font-bold text-green-600">17</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Compliance</p>
              <p className="text-2xl font-bold text-purple-600">92%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <Users className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* RFQ List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Live RFQ Updates</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {rfqs.map(rfq => (
              <div key={rfq.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{rfq.title}</h3>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {rfq.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Bids:</span> {rfq.bidCount}
                  </div>
                  <div>
                    <span className="font-medium">Compliance:</span> {rfq.complianceScore}%
                  </div>
                  <div>
                    <span className="font-medium">Best Price:</span> \
                  </div>
                  <div>
                    <span className="font-medium">Deadline:</span> {rfq.deadline}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeRFQDashboard;
