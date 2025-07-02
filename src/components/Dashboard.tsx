// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { User, RFQ, Product, Order, DashboardStats } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRFQs: 0,
    activeRFQs: 0,
    totalOrders: 0,
    totalSuppliers: 0,
    pendingApprovals: 0,
    revenue: 0
  });

  const [recentRFQs, setRecentRFQs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API calls
    const fetchDashboardData = async () => {
      try {
        // Mock stats
        setStats({
          totalRFQs: 247,
          activeRFQs: 32,
          totalOrders: 189,
          totalSuppliers: 89,
          pendingApprovals: 12,
          revenue: 2456789
        });

        // Mock recent RFQs with proper type structure
        const mockRFQs: RFQ[] = [
          {
            id: '1',
            title: 'Organic Wheat Flour Requirements',
            description: 'Looking for high-quality organic wheat flour for bakery operations',
            status: 'published',
            createdBy: 'buyer1',
            buyerCompany: 'Premium Bakery Co.',
            products: [
              {
                id: 'p1',
                name: 'Organic Wheat Flour',
                category: 'Grains',
                quantity: 1000,
                unit: 'kg',
                specifications: [
                  { name: 'Protein Content', value: '12-14', unit: '%' },
                  { name: 'Moisture', value: '<14', unit: '%' }
                ],
                description: 'Premium organic wheat flour'
              }
            ],
            requirements: {
              certifications: ['Organic', 'EU Certified'],
              qualityStandards: ['ISO22000'],
              paymentTerms: ['Net30'],
              deliveryTerms: 'FOB Origin'
            },
            timeline: {
              proposalDeadline: '2024-02-15',
              expectedDelivery: '2024-03-01',
              evaluationPeriod: 7
            },
            proposals: [],
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z',
            deadline: '2024-02-15T23:59:59Z'
          }
        ];

        setRecentRFQs(mockRFQs);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Create RFQ
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <span className="text-blue-600">📋</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total RFQs</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.totalRFQs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <span className="text-green-600">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Active RFQs</h3>
              <p className="text-2xl font-bold text-green-600">{stats.activeRFQs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <span className="text-yellow-600">📦</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <span className="text-purple-600">🏭</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Suppliers</h3>
              <p className="text-2xl font-bold text-purple-600">{stats.totalSuppliers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                <span className="text-red-600">⏳</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Pending</h3>
              <p className="text-2xl font-bold text-red-600">{stats.pendingApprovals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <span className="text-green-600">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Revenue</h3>
              <p className="text-2xl font-bold text-green-600">
                ${stats.revenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent RFQs */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent RFQs</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentRFQs.map((rfq) => (
            <div key={rfq.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{rfq.title}</h3>
                  <p className="text-sm text-gray-500">by {rfq.buyerCompany}</p>
                  <p className="text-sm text-gray-600 mt-1">{rfq.description}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    rfq.status === 'published' 
                      ? 'bg-green-100 text-green-800'
                      : rfq.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rfq.status.toUpperCase()}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    Deadline: {new Date(rfq.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;