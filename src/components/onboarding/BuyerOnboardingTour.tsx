import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { OnboardingTour, TourStep, WelcomeModal, OnboardingChecklist } from './OnboardingTour';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { UserRole } from '../../shared/types';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Card,
  CardContent,
  Chip
} from '@mui/material';

interface BuyerOnboardingProps {
  onComplete?: () => void;
  autoStart?: boolean;
}

export const BuyerOnboardingTour: React.FC<BuyerOnboardingProps> = ({
  onComplete,
  autoStart = false
}) => {
  const [showWelcome, setShowWelcome] = useState(autoStart);
  const [showTour, setShowTour] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { user } = useAppStore();

  // Buyer-specific onboarding steps
  const buyerTourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to FoodXchange for Buyers!',
      content: 'You\'re now part of the premier B2B food marketplace. Let\'s explore how to find suppliers, manage procurement, and streamline your operations.',
      placement: 'center',
      highlight: false,
    },
    {
      id: 'dashboard',
      title: 'Your Procurement Dashboard',
      content: 'Your central hub for all procurement activities. Monitor orders, track compliance, and get AI-powered insights for better buying decisions.',
      target: '[data-tour="dashboard"]',
      placement: 'bottom',
      highlight: true,
    },
    {
      id: 'marketplace',
      title: 'Discover Products & Suppliers',
      content: 'Browse thousands of verified products from trusted suppliers. Use AI-powered search to find exactly what you need.',
      target: '[data-tour="marketplace-nav"]',
      placement: 'bottom',
      highlight: true,
      action: {
        label: 'Explore Marketplace',
        onClick: () => navigate('/marketplace')
      }
    },
    {
      id: 'create-rfq',
      title: 'Create Request for Quotations',
      content: 'Post RFQs to get competitive quotes from multiple suppliers. Our AI matches you with the best suppliers for your needs.',
      target: '[data-tour="create-rfq"]',
      placement: 'bottom',
      highlight: true,
      action: {
        label: 'Create RFQ',
        onClick: () => navigate('/rfq/create')
      }
    },
    {
      id: 'ai-procurement',
      title: 'AI-Powered Procurement Assistant',
      content: 'Get intelligent recommendations for suppliers, pricing insights, and automated compliance checking.',
      target: '[data-tour="ai-assistant"]',
      placement: 'left',
      highlight: true,
    },
    {
      id: 'supplier-matching',
      title: 'Smart Supplier Matching',
      content: 'Our AI analyzes your requirements and matches you with suppliers that best fit your needs, quality standards, and budget.',
      target: '[data-tour="supplier-match"]',
      placement: 'right',
      highlight: true,
    },
    {
      id: 'orders-tracking',
      title: 'Order Management & Tracking',
      content: 'Track all your orders in real-time, manage deliveries, and communicate with suppliers seamlessly.',
      target: '[data-tour="orders-nav"]',
      placement: 'bottom',
      highlight: true,
    },
    {
      id: 'compliance',
      title: 'Automated Compliance Verification',
      content: 'Ensure all suppliers meet your compliance requirements. Automated certificate validation and compliance scoring.',
      target: '[data-tour="compliance"]',
      placement: 'right',
      highlight: true,
    },
    {
      id: 'analytics',
      title: 'Procurement Analytics',
      content: 'Analyze spending patterns, supplier performance, and market trends to optimize your procurement strategy.',
      target: '[data-tour="analytics"]',
      placement: 'top',
      highlight: true,
    },
    {
      id: 'samples',
      title: 'Sample Request System',
      content: 'Request product samples from suppliers to test quality before placing large orders.',
      target: '[data-tour="samples"]',
      placement: 'left',
      highlight: true,
    },
    {
      id: 'success',
      title: 'Ready to Procure!',
      content: 'You\'re all set! Start exploring the marketplace, create your first RFQ, and let our AI help you find the perfect suppliers.',
      placement: 'center',
      highlight: false,
    }
  ];

  // Buyer-specific checklist items
  const buyerChecklistItems = [
    {
      id: 'company-setup',
      label: 'Complete company profile and procurement preferences',
      completed: completedSteps.has('company-setup'),
      action: () => navigate('/profile/company')
    },
    {
      id: 'first-rfq',
      label: 'Create your first Request for Quotation',
      completed: completedSteps.has('first-rfq'),
      action: () => navigate('/rfq/create')
    },
    {
      id: 'explore-marketplace',
      label: 'Browse the marketplace and save favorite products',
      completed: completedSteps.has('explore-marketplace'),
      action: () => navigate('/marketplace')
    },
    {
      id: 'compliance-requirements',
      label: 'Set up compliance requirements and standards',
      completed: completedSteps.has('compliance-requirements'),
      action: () => navigate('/compliance/requirements')
    },
    {
      id: 'sample-request',
      label: 'Request samples from 2-3 suppliers',
      completed: completedSteps.has('sample-request'),
      action: () => navigate('/samples')
    },
    {
      id: 'setup-alerts',
      label: 'Configure price alerts and market notifications',
      completed: completedSteps.has('setup-alerts'),
      action: () => navigate('/settings/alerts')
    }
  ];

  const handleWelcomeStart = () => {
    setShowWelcome(false);
    setShowTour(true);
  };

  const handleWelcomeSkip = () => {
    setShowWelcome(false);
    onComplete?.();
  };

  const handleTourComplete = () => {
    setShowTour(false);
    setCompletedSteps(prev => new Set([...prev, 'tour-completed']));
    onComplete?.();
  };

  const handleTourSkip = () => {
    setShowTour(false);
    onComplete?.();
  };

  // Demo data for key buyer capabilities
  const demoCapabilities = [
    {
      title: 'AI Supplier Matching',
      description: 'Intelligent matching based on your requirements and history',
      metric: '92% match accuracy',
      trend: '+18% faster sourcing'
    },
    {
      title: 'Price Intelligence',
      description: 'Real-time market pricing and cost optimization insights',
      metric: '15% avg. cost savings',
      trend: '+25% budget efficiency'
    },
    {
      title: 'Quality Assurance',
      description: 'Automated compliance verification and quality scoring',
      metric: '99.2% compliance rate',
      trend: '85% risk reduction'
    },
    {
      title: 'Demand Forecasting',
      description: 'Predict your procurement needs with AI analytics',
      metric: '89% accuracy',
      trend: '+30% inventory optimization'
    }
  ];

  // Sample marketplace highlights for demo
  const marketplaceHighlights = [
    {
      category: 'Fresh Produce',
      suppliers: '2,400+',
      products: '15,000+',
      avgSavings: '12%'
    },
    {
      category: 'Dairy & Eggs',
      suppliers: '850+',
      products: '5,200+',
      avgSavings: '18%'
    },
    {
      category: 'Meat & Seafood',
      suppliers: '1,200+',
      products: '8,500+',
      avgSavings: '15%'
    },
    {
      category: 'Packaged Foods',
      suppliers: '3,100+',
      products: '25,000+',
      avgSavings: '20%'
    }
  ];

  return (
    <>
      <WelcomeModal
        isOpen={showWelcome}
        onClose={handleWelcomeSkip}
        onStartTour={handleWelcomeStart}
        userName={user?.name}
      />

      <OnboardingTour
        steps={buyerTourSteps}
        isOpen={showTour}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
      />

      {/* Buyer Capabilities Demo Panel */}
      {showTour && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
        >
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'semibold', background: 'linear-gradient(135deg, #1E4C8A, #FF6B35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Procurement Capabilities
            </Typography>
            
            <Stack spacing={2} sx={{ mb: 3 }}>
              {demoCapabilities.map((capability, index) => (
                <motion.div
                  key={capability.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle1" sx={{ color: 'grey.900', fontWeight: 'medium', mb: 1 }}>
                        {capability.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'grey.600', mb: 2 }}>
                        {capability.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'semibold', color: 'primary.main' }}>
                          {capability.metric}
                        </Typography>
                        <Chip
                          label={capability.trend}
                          size="small"
                          color="success"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Stack>

            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'medium', color: 'grey.900', mb: 2 }}>
                Marketplace Overview
              </Typography>
              <Stack spacing={1}>
                {marketplaceHighlights.map((highlight, index) => (
                  <motion.div
                    key={highlight.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" sx={{ color: 'grey.900', fontWeight: 'medium' }}>
                            {highlight.category}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'grey.600' }}>
                            {highlight.suppliers} suppliers • {highlight.products} products
                          </Typography>
                        </Box>
                        <Chip
                          label={`-${highlight.avgSavings}`}
                          size="small"
                          color="success"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </Stack>
            </Box>

            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mt: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.900', fontWeight: 'medium', mb: 2 }}>
                Quick Actions
              </Typography>
              <Stack spacing={1}>
                <Button
                  onClick={() => navigate('/rfq/create')}
                  variant="outlined"
                  fullWidth
                  sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                >
                  📝 Create Your First RFQ
                </Button>
                <Button
                  onClick={() => navigate('/marketplace')}
                  variant="outlined"
                  fullWidth
                  sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                >
                  🛒 Browse Marketplace
                </Button>
                <Button
                  onClick={() => navigate('/suppliers')}
                  variant="outlined"
                  fullWidth
                  sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                >
                  🏢 Find Suppliers
                </Button>
                <Button
                  onClick={() => navigate('/samples')}
                  variant="outlined"
                  fullWidth
                  sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                >
                  🧪 Request Samples
                </Button>
              </Stack>
            </Box>
          </Paper>
        </motion.div>
      )}

      {/* Onboarding Checklist - Always visible after tour */}
      {!showTour && !showWelcome && (
        <Box sx={{ m: 2 }}>
          <OnboardingChecklist
            items={buyerChecklistItems}
          />
        </Box>
      )}
    </>
  );
};

// Hook for managing buyer onboarding state
export const useBuyerOnboarding = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user } = useAppStore();

  useEffect(() => {
    // Check if user is a buyer and hasn't completed onboarding
    if (user?.role === UserRole.BUYER) {
      const hasCompletedOnboarding = localStorage.getItem('buyer-onboarding-completed');
      setIsOnboardingComplete(!!hasCompletedOnboarding);
      setShowOnboarding(!hasCompletedOnboarding);
    }
  }, [user]);

  const completeOnboarding = () => {
    localStorage.setItem('buyer-onboarding-completed', 'true');
    setIsOnboardingComplete(true);
    setShowOnboarding(false);
  };

  const restartOnboarding = () => {
    localStorage.removeItem('buyer-onboarding-completed');
    setIsOnboardingComplete(false);
    setShowOnboarding(true);
  };

  return {
    isOnboardingComplete,
    showOnboarding,
    completeOnboarding,
    restartOnboarding
  };
};