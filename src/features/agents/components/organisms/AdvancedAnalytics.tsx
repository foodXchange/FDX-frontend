import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  TrendingDown,
  Download,
  Refresh,
  FilterList,
  Schedule,
  AttachMoney,
  People,
  Assignment,
  Star,
  Compare,
  PieChart,
  BarChart,
  ShowChart,
  CalendarToday,
  LocationOn,
  Business,
  Phone,
  Email,
  WhatsApp,
  Insights,
} from '@mui/icons-material';
import { useAgentStore } from '../../store';

interface AnalyticsData {
  overview: {
    totalLeads: number;
    conversionRate: number;
    averageDealSize: number;
    totalRevenue: number;
    responseTime: number;
    customerSatisfaction: number;
    trends: {
      leads: number;
      conversion: number;
      revenue: number;
    };
  };
  performance: {
    daily: PerformanceData[];
    weekly: PerformanceData[];
    monthly: PerformanceData[];
  };
  leadSources: SourceAnalytics[];
  businessTypes: BusinessAnalytics[];
  geographicData: GeographicData[];
  timeAnalytics: TimeAnalytics;
  competitorAnalysis: CompetitorData[];
  forecastData: ForecastData;
}

interface PerformanceData {
  date: string;
  leads: number;
  converted: number;
  revenue: number;
  calls: number;
  emails: number;
  whatsappMessages: number;
}

interface SourceAnalytics {
  source: string;
  leads: number;
  conversionRate: number;
  averageValue: number;
  roi: number;
  trend: number;
}

interface BusinessAnalytics {
  type: string;
  leads: number;
  conversionRate: number;
  averageValue: number;
  marketPenetration: number;
}

interface GeographicData {
  location: string;
  leads: number;
  revenue: number;
  conversionRate: number;
  marketPotential: number;
}

interface TimeAnalytics {
  bestContactTimes: Array<{ hour: number; successRate: number }>;
  seasonalTrends: Array<{ month: string; performance: number }>;
  responseTimeImpact: Array<{ timeRange: string; conversionRate: number }>;
}

interface CompetitorData {
  competitor: string;
  marketShare: number;
  avgDealSize: number;
  winRate: number;
  lostDeals: number;
}

interface ForecastData {
  nextMonth: {
    predictedLeads: number;
    predictedRevenue: number;
    confidence: number;
  };
  nextQuarter: {
    predictedLeads: number;
    predictedRevenue: number;
    confidence: number;
  };
  recommendations: string[];
}

const AdvancedAnalytics: React.FC = () => {
  const theme = useTheme();
  const { currentAgent } = useAgentStore();
  
  const [timeRange, setTimeRange] = useState('month');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    
    // Mock data - would come from API
    setTimeout(() => {
      const mockData: AnalyticsData = {
        overview: {
          totalLeads: 156,
          conversionRate: 0.24,
          averageDealSize: 8500,
          totalRevenue: 318000,
          responseTime: 2.3,
          customerSatisfaction: 4.7,
          trends: {
            leads: 12,
            conversion: 5,
            revenue: 18,
          },
        },
        performance: {
          daily: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            leads: Math.floor(Math.random() * 10) + 2,
            converted: Math.floor(Math.random() * 3) + 1,
            revenue: Math.floor(Math.random() * 15000) + 5000,
            calls: Math.floor(Math.random() * 8) + 2,
            emails: Math.floor(Math.random() * 12) + 5,
            whatsappMessages: Math.floor(Math.random() * 15) + 8,
          })).reverse(),
          weekly: [],
          monthly: [],
        },
        leadSources: [
          { source: 'Website', leads: 45, conversionRate: 0.28, averageValue: 9200, roi: 3.2, trend: 15 },
          { source: 'Referral', leads: 38, conversionRate: 0.42, averageValue: 12500, roi: 4.8, trend: 8 },
          { source: 'Cold Call', leads: 32, conversionRate: 0.15, averageValue: 6800, roi: 1.9, trend: -5 },
          { source: 'Social Media', leads: 28, conversionRate: 0.22, averageValue: 7500, roi: 2.6, trend: 22 },
          { source: 'Advertisement', leads: 13, conversionRate: 0.31, averageValue: 10200, roi: 2.1, trend: -12 },
        ],
        businessTypes: [
          { type: 'Restaurant', leads: 62, conversionRate: 0.26, averageValue: 8900, marketPenetration: 0.15 },
          { type: 'Grocery', leads: 34, conversionRate: 0.31, averageValue: 12400, marketPenetration: 0.08 },
          { type: 'Catering', leads: 28, conversionRate: 0.35, averageValue: 15600, marketPenetration: 0.22 },
          { type: 'Food Truck', leads: 19, conversionRate: 0.21, averageValue: 5200, marketPenetration: 0.31 },
          { type: 'Bakery', leads: 13, conversionRate: 0.38, averageValue: 6800, marketPenetration: 0.18 },
        ],
        geographicData: [
          { location: 'New York', leads: 42, revenue: 156000, conversionRate: 0.29, marketPotential: 0.65 },
          { location: 'Los Angeles', leads: 38, revenue: 142000, conversionRate: 0.24, marketPotential: 0.72 },
          { location: 'Chicago', leads: 31, revenue: 118000, conversionRate: 0.26, marketPotential: 0.58 },
          { location: 'Houston', leads: 25, revenue: 95000, conversionRate: 0.22, marketPotential: 0.81 },
          { location: 'Phoenix', leads: 20, revenue: 78000, conversionRate: 0.28, marketPotential: 0.69 },
        ],
        timeAnalytics: {
          bestContactTimes: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            successRate: Math.random() * 0.5 + 0.1,
          })),
          seasonalTrends: [
            { month: 'Jan', performance: 0.85 },
            { month: 'Feb', performance: 0.92 },
            { month: 'Mar', performance: 1.08 },
            { month: 'Apr', performance: 1.15 },
            { month: 'May', performance: 1.22 },
            { month: 'Jun', performance: 1.18 },
          ],
          responseTimeImpact: [
            { timeRange: '< 1 hour', conversionRate: 0.45 },
            { timeRange: '1-4 hours', conversionRate: 0.32 },
            { timeRange: '4-24 hours', conversionRate: 0.18 },
            { timeRange: '1-3 days', conversionRate: 0.08 },
            { timeRange: '> 3 days', conversionRate: 0.03 },
          ],
        },
        competitorAnalysis: [
          { competitor: 'FoodCorp', marketShare: 0.28, avgDealSize: 9200, winRate: 0.22, lostDeals: 12 },
          { competitor: 'RestaurantPro', marketShare: 0.18, avgDealSize: 7800, winRate: 0.15, lostDeals: 8 },
          { competitor: 'ChefSupply', marketShare: 0.15, avgDealSize: 11200, winRate: 0.18, lostDeals: 6 },
        ],
        forecastData: {
          nextMonth: {
            predictedLeads: 68,
            predictedRevenue: 142000,
            confidence: 0.82,
          },
          nextQuarter: {
            predictedLeads: 195,
            predictedRevenue: 425000,
            confidence: 0.74,
          },
          recommendations: [
            'Focus on referral campaigns - highest ROI source',
            'Target catering businesses - best conversion rate',
            'Improve response time to under 1 hour',
            'Expand efforts in Houston market - high potential',
            'Contact leads between 10-11 AM for best results',
          ],
        },
      };
      
      setAnalyticsData(mockData);
      setIsLoading(false);
    }, 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number, decimals = 1) => {
    return `${(value * 100).toFixed(decimals)}%`;
  };

  const getTrendIcon = (trend: number) => {
    return trend >= 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />;
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    trend?: number;
    icon: React.ReactNode;
    color?: string;
    subtitle?: string;
  }> = ({ title, value, trend, icon, color = theme.palette.primary.main, subtitle }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>
            {icon}
          </Avatar>
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          {typeof value === 'number' && title.includes('$') ? formatCurrency(value) : value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {subtitle}
          </Typography>
        )}
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getTrendIcon(trend)}
            <Typography
              variant="body2"
              color={trend >= 0 ? 'success.main' : 'error.main'}
              sx={{ ml: 0.5 }}
            >
              {Math.abs(trend)}% vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const OverviewTab = () => (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid item xs={12} sm={6} md={2}>
        <MetricCard
          title="Total Leads"
          value={analyticsData?.overview.totalLeads || 0}
          trend={analyticsData?.overview.trends.leads}
          icon={<People />}
          color={theme.palette.primary.main}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <MetricCard
          title="Conversion Rate"
          value={formatPercentage(analyticsData?.overview.conversionRate || 0)}
          trend={analyticsData?.overview.trends.conversion}
          icon={<TrendingUp />}
          color={theme.palette.success.main}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <MetricCard
          title="Avg Deal Size"
          value={formatCurrency(analyticsData?.overview.averageDealSize || 0)}
          icon={<AttachMoney />}
          color={theme.palette.warning.main}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(analyticsData?.overview.totalRevenue || 0)}
          trend={analyticsData?.overview.trends.revenue}
          icon={<Star />}
          color={theme.palette.info.main}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <MetricCard
          title="Response Time"
          value={`${analyticsData?.overview.responseTime || 0}h`}
          icon={<Schedule />}
          color={theme.palette.secondary.main}
          subtitle="Average response time"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        <MetricCard
          title="Satisfaction"
          value={`${analyticsData?.overview.customerSatisfaction || 0}/5`}
          icon={<Star />}
          color={theme.palette.success.main}
          subtitle="Customer rating"
        />
      </Grid>

      {/* Charts Placeholder */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Performance Trends
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Performance chart would be rendered here using Chart.js or similar
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Lead Sources
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Pie chart for lead sources
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const SourceAnalysisTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Lead Source Performance
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Source</TableCell>
                    <TableCell align="right">Leads</TableCell>
                    <TableCell align="right">Conversion Rate</TableCell>
                    <TableCell align="right">Avg Value</TableCell>
                    <TableCell align="right">ROI</TableCell>
                    <TableCell align="right">Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsData?.leadSources.map((source) => (
                    <TableRow key={source.source}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.light }}>
                            {source.source === 'Website' ? <Business /> :
                             source.source === 'Referral' ? <People /> :
                             source.source === 'Cold Call' ? <Phone /> :
                             source.source === 'Social Media' ? <Email /> :
                             <Assignment />}
                          </Avatar>
                          {source.source}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{source.leads}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={source.conversionRate * 100}
                            sx={{ width: 50, height: 6 }}
                          />
                          {formatPercentage(source.conversionRate)}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{formatCurrency(source.averageValue)}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${source.roi.toFixed(1)}x`}
                          color={source.roi >= 3 ? 'success' : source.roi >= 2 ? 'warning' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {getTrendIcon(source.trend)}
                          <Typography
                            variant="body2"
                            color={source.trend >= 0 ? 'success.main' : 'error.main'}
                            sx={{ ml: 0.5 }}
                          >
                            {Math.abs(source.trend)}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const GeographicTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Geographic Performance
            </Typography>
            <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Interactive map would be displayed here
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Top Locations
            </Typography>
            {analyticsData?.geographicData.map((location, index) => (
              <Box key={location.location} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">#{index + 1}</Typography>
                    <LocationOn sx={{ fontSize: 16 }} />
                    <Typography variant="subtitle2">{location.location}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {location.leads} leads
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={location.marketPotential * 100}
                  sx={{ height: 6, mb: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption">
                    {formatCurrency(location.revenue)}
                  </Typography>
                  <Typography variant="caption">
                    {formatPercentage(location.conversionRate)} conversion
                  </Typography>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const ForecastTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Next Month Forecast
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Predicted Leads</Typography>
                <Typography variant="h6">{analyticsData?.forecastData.nextMonth.predictedLeads}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Predicted Revenue</Typography>
                <Typography variant="h6">{formatCurrency(analyticsData?.forecastData.nextMonth.predictedRevenue || 0)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Confidence</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(analyticsData?.forecastData.nextMonth.confidence || 0) * 100}
                    sx={{ width: 60, height: 6 }}
                  />
                  <Typography variant="body2">
                    {formatPercentage(analyticsData?.forecastData.nextMonth.confidence || 0)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Next Quarter Forecast
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Predicted Leads</Typography>
                <Typography variant="h6">{analyticsData?.forecastData.nextQuarter.predictedLeads}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Predicted Revenue</Typography>
                <Typography variant="h6">{formatCurrency(analyticsData?.forecastData.nextQuarter.predictedRevenue || 0)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Confidence</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(analyticsData?.forecastData.nextQuarter.confidence || 0) * 100}
                    sx={{ width: 60, height: 6 }}
                  />
                  <Typography variant="body2">
                    {formatPercentage(analyticsData?.forecastData.nextQuarter.confidence || 0)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              AI Recommendations
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Based on your performance data and market trends
            </Alert>
            {analyticsData?.forecastData.recommendations.map((recommendation, index) => (
              <Box key={index} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Insights color="primary" />
                <Typography variant="body2">{recommendation}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <Analytics />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              Advanced Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Deep insights into your performance and market trends
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Compare />}
            onClick={() => setCompareMode(!compareMode)}
            color={compareMode ? 'primary' : 'inherit'}
          >
            Compare
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            Export
          </Button>
          <IconButton onClick={loadAnalyticsData}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
          <Tab label="Overview" icon={<ShowChart />} iconPosition="start" />
          <Tab label="Lead Sources" icon={<PieChart />} iconPosition="start" />
          <Tab label="Geographic" icon={<LocationOn />} iconPosition="start" />
          <Tab label="Forecast" icon={<Insights />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {selectedTab === 0 && <OverviewTab />}
      {selectedTab === 1 && <SourceAnalysisTab />}
      {selectedTab === 2 && <GeographicTab />}
      {selectedTab === 3 && <ForecastTab />}

      {/* Export Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>Export as PDF</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Export as Excel</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Export as CSV</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Schedule Report</MenuItem>
      </Menu>
    </Box>
  );
};

export default AdvancedAnalytics;