import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Button,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Rating,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Alert,
  Badge,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Store,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  LocalShipping,
  AttachMoney,
  Speed,
  VerifiedUser,
  Star,
  CompareArrows,
  FilterList,
  Download,
  MoreVert,
  EmojiEvents,
  WorkspacePremium,
  Timeline,
  Assessment,
  Flag,
  ThumbUp,
  ThumbDown,
  Schedule,
  Receipt,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { formatCurrency, formatNumber, formatPercentage } from '../../../utils/format';
import { SupplierMetrics } from '../types';

// Glassmorphism styles
const glassmorphismStyle = {
  background: (theme: any) => alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  borderRadius: 2,
  border: (theme: any) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: (theme: any) => `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
};

// Tier Badge Component
const TierBadge: React.FC<{ tier: 'bronze' | 'silver' | 'gold' }> = ({ tier }) => {
  const config = {
    bronze: { color: '#CD7F32', icon: <WorkspacePremium />, label: 'Bronze' },
    silver: { color: '#C0C0C0', icon: <WorkspacePremium />, label: 'Silver' },
    gold: { color: '#FFD700', icon: <EmojiEvents />, label: 'Gold' },
  };

  const { color, icon, label } = config[tier];

  return (
    <Chip
      icon={icon}
      label={label}
      size="small"
      sx={{
        bgcolor: alpha(color, 0.1),
        color: color,
        fontWeight: 'bold',
        '& .MuiChip-icon': { color },
      }}
    />
  );
};

// Performance Metric Card
const PerformanceCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}> = ({ title, value, icon, color, trend }) => {
  const theme = useTheme();

  return (
    <Card sx={glassmorphismStyle}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" variant="caption" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {formatPercentage(value / 100)}
            </Typography>
            {trend !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                {trend > 0 ? (
                  <TrendingUp color="success" fontSize="small" />
                ) : (
                  <TrendingDown color="error" fontSize="small" />
                )}
                <Typography
                  variant="caption"
                  color={trend > 0 ? 'success.main' : 'error.main'}
                  ml={0.5}
                >
                  {Math.abs(trend)}% vs last month
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: alpha(color, 0.1), color }}>
            {icon}
          </Avatar>
        </Box>
        <LinearProgress
          variant="determinate"
          value={value}
          sx={{
            mt: 2,
            height: 8,
            borderRadius: 4,
            bgcolor: alpha(color, 0.1),
            '& .MuiLinearProgress-bar': {
              bgcolor: color,
              borderRadius: 4,
            },
          }}
        />
      </CardContent>
    </Card>
  );
};

// Supplier Comparison Table
const SupplierComparisonTable: React.FC<{
  suppliers: SupplierMetrics[];
}> = ({ suppliers }) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, supplierId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedSupplier(supplierId);
  };

  const getStatusColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Paper sx={glassmorphismStyle}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Supplier</TableCell>
              <TableCell>Tier</TableCell>
              <TableCell align="center">Performance</TableCell>
              <TableCell align="center">Orders</TableCell>
              <TableCell align="right">Revenue</TableCell>
              <TableCell align="center">Compliance</TableCell>
              <TableCell align="center">Rating</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((supplier) => (
                <TableRow key={supplier.supplierId} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        <Store />
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {supplier.supplierName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <TierBadge tier={supplier.tier} />
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                      <CircularProgressWithLabel
                        value={supplier.performance.overall}
                        color={getStatusColor(supplier.performance.overall)}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Stack spacing={0.5} alignItems="center">
                      <Typography variant="h6">{supplier.orders.total}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {supplier.orders.pending} pending
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Stack spacing={0.5} alignItems="flex-end">
                      <Typography variant="subtitle2" fontWeight="bold">
                        {formatCurrency(supplier.revenue.total)}
                      </Typography>
                      <Chip
                        label={`${supplier.revenue.growth > 0 ? '+' : ''}${supplier.revenue.growth}%`}
                        size="small"
                        color={supplier.revenue.growth > 0 ? 'success' : 'error'}
                      />
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Active Certifications">
                        <Chip
                          icon={<CheckCircle />}
                          label={supplier.certifications.active}
                          size="small"
                          color="success"
                        />
                      </Tooltip>
                      {supplier.certifications.expiring > 0 && (
                        <Tooltip title="Expiring Soon">
                          <Chip
                            icon={<Warning />}
                            label={supplier.certifications.expiring}
                            size="small"
                            color="warning"
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Rating value={4.5} precision={0.5} readOnly size="small" />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, supplier.supplierId)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={suppliers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem>View Details</MenuItem>
        <MenuItem>Compare</MenuItem>
        <MenuItem>Generate Report</MenuItem>
        <Divider />
        <MenuItem>Contact Supplier</MenuItem>
      </Menu>
    </Paper>
  );
};

// Circular Progress with Label
const CircularProgressWithLabel: React.FC<{ value: number; color: string }> = ({ value, color }) => {
  return (
    <Box position="relative" display="inline-flex">
      <Box
        sx={{
          position: 'relative',
          width: 60,
          height: 60,
        }}
      >
        <svg width={60} height={60}>
          <circle
            cx={30}
            cy={30}
            r={25}
            fill="none"
            stroke={alpha(color, 0.2)}
            strokeWidth={5}
          />
          <circle
            cx={30}
            cy={30}
            r={25}
            fill="none"
            stroke={color}
            strokeWidth={5}
            strokeDasharray={`${(value / 100) * 157} 157`}
            transform="rotate(-90 30 30)"
            strokeLinecap="round"
          />
        </svg>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" fontWeight="bold">
            {value}%
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// Main Supplier Analytics Component
export const SupplierAnalytics: React.FC = () => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

  // Mock data
  const supplierMetrics: SupplierMetrics[] = [
    {
      supplierId: '1',
      supplierName: 'Fresh Farms Ltd',
      tier: 'gold',
      performance: {
        overall: 95,
        onTimeDelivery: 98,
        qualityScore: 96,
        responsiveness: 92,
        compliance: 94,
      },
      orders: {
        total: 156,
        completed: 142,
        pending: 12,
        cancelled: 2,
      },
      revenue: {
        total: 458000,
        mtd: 125000,
        ytd: 458000,
        growth: 15.2,
      },
      certifications: {
        active: 12,
        expiring: 2,
        expired: 0,
      },
      trends: [],
    },
    {
      supplierId: '2',
      supplierName: 'Ocean Harvest Co',
      tier: 'silver',
      performance: {
        overall: 88,
        onTimeDelivery: 90,
        qualityScore: 89,
        responsiveness: 85,
        compliance: 88,
      },
      orders: {
        total: 98,
        completed: 89,
        pending: 8,
        cancelled: 1,
      },
      revenue: {
        total: 312000,
        mtd: 78000,
        ytd: 312000,
        growth: 8.5,
      },
      certifications: {
        active: 8,
        expiring: 1,
        expired: 0,
      },
      trends: [],
    },
  ];

  const performanceRadarData = [
    { metric: 'On-time Delivery', value: 95 },
    { metric: 'Quality Score', value: 92 },
    { metric: 'Responsiveness', value: 88 },
    { metric: 'Compliance', value: 94 },
    { metric: 'Cost Efficiency', value: 85 },
    { metric: 'Innovation', value: 78 },
  ];

  const trendData = [
    { month: 'Jan', orders: 120, revenue: 380000, performance: 88 },
    { month: 'Feb', orders: 135, revenue: 420000, performance: 90 },
    { month: 'Mar', orders: 142, revenue: 445000, performance: 89 },
    { month: 'Apr', orders: 156, revenue: 485000, performance: 92 },
    { month: 'May', orders: 165, revenue: 512000, performance: 94 },
    { month: 'Jun', orders: 178, revenue: 545000, performance: 95 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Supplier Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive supplier performance metrics and insights
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<CompareArrows />}>
            Compare Suppliers
          </Button>
          <Button variant="contained" startIcon={<Download />}>
            Export Report
          </Button>
        </Stack>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <PerformanceCard
            title="Average Performance"
            value={91.5}
            icon={<Speed />}
            color={theme.palette.success.main}
            trend={3.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <PerformanceCard
            title="On-time Delivery"
            value={94}
            icon={<LocalShipping />}
            color={theme.palette.info.main}
            trend={1.8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <PerformanceCard
            title="Quality Score"
            value={92.5}
            icon={<Star />}
            color={theme.palette.warning.main}
            trend={-0.5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <PerformanceCard
            title="Compliance Rate"
            value={96}
            icon={<VerifiedUser />}
            color={theme.palette.primary.main}
            trend={2.1}
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ ...glassmorphismStyle, mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, value) => setSelectedTab(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Performance Overview" />
          <Tab label="Supplier Comparison" />
          <Tab label="Compliance Tracking" />
          <Tab label="Trend Analysis" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {selectedTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={glassmorphismStyle}>
              <CardHeader title="Performance Radar" />
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={performanceRadarData}>
                    <PolarGrid stroke={alpha(theme.palette.divider, 0.3)} />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke={theme.palette.primary.main}
                      fill={alpha(theme.palette.primary.main, 0.3)}
                      strokeWidth={2}
                    />
                    <RechartsTooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={glassmorphismStyle}>
              <CardHeader title="Supplier Distribution by Tier" />
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={[
                      { tier: 'Gold', count: 15, percentage: 25 },
                      { tier: 'Silver', count: 28, percentage: 47 },
                      { tier: 'Bronze', count: 17, percentage: 28 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                    <XAxis dataKey="tier" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]}>
                      <Cell fill="#FFD700" />
                      <Cell fill="#C0C0C0" />
                      <Cell fill="#CD7F32" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {selectedTab === 1 && (
        <SupplierComparisonTable suppliers={supplierMetrics} />
      )}

      {selectedTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Compliance Alert
              </Typography>
              <Typography variant="body2">
                5 suppliers have certifications expiring within the next 30 days. Review and take action to maintain compliance.
              </Typography>
            </Alert>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card sx={glassmorphismStyle}>
              <CardHeader title="Certification Status Overview" />
              <CardContent>
                <Stack spacing={3}>
                  {['HACCP', 'ISO 22000', 'Organic', 'Fair Trade', 'Halal'].map((cert) => (
                    <Box key={cert}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="subtitle2">{cert}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          85% compliant
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={85}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: theme.palette.success.main,
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={glassmorphismStyle}>
              <CardHeader title="Compliance Metrics" />
              <CardContent>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Total Certifications</Typography>
                    <Typography variant="h6" fontWeight="bold">256</Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Active</Typography>
                    <Chip label="234" color="success" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Expiring Soon</Typography>
                    <Chip label="18" color="warning" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Expired</Typography>
                    <Chip label="4" color="error" size="small" />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {selectedTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={glassmorphismStyle}>
              <CardHeader 
                title="Performance Trends" 
                subheader="6-month supplier performance analysis"
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="orders"
                      stroke={theme.palette.primary.main}
                      fill={alpha(theme.palette.primary.main, 0.3)}
                      name="Orders"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="performance"
                      stroke={theme.palette.secondary.main}
                      strokeWidth={3}
                      dot={{ fill: theme.palette.secondary.main }}
                      name="Performance %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default SupplierAnalytics;