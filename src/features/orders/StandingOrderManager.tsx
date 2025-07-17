import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Tabs,
  Tab,
  LinearProgress,
  Menu,
  MenuItem,
  Divider,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  CalendarMonth,
  AccessTime,
  Inventory,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Settings,
  Add,
  MoreHoriz,
  TrendingUp,
  Refresh
} from '@mui/icons-material';
import { format } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

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
  weekly: { label: 'Weekly', color: 'primary' as const },
  'bi-weekly': { label: 'Bi-weekly', color: 'secondary' as const },
  monthly: { label: 'Monthly', color: 'success' as const },
  quarterly: { label: 'Quarterly', color: 'warning' as const },
};

const statusConfig = {
  active: { label: 'Active', color: 'success' as const, icon: PlayCircle },
  paused: { label: 'Paused', color: 'warning' as const, icon: PauseCircle },
  cancelled: { label: 'Cancelled', color: 'error' as const, icon: StopCircle },
  expired: { label: 'Expired', color: 'default' as const, icon: AccessTime },
};

const getDaysUntilDelivery = (nextDelivery: Date): number => {
  const today = new Date();
  const diffTime = nextDelivery.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const StandingOrderManager: React.FC = () => {
  const [standingOrders, setStandingOrders] = useState<StandingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, orderId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrderId(orderId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrderId(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusChip = (status: StandingOrder['status']) => {
    const config = statusConfig[status];
    const IconComponent = config.icon === AccessTime ? AccessTime : 
                        config.icon === PlayCircle ? PlayCircle :
                        config.icon === PauseCircle ? PauseCircle : StopCircle;
    return (
      <Chip
        icon={<IconComponent />}
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };

  const getFrequencyChip = (frequency: StandingOrder['frequency']) => {
    const config = frequencyConfig[frequency];
    return <Chip label={config.label} color={config.color} size="small" variant="outlined" />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Standing Order Manager
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage recurring orders and subscription deliveries
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" size="small" startIcon={<Refresh />}>
            Refresh
          </Button>
          <Button variant="contained" size="small" startIcon={<Add />}>
            New Standing Order
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader
              title="Active Orders"
              titleTypographyProps={{ variant: 'body2' }}
              avatar={<PlayCircle color="success" />}
            />
            <CardContent>
              <Typography variant="h4" component="div">
                {stats.totalActive}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Currently running
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader
              title="Paused Orders"
              titleTypographyProps={{ variant: 'body2' }}
              avatar={<PauseCircle color="warning" />}
            />
            <CardContent>
              <Typography variant="h4" component="div">
                {stats.totalPaused}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Temporarily stopped
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader
              title="Upcoming Deliveries"
              titleTypographyProps={{ variant: 'body2' }}
              avatar={<CalendarMonth color="primary" />}
            />
            <CardContent>
              <Typography variant="h4" component="div">
                {stats.upcomingDeliveries}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Next 7 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader
              title="Monthly Revenue"
              titleTypographyProps={{ variant: 'body2' }}
              avatar={<TrendingUp color="success" />}
            />
            <CardContent>
              <Typography variant="h4" component="div">
                {stats.currency} {stats.monthlyRevenue.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Estimated recurring
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="standing orders tabs">
          <Tab label="All Orders" />
          <Tab label="Active" />
          <Tab label="Paused" />
          <Tab label="Upcoming" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Card>
            <CardHeader
              title="Standing Orders"
              subheader={`${standingOrders.length} total standing orders`}
            />
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell>Frequency</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Next Delivery</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Monthly Value</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
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
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {order.orderNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.sku}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {order.productName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.quantity} {order.unit}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{getFrequencyChip(order.frequency)}</TableCell>
                        <TableCell>
                          <Box sx={{ minWidth: 120 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">
                                {order.completedDeliveries}/{order.totalDeliveries}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {Math.round(getProgressPercentage(order))}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={getProgressPercentage(order)}
                              sx={{ height: 6, borderRadius: 1 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {format(order.nextDelivery, 'MMM dd, yyyy')}
                            </Typography>
                            <Typography
                              variant="caption"
                              color={
                                daysUntil <= 3 ? 'error.main' :
                                daysUntil <= 7 ? 'warning.main' :
                                'text.secondary'
                              }
                            >
                              {daysUntil > 0 ? `${daysUntil} days` : 'Overdue'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{getStatusChip(order.status)}</TableCell>
                        <TableCell>
                          {order.currency} {Math.round(monthlyValue).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, order.id)}
                          >
                            <MoreHoriz />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardHeader title="Active Standing Orders" />
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Inventory sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
                <Typography color="text.secondary">
                  Active orders view would show filtered content
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardHeader title="Paused Standing Orders" />
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <PauseCircle sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
                <Typography color="text.secondary">
                  Paused orders view would show filtered content
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardHeader title="Upcoming Deliveries" />
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CalendarMonth sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
                <Typography color="text.secondary">
                  Upcoming deliveries view would show filtered content
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <Settings sx={{ mr: 1, fontSize: 18 }} />
          Edit Schedule
        </MenuItem>
        <Divider />
        {selectedOrderId && (() => {
          const order = standingOrders.find(o => o.id === selectedOrderId);
          if (!order) return null;
          
          if (order.status === 'active') {
            return (
              <MenuItem onClick={() => {
                handleOrderAction('pause', order.id);
                handleMenuClose();
              }}>
                <PauseCircle sx={{ mr: 1, fontSize: 18 }} />
                Pause Order
              </MenuItem>
            );
          }
          
          if (order.status === 'paused') {
            return (
              <MenuItem onClick={() => {
                handleOrderAction('resume', order.id);
                handleMenuClose();
              }}>
                <PlayCircle sx={{ mr: 1, fontSize: 18 }} />
                Resume Order
              </MenuItem>
            );
          }
          
          return null;
        })()}
        <MenuItem 
          onClick={() => {
            if (selectedOrderId) {
              handleOrderAction('cancel', selectedOrderId);
              handleMenuClose();
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <StopCircle sx={{ mr: 1, fontSize: 18 }} />
          Cancel Order
        </MenuItem>
      </Menu>
    </Box>
  );
};