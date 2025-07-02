// src/features/admin/index.tsx
import React, { useState } from 'react';
import AdminDashboard from './dashboard/AdminDashboard';

interface TabItem {
  id: string;
  label: string;
  icon: string;
  component: React.ComponentType;
}

// Placeholder components for other admin features
const UserManagement: React.FC = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">User Management</h2>
    <p className="text-gray-600">User management features coming soon...</p>
  </div>
);

const SystemSettings: React.FC = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">System Settings</h2>
    <p className="text-gray-600">System settings coming soon...</p>
  </div>
);

const Analytics: React.FC = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Analytics</h2>
    <p className="text-gray-600">Analytics dashboard coming soon...</p>
  </div>
);

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs: TabItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      component: AdminDashboard
    },
    {
      id: 'users',
      label: 'Users',
      icon: '👥',
      component: UserManagement
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      component: SystemSettings
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📈',
      component: Analytics
    }
  ];

  const getCurrentComponent = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    if (currentTab) {
      const Component = currentTab.component;
      return <Component />;
    }
    return <AdminDashboard />;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-orange-600">FoodXchange Admin</h1>
            
            {/* Navigation Tabs */}
            <div className="flex space-x-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <span className="sr-only">Notifications</span>
                🔔
              </button>
              <div className="flex items-center space-x-2">
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://via.placeholder.com/32"
                  alt="Admin"
                />
                <span className="text-sm text-gray-700">Admin User</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-6">
        {getCurrentComponent()}
      </main>
    </div>
  );
};

export default AdminPanel;