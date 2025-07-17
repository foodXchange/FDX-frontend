import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Skeleton,
  Alert,
  Tab,
  Tabs,
  Divider,
  Avatar,
  AvatarGroup,
  LinearProgress,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Analytics,
  Download,
  Refresh,
  FilterList,
  MoreVert,
  Search,
  AutoGraph,
  Timeline,
  PieChart,
  BarChart,
  ShowChart,
  Speed,
  Warning,
  CheckCircle,
  Info,
  AttachMoney,
  LocalShipping,
  StoreMallDirectory,
  Assignment,
  AccountTree,
  EmojiEvents,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Treemap,
} from 'recharts';
import { aiServiceManager } from '../../../services/ai';
import { useApi } from '../../../hooks/useApi';
import { formatCurrency, formatNumber, formatPercentage } from '../../../utils/format';

// Glassmorphism styles
const glassmorphismStyle = {
  background: (theme: any) => alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  borderRadius: 2,
  border: (theme: any) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: (theme: any) => `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
};

// KPI Card Component with Glassmorphism
const KPICard: React.FC<{
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  format?: 'currency' | 'number' | 'percentage';
  color?: string;
  onClick?: () => void;
}> = ({ title, value, change, icon, format = 'number', color, onClick }) => {
  const theme = useTheme();
  const isPositive = change && change > 0;
  
  const formattedValue = useMemo(() => {
    if (typeof value === 'string') return value;
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value / 100);
      default:
        return formatNumber(value);
    }
  }, [value, format]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        sx={{
          ...glassmorphismStyle,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: theme.shadows[8],
          },
        }}
        onClick={onClick}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography color="text.secondary" variant="caption" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h4" fontWeight="bold" color={color || 'text.primary'}>
                {formattedValue}
              </Typography>
              {change !== undefined && (
                <Box display="flex" alignItems="center" mt={1}>
                  {isPositive ? (
                    <TrendingUp color="success" fontSize="small" />
                  ) : (
                    <TrendingDown color="error" fontSize="small" />
                  )}
                  <Typography
                    variant="body2"
                    color={isPositive ? 'success.main' : 'error.main'}
                    ml={0.5}
                  >
                    {Math.abs(change)}%
                  </Typography>
                </Box>
              )}
            </Box>
            <Avatar
              sx={{
                bgcolor: alpha(color || theme.palette.primary.main, 0.1),
                color: color || theme.palette.primary.main,
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Interactive Chart Component
const InteractiveChart: React.FC<{
  type: 'line' | 'area' | 'bar' | 'pie' | 'radial' | 'treemap';
  data: any[];
  title: string;
  subtitle?: string;
  height?: number;
}> = ({ type, data, title, subtitle, height = 400 }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    '#FF9800', // Orange
    '#2E7D32', // Teal
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.success.main,
  ];

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: alpha(theme.palette.background.paper, 0.95),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: theme.shape.borderRadius,
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={{ fill: theme.palette.primary.main }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke={theme.palette.secondary.main}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: alpha(theme.palette.background.paper, 0.95),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: theme.shape.borderRadius,
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              stroke={theme.palette.primary.main}
              fill={alpha(theme.palette.primary.main, 0.3)}
              strokeWidth={2}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <RechartsBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: alpha(theme.palette.background.paper, 0.95),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: theme.shape.borderRadius,
              }}
            />
            <Legend />
            <Bar dataKey="value" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} />
            <Bar dataKey="target" fill={theme.palette.secondary.main} radius={[8, 8, 0, 0]} />
          </RechartsBarChart>
        );

      case 'pie':
        return (
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip
              contentStyle={{
                backgroundColor: alpha(theme.palette.background.paper, 0.95),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: theme.shape.borderRadius,
              }}
            />
          </RechartsPieChart>
        );

      case 'radial':
        return (
          <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" data={data}>
            <RadialBar
              minAngle={15}
              label={{ position: 'insideStart', fill: '#fff' }}
              background
              clockWise
              dataKey="value"
            />
            <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: alpha(theme.palette.background.paper, 0.95),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: theme.shape.borderRadius,
              }}
            />
          </RadialBarChart>
        );

      case 'treemap':
        return (
          <Treemap
            data={data}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="#fff"
            fill={theme.palette.primary.main}
          >
            <RechartsTooltip
              contentStyle={{
                backgroundColor: alpha(theme.palette.background.paper, 0.95),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: theme.shape.borderRadius,
              }}
            />
          </Treemap>
        );

      default:
        return null;
    }
  };

  return (
    <Paper sx={glassmorphismStyle}>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box>
            <Tooltip title="Refresh">
              <IconButton size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton size="small">
                <Download />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem>Export as CSV</MenuItem>
              <MenuItem>Export as PDF</MenuItem>
              <MenuItem>Share Report</MenuItem>
            </Menu>
          </Box>
        </Box>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

// AI Insights Component
const AIInsights: React.FC<{
  insights: Array<{ type: 'success' | 'warning' | 'info'; message: string; action?: string }>;
}> = ({ insights }) => {
  const theme = useTheme();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle />;
      case 'warning':
        return <Warning />;
      default:
        return <Info />;
    }
  };

  return (
    <Paper sx={glassmorphismStyle}>
      <CardHeader
        title="AI-Powered Insights"
        subheader="Natural language analysis of your business metrics"
        avatar={
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <AutoGraph />
          </Avatar>
        }
      />
      <CardContent>
        <Stack spacing={2}>
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Alert
                severity={insight.type}
                icon={getIcon(insight.type)}
                action={
                  insight.action && (
                    <Button color="inherit" size="small">
                      {insight.action}
                    </Button>
                  )
                }
              >
                {insight.message}
              </Alert>
            </motion.div>
          ))}
        </Stack>
      </CardContent>
    </Paper>
  );
};

// Natural Language Query Component
const NaturalLanguageQuery: React.FC<{
  onQuery: (query: string) => void;
}> = ({ onQuery }) => {
  const [query, setQuery] = useState('');
  const [suggestions] = useState([
    'Show me supplier performance trends',
    'What are the top selling products this month?',
    'Compare order volumes across regions',
    'Predict demand for next quarter',
  ]);

  return (
    <Paper sx={glassmorphismStyle}>
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Ask Analytics Assistant
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask a question about your data..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onQuery(query);
              setQuery('');
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    onQuery(query);
                    setQuery('');
                  }}
                >
                  Ask
                </Button>
              </InputAdornment>
            ),
          }}
        />
        <Box mt={2}>
          <Typography variant="caption" color="text.secondary">
            Suggestions:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
            {suggestions.map((suggestion, index) => (
              <Chip
                key={index}
                label={suggestion}
                size="small"
                onClick={() => setQuery(suggestion)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

// Main Dashboard Component
export const AdvancedAnalyticsDashboard: React.FC = () => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date(),
  });
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  const kpiData = [
    {
      title: 'Total Revenue',
      value: 2847000,
      change: 12.5,
      icon: <AttachMoney />,
      format: 'currency' as const,
      color: theme.palette.success.main,
    },
    {
      title: 'Active Orders',
      value: 342,
      change: -5.2,
      icon: <Assignment />,
      format: 'number' as const,
      color: theme.palette.primary.main,
    },
    {
      title: 'Supplier Performance',
      value: 0.87,
      change: 3.1,
      icon: <Speed />,
      format: 'percentage' as const,
      color: theme.palette.info.main,
    },
    {
      title: 'Compliance Rate',
      value: 0.94,
      change: 1.8,
      icon: <CheckCircle />,
      format: 'percentage' as const,
      color: theme.palette.success.main,
    },
  ];

  const revenueData = [
    { name: 'Jan', value: 400000, target: 380000 },
    { name: 'Feb', value: 420000, target: 400000 },
    { name: 'Mar', value: 480000, target: 450000 },
    { name: 'Apr', value: 520000, target: 500000 },
    { name: 'May', value: 580000, target: 550000 },
    { name: 'Jun', value: 640000, target: 600000 },
  ];

  const categoryData = [
    { name: 'Fresh Produce', value: 35 },
    { name: 'Dairy', value: 25 },
    { name: 'Meat & Seafood', value: 20 },
    { name: 'Bakery', value: 12 },
    { name: 'Others', value: 8 },
  ];

  const supplierData = [
    { name: 'Gold Tier', value: 45, fill: '#FFD700' },
    { name: 'Silver Tier', value: 30, fill: '#C0C0C0' },
    { name: 'Bronze Tier', value: 25, fill: '#CD7F32' },
  ];

  const insights = [
    {
      type: 'success' as const,
      message: 'Revenue is up 12.5% compared to last month, exceeding targets by 6.7%',
      action: 'View Details',
    },
    {
      type: 'warning' as const,
      message: '3 suppliers have certifications expiring within 30 days',
      action: 'Review Now',
    },
    {
      type: 'info' as const,
      message: 'Fresh produce demand is predicted to increase by 15% next quarter',
      action: 'Prepare Inventory',
    },
  ];

  const handleNaturalLanguageQuery = async (query: string) => {
    setLoading(true);
    try {
      // Call AI service for insights
      const response = await aiServiceManager.generateInsights(
        { query, metrics: kpiData, charts: { revenue: revenueData, categories: categoryData } },
        'analytics_dashboard'
      );
      console.log('AI Response:', response);
    } catch (error) {
      console.error('Error processing query:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time insights and performance metrics
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={dateRange.start}
              onChange={(date) => date && setDateRange({ ...dateRange, start: date })}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="End Date"
              value={dateRange.end}
              onChange={(date) => date && setDateRange({ ...dateRange, end: date })}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>
          <Button variant="outlined" startIcon={<FilterList />}>
            Filters
          </Button>
          <Button variant="contained" startIcon={<Download />}>
            Export
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={3}>
        {kpiData.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <KPICard {...kpi} />
          </Grid>
        ))}
      </Grid>

      {/* Natural Language Query */}
      <Box mb={3}>
        <NaturalLanguageQuery onQuery={handleNaturalLanguageQuery} />
      </Box>

      {/* Tab Navigation */}
      <Paper sx={{ ...glassmorphismStyle, mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, value) => setSelectedTab(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" icon={<Analytics />} iconPosition="start" />
          <Tab label="Sales" icon={<ShowChart />} iconPosition="start" />
          <Tab label="Suppliers" icon={<StoreMallDirectory />} iconPosition="start" />
          <Tab label="Logistics" icon={<LocalShipping />} iconPosition="start" />
          <Tab label="Compliance" icon={<Assignment />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Main Content */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {selectedTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <InteractiveChart
                  type="area"
                  data={revenueData}
                  title="Revenue Trend"
                  subtitle="Monthly revenue vs target"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <AIInsights insights={insights} />
              </Grid>
              <Grid item xs={12} md={6}>
                <InteractiveChart
                  type="pie"
                  data={categoryData}
                  title="Product Categories"
                  subtitle="Distribution by category"
                  height={300}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <InteractiveChart
                  type="radial"
                  data={supplierData}
                  title="Supplier Tiers"
                  subtitle="Verification levels"
                  height={300}
                />
              </Grid>
            </Grid>
          )}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default AdvancedAnalyticsDashboard;