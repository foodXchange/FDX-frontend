// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { User, RFQ, Product, Order } from '../types';

interface DashboardStats {
  totalRFQs: number;
  activeRFQs: number;
  totalOrders: number;
  totalProducts: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRFQs: 0,
    activeRFQs: 0,
    totalOrders: 0,
    totalProducts: 0
  });

  const [recentRFQs, setRecentRFQs] = useState<RFQ[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setStats({
        totalRFQs: 24,
        activeRFQs: 8,
        totalOrders: 156,
        totalProducts: 1200
      });

      setRecentRFQs([
        {
          id: '1',
          referenceNumber: 'RFQ-2025-001',
          title: 'Organic Olive Oil - Bulk Order',
          description: 'Looking for certified organic olive oil suppliers',
          category: 'Oils & Fats',
          buyer: {
            companyId: 'company-1',
            userId: 'user-1',
            companyName: 'Mediterranean Foods Ltd'
          },
          products: [],
          requirements: {
            certifications: ['Organic', 'EU Certified'],
            qualityStandards: ['ISO 22000'],
            paymentTerms: ['Net 30'],
            deliveryTerms: 'FOB Origin'
          },
          timeline: {
            publishedAt: '2025-06-29T10:00:00Z',
            deadline: '2025-07-15T23:59:59Z',
            deliveryDate: '2025-08-01T00:00:00Z'
          },
          status: 'published',
          responses: [],
          createdAt: '2025-06-29T10:00:00Z',
          updatedAt: '2025-06-29T10:00:00Z'
        }
      ]);

      setLoading(false);
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-orange-600 mr-8">
                🍊 FoodXchange
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-gray-900 hover:text-orange-600">Dashboard</a>
                <a href="#" className="text-gray-500 hover:text-orange-600">RFQs</a>
                <a href="#" className="text-gray-500 hover:text-orange-600">Products</a>
                <a href="#" className="text-gray-500 hover:text-orange-600">Orders</a>
                <a href="#" className="text-gray-500 hover:text-orange-600">Suppliers</a>
              </nav>
            </div>
            <div className="flex items-center">
              <button className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700">
                Create RFQ
              </button>
              <div className="ml-4 relative">
                <button className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300">
                  <img className="h-8 w-8 rounded-full" src="https://via.placeholder.com/40" alt="Profile" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back! 👋
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Here's what's happening with your food sourcing today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">📋</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total RFQs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalRFQs}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">⚡</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active RFQs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.activeRFQs}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">📦</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Orders
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalOrders}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">🏪</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Products
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalProducts}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent RFQs */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent RFQs</h3>
            </div>
            <div className="p-6">
              {recentRFQs.length > 0 ? (
                <div className="space-y-4">
                  {recentRFQs.map((rfq) => (
                    <div key={rfq.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {rfq.title}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {rfq.referenceNumber} • {rfq.buyer.companyName}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {rfq.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No recent RFQs</p>
                  <button className="mt-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700">
                    Create Your First RFQ
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">📋</span>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Create New RFQ</h4>
                      <p className="text-sm text-gray-500">Find suppliers for your products</p>
                    </div>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">🏪</span>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Browse Products</h4>
                      <p className="text-sm text-gray-500">Explore available products</p>
                    </div>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">👥</span>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Find Suppliers</h4>
                      <p className="text-sm text-gray-500">Connect with verified suppliers</p>
                    </div>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">📊</span>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">View Analytics</h4>
                      <p className="text-sm text-gray-500">Track your sourcing performance</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
