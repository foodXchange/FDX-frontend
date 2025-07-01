import React from 'react';
import { useAdminData } from '../hooks/useAdminData';

const AdminDashboard: React.FC = () => {
  const { health, usage, aiUsage, loading, error } = useAdminData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error loading admin data: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">FoodXchange Admin Dashboard</h1>
        <div className={px-3 py-1 rounded-full text-sm font-medium }>
          {health?.status?.toUpperCase()}
        </div>
      </div>

      {/* System Health Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="System Uptime" 
          value={health ? ${Math.floor(health.uptime / 3600)}h : '--'} 
          icon="🟢" 
          color="green" 
        />
        <MetricCard 
          title="Avg Response" 
          value={health ? ${health.responseTime}ms : '--'} 
          icon="⚡" 
          color="blue" 
        />
        <MetricCard 
          title="Active Users" 
          value={usage?.activeUsers?.toString() || '--'} 
          icon="👥" 
          color="purple" 
        />
        <MetricCard 
          title="Daily RFQs" 
          value={usage?.dailyRfqs?.toString() || '--'} 
          icon="📊" 
          color="orange" 
        />
      </div>

      {/* AI Usage & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">🤖</span>AI Usage & Costs
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>OpenAI Costs:</span>
              <span className="font-mono text-green-600">
                \
              </span>
            </div>
            <div className="flex justify-between">
              <span>Azure Costs:</span>
              <span className="font-mono text-blue-600">
                \
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Requests:</span>
              <span className="font-mono">
                {aiUsage?.requestCount?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Token Usage:</span>
              <span className="font-mono">
                {aiUsage?.tokenUsage?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="mr-2">💰</span>Revenue Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Revenue:</span>
              <span className="font-mono text-green-600">
                \
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg Session:</span>
              <span className="font-mono">{usage?.avgSessionTime || '0'}min</span>
            </div>
            <div className="border-t pt-3 mt-3">
              <h4 className="font-medium mb-2">Top Features:</h4>
              {usage?.topFeatures?.map((f, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{f.name}</span>
                  <span>{f.usage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* API Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">🛣️</span>API Endpoints Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {health?.apis?.map((api, i) => (
            <div key={i} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{api.endpoint}</span>
                <span className={w-3 h-3 rounded-full }></span>
              </div>
              <div className="text-sm text-gray-500 mt-1">{api.latency}ms latency</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ActionButton 
          label="User Management" 
          icon="👥" 
          onClick={() => alert('Navigate to user management')} 
        />
        <ActionButton 
          label="Security Alerts" 
          icon="🔒" 
          onClick={() => alert('Check security alerts')} 
        />
        <ActionButton 
          label="Compliance" 
          icon="✅" 
          onClick={() => alert('View compliance status')} 
        />
        <ActionButton 
          label="Generate Report" 
          icon="📊" 
          onClick={() => alert('Generate admin report')} 
        />
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
  </div>
);

interface ActionButtonProps {
  label: string;
  icon: string;
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, icon, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-white rounded-lg shadow p-4 text-left hover:shadow-md transition-shadow"
  >
    <div className="flex items-center space-x-3">
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  </button>
);

export default AdminDashboard;
