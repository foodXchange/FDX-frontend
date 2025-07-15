import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useAgentStore } from '@/store/useAgentStore';
import { 
  CurrencyDollarIcon, 
  BriefcaseIcon, 
  TrophyIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/format';
import { EarningsChart } from './EarningsChart';
import { PerformanceBadge } from './PerformanceBadge';

export const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    agent, 
    availableLeads, 
    earnings, 
    performance,
    setEarnings,
    setPerformance
  } = useAgentStore();

  const [todayEarnings] = useState(0);
  const [animatedEarnings, setAnimatedEarnings] = useState(0);

  // Animate earnings ticker
  useEffect(() => {
    if (earnings?.today) {
      const duration = 2000;
      const steps = 60;
      const stepValue = earnings.today / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        setAnimatedEarnings(prev => Math.min(prev + stepValue, earnings.today));
        
        if (currentStep >= steps) {
          clearInterval(interval);
          setAnimatedEarnings(earnings.today);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [earnings?.today]);

  // Mock data loading - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEarnings({
        today: 345.50,
        thisWeek: 1250.00,
        thisMonth: 4580.00,
        pending: 890.00,
        lifetime: 45200.00,
        recentTransactions: []
      });

      setPerformance({
        conversionRate: 0.68,
        averageDealSize: 12500,
        responseTime: 2.5,
        customerSatisfaction: 4.8,
        rank: 12,
        totalAgents: 150
      });
    }, 1000);
  }, [setEarnings, setPerformance]);

  const urgentLeads = availableLeads.filter(lead => lead.priority === 'urgent');
  const expiringLeads = availableLeads.filter(lead => {
    const hoursUntilExpiry = (new Date(lead.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntilExpiry < 2 && hoursUntilExpiry > 0;
  });

  return (
    <div className="space-y-6">
      {/* Hero Section with Glassmorphic overlay */}
      <div className="relative bg-gradient-to-r from-blue-600 to-orange-600 rounded-2xl p-8 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-blue-100">
                Here's your performance overview for today
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              {/* Earnings Ticker */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm">Today's Earnings</span>
                  <CurrencyDollarIcon className="h-5 w-5 text-white/60" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(animatedEarnings)}
                </div>
                <div className="flex items-center mt-2 text-sm">
                  {earnings && earnings.today > todayEarnings ? (
                    <>
                      <ArrowUpIcon className="h-4 w-4 text-green-300 mr-1" />
                      <span className="text-green-300">+12% from yesterday</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownIcon className="h-4 w-4 text-red-300 mr-1" />
                      <span className="text-red-300">-5% from yesterday</span>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Active Leads */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm">Active Leads</span>
                  <BriefcaseIcon className="h-5 w-5 text-white/60" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {agent?.activeLeads || 0}
                </div>
                <div className="flex items-center mt-2 text-sm text-white/80">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>{expiringLeads.length} expiring soon</span>
                </div>
              </motion.div>

              {/* Performance Tier */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm">Your Tier</span>
                  <TrophyIcon className="h-5 w-5 text-white/60" />
                </div>
                <PerformanceBadge tier={agent?.tier || 'bronze'} size="large" />
                <div className="flex items-center mt-2 text-sm text-white/80">
                  <ChartBarIcon className="h-4 w-4 mr-1" />
                  <span>Rank #{performance?.rank || '-'}</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              onClick={() => window.location.href = '/agent/leads'}
            >
              View Available Leads ({availableLeads.length})
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors border border-white/30"
              onClick={() => window.location.href = '/agent/earnings'}
            >
              Track Commissions
            </motion.button>
          </div>
        </div>
      </div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
            Today's Opportunities
            <span className="text-sm text-gray-500 font-normal">
              {urgentLeads.length} urgent
            </span>
          </h2>
          
          <div className="space-y-3">
            {availableLeads.slice(0, 5).map((lead, index) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="border-l-4 border-blue-500 pl-4 py-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{lead.rfqTitle}</p>
                    <p className="text-sm text-gray-600">
                      {lead.category} • {lead.buyerLocation}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      {lead.matchScore}% match
                    </p>
                    <p className="text-xs text-gray-500">
                      Expires in {Math.round((new Date(lead.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60))}h
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {availableLeads.length > 5 && (
            <button className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700">
              View all {availableLeads.length} opportunities →
            </button>
          )}
        </motion.div>

        {/* Your Active Leads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Active Leads
          </h2>
          
          <div className="space-y-3">
            {/* Mock active leads - replace with actual data */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Dairy RFQ #123</span>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Negotiating
                </span>
              </div>
              <p className="text-sm text-gray-600">MegaMart Ltd.</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-500">Est. value: $12,000</span>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  Update →
                </button>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Produce RFQ #456</span>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Contacted
                </span>
              </div>
              <p className="text-sm text-gray-600">FoodCo International</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-500">Est. value: $8,500</span>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  Update →
                </button>
              </div>
            </div>
          </div>

          <button className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            View All Active Leads
          </button>
        </motion.div>

        {/* Recent Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
            Recent Earnings
            <span className="text-sm text-gray-500 font-normal">
              ${earnings?.pending || 0} pending
            </span>
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Order #789</p>
                <p className="text-sm text-gray-600">Dairy Products</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">+$245</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Order #654</p>
                <p className="text-sm text-gray-600">Fresh Produce</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">+$180</p>
                <p className="text-xs text-gray-500">Yesterday</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Monthly Bonus</p>
                <p className="text-sm text-gray-600">Performance Tier</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-blue-600">+$420</p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Month Total</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(earnings?.thisMonth || 0)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Performance Overview
        </h2>
        <EarningsChart />
      </motion.div>
    </div>
  );
};