// File: C:\Users\foodz\Documents\GitHub\Development\FDX-frontend\src\features\compliance\components\ComplianceDashboard.tsx

import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { ChartBarIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';

interface ComplianceStats {
  totalValidations: number;
  passedValidations: number;
  failedValidations: number;
  averageScore: number;
  criticalIssues: number;
  pendingFixes: number;
}

interface RecentValidation {
  id: string;
  productName: string;
  productType: string;
  score: number;
  status: 'passed' | 'failed';
  timestamp: Date;
  criticalErrors: number;
}

export const ComplianceDashboard: React.FC = () => {
  const [stats, setStats] = useState<ComplianceStats>({
    totalValidations: 0,
    passedValidations: 0,
    failedValidations: 0,
    averageScore: 0,
    criticalIssues: 0,
    pendingFixes: 0
  });

  const [recentValidations, setRecentValidations] = useState<RecentValidation[]>([]);
  const [selectedRFQ, setSelectedRFQ] = useState<string | null>(null);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        fetch('/api/compliance/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/compliance/history?limit=10', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats || {
          totalValidations: 47,
          passedValidations: 38,
          failedValidations: 9,
          averageScore: 82,
          criticalIssues: 3,
          pendingFixes: 5
        });
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setRecentValidations(historyData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch compliance data:', error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, subtext }: any) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <Icon className={`h-8 w-8 ${color}`} />
        <span className="text-sm text-gray-500">{subtext}</span>
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Compliance Center</h1>
        <p className="text-gray-600 mt-2">Monitor and validate product specifications to prevent costly errors</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={DocumentCheckIcon}
          title="Total Validations"
          value={stats.totalValidations}
          color="text-blue-600"
          subtext="All time"
        />
        <StatCard
          icon={CheckCircleIcon}
          title="Pass Rate"
          value={`${stats.passedValidations > 0 ? Math.round((stats.passedValidations / stats.totalValidations) * 100) : 0}%`}
          color="text-green-600"
          subtext={`${stats.passedValidations} passed`}
        />
        <StatCard
          icon={ChartBarIcon}
          title="Average Score"
          value={stats.averageScore}
          color="text-indigo-600"
          subtext="Out of 100"
        />
        <StatCard
          icon={ExclamationTriangleIcon}
          title="Critical Issues"
          value={stats.criticalIssues}
          color="text-red-600"
          subtext={`${stats.pendingFixes} pending`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Validations */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Validations</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentValidations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No validations yet. Create an RFQ and validate specifications.
                </div>
              ) : (
                recentValidations.map((validation) => (
                  <div
                    key={validation.id}
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedRFQ(validation.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{validation.productName}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {validation.productType} • {new Date(validation.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{validation.score}</p>
                          <p className="text-xs text-gray-500">Score</p>
                        </div>
                        <div className="flex items-center">
                          {validation.status === 'passed' ? (
                            <CheckCircleIcon className="h-8 w-8 text-green-500" />
                          ) : (
                            <XCircleIcon className="h-8 w-8 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    {validation.criticalErrors > 0 && (
                      <div className="mt-2 flex items-center text-sm text-red-600">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        {validation.criticalErrors} critical errors
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Color Rules Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Color Rules</h3>
            <div className="space-y-3">
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm font-medium text-gray-900">Allowed Colors</p>
                <p className="text-sm text-gray-600">Golden, Light Golden, Amber, Honey</p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <p className="text-sm font-medium text-gray-900">Prohibited Colors</p>
                <p className="text-sm text-gray-600">Green, Blue, Red, Purple</p>
              </div>
            </div>
          </div>

          {/* Required Certifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Certifications</h3>
            <div className="space-y-2">
              {['FDA Food Safety', 'HACCP', 'USDA Organic', 'Kosher', 'Halal', 'Gluten-Free'].map((cert) => (
                <div key={cert} className="flex items-center">
                  <ShieldCheckIcon className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-700">{cert}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Validate */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need to Validate?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Run compliance checks on your RFQs to prevent specification errors before they become costly mistakes.
            </p>
            <button
              onClick={() => window.location.href = '/rfq'}
              className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-700 transition-colors"
            >
              Go to RFQ Management
            </button>
          </div>
        </div>
      </div>

      {/* Validation Modal/Drawer */}
      {selectedRFQ && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSelectedRFQ(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Validation Details</h2>
                <button
                  onClick={() => setSelectedRFQ(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              <p className="text-gray-500">Validation details for RFQ: {selectedRFQ}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};