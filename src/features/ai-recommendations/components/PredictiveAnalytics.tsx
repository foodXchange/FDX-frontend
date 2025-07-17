import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  IconButton,
  Stack,
  Chip,
  Avatar,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tooltip,
  Badge,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  TrendingDown,
  Analytics,
  Insights,
  PriceChange,
  Inventory,
  LocalShipping,
  Warning,
  CheckCircle,
  Schedule,
  Lightbulb,
  AutoAwesome,
  Psychology,
  SmartToy,
  Assessment,
  ShowChart,
  DataUsage,
  Refresh,
  Download,
  Share,
  Bookmark,
  BookmarkBorder,
  MoreVert,
  Settings,
  Notifications,
  NotificationsActive,
  CalendarToday,
  AttachMoney,
  Speed,
  LocalOffer,
  ShoppingCart,
  TrendingFlat,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { formatCurrency, formatNumber, formatPercentage } from '../../../utils/format';

// Glassmorphism styles
const glassmorphismStyle = {
  background: (theme: any) => alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  borderRadius: 2,
  border: (theme: any) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: (theme: any) => `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
};

// Prediction Card Component
const PredictionCard: React.FC<{
  prediction: {
    id: string;
    type: 'demand' | 'price' | 'supply' | 'market';
    title: string;
    description: string;
    prediction: {
      current: number;
      predicted: number;
      confidence: number;
      timeframe: string;
      unit: string;
    };
    factors: Array<{
      name: string;
      impact: number;
      description: string;
    }>;
    recommendations: string[];
    priority: 'high' | 'medium' | 'low';
  };
  onBookmark: () => void;
  onShare: () => void;
  bookmarked: boolean;
}> = ({ prediction, onBookmark, onShare, bookmarked }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const getTypeIcon = () => {
    switch (prediction.type) {
      case 'demand':
        return <TrendingUp />;
      case 'price':
        return <AttachMoney />;
      case 'supply':
        return <Inventory />;
      case 'market':
        return <ShowChart />;
      default:
        return <Assessment />;
    }
  };

  const getTypeColor = () => {
    switch (prediction.type) {
      case 'demand':
        return theme.palette.primary.main;
      case 'price':
        return theme.palette.success.main;
      case 'supply':
        return theme.palette.warning.main;
      case 'market':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getPriorityColor = () => {
    switch (prediction.priority) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const change = ((prediction.prediction.predicted - prediction.prediction.current) / prediction.prediction.current) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={glassmorphismStyle}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: alpha(getTypeColor(), 0.1), color: getTypeColor() }}>
              {getTypeIcon()}
            </Avatar>
          }
          action={
            <Stack direction="row" spacing={0.5}>
              <Chip
                label={prediction.priority}
                size="small"
                sx={{
                  bgcolor: alpha(getPriorityColor(), 0.1),
                  color: getPriorityColor(),
                  textTransform: 'capitalize',
                }}
              />
              <IconButton size="small" onClick={onBookmark}>
                {bookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
              </IconButton>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Stack>
          }
          title={
            <Typography variant="h6" fontWeight="bold">
              {prediction.title}
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="text.secondary">
              {prediction.description}
            </Typography>
          }
        />

        <CardContent>
          {/* Prediction Values */}
          <Box mb={3}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                  <Typography variant="caption" color="text.secondary">
                    Current
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatNumber(prediction.prediction.current)}{prediction.prediction.unit}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                  <Typography variant="caption" color="text.secondary">
                    Predicted ({prediction.prediction.timeframe})
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color={change > 0 ? 'success.main' : 'error.main'}>
                    {formatNumber(prediction.prediction.predicted)}{prediction.prediction.unit}
                  </Typography>
                  <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                    {change > 0 ? (
                      <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />
                    ) : (
                      <TrendingDown sx={{ fontSize: 16, color: theme.palette.error.main }} />
                    )}
                    <Typography
                      variant="caption"
                      color={change > 0 ? 'success.main' : 'error.main'}
                      ml={0.5}
                    >
                      {formatPercentage(Math.abs(change))}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Confidence */}
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Confidence Level
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {formatPercentage(prediction.prediction.confidence)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={prediction.prediction.confidence}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.grey[300], 0.3),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: prediction.prediction.confidence >= 80 ? theme.palette.success.main :
                           prediction.prediction.confidence >= 60 ? theme.palette.warning.main :
                           theme.palette.error.main,
                },
              }}
            />
          </Box>

          {/* Key Factors */}
          <Box mb={2}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Key Factors
            </Typography>
            <Stack spacing={1}>
              {prediction.factors.slice(0, expanded ? undefined : 3).map((factor) => (
                <Box key={factor.name} display="flex" alignItems="center" gap={2}>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight="medium">
                      {factor.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {factor.description}
                    </Typography>
                  </Box>
                  <Chip
                    label={factor.impact > 0 ? `+${factor.impact}%` : `${factor.impact}%`}
                    size="small"
                    color={factor.impact > 0 ? 'success' : 'error'}
                    sx={{ minWidth: 60 }}
                  />
                </Box>
              ))}
            </Stack>
            {prediction.factors.length > 3 && (
              <Button
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ mt: 1 }}
              >
                {expanded ? 'Show Less' : `Show ${prediction.factors.length - 3} More`}
              </Button>
            )}
          </Box>

          {/* Recommendations */}
          {expanded && prediction.recommendations.length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                AI Recommendations
              </Typography>
              <List dense>
                {prediction.recommendations.map((rec, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Lightbulb color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={rec}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>

        <CardActions>
          <Button size="small" variant="outlined" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Less Details' : 'More Details'}
          </Button>
          <Button size="small" variant="contained" startIcon={<AutoAwesome />}>
            Apply Insights
          </Button>
          <Button size="small" onClick={onShare} startIcon={<Share />}>
            Share
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );
};

// Market Intelligence Panel
const MarketIntelligencePanel: React.FC<{
  intelligence: Array<{
    id: string;
    category: string;
    title: string;
    insight: string;
    confidence: number;
    impact: 'positive' | 'negative' | 'neutral';
    urgency: 'high' | 'medium' | 'low';
    sources: string[];
  }>;
}> = ({ intelligence }) => {
  const theme = useTheme();

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return theme.palette.success.main;
      case 'negative':
        return theme.palette.error.main;
      case 'neutral':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Paper sx={glassmorphismStyle}>
      <Box p={3}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Psychology color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Market Intelligence
          </Typography>
          <Chip label="AI Powered" size="small" color="primary" sx={{ ml: 'auto' }} />
        </Box>

        <Stack spacing={2}>
          {intelligence.map((intel) => (
            <motion.div
              key={intel.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: 5 }}
            >
              <Card sx={{ p: 2, bgcolor: alpha(theme.palette.background.paper, 0.3) }}>
                <Box display="flex" justify="space-between" alignItems="flex-start" mb={2}>
                  <Box flex={1}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Chip label={intel.category} size="small" variant="outlined" />
                      <Chip
                        label={intel.impact}
                        size="small"
                        sx={{
                          bgcolor: alpha(getImpactColor(intel.impact), 0.1),
                          color: getImpactColor(intel.impact),
                        }}
                      />
                      <Chip
                        label={`${intel.urgency} urgency`}
                        size="small"
                        sx={{
                          bgcolor: alpha(getUrgencyColor(intel.urgency), 0.1),
                          color: getUrgencyColor(intel.urgency),
                        }}
                      />
                    </Stack>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {intel.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {intel.insight}
                    </Typography>
                  </Box>
                  <Box ml={2} textAlign="center">
                    <Typography variant="caption" color="text.secondary">
                      Confidence
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {Math.round(intel.confidence * 100)}%
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption" color="text.secondary">
                    Sources:
                  </Typography>
                  {intel.sources.map((source, index) => (
                    <Chip key={index} label={source} size="small" variant="outlined" />
                  ))}
                </Box>
              </Card>
            </motion.div>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

// Main Predictive Analytics Component
export const PredictiveAnalytics: React.FC = () => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [timeframe, setTimeframe] = useState('30d');
  const [bookmarkedPredictions, setBookmarkedPredictions] = useState<string[]>([]);

  // Mock predictions data
  const predictions = [
    {
      id: '1',
      type: 'demand' as const,
      title: 'Organic Avocado Demand Surge',
      description: 'Predicted increase in organic avocado demand based on seasonal trends and health awareness',
      prediction: {
        current: 1250,
        predicted: 1625,
        confidence: 0.89,
        timeframe: '30 days',
        unit: ' units/week',
      },
      factors: [
        { name: 'Seasonal Trends', impact: 25, description: 'Spring season increases demand' },
        { name: 'Health Awareness', impact: 15, description: 'Growing health consciousness' },
        { name: 'Social Media Impact', impact: 10, description: 'Viral health content' },
        { name: 'Economic Factors', impact: -5, description: 'Slight economic slowdown' },
      ],
      recommendations: [
        'Increase inventory by 30% for next month',
        'Consider bulk ordering to reduce unit costs',
        'Explore premium organic suppliers',
        'Monitor competitor pricing strategies',
      ],
      priority: 'high' as const,
    },
    {
      id: '2',
      type: 'price' as const,
      title: 'Olive Oil Price Volatility',
      description: 'Expected price fluctuation due to Mediterranean weather patterns',
      prediction: {
        current: 12.50,
        predicted: 15.75,
        confidence: 0.76,
        timeframe: '45 days',
        unit: '/bottle',
      },
      factors: [
        { name: 'Weather Patterns', impact: 20, description: 'Drought in Mediterranean' },
        { name: 'Supply Chain', impact: 8, description: 'Shipping delays' },
        { name: 'Currency Exchange', impact: 5, description: 'EUR/USD fluctuation' },
      ],
      recommendations: [
        'Lock in current prices with suppliers',
        'Consider alternative oil sources',
        'Adjust pricing strategy proactively',
      ],
      priority: 'medium' as const,
    },
    {
      id: '3',
      type: 'supply' as const,
      title: 'Quinoa Supply Shortage',
      description: 'Potential supply chain disruption affecting quinoa availability',
      prediction: {
        current: 500,
        predicted: 320,
        confidence: 0.82,
        timeframe: '21 days',
        unit: ' tons',
      },
      factors: [
        { name: 'Bolivian Harvest', impact: -35, description: 'Poor harvest season' },
        { name: 'Transportation', impact: -10, description: 'Logistical challenges' },
        { name: 'Alternative Sources', impact: 15, description: 'Peru increasing production' },
      ],
      recommendations: [
        'Secure quinoa inventory immediately',
        'Identify alternative suppliers',
        'Consider substitute products',
        'Communicate with key customers early',
      ],
      priority: 'high' as const,
    },
  ];

  const marketIntelligence = [
    {
      id: '1',
      category: 'Consumer Trends',
      title: 'Plant-Based Protein Surge',
      insight: 'Consumer demand for plant-based protein sources is expected to grow by 40% over the next quarter.',
      confidence: 0.87,
      impact: 'positive' as const,
      urgency: 'high' as const,
      sources: ['Market Research', 'Consumer Surveys', 'Sales Data'],
    },
    {
      id: '2',
      category: 'Regulatory',
      title: 'New Organic Standards',
      insight: 'Updated organic certification requirements will affect 15% of current suppliers starting next month.',
      confidence: 0.95,
      impact: 'negative' as const,
      urgency: 'high' as const,
      sources: ['Government Reports', 'Industry News'],
    },
    {
      id: '3',
      category: 'Economic',
      title: 'Currency Impact on Imports',
      insight: 'Expected USD strengthening will reduce import costs by 8-12% for European suppliers.',
      confidence: 0.72,
      impact: 'positive' as const,
      urgency: 'medium' as const,
      sources: ['Economic Indicators', 'Financial Analysis'],
    },
  ];

  const handleBookmark = (predictionId: string) => {
    setBookmarkedPredictions(prev => 
      prev.includes(predictionId) 
        ? prev.filter(id => id !== predictionId)
        : [...prev, predictionId]
    );
  };

  const handleShare = (predictionId: string) => {
    // Implementation for sharing prediction
    console.log('Sharing prediction:', predictionId);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Predictive Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-powered market predictions and business intelligence
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <FormControl size="small">
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              label="Timeframe"
            >
              <MenuItem value="7d">7 Days</MenuItem>
              <MenuItem value="30d">30 Days</MenuItem>
              <MenuItem value="90d">90 Days</MenuItem>
              <MenuItem value="1y">1 Year</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<Settings />}>
            Configure
          </Button>
          <Button variant="contained" startIcon={<Refresh />}>
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Tabs */}
      <Paper sx={{ ...glassmorphismStyle, mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, value) => setSelectedTab(value)}
          variant="fullWidth"
        >
          <Tab label="Predictions" icon={<ShowChart />} iconPosition="start" />
          <Tab label="Market Intelligence" icon={<Psychology />} iconPosition="start" />
          <Tab label="Trend Analysis" icon={<Timeline />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {selectedTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <AlertTitle>AI Model Performance</AlertTitle>
                  Current prediction accuracy: 84% • Model last updated: 2 hours ago
                </Alert>
              </Grid>
              
              {predictions.map((prediction) => (
                <Grid item xs={12} lg={6} key={prediction.id}>
                  <PredictionCard
                    prediction={prediction}
                    onBookmark={() => handleBookmark(prediction.id)}
                    onShare={() => handleShare(prediction.id)}
                    bookmarked={bookmarkedPredictions.includes(prediction.id)}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {selectedTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <MarketIntelligencePanel intelligence={marketIntelligence} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={glassmorphismStyle}>
                  <Box p={3}>
                    <Typography variant="h6" gutterBottom>
                      Intelligence Sources
                    </Typography>
                    <Stack spacing={2}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Market Data</Typography>
                        <Chip label="Active" color="success" size="small" />
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">News Analytics</Typography>
                        <Chip label="Active" color="success" size="small" />
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Social Sentiment</Typography>
                        <Chip label="Active" color="success" size="small" />
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Economic Indicators</Typography>
                        <Chip label="Active" color="success" size="small" />
                      </Box>
                    </Stack>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}

          {selectedTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={glassmorphismStyle}>
                  <CardHeader
                    title="Trend Analysis Dashboard"
                    subheader="Historical patterns and future projections"
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Comprehensive trend analysis visualization would be displayed here, showing historical data patterns, seasonal variations, and predictive models.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default PredictiveAnalytics;