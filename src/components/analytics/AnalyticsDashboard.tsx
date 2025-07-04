import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package,
  Download,
  Eye,
  ExternalLink
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Mock data
const revenueData = [
  { month: 'Jan', revenue: 125000, orders: 45 },
  { month: 'Feb', revenue: 142000, orders: 52 },
  { month: 'Mar', revenue: 138000, orders: 48 },
  { month: 'Apr', revenue: 165000, orders: 61 },
  { month: 'May', revenue: 189000, orders: 68 },
  { month: 'Jun', revenue: 201000, orders: 74 }
];

const categoryData = [
  { name: 'Beverages', value: 35, color: '#3B82F6' },
  { name: 'Snacks', value: 25, color: '#10B981' },
  { name: 'Dairy', value: 20, color: '#F59E0B' },
  { name: 'Frozen', value: 12, color: '#EF4444' },
  { name: 'Other', value: 8, color: '#8B5CF6' }
];

const supplierPerformance = [
  { supplier: 'Global Foods Co.', orders: 28, onTime: 96, rating: 4.8 },
  { supplier: 'Fresh Imports Ltd', orders: 22, onTime: 94, rating: 4.7 },
  { supplier: 'Quality Distributors', orders: 19, onTime: 98, rating: 4.9 },
  { supplier: 'Metro Wholesale', orders: 15, onTime: 92, rating: 4.5 }
];

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  changeType?: string;
  icon: string;
  format?: string;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = change >= 0 ? 'increase' : 'decrease',
  icon,
  format = 'number',
  className = ''
}) => {
  const formatValue = (val: number, fmt: string) => {
    switch (fmt) {
      case 'currency':
        return val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  const getIcon = (iconName: string) => {
    const iconProps = { className: "h-5 w-5 text-blue-600" };
    switch (iconName) {
      case 'TrendingUp': return <TrendingUp {...iconProps} />;
      case 'Users': return <Users {...iconProps} />;
      case 'ShoppingCart': return <ShoppingCart {...iconProps} />;
      case 'DollarSign': return <DollarSign {...iconProps} />;
      case 'Package': return <Package {...iconProps} />;
      default: return <TrendingUp {...iconProps} />;
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            {getIcon(icon)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-xl font-bold text-gray-900">
              {formatValue(value, format)}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          changeType === 'increase' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {changeType === 'increase' ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {Math.abs(change)}%
        </div>
      </div>
    </div>
  );
};

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, actions, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="font-medium">{`Month: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsDashboard: React.FC = () => {
  const formatCurrency = (value: number) => 
    value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  const metrics = {
    totalRevenue: { value: 4890000, change: 12.5 },
    totalOrders: { value: 156, change: 8.2 },
    revenue: { value: 2340000, change: 15.3 },
    activeSuppliers: { value: 23, change: -2.1, changeType: 'decrease' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track performance metrics and business insights</p>
        </div>
        <div className="flex gap-3">
          <button className="h-8 px-3 py-1 border border-gray-300 rounded-md flex items-center gap-2 text-sm hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Revenue" 
          value={metrics.totalRevenue.value} 
          change={metrics.totalRevenue.change} 
          icon="DollarSign"
          format="currency"
          className="bg-blue-50"
        />
        <MetricCard 
          title="Total Orders" 
          value={metrics.totalOrders.value} 
          change={metrics.totalOrders.change} 
          icon="ShoppingCart"
          className="bg-green-50"
        />
        <MetricCard 
          title="Revenue" 
          value={metrics.revenue.value} 
          change={metrics.revenue.change} 
          icon="TrendingUp"
          format="currency"
          className="bg-purple-50"
        />
        <MetricCard 
          title="Active Suppliers" 
          value={metrics.activeSuppliers.value} 
          change={metrics.activeSuppliers.change} 
          changeType={metrics.activeSuppliers.changeType}
          icon="Users"
          className="bg-orange-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <ChartCard
          title="Revenue & Orders Trend"
          actions={
            <button className="h-8 px-3 py-1 border border-gray-300 rounded-md flex items-center gap-2 text-sm hover:bg-gray-50">
              <Eye className="h-4 w-4" />
              View Details
            </button>
          }
          className=""
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="revenue" orientation="left" tickFormatter={formatCurrency} />
              <YAxis yAxisId="orders" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
                name="Revenue"
              />
              <Area
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                stackId="2"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
                name="Orders"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category Distribution */}
        <ChartCard title="Revenue by Category" className="">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Supplier Performance */}
      <ChartCard title="Top Supplier Performance" className="">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-700">Supplier</th>
                <th className="text-right py-2 font-medium text-gray-700">Orders</th>
                <th className="text-right py-2 font-medium text-gray-700">On-Time %</th>
                <th className="text-right py-2 font-medium text-gray-700">Rating</th>
              </tr>
            </thead>
            <tbody>
              {supplierPerformance.map((supplier, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 font-medium text-gray-900">{supplier.supplier}</td>
                  <td className="text-right py-3 text-gray-700">{supplier.orders}</td>
                  <td className="text-right py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      supplier.onTime >= 95 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {supplier.onTime}%
                    </span>
                  </td>
                  <td className="text-right py-3 text-gray-700">⭐ {supplier.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
};

export default AnalyticsDashboard;
