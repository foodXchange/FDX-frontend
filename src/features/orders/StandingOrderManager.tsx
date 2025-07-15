import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressIndicator } from '../../components/ui/ProgressIndicator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Calendar,
  Clock,
  Package,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Settings,
  Plus,
  MoreHorizontal,
  TrendingUp,
  // CheckCircle, // Unused for now
  RefreshCw,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { format } from 'date-fns';

interface StandingOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  sku: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  currency: string;
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly';
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  startDate: Date;
  endDate?: Date;
  nextDelivery: Date;
  lastDelivery?: Date;
  totalDeliveries: number;
  completedDeliveries: number;
  autoRenew: boolean;
  createdDate: Date;
  supplier: string;
  notes?: string;
}

interface StandingOrderStats {
  totalActive: number;
  totalPaused: number;
  upcomingDeliveries: number;
  monthlyRevenue: number;
  currency: string;
}

const frequencyConfig = {
  weekly: { label: 'Weekly', color: 'bg-blue-100 text-blue-700' },
  'bi-weekly': { label: 'Bi-weekly', color: 'bg-purple-100 text-purple-700' },
  monthly: { label: 'Monthly', color: 'bg-green-100 text-green-700' },
  quarterly: { label: 'Quarterly', color: 'bg-orange-100 text-orange-700' },
};

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: PlayCircle },
  paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-700', icon: PauseCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: StopCircle },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-700', icon: Clock },
};


const getDaysUntilDelivery = (nextDelivery: Date): number => {
  const today = new Date();
  const diffTime = nextDelivery.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const StandingOrderManager: React.FC = () => {
  const [standingOrders, setStandingOrders] = useState<StandingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StandingOrderStats>({
    totalActive: 0,
    totalPaused: 0,
    upcomingDeliveries: 0,
    monthlyRevenue: 0,
    currency: 'EUR',
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockOrders: StandingOrder[] = [
      {
        id: '1',
        orderNumber: 'SO-2024-001',
        customerName: 'Global Foods Inc.',
        productName: 'Organic Wheat Flour',
        sku: 'OWF-001',
        quantity: 1000,
        unit: 'kg',
        unitPrice: 2.5,
        currency: 'EUR',
        frequency: 'monthly',
        status: 'active',
        startDate: new Date('2024-01-01'),
        nextDelivery: new Date('2024-12-25'),
        lastDelivery: new Date('2024-11-25'),
        totalDeliveries: 12,
        completedDeliveries: 11,
        autoRenew: true,
        createdDate: new Date('2023-12-15'),
        supplier: 'Munich Mills GmbH',
        notes: 'Premium grade flour for bakery operations',
      },
      {
        id: '2',
        orderNumber: 'SO-2024-002',
        customerName: 'Mediterranean Delights',
        productName: 'Extra Virgin Olive Oil',
        sku: 'EVOO-201',
        quantity: 500,
        unit: 'liters',
        unitPrice: 8.5,
        currency: 'EUR',
        frequency: 'bi-weekly',
        status: 'active',
        startDate: new Date('2024-03-01'),
        nextDelivery: new Date('2024-12-20'),
        lastDelivery: new Date('2024-12-06'),
        totalDeliveries: 26,
        completedDeliveries: 22,
        autoRenew: true,
        createdDate: new Date('2024-02-15'),
        supplier: 'Mediterranean Oils Ltd',
      },
      {
        id: '3',
        orderNumber: 'SO-2024-003',
        customerName: 'Nordic Coffee Co.',
        productName: 'Premium Coffee Beans',
        sku: 'PCB-401',
        quantity: 200,
        unit: 'kg',
        unitPrice: 25.0,
        currency: 'EUR',
        frequency: 'weekly',
        status: 'paused',
        startDate: new Date('2024-06-01'),
        nextDelivery: new Date('2024-12-22'),
        lastDelivery: new Date('2024-12-08'),
        totalDeliveries: 52,
        completedDeliveries: 24,
        autoRenew: false,
        createdDate: new Date('2024-05-20'),
        supplier: 'Colombian Coffee Co.',
        notes: 'Temporarily paused due to seasonal closure',
      },
      {
        id: '4',
        orderNumber: 'SO-2024-004',
        customerName: 'Frozen Foods Ltd',
        productName: 'Frozen Blueberries',
        sku: 'FB-301',
        quantity: 300,
        unit: 'kg',
        unitPrice: 12.0,
        currency: 'EUR',
        frequency: 'quarterly',
        status: 'active',
        startDate: new Date('2024-02-01'),
        nextDelivery: new Date('2025-01-01'),
        lastDelivery: new Date('2024-10-01'),
        totalDeliveries: 4,
        completedDeliveries: 3,
        autoRenew: true,
        createdDate: new Date('2024-01-20'),
        supplier: 'Nordic Berries AB',
      },
    ];

    setStandingOrders(mockOrders);

    // Calculate stats
    const activeOrders = mockOrders.filter(order => order.status === 'active');
    const pausedOrders = mockOrders.filter(order => order.status === 'paused');
    const upcomingCount = activeOrders.filter(order => 
      getDaysUntilDelivery(order.nextDelivery) <= 7
    ).length;
    
    const monthlyRevenue = activeOrders.reduce((total, order) => {
      const deliveriesPerMonth = {
        weekly: 4.33,
        'bi-weekly': 2.17,
        monthly: 1,
        quarterly: 0.33,
      };
      return total + (order.quantity * order.unitPrice * deliveriesPerMonth[order.frequency]);
    }, 0);

    setStats({
      totalActive: activeOrders.length,
      totalPaused: pausedOrders.length,
      upcomingDeliveries: upcomingCount,
      monthlyRevenue: Math.round(monthlyRevenue),
      currency: 'EUR',
    });

    setLoading(false);
  }, []);

  const handleOrderAction = (action: string, orderId: string) => {
    setStandingOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.id === orderId) {
          switch (action) {
            case 'pause':
              return { ...order, status: 'paused' as const };
            case 'resume':
              return { ...order, status: 'active' as const };
            case 'cancel':
              return { ...order, status: 'cancelled' as const };
            default:
              return order;
          }
        }
        return order;
      })
    );
  };

  const getProgressPercentage = (order: StandingOrder) => {
    if (order.totalDeliveries === 0) return 0;
    return (order.completedDeliveries / order.totalDeliveries) * 100;
  };

  const getStatusBadge = (status: StandingOrder['status']) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getFrequencyBadge = (frequency: StandingOrder['frequency']) => {
    const config = frequencyConfig[frequency];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading standing orders...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Standing Order Manager</h1>
          <p className="text-muted-foreground">
            Manage recurring orders and subscription deliveries
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Standing Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <PlayCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActive}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused Orders</CardTitle>
            <PauseCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPaused}</div>
            <p className="text-xs text-muted-foreground">Temporarily stopped</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deliveries</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingDeliveries}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.currency} {stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Estimated recurring</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Standing Orders</CardTitle>
              <p className="text-sm text-muted-foreground">
                {standingOrders.length} total standing orders
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Next Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Monthly Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standingOrders.map((order) => {
                    const daysUntil = getDaysUntilDelivery(order.nextDelivery);
                    const monthlyValue = (() => {
                      const deliveriesPerMonth = {
                        weekly: 4.33,
                        'bi-weekly': 2.17,
                        monthly: 1,
                        quarterly: 0.33,
                      };
                      return order.quantity * order.unitPrice * deliveriesPerMonth[order.frequency];
                    })();

                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-xs text-muted-foreground">{order.sku}</p>
                          </div>
                        </TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.productName}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.quantity} {order.unit}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getFrequencyBadge(order.frequency)}</TableCell>
                        <TableCell>
                          <div className="space-y-1 min-w-[120px]">
                            <div className="flex items-center justify-between text-sm">
                              <span>{order.completedDeliveries}/{order.totalDeliveries}</span>
                              <span className="text-xs text-muted-foreground">
                                {Math.round(getProgressPercentage(order))}%
                              </span>
                            </div>
                            <ProgressIndicator value={getProgressPercentage(order)} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              {format(order.nextDelivery, 'MMM dd, yyyy')}
                            </p>
                            <p className={cn(
                              "text-xs",
                              daysUntil <= 3 ? "text-red-600" : 
                              daysUntil <= 7 ? "text-yellow-600" : "text-muted-foreground"
                            )}>
                              {daysUntil > 0 ? `${daysUntil} days` : 'Overdue'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          {order.currency} {Math.round(monthlyValue).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Edit Schedule
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {order.status === 'active' && (
                                <DropdownMenuItem 
                                  onClick={() => handleOrderAction('pause', order.id)}
                                >
                                  <PauseCircle className="h-4 w-4 mr-2" />
                                  Pause Order
                                </DropdownMenuItem>
                              )}
                              {order.status === 'paused' && (
                                <DropdownMenuItem 
                                  onClick={() => handleOrderAction('resume', order.id)}
                                >
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  Resume Order
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleOrderAction('cancel', order.id)}
                                className="text-red-600"
                              >
                                <StopCircle className="h-4 w-4 mr-2" />
                                Cancel Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Standing Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Active orders view would show filtered content</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paused">
          <Card>
            <CardHeader>
              <CardTitle>Paused Standing Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <PauseCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Paused orders view would show filtered content</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Upcoming deliveries view would show filtered content</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};