import { motion } from 'framer-motion';
import {
  ClipboardDocumentListIcon,
  BuildingStorefrontIcon,
  ShoppingCartIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface StatCardData {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'orange' | 'teal' | 'purple' | 'red';
  description?: string;
}

interface RecentActivity {
  id: string;
  action: string;
  product: string;
  time: string;
  status: 'success' | 'pending' | 'warning';
}

interface DashboardCardsProps {
  stats?: StatCardData[];
  activities?: RecentActivity[];
  onViewAll?: (section: string) => void;
}

const defaultStats: StatCardData[] = [
  {
    title: 'Active RFQs',
    value: 12,
    change: '+2 this week',
    changeType: 'positive',
    icon: ClipboardDocumentListIcon,
    color: 'blue',
    description: 'Request for Quotations in progress'
  },
  {
    title: 'Verified Suppliers',
    value: 85,
    change: '+5 verified',
    changeType: 'positive',
    icon: BuildingStorefrontIcon,
    color: 'green',
    description: 'Certified food suppliers'
  },
  {
    title: 'Pending Orders',
    value: 28,
    change: '+8 pending',
    changeType: 'neutral',
    icon: ShoppingCartIcon,
    color: 'orange',
    description: 'Orders awaiting processing'
  },
  {
    title: 'Compliance Rate',
    value: '98%',
    change: 'All passed',
    changeType: 'positive',
    icon: ShieldCheckIcon,
    color: 'teal',
    description: 'Food safety compliance score'
  },
];

const defaultActivities: RecentActivity[] = [
  {
    id: '1',
    action: 'New RFQ submitted',
    product: 'Organic Cornflakes - 1000kg',
    time: '2 hours ago',
    status: 'success'
  },
  {
    id: '2',
    action: 'Supplier verified',
    product: 'Premium Foods Ltd',
    time: '4 hours ago',
    status: 'success'
  },
  {
    id: '3',
    action: 'Order shipped',
    product: 'Gluten-free Pasta - 500kg',
    time: '6 hours ago',
    status: 'success'
  },
  {
    id: '4',
    action: 'Compliance check',
    product: 'Almond Milk - Pending review',
    time: '8 hours ago',
    status: 'pending'
  },
  {
    id: '5',
    action: 'Payment processed',
    product: 'Quinoa Flour - $2,450',
    time: '1 day ago',
    status: 'success'
  },
];

const iconColorVariants = {
  blue: 'text-blue-600 bg-blue-100',
  green: 'text-green-600 bg-green-100',
  orange: 'text-orange-600 bg-orange-100',
  teal: 'text-teal-600 bg-teal-100',
  purple: 'text-purple-600 bg-purple-100',
  red: 'text-red-600 bg-red-100',
};

export function DashboardCards({ 
  stats = defaultStats, 
  activities = defaultActivities,
  onViewAll 
}: DashboardCardsProps) {
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const getStatusColor = (status: RecentActivity['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'warning':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-8 text-white"
      >
        <h2 className="text-3xl font-bold mb-2">Welcome to FoodXchange</h2>
        <p className="text-blue-100 text-lg">
          Transform your global food sourcing with unified digital solutions
        </p>
        <Button
          variant="outline"
          className="mt-4 bg-white/20 border-white/30 text-white hover:bg-white/30"
          rightIcon={<ArrowRightIcon className="h-4 w-4" />}
        >
          Get Started
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={index} variants={itemVariants}>
              <Card
                variant="glass"
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg ${iconColorVariants[stat.color]}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-gray-800">
                          {stat.value}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {stat.changeType === 'positive' && (
                            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                          )}
                          {stat.changeType === 'negative' && (
                            <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm ${
                            stat.changeType === 'positive' ? 'text-green-600' :
                            stat.changeType === 'negative' ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {stat.change}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {stat.description && (
                    <p className="text-xs text-gray-500 mt-2 group-hover:text-gray-700 transition-colors">
                      {stat.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card variant="default" shadow="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewAll?.('activities')}
                rightIcon={<ArrowRightIcon className="h-4 w-4" />}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                      <div className="font-medium text-gray-800">
                        {activity.action}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {activity.product}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 text-right">
                    {activity.time}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}