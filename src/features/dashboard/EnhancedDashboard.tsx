import React from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  UserGroupIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  BellIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { ProgressIndicator } from '@components/ui/ProgressIndicator';
import { cn } from '@utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  onClick?: () => void;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  onClick,
  delay = 0,
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
  };

  const isPositive = change && change > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={cn('cursor-pointer', onClick && 'group')}
    >
      <Card className="glass-morphism hover:shadow-xl transition-all duration-300 h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
                className="text-3xl font-bold text-gray-900 mt-2"
              >
                {value}
              </motion.p>
              
              {change !== undefined && (
                <div className="flex items-center mt-2">
                  {isPositive ? (
                    <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={cn(
                    'text-sm font-medium',
                    isPositive ? 'text-green-600' : 'text-red-600'
                  )}>
                    {Math.abs(change)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              )}
            </div>
            
            <div className={cn(
              'p-3 rounded-lg bg-gradient-to-br',
              colorClasses[color],
              'group-hover:scale-110 transition-transform duration-300'
            )}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface ActivityItem {
  id: string;
  type: 'rfq' | 'order' | 'compliance' | 'supplier';
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'warning' | 'error';
}

const ActivityFeed: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card className="glass-morphism h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <BellIcon className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
            >
              <div className={cn('mt-1', getStatusColor(activity.status))}>
                <CheckCircleIcon className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <Button variant="link" className="w-full mt-4 text-[#1E4C8A]">
          View All Activity
        </Button>
      </CardContent>
    </Card>
  );
};

const ComplianceOverview: React.FC = () => {
  const complianceScore = 98;
  
  return (
    <Card className="glass-morphism h-full">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Overview</h3>
        
        <div className="flex items-center justify-center mb-6">
          <ProgressIndicator
            value={complianceScore}
            variant="circular"
            size="lg"
            color="success"
            showLabel
            animated
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">FDA Compliance</span>
            <span className="text-sm font-medium text-green-600">100%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">HACCP Standards</span>
            <span className="text-sm font-medium text-green-600">98%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Organic Certification</span>
            <span className="text-sm font-medium text-yellow-600">95%</span>
          </div>
        </div>
        
        <Button variant="outline" className="w-full mt-4 hover-lift">
          View Compliance Report
        </Button>
      </CardContent>
    </Card>
  );
};

const QuickActions: React.FC = () => {
  const actions = [
    { label: 'Create RFQ', icon: DocumentDuplicateIcon, color: 'bg-blue-500' },
    { label: 'Invite Supplier', icon: UserGroupIcon, color: 'bg-green-500' },
    { label: 'Import Data', icon: ArrowTrendingUpIcon, color: 'bg-purple-500' },
    { label: 'Run Compliance Check', icon: CheckCircleIcon, color: 'bg-yellow-500' },
  ];

  return (
    <Card className="glass-morphism">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all"
              >
                <div className={cn('p-3 rounded-lg mb-2', action.color)}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export const EnhancedDashboard: React.FC = () => {
  const stats = [
    { title: 'Active RFQs', value: 12, change: 15, icon: DocumentDuplicateIcon, color: 'blue' as const },
    { title: 'Verified Suppliers', value: 85, change: 8, icon: UserGroupIcon, color: 'green' as const },
    { title: 'Pending Orders', value: 28, change: -5, icon: ChartBarIcon, color: 'yellow' as const },
    { title: 'Compliance Rate', value: '98%', icon: CheckCircleIcon, color: 'purple' as const },
  ];

  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'rfq',
      title: 'New RFQ Response',
      description: 'Global Foods Ltd. submitted a proposal for Organic Quinoa',
      time: '5 minutes ago',
      status: 'success',
    },
    {
      id: '2',
      type: 'compliance',
      title: 'Compliance Alert',
      description: 'Product specification update required for Almond Milk',
      time: '1 hour ago',
      status: 'warning',
    },
    {
      id: '3',
      type: 'order',
      title: 'Order Shipped',
      description: 'Order #12345 has been shipped via DHL Express',
      time: '3 hours ago',
      status: 'success',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#1E4C8A] to-[#2E6BB8] rounded-2xl p-8 text-white"
      >
        <h2 className="text-2xl font-bold mb-2">Good morning! 👋</h2>
        <p className="text-blue-100 mb-4">
          Here's what's happening with your business today.
        </p>
        <div className="flex gap-4">
          <Button variant="gold" className="hover-lift">
            View Today's Opportunities
          </Button>
          <Button variant="outline" className="text-white border-white hover:bg-white hover:text-[#1E4C8A]">
            Schedule Demo
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ActivityFeed activities={activities} />
          <QuickActions />
        </div>
        
        <div className="space-y-6">
          <ComplianceOverview />
          
          {/* Performance Chart Placeholder */}
          <Card className="glass-morphism">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
              <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ChartBarIcon className="w-12 h-12 text-gray-400" />
                </motion.div>
              </div>
              <p className="text-sm text-gray-500 text-center mt-4">
                Chart visualization coming soon
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};