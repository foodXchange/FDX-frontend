import React, { useState } from 'react';
import AdminDashboard from './dashboard/AdminDashboard';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'monitoring', label: 'Monitoring', icon: '🔍' },
    { id: 'users', label: 'Users', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-orange-600">FoodXchange Admin</h1>
            <div className="flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={lex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors \}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
      
      {activeTab === 'dashboard' && <AdminDashboard />}
      {activeTab === 'analytics' && (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">Analytics features will be implemented here.</p>
          </div>
        </div>
      )}
      {activeTab === 'monitoring' && (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">System Monitoring</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">Monitoring features will be implemented here.</p>
          </div>
        </div>
      )}
      {activeTab === 'users' && (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">User Management</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">User management features will be implemented here.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
