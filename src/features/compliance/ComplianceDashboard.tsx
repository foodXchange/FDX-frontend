import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentTextIcon,
  GlobeAmericasIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  BellIcon,
  EyeIcon,
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { complianceService } from '../../services/complianceService';
import { ComplianceOverview, ComplianceCheck, Certification } from '../../shared/types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { formatDistanceToNow, format, addDays, isBefore } from 'date-fns';

interface ComplianceStats {
  totalProducts: number;
  compliantProducts: number;
  pendingChecks: number;
  expiringCertifications: number;
  averageComplianceScore: number;
  recentChecks: ComplianceCheck[];
  upcomingDeadlines: Certification[];
  regionalCompliance: {
    region: string;
    compliant: number;
    total: number;
    percentage: number;
  }[];
}

const mockComplianceStats: ComplianceStats = {
  totalProducts: 156,
  compliantProducts: 142,
  pendingChecks: 8,
  expiringCertifications: 3,
  averageComplianceScore: 94.2,
  recentChecks: [
    {
      id: '1',
      productName: 'Organic Cornflakes',
      region: 'EU',
      status: 'compliant',
      checkedAt: new Date().toISOString(),
      score: 98,
      issues: [],
    },
    {
      id: '2',
      productName: 'Gluten-Free Pasta',
      region: 'US',
      status: 'non-compliant',
      checkedAt: new Date(Date.now() - 3600000).toISOString(),
      score: 76,
      issues: ['Missing FDA approval', 'Incomplete labeling'],
    },
  ],
  upcomingDeadlines: [
    {
      id: '1',
      name: 'Organic Certification',
      type: 'Organic',
      expiryDate: addDays(new Date(), 30).toISOString(),
      status: 'active',
      productIds: ['prod-1', 'prod-2'],
    },
    {
      id: '2',
      name: 'HACCP Certificate',
      type: 'HACCP',
      expiryDate: addDays(new Date(), 15).toISOString(),
      status: 'active',
      productIds: ['prod-3'],
    },
  ],
  regionalCompliance: [
    { region: 'EU', compliant: 45, total: 50, percentage: 90 },
    { region: 'US', compliant: 38, total: 42, percentage: 90.5 },
    { region: 'Asia-Pacific', compliant: 35, total: 40, percentage: 87.5 },
    { region: 'Canada', compliant: 24, total: 24, percentage: 100 },
  ],
};

export const ComplianceDashboard: React.FC = () => {
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats(mockComplianceStats);
    } catch (err) {
      setError('Failed to load compliance data');
      console.error('Compliance data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchComplianceData();
    setRefreshing(false);
  };

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 95) return 'text-green-600 bg-green-100';
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getUrgencyLevel = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 7) return 'urgent';
    if (daysUntilExpiry <= 30) return 'warning';
    return 'normal';
  };

  const getUrgencyDisplay = (urgency: string) => {
    switch (urgency) {
      case 'expired':
        return { text: 'Expired', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' };
      case 'urgent':
        return { text: 'Urgent', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' };
      case 'warning':
        return { text: 'Soon', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' };
      default:
        return { text: 'Normal', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' };
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <SkeletonLoader width="300px" height="32px" />
          <SkeletonLoader width="120px" height="40px" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <SkeletonLoader key={i} width="100%" height="140px" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader width="100%" height="400px" />
          <SkeletonLoader width="100%" height="400px" />
        </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage product compliance across all markets</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/compliance/check"
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Run Compliance Check
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Compliance Score',
            value: `${stats?.averageComplianceScore}%`,
            icon: ShieldCheckIcon,
            color: getComplianceColor(stats?.averageComplianceScore || 0),
            trend: '+2.1%',
            description: 'Average across all products'
          },
          {
            title: 'Compliant Products',
            value: `${stats?.compliantProducts}/${stats?.totalProducts}`,
            icon: CheckCircleIcon,
            color: 'text-green-600 bg-green-100',
            trend: '+5',
            description: 'Products meeting requirements'
          },
          {
            title: 'Pending Checks',
            value: stats?.pendingChecks || 0,
            icon: ClockIcon,
            color: 'text-yellow-600 bg-yellow-100',
            trend: '-2',
            description: 'Awaiting compliance verification'
          },
          {
            title: 'Expiring Soon',
            value: stats?.expiringCertifications || 0,
            icon: ExclamationTriangleIcon,
            color: 'text-red-600 bg-red-100',
            trend: '0',
            description: 'Certifications expiring within 30 days'
          }
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  <metric.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
                  <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-green-600">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                {metric.trend}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{metric.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Regional Compliance & Recent Checks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Compliance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Regional Compliance</h2>
              <GlobeAmericasIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats?.regionalCompliance.map((region) => (
                <div key={region.region} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{region.region}</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getComplianceColor(region.percentage)}`}>
                      {region.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        region.percentage >= 95 ? 'bg-green-500' :
                        region.percentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${region.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{region.compliant} compliant</span>
                    <span>{region.total} total products</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Compliance Checks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Checks</h2>
              <Link
                to="/compliance/check"
                className="text-orange-500 hover:text-orange-600 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {stats?.recentChecks.length === 0 ? (
              <div className="p-8 text-center">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent checks</h3>
                <p className="text-gray-500 mb-4">Start by running your first compliance check</p>
                <Link
                  to="/compliance/check"
                  className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Run Check
                </Link>
              </div>
            ) : (
              stats?.recentChecks.map((check) => (
                <motion.div
                  key={check.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {check.productName}
                        </h3>
                        <StatusBadge status={check.status} type="compliance" />
                        <span className="text-sm text-gray-500">{check.region}</span>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Score: {check.score}%</span>
                        <span>•</span>
                        <span>Checked {formatDistanceToNow(new Date(check.checkedAt))} ago</span>
                      </div>
                      {check.issues.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center text-sm text-red-600">
                            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                            <span>{check.issues.length} issue{check.issues.length !== 1 ? 's' : ''}</span>
                          </div>
                          <ul className="mt-1 text-sm text-red-600 space-y-1">
                            {check.issues.slice(0, 2).map((issue, index) => (
                              <li key={index} className="flex items-center">
                                <span className="w-1 h-1 bg-red-400 rounded-full mr-2" />
                                {issue}
                              </li>
                            ))}
                            {check.issues.length > 2 && (
                              <li className="text-sm text-gray-500">
                                +{check.issues.length - 2} more issues
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    <button className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Certification Deadlines */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
              <BellIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {stats?.upcomingDeadlines.length === 0 ? (
              <div className="p-8 text-center">
                <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming deadlines</h3>
                <p className="text-gray-500">All certifications are up to date</p>
              </div>
            ) : (
              stats?.upcomingDeadlines.map((cert) => {
                const urgency = getUrgencyLevel(cert.expiryDate);
                const urgencyDisplay = getUrgencyDisplay(urgency);
                
                return (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{cert.name}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${urgencyDisplay.color} ${urgencyDisplay.bg} ${urgencyDisplay.border} border`}>
                            {urgencyDisplay.text}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Type: {cert.type}</span>
                          <span>•</span>
                          <span>
                            Expires: {format(new Date(cert.expiryDate), 'MMM dd, yyyy')}
                          </span>
                          <span>•</span>
                          <span>
                            {cert.productIds.length} product{cert.productIds.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <Link
                          to={`/compliance/certs/${cert.id}/renew`}
                          className="text-sm bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600"
                        >
                          Renew
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              <Link
                to="/compliance/check"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-shrink-0">
                  <ShieldCheckIcon className="h-8 w-8 text-orange-500 group-hover:text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">Run Compliance Check</h3>
                  <p className="text-sm text-gray-500">Check products against market requirements</p>
                </div>
              </Link>

              <Link
                to="/compliance/certs"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-8 w-8 text-blue-500 group-hover:text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">Manage Certifications</h3>
                  <p className="text-sm text-gray-500">Upload and track certificate status</p>
                </div>
              </Link>

              <Link
                to="/validation"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-500 group-hover:text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">Validate Specifications</h3>
                  <p className="text-sm text-gray-500">Ensure product specs meet requirements</p>
                </div>
              </Link>

              <Link
                to="/compliance/reports"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-8 w-8 text-purple-500 group-hover:text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">Generate Reports</h3>
                  <p className="text-sm text-gray-500">Create compliance reports for audits</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Alerts */}
      {(stats?.pendingChecks && stats.pendingChecks > 0) || (stats?.expiringCertifications && stats.expiringCertifications > 0) ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800">Action Required</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="space-y-1">
                  {stats?.pendingChecks > 0 && (
                    <li>• {stats.pendingChecks} products pending compliance verification</li>
                  )}
                  {stats?.expiringCertifications > 0 && (
                    <li>• {stats.expiringCertifications} certifications expiring within 30 days</li>
                  )}
                </ul>
              </div>
              <div className="mt-3 flex space-x-3">
                <Link
                  to="/compliance/check"
                  className="text-sm bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                >
                  Run Checks
                </Link>
                <Link
                  to="/compliance/certs"
                  className="text-sm border border-yellow-300 text-yellow-700 px-3 py-1 rounded-lg hover:bg-yellow-100"
                >
                  Review Certifications
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};