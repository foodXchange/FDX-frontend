import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  LinearProgress,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Avatar,
  Divider,
  ButtonGroup
} from '@mui/material';
import {
  BarChart as ChartBarIcon,
  People as UserGroupIcon,
  AutoAwesome as SparklesIcon,
  LocalShipping as TruckIcon,
  Security as ShieldCheckIcon
} from '@mui/icons-material';

// Interactive AI Chat Demo
export const AIChatDemo: React.FC<{ className?: string }> = ({ className }) => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: 'Hi! I\'m your AI procurement assistant. How can I help you today?' }
  ]);
  const [currentDemo, setCurrentDemo] = useState(0);

  const demoScenarios = [
    {
      userMessage: "Find organic apple suppliers near New York",
      aiResponse: "I found 12 certified organic apple suppliers within 100 miles of New York. Top 3 matches:\n\n🥇 GreenHarvest Farms (95% match)\n• USDA Organic certified\n• $2.45/lb average price\n• 4.8/5 rating\n\n🥈 Valley Organic Co. (92% match)\n• Multiple certifications\n• $2.60/lb average price\n• 4.7/5 rating\n\n🥉 Northeast Organics (89% match)\n• Family-owned since 1985\n• $2.50/lb average price\n• 4.6/5 rating\n\nWould you like me to create an RFQ for any of these suppliers?"
    },
    {
      userMessage: "What's the market price trend for salmon?",
      aiResponse: "🐟 Atlantic Salmon Market Analysis:\n\n📈 Current Price: $8.25/lb (↑2.3% this week)\n📊 30-day trend: Steady increase (+8.5%)\n🔮 Forecast: Prices expected to stabilize next month\n\n🌟 Key Insights:\n• Seasonal demand increase affecting prices\n• Chilean supply disruption causing shortage\n• Recommended action: Lock in prices for Q4 orders\n\nShall I help you find salmon suppliers with competitive pricing?"
    },
    {
      userMessage: "Check compliance for my dairy suppliers",
      aiResponse: "🛡️ Compliance Status Summary:\n\n✅ 8 suppliers fully compliant\n⚠️ 2 suppliers need attention:\n\n• Alpine Dairy: FDA inspection due in 15 days\n• Mountain Creamery: HACCP certificate expires next month\n\n📋 Actions Required:\n1. Contact Alpine Dairy for inspection update\n2. Request renewed HACCP cert from Mountain Creamery\n\n🎯 Overall Compliance Score: 94.2%\n\nWould you like me to send automated reminders to these suppliers?"
    }
  ];

  const runDemo = () => {
    const scenario = demoScenarios[currentDemo];
    
    // Add user message
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'user',
        text: scenario.userMessage
      }]);
    }, 500);

    // Add AI response with typing effect
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        text: scenario.aiResponse
      }]);
    }, 1500);

    setCurrentDemo((prev) => (prev + 1) % demoScenarios.length);
  };

  return (
    <Paper 
      sx={{ 
        p: 3, 
        borderRadius: 3, 
        backdropFilter: 'blur(10px)', 
        bgcolor: 'rgba(255, 255, 255, 0.9)' 
      }}
      className={className || ''}
    >
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <SparklesIcon sx={{ fontSize: 20, color: 'secondary.main', mr: 1 }} />
        <Typography variant="h6" sx={{ color: 'grey.900' }}>
          AI Assistant Demo
        </Typography>
      </Box>

      <Paper sx={{ bgcolor: 'grey.50', p: 2, mb: 2, borderRadius: 2, minHeight: 200 }}>
        <Stack spacing={1}>
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Paper
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    maxWidth: '85%',
                    ...(message.type === 'user' 
                      ? { 
                          bgcolor: 'primary.main', 
                          color: 'white', 
                          ml: 'auto' 
                        } 
                      : { 
                          bgcolor: 'white', 
                          color: 'grey.900' 
                        })
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {message.text}
                  </Typography>
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>
        </Stack>
      </Paper>

      <Button onClick={runDemo} variant="contained" size="small" fullWidth>
        Try Demo Scenario {currentDemo + 1}
      </Button>
    </Paper>
  );
};

// Live Market Data Demo
export const MarketDataDemo: React.FC<{ className?: string }> = ({ className }) => {
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [animatingPrice, setAnimatingPrice] = useState(false);

  const marketData = [
    {
      name: 'Atlantic Salmon',
      price: 8.25,
      change: 2.3,
      trend: 'up',
      volume: '12,450 lbs',
      suppliers: 24
    },
    {
      name: 'Organic Apples',
      price: 2.45,
      change: -1.2,
      trend: 'down',
      volume: '45,200 lbs',
      suppliers: 18
    },
    {
      name: 'Premium Beef',
      price: 15.80,
      change: 4.1,
      trend: 'up',
      volume: '8,900 lbs',
      suppliers: 12
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatingPrice(true);
      setTimeout(() => setAnimatingPrice(false), 500);
      setSelectedProduct((prev) => (prev + 1) % marketData.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentProduct = marketData[selectedProduct];

  return (
    <Paper 
      sx={{ 
        p: 3, 
        borderRadius: 3, 
        backdropFilter: 'blur(10px)', 
        bgcolor: 'rgba(255, 255, 255, 0.9)' 
      }}
      className={className || ''}
    >
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <ChartBarIcon sx={{ fontSize: 20, color: 'success.main', mr: 1 }} />
        <Typography variant="h6" sx={{ color: 'grey.900' }}>
          Live Market Data
        </Typography>
      </Box>

      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'grey.900', mb: 2 }}>
              {currentProduct.name}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: 'grey.600' }}>
                  Current Price
                </Typography>
                <motion.div 
                  animate={animatingPrice ? { scale: [1, 1.1, 1] } : {}}
                >
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    ${currentProduct.price}
                  </Typography>
                </motion.div>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: 'grey.600' }}>
                  24h Change
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'semibold',
                    color: currentProduct.change > 0 ? 'success.main' : 'error.main'
                  }}
                >
                  {currentProduct.change > 0 ? '+' : ''}{currentProduct.change}%
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: 'grey.600' }}>
                  Volume
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {currentProduct.volume}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: 'grey.600' }}>
                  Suppliers
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {currentProduct.suppliers}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={1}>
          {marketData.map((product, index) => (
            <Grid item xs={4} key={product.name}>
              <Button
                onClick={() => setSelectedProduct(index)}
                variant={index === selectedProduct ? 'contained' : 'outlined'}
                size="small"
                fullWidth
                sx={{
                  fontSize: '0.75rem',
                  py: 1,
                  ...(index === selectedProduct 
                    ? { 
                        bgcolor: 'primary.main', 
                        '&:hover': { bgcolor: 'primary.dark' } 
                      } 
                    : { 
                        bgcolor: 'grey.100', 
                        '&:hover': { bgcolor: 'grey.200' } 
                      })
                }}
              >
                {product.name}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Paper>
  );
};

// Supplier Matching Demo
export const SupplierMatchDemo: React.FC<{ className?: string }> = ({ className }) => {
  const [matchingStage, setMatchingStage] = useState(0);
  const [isMatching, setIsMatching] = useState(false);

  const matchingStages = [
    'Analyzing requirements...',
    'Searching supplier database...',
    'Calculating compatibility scores...',
    'Ranking by performance...',
    'Match complete!'
  ];

  const suppliers = [
    {
      name: 'FreshFarms Co.',
      match: 96,
      location: 'California',
      specialty: 'Organic Produce',
      rating: 4.8,
      certifications: ['USDA Organic', 'GAP']
    },
    {
      name: 'GreenHarvest',
      match: 94,
      location: 'Oregon',
      specialty: 'Sustainable Farming',
      rating: 4.7,
      certifications: ['Organic', 'Fair Trade']
    },
    {
      name: 'Valley Organics',
      match: 89,
      location: 'Washington',
      specialty: 'Premium Fruits',
      rating: 4.6,
      certifications: ['USDA Organic']
    }
  ];

  const startMatching = () => {
    setIsMatching(true);
    setMatchingStage(0);

    const interval = setInterval(() => {
      setMatchingStage(prev => {
        if (prev >= matchingStages.length - 1) {
          clearInterval(interval);
          setIsMatching(false);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
  };

  return (
    <Paper 
      sx={{ 
        p: 3, 
        borderRadius: 3, 
        backdropFilter: 'blur(10px)', 
        bgcolor: 'rgba(255, 255, 255, 0.9)' 
      }}
      className={className || ''}
    >
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <UserGroupIcon sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
        <Typography variant="h6" sx={{ color: 'grey.900' }}>
          AI Supplier Matching
        </Typography>
      </Box>

      {!isMatching && matchingStage < matchingStages.length - 1 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'grey.600' }}>
              Looking for:
            </Typography>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', mt: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                Organic Apples
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                5000 lbs • USDA Organic • California preferred
              </Typography>
            </Paper>
          </Box>
          <Button onClick={startMatching} variant="contained" size="small">
            Find Suppliers
          </Button>
        </Box>
      ) : isMatching ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ marginBottom: 16 }}
          >
            <CircularProgress size={40} />
          </motion.div>
          <Typography variant="body2" sx={{ color: 'grey.600' }}>
            {matchingStages[matchingStage]}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: 'grey.600' }}>
            Top Matches Found:
          </Typography>
          {suppliers.map((supplier, index) => (
            <motion.div
              key={supplier.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {supplier.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.600' }}>
                      {supplier.location} • {supplier.specialty}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {supplier.match}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'grey.600' }}>
                      match
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'warning.main' }}>
                      ★ {supplier.rating}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {supplier.certifications.map(cert => (
                      <Chip key={cert} label={cert} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

// Compliance Checker Demo
export const ComplianceDemo: React.FC<{ className?: string }> = ({ className }) => {
  const [checkingCompliance, setCheckingCompliance] = useState(false);
  const [complianceResults, setComplianceResults] = useState<any>(null);

  const runComplianceCheck = () => {
    setCheckingCompliance(true);
    
    setTimeout(() => {
      setComplianceResults({
        overallScore: 96,
        checks: [
          { name: 'USDA Organic', status: 'passed', expiry: '2025-03-15' },
          { name: 'FDA Registration', status: 'passed', expiry: '2024-12-31' },
          { name: 'HACCP Certification', status: 'warning', expiry: '2024-08-20', message: 'Expires soon' },
          { name: 'GAP Certification', status: 'passed', expiry: '2025-06-10' }
        ]
      });
      setCheckingCompliance(false);
    }, 2000);
  };

  return (
    <Paper 
      sx={{ 
        p: 3, 
        borderRadius: 3, 
        backdropFilter: 'blur(10px)', 
        bgcolor: 'rgba(255, 255, 255, 0.9)' 
      }}
      className={className || ''}
    >
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <ShieldCheckIcon sx={{ fontSize: 20, color: 'success.main', mr: 1 }} />
        <Typography variant="h6" sx={{ color: 'grey.900' }}>
          Compliance Checker
        </Typography>
      </Box>

      {!complianceResults ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          {checkingCompliance ? (
            <Box>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}
              >
                <ShieldCheckIcon sx={{ fontSize: 24, color: 'success.main' }} />
              </motion.div>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Checking compliance...
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" sx={{ color: 'grey.600', mb: 2 }}>
                Verify supplier compliance automatically
              </Typography>
              <Button onClick={runComplianceCheck} variant="contained" size="small">
                Check Compliance
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        <Stack spacing={2}>
          <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'success.light' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              {complianceResults.overallScore}%
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.600' }}>
              Compliance Score
            </Typography>
          </Paper>

          <Stack spacing={1}>
            {complianceResults.checks.map((check: any, index: number) => (
              <motion.div
                key={check.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        mr: 1,
                        bgcolor: check.status === 'passed' ? 'success.main' : 
                                check.status === 'warning' ? 'warning.main' : 'error.main'
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {check.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'grey.600' }}>
                    {check.message || `Expires ${check.expiry}`}
                  </Typography>
                </Paper>
              </motion.div>
            ))}
          </Stack>
        </Stack>
      )}
    </Paper>
  );
};

// Order Tracking Demo
export const OrderTrackingDemo: React.FC<{ className?: string }> = ({ className }) => {
  const [selectedOrder, setSelectedOrder] = useState(0);

  const orders = [
    {
      id: 'ORD-2024-001',
      product: 'Organic Apples',
      supplier: 'FreshFarms Co.',
      status: 'in_transit',
      progress: 75,
      eta: '2 hours',
      updates: [
        { time: '09:00', status: 'Picked up from warehouse' },
        { time: '11:30', status: 'In transit - Route 101' },
        { time: '13:45', status: 'Expected delivery: 15:30' }
      ]
    },
    {
      id: 'ORD-2024-002',
      product: 'Premium Salmon',
      supplier: 'Ocean Fresh Ltd.',
      status: 'preparing',
      progress: 25,
      eta: '6 hours',
      updates: [
        { time: '08:00', status: 'Order confirmed' },
        { time: '09:15', status: 'Preparing shipment' }
      ]
    }
  ];

  const currentOrder = orders[selectedOrder];

  return (
    <Paper 
      sx={{ 
        p: 3, 
        borderRadius: 3, 
        backdropFilter: 'blur(10px)', 
        bgcolor: 'rgba(255, 255, 255, 0.9)' 
      }}
      className={className || ''}
    >
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <TruckIcon sx={{ fontSize: 20, color: 'warning.main', mr: 1 }} />
        <Typography variant="h6" sx={{ color: 'grey.900' }}>
          Live Order Tracking
        </Typography>
      </Box>

      <Stack spacing={3}>
        <ButtonGroup variant="outlined" size="small">
          {orders.map((order, index) => (
            <Button
              key={order.id}
              onClick={() => setSelectedOrder(index)}
              variant={index === selectedOrder ? 'contained' : 'outlined'}
              sx={{
                fontSize: '0.75rem',
                ...(index === selectedOrder 
                  ? { 
                      bgcolor: 'warning.main', 
                      color: 'white',
                      '&:hover': { bgcolor: 'warning.dark' } 
                    } 
                  : {})
              }}
            >
              {order.id}
            </Button>
          ))}
        </ButtonGroup>

        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {currentOrder.product}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                {currentOrder.supplier}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 'semibold', color: 'warning.main' }}>
                ETA: {currentOrder.eta}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                {currentOrder.status.replace('_', ' ')}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Progress
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                {currentOrder.progress}%
              </Typography>
            </Box>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentOrder.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <LinearProgress 
                variant="determinate" 
                value={currentOrder.progress} 
                sx={{ height: 8, borderRadius: 1 }}
              />
            </motion.div>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: 'grey.700', mb: 2 }}>
              Recent Updates:
            </Typography>
            <Stack spacing={1}>
              {currentOrder.updates.map((update, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'grey.600' }}>
                      {update.time}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.900' }}>
                      {update.status}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Stack>
          </Box>
        </Paper>
      </Stack>
    </Paper>
  );
};

// Main Demo Showcase Component
export const DemoShowcase: React.FC<{ className?: string }> = ({ className }) => {
  const [activeDemo, setActiveDemo] = useState(0);

  const demos = [
    { component: AIChatDemo, title: 'AI Assistant', icon: SparklesIcon },
    { component: MarketDataDemo, title: 'Market Data', icon: ChartBarIcon },
    { component: SupplierMatchDemo, title: 'Supplier Matching', icon: UserGroupIcon },
    { component: ComplianceDemo, title: 'Compliance Check', icon: ShieldCheckIcon },
    { component: OrderTrackingDemo, title: 'Order Tracking', icon: TruckIcon }
  ];

  const ActiveDemoComponent = demos[activeDemo].component;

  return (
    <Paper 
      sx={{ 
        p: 4, 
        borderRadius: 3, 
        backdropFilter: 'blur(10px)', 
        bgcolor: 'rgba(255, 255, 255, 0.9)' 
      }}
      className={className || ''}
    >
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 'bold', 
          mb: 4, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Platform Capabilities Demo
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4, justifyContent: 'center' }}>
        {demos.map((demo, index) => {
          const IconComponent = demo.icon;
          return (
            <Button
              key={demo.title}
              onClick={() => setActiveDemo(index)}
              variant={index === activeDemo ? 'contained' : 'outlined'}
              startIcon={<IconComponent />}
              sx={{
                fontSize: '0.875rem',
                fontWeight: 'medium',
                ...(index === activeDemo 
                  ? { 
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      color: 'white',
                      boxShadow: 3,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        boxShadow: 6
                      }
                    } 
                  : { 
                      bgcolor: 'grey.100',
                      color: 'grey.700',
                      '&:hover': { bgcolor: 'grey.200' }
                    })
              }}
            >
              {demo.title}
            </Button>
          );
        })}
      </Box>

      <Box sx={{ minHeight: 400 }}>
        <ActiveDemoComponent />
      </Box>
    </Paper>
  );
};