// File: C:\Users\foodz\Documents\GitHub\Development\FDX-frontend\src\components\Dashboard.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import {
  DocumentTextIcon,
  ShoppingBagIcon,
  BuildingOfficeIcon,
  TruckIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useWebSocket();
  const [metrics, setMetrics] = useState({
    totalRFQs: 0,
    activeRFQs: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalSuppliers: 0,
    revenue: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    if (socket && isConnected) {
      socket.on('dashboard_update', handleDashboardUpdate);
      socket.on('rfq_update', handleRFQUpdate);
      socket.on('order_update', handleOrderUpdate);
      
      return () => {
        socket.off('dashboard_update', handleDashboardUpdate);
        socket.off('rfq_update', handleRFQUpdate);
        socket.off('order_update', handleOrderUpdate);
      };
    }
  }, [socket, isConnected]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const mockMetrics = {
        totalRFQs: 24,
        activeRFQs: 8,
        completedOrders: 156,
        pendingOrders: 12,
        totalSuppliers: 45,
        revenue: 285000
      };
      
      const mockActivity = [
        {
          id: 1,
          type: 'rfq_created',
          title: 'New RFQ for Organic Almonds',
          description: 'RFQ #RF-2024-001 created for 500kg organic almonds',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          status: 'pending',
          priority: 'high'
        },
        {
          id: 2,
          type: 'order_completed',
          title: 'Order Delivered Successfully',
          description: 'Order #ORD-2024-045 delivered to warehouse',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'completed',
          priority: 'normal'
        },
        {
          id: 3,
          type: 'supplier_verified',
          title: 'New Supplier Verified',
          description: 'ABC Foods Ltd. passed all verification checks',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          status: 'verified',
          priority: 'normal'
        },
        {
          id: 4,
          type: 'compliance_alert',
          title: 'Compliance Check Required',
          description: 'FDA compliance review needed for shipment #SH-2024-089',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          status: 'warning',
          priority: 'high'
        }
      ];
      
      setMetrics(mockMetrics);
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDashboardUpdate = (data) => {
    setMetrics(prev => ({ ...prev, ...data }));
  };

  const handleRFQUpdate = (data) => {
    setRecentActivity(prev => [
      {
        id: Date.now(),
        type: 'rfq_update',
        title: 'RFQ Updated',
        description: `RFQ #${data.id} status changed to ${data.status}`,
        timestamp: new Date(),
        status: 'pending',
        priority: 'normal'
      },
      ...prev.slice(0, 9)
    ]);
  };

  const handleOrderUpdate = (data) => {
    setRecentActivity(prev => [
      {
        id: Date.now(),
        type: 'order_update',
        title: 'Order Status Update',
        description: `Order #${data.id} is now ${data.status}`,
        timestamp: new Date(),
        status: data.status,
        priority: 'normal'
      },
      ...prev.slice(0, 9)
    ]);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getActivityIcon = (type, status) => {
    switch (type) {
      case 'rfq_created':
      case 'rfq_update':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'order_completed':
      case 'order_update':
        return <TruckIcon className="h-5 w-5 text-green-500" />;
      case 'supplier_verified':
        return <BuildingOfficeIcon className="h-5 w-5 text-purple-500" />;
      case 'compliance_alert':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'verified':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIndicator = (priority) => {
    if (priority === 'high') {
      return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
    }
    return <div className="w-2 h-2 bg-gray-300 rounded-full"></div>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Modern Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Good morning, {user?.firstName}! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                Here's what's happening with your food sourcing operations today
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
                <BellIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Modern Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active RFQs</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{metrics.activeRFQs}</p>
                <div className="flex items-center">
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+12% this month</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{metrics.pendingOrders}</p>
                <div className="flex items-center">
                  <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600 font-medium">-3% this month</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3">
                <TruckIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Suppliers</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{metrics.totalSuppliers}</p>
                <div className="flex items-center">
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+8% this month</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3">
                <BuildingOfficeIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(metrics.revenue)}</p>
                <div className="flex items-center">
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+15% this month</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Modern Activity Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-600 mt-1">Real-time updates from your operations</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-2">
                        {getPriorityIndicator(activity.priority)}
                        <div className="flex-shrink-0 bg-white rounded-lg p-2 shadow-sm">
                          {getActivityIcon(activity.type, activity.status)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 truncate">{activity.title}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-2">{formatRelativeTime(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Modern Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
                <p className="text-sm text-gray-600 mt-1">Streamline your workflow</p>
              </div>
              <div className="p-6 space-y-4">
                <Link
                  to="/rfqs/new"
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create New RFQ
                </Link>
                
                <Link
                  to="/marketplace"
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  <ShoppingBagIcon className="h-5 w-5 mr-2" />
                  Browse Marketplace
                </Link>
                
                <Link
                  to="/suppliers"
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                  Find Suppliers
                </Link>
                
                <Link
                  to="/compliance"
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Check Compliance
                </Link>
              </div>
            </div>

            {/* Modern Analytics Preview */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-lg text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Performance Insights</h3>
                <ChartBarIcon className="h-6 w-6 opacity-80" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Order Success Rate</span>
                  <span className="font-bold">98.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Avg. Delivery Time</span>
                  <span className="font-bold">4.2 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Supplier Rating</span>
                  <span className="font-bold">4.8/5.0</span>
                </div>
              </div>
              <Link
                to="/analytics"
                className="w-full flex items-center justify-center mt-4 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 font-medium"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                View Full Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;