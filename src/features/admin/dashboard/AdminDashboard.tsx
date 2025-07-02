// src/features/admin/dashboard/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { SystemHealth } from '../../../services/api/admin';

interface HealthData {
  status: string;
  uptime: number;
  responseTime: number;
  memoryUsage: number;
  activeConnections: number;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'green' | 'blue' | 'yellow' | 'red';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    red: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

const ActionButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}> = ({ onClick, children, variant = 'primary', disabled = false }) => {
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors";
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
};

const AdminDashboard: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call for health data
    const fetchHealthData = async () => {
      try {
        // Mock data - replace with actual API call
        const mockHealth: HealthData = {
          status: 'healthy',
          uptime: 12345, // seconds
          responseTime: 45, // milliseconds
          memoryUsage: 68, // percentage
          activeConnections: 150
        };
        
        setHealth(mockHealth);
      } catch (error) {
        console.error('Failed to fetch health data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, []);

  const getStatusColor = (status: string): 'green' | 'red' | 'yellow' => {
    switch (status?.toLowerCase()) {
      case 'healthy': return 'green';
      case 'unhealthy': return 'red';
      default: return 'yellow';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">FoodXchange Admin Dashboard</h1>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          health?.status === 'healthy' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {health?.status?.toUpperCase() || 'UNKNOWN'}
        </div>
      </div>

      {/* System Health Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="System Uptime"
          value={health ? `${Math.floor(health.uptime / 3600)}h` : '--'}
          icon="🟢"
          color="green"
        />
        <MetricCard
          title="Response Time"
          value={health ? `${health.responseTime}ms` : '--'}
          icon="⚡"
          color="blue"
        />
        <MetricCard
          title="Memory Usage"
          value={health ? `${health.memoryUsage}%` : '--'}
          icon="💾"
          color={health && health.memoryUsage > 80 ? 'red' : 'yellow'}
        />
        <MetricCard
          title="Active Users"
          value={health?.activeConnections || '--'}
          icon="👥"
          color="blue"
        />
      </div>

      {/* Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total RFQs"
          value="247"
          icon="📋"
          color="blue"
        />
        <MetricCard
          title="Active Suppliers"
          value="89"
          icon="🏭"
          color="green"
        />
        <MetricCard
          title="Orders Today"
          value="23"
          icon="📦"
          color="yellow"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <ActionButton onClick={() => console.log('Clear cache')}>
              Clear Cache
            </ActionButton>
            <ActionButton onClick={() => console.log('Backup DB')} variant="secondary">
              Backup Database
            </ActionButton>
            <ActionButton onClick={() => console.log('Export logs')} variant="secondary">
              Export Logs
            </ActionButton>
            <ActionButton onClick={() => console.log('System restart')} variant="danger">
              Restart System
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent System Activity</h2>
        <div className="space-y-3">
          {[
            { time: '2 min ago', event: 'User login: supplier@foodco.com', type: 'info' },
            { time: '5 min ago', event: 'New RFQ created: Organic Wheat Flour', type: 'success' },
            { time: '10 min ago', event: 'Order #1234 completed', type: 'success' },
            { time: '15 min ago', event: 'Cache cleared by admin', type: 'warning' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-400' :
                  activity.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                }`}></div>
                <span className="text-sm text-gray-700">{activity.event}</span>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
