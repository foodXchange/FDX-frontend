import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  CardActions,
  Avatar,
  Chip,
  Button,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Rating,
  Tooltip,
  Badge,
  Slider,
  Switch,
  FormControlLabel,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Skeleton,
  LinearProgress,
  Divider,
  useTheme,
  alpha,
  Collapse,
  Fade,
} from '@mui/material';
import {
  AutoAwesome,
  TrendingUp,
  Psychology,
  Lightbulb,
  ThumbUp,
  ThumbDown,
  Refresh,
  FilterList,
  ExpandMore,
  Search,
  LocalOffer,
  Store,
  ShoppingCart,
  CompareArrows,
  Timeline,
  Analytics,
  Visibility,
  AttachMoney,
  Speed,
  CheckCircle,
  Warning,
  Info,
  Close,
  BookmarkBorder,
  Bookmark,
  Share,
  MoreVert,
  SwapHoriz,
  TuneRounded,
  SmartToy,
  Insights,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAuth } from '../../../hooks/useAuth';
import { aiServiceManager } from '../../../services/ai';
import { formatCurrency, formatNumber, formatPercentage } from '../../../utils/format';

// Glassmorphism styles
const glassmorphismStyle = {
  background: (theme: any) => alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  borderRadius: 2,
  border: (theme: any) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: (theme: any) => `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
};

// Recommendation Card Component
const RecommendationCard: React.FC<{
  recommendation: {
    id: string;
    type: 'product' | 'supplier' | 'substitute' | 'trend';
    title: string;
    description: string;
    confidence: number;
    impact: {
      cost: number;
      quality: number;
      availability: number;
    };
    reason: string;
    image?: string;
    price?: number;
    supplier?: string;
    matchScore?: number;
    tags: string[];
  };
  onAccept: () => void;
  onReject: () => void;
  onCompare: () => void;
}> = ({ recommendation, onAccept, onReject, onCompare }) => {
  const theme = useTheme();
  const [bookmarked, setBookmarked] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const getTypeIcon = () => {
    switch (recommendation.type) {
      case 'product':
        return <ShoppingCart />;
      case 'supplier':
        return <Store />;
      case 'substitute':
        return <SwapHoriz />;
      case 'trend':
        return <TrendingUp />;
      default:
        return <Lightbulb />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return theme.palette.success.main;
    if (confidence >= 0.6) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ ...glassmorphismStyle, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {recommendation.image && (
          <CardMedia
            component="img"
            height="200"
            image={recommendation.image}
            alt={recommendation.title}
            sx={{ objectFit: 'cover' }}
          />
        )}
        
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              {getTypeIcon()}
            </Avatar>
          }
          action={
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={() => setBookmarked(!bookmarked)}>
                {bookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
              </IconButton>
              <IconButton size="small">
                <Share />
              </IconButton>
            </Stack>
          }
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {recommendation.title}
              </Typography>
              <Chip
                label={`${Math.round(recommendation.confidence * 100)}%`}
                size="small"
                sx={{
                  bgcolor: alpha(getConfidenceColor(recommendation.confidence), 0.1),
                  color: getConfidenceColor(recommendation.confidence),
                  fontWeight: 'bold',
                }}
              />
            </Box>
          }
          subheader={
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
              {recommendation.supplier && (
                <Chip label={recommendation.supplier} size="small" variant="outlined" />
              )}
              {recommendation.price && (
                <Typography variant="subtitle2" color="primary" fontWeight="bold">
                  {formatCurrency(recommendation.price)}
                </Typography>
              )}
            </Stack>
          }
        />

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            {recommendation.description}
          </Typography>

          <Box mb={2}>
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              endIcon={<ExpandMore sx={{ transform: expanded ? 'rotate(180deg)' : 'none' }} />}
            >
              Why this recommendation?
            </Button>
            <Collapse in={expanded}>
              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography variant="body2">{recommendation.reason}</Typography>
              </Alert>
            </Collapse>
          </Box>

          {/* Impact Metrics */}
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Predicted Impact
            </Typography>
            <Grid container spacing={1}>
              {Object.entries(recommendation.impact).map(([key, value]) => (
                <Grid item xs={4} key={key}>
                  <Paper sx={{ p: 1, textAlign: 'center', bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
                    <Typography variant="caption" color="text.secondary">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color={value > 0 ? 'success.main' : 'error.main'}>
                      {value > 0 ? '+' : ''}{value}%
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Tags */}
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {recommendation.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" sx={{ mb: 0.5 }} />
            ))}
          </Stack>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<ThumbUp />}
              onClick={onAccept}
            >
              Accept
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<ThumbDown />}
              onClick={onReject}
            >
              Reject
            </Button>
          </Stack>
          <Button size="small" startIcon={<CompareArrows />} onClick={onCompare}>
            Compare
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );
};

// AI Insights Panel
const AIInsightsPanel: React.FC<{
  insights: Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    confidence: number;
    actionable: boolean;
    impact: 'high' | 'medium' | 'low';
    trend?: { data: number[]; labels: string[] };
  }>;
}> = ({ insights }) => {
  const theme = useTheme();
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
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
            AI-Powered Insights
          </Typography>
          <Chip label="Live" size="small" color="success" sx={{ ml: 'auto' }} />
        </Box>

        <Stack spacing={2}>
          {insights.map((insight) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: 5 }}
            >
              <Card
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: selectedInsight === insight.id 
                    ? `2px solid ${theme.palette.primary.main}` 
                    : '1px solid transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
                onClick={() => setSelectedInsight(selectedInsight === insight.id ? null : insight.id)}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Chip label={insight.category} size="small" variant="outlined" />
                      <Chip
                        label={insight.impact}
                        size="small"
                        sx={{
                          bgcolor: alpha(getImpactColor(insight.impact), 0.1),
                          color: getImpactColor(insight.impact),
                        }}
                      />
                      {insight.actionable && (
                        <Chip
                          icon={<Lightbulb />}
                          label="Actionable"
                          size="small"
                          color="primary"
                        />
                      )}
                    </Box>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {insight.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {insight.description}
                    </Typography>
                  </Box>
                  <Box ml={2}>
                    <CircularProgressWithLabel value={insight.confidence * 100} />
                  </Box>
                </Box>

                <Collapse in={selectedInsight === insight.id}>
                  {insight.trend && (
                    <Box mt={2}>
                      <ResponsiveContainer width="100%" height={100}>
                        <AreaChart data={insight.trend.labels.map((label, index) => ({
                          name: label,
                          value: insight.trend!.data[index],
                        }))}>
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={theme.palette.primary.main}
                            fill={alpha(theme.palette.primary.main, 0.3)}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                  <Box mt={2}>
                    <Button size="small" variant="contained" fullWidth>
                      Take Action
                    </Button>
                  </Box>
                </Collapse>
              </Card>
            </motion.div>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

// Circular Progress with Label
const CircularProgressWithLabel: React.FC<{ value: number }> = ({ value }) => {
  const theme = useTheme();
  const color = value >= 80 ? theme.palette.success.main : 
                value >= 60 ? theme.palette.warning.main : 
                theme.palette.error.main;

  return (
    <Box position="relative" display="inline-flex">
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
          {Math.round(value)}%
        </Typography>
      </Box>
    </Box>
  );
};

// Preference Controls
const PreferenceControls: React.FC<{
  preferences: {
    priceWeight: number;
    qualityWeight: number;
    sustainabilityWeight: number;
    deliveryWeight: number;
    autoAccept: boolean;
    minConfidence: number;
  };
  onChange: (preferences: any) => void;
}> = ({ preferences, onChange }) => {
  const handleSliderChange = (field: string) => (event: Event, value: number | number[]) => {
    onChange({ ...preferences, [field]: value });
  };

  return (
    <Paper sx={glassmorphismStyle}>
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Recommendation Preferences
        </Typography>
        
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Price Sensitivity
            </Typography>
            <Slider
              value={preferences.priceWeight}
              onChange={handleSliderChange('priceWeight')}
              valueLabelDisplay="auto"
              marks={[
                { value: 0, label: 'Low' },
                { value: 50, label: 'Medium' },
                { value: 100, label: 'High' },
              ]}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Quality Priority
            </Typography>
            <Slider
              value={preferences.qualityWeight}
              onChange={handleSliderChange('qualityWeight')}
              valueLabelDisplay="auto"
              color="secondary"
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Sustainability Focus
            </Typography>
            <Slider
              value={preferences.sustainabilityWeight}
              onChange={handleSliderChange('sustainabilityWeight')}
              valueLabelDisplay="auto"
              sx={{ color: '#2E7D32' }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Delivery Speed
            </Typography>
            <Slider
              value={preferences.deliveryWeight}
              onChange={handleSliderChange('deliveryWeight')}
              valueLabelDisplay="auto"
              sx={{ color: '#FF9800' }}
            />
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Minimum Confidence Level
            </Typography>
            <Slider
              value={preferences.minConfidence}
              onChange={handleSliderChange('minConfidence')}
              valueLabelDisplay="auto"
              min={50}
              max={100}
              marks={[
                { value: 50, label: '50%' },
                { value: 75, label: '75%' },
                { value: 100, label: '100%' },
              ]}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={preferences.autoAccept}
                onChange={(e) => onChange({ ...preferences, autoAccept: e.target.checked })}
              />
            }
            label="Auto-accept high confidence recommendations"
          />
        </Stack>
      </Box>
    </Paper>
  );
};

// Main AI Recommendation Engine Component
export const AIRecommendationEngine: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [preferences, setPreferences] = useState({
    priceWeight: 70,
    qualityWeight: 80,
    sustainabilityWeight: 60,
    deliveryWeight: 50,
    autoAccept: false,
    minConfidence: 75,
  });
  const [compareItems, setCompareItems] = useState<string[]>([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);

  // Mock recommendations data
  const recommendations = [
    {
      id: '1',
      type: 'product' as const,
      title: 'Organic Avocados - Premium Grade',
      description: 'Based on your order history, this premium organic avocado supplier offers 15% better pricing with same-day delivery.',
      confidence: 0.92,
      impact: { cost: -15, quality: 10, availability: 20 },
      reason: 'Analysis shows 87% of similar buyers switched to this product with 95% satisfaction rate. Seasonal pricing is at its lowest.',
      image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400',
      price: 4.99,
      supplier: 'Green Valley Farms',
      matchScore: 0.95,
      tags: ['Organic', 'Premium', 'Same-day Delivery', 'Bulk Discount'],
    },
    {
      id: '2',
      type: 'substitute' as const,
      title: 'Alternative: Frozen Mango Chunks',
      description: 'AI detected supply chain disruption for fresh mangoes. Frozen alternative maintains quality at 30% lower cost.',
      confidence: 0.85,
      impact: { cost: -30, quality: -5, availability: 50 },
      reason: 'Supply chain analysis predicts fresh mango shortage for next 3 weeks. Frozen alternative from verified supplier maintains nutritional value.',
      price: 12.50,
      supplier: 'Tropical Frozen Foods',
      matchScore: 0.82,
      tags: ['Cost-effective', 'Long Shelf Life', 'Verified Quality'],
    },
    {
      id: '3',
      type: 'supplier' as const,
      title: 'New Supplier: Ocean Fresh Seafood',
      description: 'Gold-tier supplier with 99% on-time delivery and superior cold chain management for your seafood needs.',
      confidence: 0.88,
      impact: { cost: 5, quality: 25, availability: 30 },
      reason: 'Machine learning identified this supplier serves 3 of your competitors with 98% retention rate. Offers exclusive bulk pricing.',
      supplier: 'Ocean Fresh Seafood',
      matchScore: 0.90,
      tags: ['Gold Tier', 'Cold Chain Expert', 'Exclusive Pricing'],
    },
  ];

  const insights = [
    {
      id: '1',
      category: 'Market Trend',
      title: 'Quinoa Demand Surge Predicted',
      description: 'AI predicts 40% increase in quinoa demand over next quarter based on health trend analysis.',
      confidence: 0.87,
      actionable: true,
      impact: 'high' as const,
      trend: {
        data: [100, 110, 125, 140, 165, 190],
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      },
    },
    {
      id: '2',
      category: 'Price Alert',
      title: 'Olive Oil Prices Expected to Drop',
      description: 'Seasonal analysis indicates 20% price reduction in olive oil within 2 weeks.',
      confidence: 0.79,
      actionable: true,
      impact: 'medium' as const,
    },
    {
      id: '3',
      category: 'Compliance',
      title: 'New Organic Certification Requirements',
      description: 'Regulatory changes affecting 5 of your regular suppliers. Action required by March 1st.',
      confidence: 0.95,
      actionable: true,
      impact: 'high' as const,
    },
  ];

  const demandForecast = [
    { month: 'Jan', actual: 850, predicted: 820, confidence: 0.92 },
    { month: 'Feb', actual: 920, predicted: 890, confidence: 0.88 },
    { month: 'Mar', actual: 980, predicted: 960, confidence: 0.91 },
    { month: 'Apr', actual: null, predicted: 1050, confidence: 0.85 },
    { month: 'May', actual: null, predicted: 1120, confidence: 0.82 },
    { month: 'Jun', actual: null, predicted: 1200, confidence: 0.78 },
  ];

  const handleAcceptRecommendation = async (id: string) => {
    setLoading(true);
    try {
      // In real implementation, this would update the backend
      console.log('Accepting recommendation:', id);
      // Show success notification
    } catch (error) {
      console.error('Error accepting recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRecommendation = async (id: string, reason?: string) => {
    setLoading(true);
    try {
      // This helps train the AI model
      await aiServiceManager.sendMetric({
        metric: 'recommendation_rejected',
        value: 1,
        dimensions: { recommendationId: id, reason },
      });
    } catch (error) {
      console.error('Error rejecting recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = (id: string) => {
    if (compareItems.includes(id)) {
      setCompareItems(compareItems.filter(item => item !== id));
    } else if (compareItems.length < 3) {
      setCompareItems([...compareItems, id]);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            AI Recommendation Engine
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Intelligent recommendations powered by machine learning
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Badge badgeContent={compareItems.length} color="primary">
            <Button
              variant="outlined"
              startIcon={<CompareArrows />}
              onClick={() => setCompareDialogOpen(true)}
              disabled={compareItems.length === 0}
            >
              Compare ({compareItems.length})
            </Button>
          </Badge>
          <Button variant="contained" startIcon={<Refresh />}>
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ ...glassmorphismStyle, p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Ask AI for specific recommendations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SmartToy color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button variant="contained" size="small">
                    Ask AI
                  </Button>
                </InputAdornment>
              ),
            }}
          />
          <IconButton>
            <TuneRounded />
          </IconButton>
        </Stack>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ ...glassmorphismStyle, mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, value) => setSelectedTab(value)}
          variant="fullWidth"
        >
          <Tab label="Recommendations" icon={<AutoAwesome />} iconPosition="start" />
          <Tab label="Insights & Predictions" icon={<Insights />} iconPosition="start" />
          <Tab label="Demand Forecasting" icon={<Timeline />} iconPosition="start" />
          <Tab label="Preferences" icon={<TuneRounded />} iconPosition="start" />
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
                  <AlertTitle>AI Learning Active</AlertTitle>
                  The recommendation engine is continuously learning from your preferences and improving suggestions.
                  Current accuracy: 89%
                </Alert>
              </Grid>
              
              {recommendations
                .filter(rec => rec.confidence >= preferences.minConfidence / 100)
                .map((recommendation) => (
                  <Grid item xs={12} md={6} lg={4} key={recommendation.id}>
                    <RecommendationCard
                      recommendation={recommendation}
                      onAccept={() => handleAcceptRecommendation(recommendation.id)}
                      onReject={() => handleRejectRecommendation(recommendation.id)}
                      onCompare={() => handleCompare(recommendation.id)}
                    />
                  </Grid>
                ))}
            </Grid>
          )}

          {selectedTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <AIInsightsPanel insights={insights} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={glassmorphismStyle}>
                  <Box p={3}>
                    <Typography variant="h6" gutterBottom>
                      AI Performance Metrics
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Prediction Accuracy</Typography>
                          <Typography variant="body2" fontWeight="bold">89%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={89} color="success" />
                      </Box>
                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Acceptance Rate</Typography>
                          <Typography variant="body2" fontWeight="bold">76%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={76} color="primary" />
                      </Box>
                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Cost Savings</Typography>
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            +12.5%
                          </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={100} color="success" />
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
                    title="Demand Forecasting"
                    subheader="AI-powered predictions for next 6 months"
                    action={
                      <Button startIcon={<Download />}>Export</Button>
                    }
                  />
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={demandForecast}>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area
                          type="monotone"
                          dataKey="actual"
                          stroke={theme.palette.primary.main}
                          fill={alpha(theme.palette.primary.main, 0.3)}
                          name="Actual Orders"
                        />
                        <Area
                          type="monotone"
                          dataKey="predicted"
                          stroke={theme.palette.secondary.main}
                          fill={alpha(theme.palette.secondary.main, 0.3)}
                          strokeDasharray="5 5"
                          name="Predicted Orders"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    
                    <Box mt={3}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                            <Typography variant="h4" color="primary">+15%</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Expected Growth
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                            <Typography variant="h4" color="success.main">1,200</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Predicted June Orders
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                            <Typography variant="h4" color="warning.main">82%</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Confidence Level
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {selectedTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <PreferenceControls
                  preferences={preferences}
                  onChange={setPreferences}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={glassmorphismStyle}>
                  <Box p={3}>
                    <Typography variant="h6" gutterBottom>
                      Preference Impact Preview
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={[
                        { subject: 'Price', value: preferences.priceWeight },
                        { subject: 'Quality', value: preferences.qualityWeight },
                        { subject: 'Sustainability', value: preferences.sustainabilityWeight },
                        { subject: 'Delivery', value: preferences.deliveryWeight },
                      ]}>
                        <PolarGrid stroke={alpha(theme.palette.divider, 0.3)} />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Preferences"
                          dataKey="value"
                          stroke={theme.palette.primary.main}
                          fill={alpha(theme.palette.primary.main, 0.3)}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Compare Dialog */}
      <Dialog
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Compare Recommendations
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setCompareDialogOpen(false)}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* Comparison table would go here */}
          <Typography>Comparison view for selected items</Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AIRecommendationEngine;