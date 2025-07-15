import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAgentStore } from '@/store/useAgentStore';
import { formatCurrency, formatDate } from '@/utils/format';
import { 
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { EarningsChart } from './EarningsChart';

export const CommissionDashboard: React.FC = () => {
  const { earnings, setEarnings } = useAgentStore();
  const [dateFilter, setDateFilter] = useState<'week' | 'month' | 'year'>('month');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'paid'>('all');

  // Mock data - replace with actual API call
  useEffect(() => {
    setTimeout(() => {
      setEarnings({
        today: 345.50,
        thisWeek: 1250.00,
        thisMonth: 4580.00,
        pending: 890.00,
        lifetime: 45200.00,
        recentTransactions: [
          {
            id: '1',
            agentId: 'agent123',
            orderId: 'order789',
            rfqId: 'rfq456',
            amount: 245,
            percentage: 2,
            status: 'paid',
            createdAt: new Date('2024-01-15'),
            paidAt: new Date('2024-01-15'),
            paymentMethod: 'bank_transfer'
          },
          {
            id: '2',
            agentId: 'agent123',
            orderId: 'order654',
            rfqId: 'rfq321',
            amount: 180,
            percentage: 2,
            status: 'paid',
            createdAt: new Date('2024-01-14'),
            paidAt: new Date('2024-01-14'),
            paymentMethod: 'bank_transfer'
          },
          {
            id: '3',
            agentId: 'agent123',
            orderId: 'order555',
            rfqId: 'rfq222',
            amount: 420,
            percentage: 2.5,
            status: 'pending',
            createdAt: new Date('2024-01-12')
          },
          {
            id: '4',
            agentId: 'agent123',
            orderId: 'order444',
            rfqId: 'rfq111',
            amount: 310,
            percentage: 2,
            status: 'approved',
            createdAt: new Date('2024-01-10')
          }
        ]
      });
    }, 1000);
  }, [setEarnings]);

  const filteredTransactions = earnings?.recentTransactions.filter(transaction => {
    if (statusFilter !== 'all' && transaction.status !== statusFilter) {
      return false;
    }
    // Additional date filtering logic would go here
    return true;
  }) || [];

  const exportTransactions = () => {
    // Export logic would go here
    console.log('Exporting transactions...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Earnings & Commissions</h1>
        <button
          onClick={exportTransactions}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">This Month</span>
            <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(earnings?.thisMonth || 0)}
          </div>
          <p className="text-xs text-green-600 mt-2">+12% from last month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Pending</span>
            <CalendarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(earnings?.pending || 0)}
          </div>
          <p className="text-xs text-gray-600 mt-2">Awaiting approval</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Lifetime</span>
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(earnings?.lifetime || 0)}
          </div>
          <p className="text-xs text-gray-600 mt-2">Since joining</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-blue-600 to-orange-600 rounded-lg shadow-md p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/80">Next Payout</span>
            <CalendarIcon className="h-5 w-5 text-white/60" />
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(890)}
          </div>
          <p className="text-xs text-white/80 mt-2">In 3 days</p>
        </motion.div>
      </div>

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Earnings Trend</h2>
        <EarningsChart />
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg shadow-md"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            
            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RFQ ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{transaction.rfqId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{transaction.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {transaction.percentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full
                      ${transaction.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                      ${transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${transaction.status === 'approved' ? 'bg-blue-100 text-blue-800' : ''}
                    `}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};