import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { rfqService } from '../../services/rfqService';
import { RFQ, RFQStats } from '../../shared/types';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatDistanceToNow } from 'date-fns';

export const RFQDashboard: React.FC = () => {
  const [stats, setStats] = useState<RFQStats | null>(null);
  const [recentRFQs, setRecentRFQs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, recentData] = await Promise.all([
          rfqService.getRFQStats(),
          rfqService.getRecentRFQs(5)
        ]);
        setStats(statsData);
        setRecentRFQs(recentData);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Active RFQs',
      value: stats?.activeRFQs || 0,
      icon: ClipboardDocumentListIcon,
      color: 'bg-blue-500',
      trend: '+12%',
      description: 'Currently published RFQs'
    },
    {
      title: 'Pending Proposals',
      value: stats?.draftRFQs || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      trend: '+8%',
      description: 'Awaiting your review'
    },
    {
      title: 'Completed RFQs',
      value: stats?.closedRFQs || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      trend: '+15%',
      description: 'Successfully awarded'
    },
    {
      title: 'Urgent Actions',
      value: stats?.averageProposals || 0,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      trend: '-5%',
      description: 'Require immediate attention'
    }
  ];

  const handleDeleteRFQ = async (id: string) => {
    try {
      await rfqService.deleteRFQ(id);
      setRecentRFQs(prev => prev.filter(rfq => rfq.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <SkeletonLoader width="200px" height="32px" />
          <SkeletonLoader width="120px" height="40px" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <SkeletonLoader key={i} width="100%" height="140px" />
          ))}
        </div>
        <SkeletonLoader width="100%" height="400px" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RFQ Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your requests for quotations</p>
        </div>
        <Link
          to="/rfq/create"
          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create RFQ
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${card.color} text-white`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
                  <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-green-600">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                {card.trend}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{card.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent RFQs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent RFQs</h2>
            <Link
              to="/rfq"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentRFQs.length === 0 ? (
            <div className="p-8 text-center">
              <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No RFQs yet</h3>
              <p className="text-gray-500 mb-4">Start by creating your first RFQ</p>
              <Link
                to="/rfq/create"
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create First RFQ
              </Link>
            </div>
          ) : (
            recentRFQs.map((rfq) => (
              <motion.div
                key={rfq.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {rfq.title}
                      </h3>
                      <StatusBadge status={rfq.status} type="rfq" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {rfq.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <span>Category: {rfq.category}</span>
                      <span>•</span>
                      <span>Quantity: {rfq.quantity}</span>
                      <span>•</span>
                      <span>Created {formatDistanceToNow(new Date(rfq.createdAt))} ago</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/rfq/${rfq.id}`}
                      className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"
                      title="View RFQ"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                    <Link
                      to={`/rfq/${rfq.id}/edit`}
                      className="p-2 text-gray-400 hover:text-green-500 rounded-lg hover:bg-green-50"
                      title="Edit RFQ"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDeleteRFQ(rfq.id)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                      title="Delete RFQ"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {rfq.proposalCount > 0 && (
                  <div className="mt-3 flex items-center text-sm text-green-600">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    {rfq.proposalCount} proposal{rfq.proposalCount !== 1 ? 's' : ''} received
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/rfq/create"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <PlusIcon className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Create New RFQ</h3>
              <p className="text-sm text-gray-500">Start a new request for quotation</p>
            </div>
          </Link>
          <Link
            to="/rfq?status=pending"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ClockIcon className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Review Proposals</h3>
              <p className="text-sm text-gray-500">Check pending proposal submissions</p>
            </div>
          </Link>
          <Link
            to="/compliance"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Compliance Check</h3>
              <p className="text-sm text-gray-500">Verify product compliance</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};