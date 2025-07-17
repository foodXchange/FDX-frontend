import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { OnboardingTour, TourStep, WelcomeModal, OnboardingChecklist } from './OnboardingTour';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { UserRole } from '../../shared/types';
import { Box, Typography, Button, Paper, Stack, Card, CardContent, Chip } from '@mui/material';

interface SellerOnboardingProps {
  onComplete?: () => void;
  autoStart?: boolean;
}

export const SellerOnboardingTour: React.FC<SellerOnboardingProps> = ({
  onComplete,
  autoStart = false
}) => {
  const [showWelcome, setShowWelcome] = useState(autoStart);
  const [showTour, setShowTour] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { user } = useAppStore();

  // Seller-specific onboarding steps
  const sellerTourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to FoodXchange for Suppliers!',
      content: 'You\'re now part of the leading B2B food marketplace. Let\'s explore how you can showcase your products and connect with buyers.',
      placement: 'center',
      highlight: false,
    },
    {
      id: 'dashboard',
      title: 'Your Supplier Dashboard',
      content: 'This is your command center. Monitor your performance, track orders, and get AI-powered insights to grow your business.',
      target: '[data-tour="dashboard"]',
      placement: 'bottom',
      highlight: true,
    },
    {
      id: 'products',
      title: 'Product Management',
      content: 'Add, edit, and manage your product catalog. Our AI helps optimize descriptions and suggests competitive pricing.',
      target: '[data-tour="products-nav"]',
      placement: 'bottom',
      highlight: true,
      action: {
        label: 'View Products',
        onClick: () => navigate('/products')
      }
    },
    {
      id: 'rfq-opportunities',
      title: 'RFQ Opportunities',
      content: 'Browse and respond to Request for Quotations from verified buyers. Our AI matches you with relevant opportunities.',
      target: '[data-tour="rfq-nav"]',
      placement: 'bottom',
      highlight: true,
      action: {
        label: 'Explore RFQs',
        onClick: () => navigate('/rfq')
      }
    },
    {
      id: 'ai-insights',
      title: 'AI-Powered Market Intelligence',
      content: 'Get intelligent recommendations on pricing, demand forecasting, and market trends to stay competitive.',
      target: '[data-tour="ai-insights"]',
      placement: 'left',
      highlight: true,
    },
    {
      id: 'orders',
      title: 'Order Management',
      content: 'Track all your orders, manage fulfillment, and communicate with buyers in real-time.',
      target: '[data-tour="orders-nav"]',
      placement: 'bottom',
      highlight: true,
    },
    {
      id: 'compliance',
      title: 'Compliance Made Easy',
      content: 'Upload certificates, track compliance scores, and ensure your products meet all regional requirements automatically.',
      target: '[data-tour="compliance"]',
      placement: 'right',
      highlight: true,
    },
    {
      id: 'analytics',
      title: 'Performance Analytics',
      content: 'Monitor your sales, customer feedback, and market position with detailed analytics and reports.',
      target: '[data-tour="analytics"]',
      placement: 'top',
      highlight: true,
    },
    {
      id: 'profile',
      title: 'Company Profile',
      content: 'Complete your company profile to build trust with buyers. Add certifications, case studies, and showcase your capabilities.',
      target: '[data-tour="profile"]',
      placement: 'left',
      highlight: true,
    },
    {
      id: 'success',
      title: 'You\'re All Set!',
      content: 'Congratulations! You\'re ready to start selling on FoodXchange. Our AI will help you optimize your presence and grow your business.',
      placement: 'center',
      highlight: false,
    }
  ];

  // Seller-specific checklist items
  const sellerChecklistItems = [
    {
      id: 'company-profile',
      label: 'Complete company profile and verification',
      completed: completedSteps.has('company-profile'),
      action: () => navigate('/profile/company')
    },
    {
      id: 'add-products',
      label: 'Add your first 3 products to catalog',
      completed: completedSteps.has('add-products'),
      action: () => navigate('/products/add')
    },
    {
      id: 'upload-certifications',
      label: 'Upload compliance certificates',
      completed: completedSteps.has('upload-certifications'),
      action: () => navigate('/compliance/certificates')
    },
    {
      id: 'respond-rfq',
      label: 'Respond to your first RFQ',
      completed: completedSteps.has('respond-rfq'),
      action: () => navigate('/rfq')
    },
    {
      id: 'setup-notifications',
      label: 'Configure notification preferences',
      completed: completedSteps.has('setup-notifications'),
      action: () => navigate('/settings/notifications')
    },
    {
      id: 'enable-ai-insights',
      label: 'Enable AI-powered market insights',
      completed: completedSteps.has('enable-ai-insights'),
      action: () => setCompletedSteps(prev => new Set([...prev, 'enable-ai-insights']))
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

  // Demo data for key seller capabilities
  const demoCapabilities = [
    {
      title: 'Smart Product Matching',
      description: 'AI automatically matches your products to relevant RFQs',
      metric: '73% match accuracy',
      trend: '+15% this month'
    },
    {
      title: 'Dynamic Pricing Optimization',
      description: 'Real-time pricing recommendations based on market data',
      metric: '12% avg. profit increase',
      trend: '+8% conversion rate'
    },
    {
      title: 'Compliance Automation',
      description: 'Automated certificate tracking and renewal alerts',
      metric: '99.8% compliance score',
      trend: '0 violations this year'
    },
    {
      title: 'Demand Forecasting',
      description: 'Predict demand patterns for your products',
      metric: '87% accuracy',
      trend: '+23% inventory optimization'
    }
  ];

  return (
    <>
      <WelcomeModal
        isOpen={showWelcome}
        onClose={handleWelcomeSkip}
        onStartTour={handleWelcomeStart}
        userName={user?.profile?.firstName}
      />

      <OnboardingTour
        steps={sellerTourSteps}
        isOpen={showTour}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
      />

      {/* Capabilities Demo Panel */}
      {showTour && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
        >
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'semibold', background: 'linear-gradient(135deg, #1E4C8A, #FF6B35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Seller Capabilities
            </Typography>
            
            <Stack spacing={2}>
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

            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mt: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.900', fontWeight: 'medium', mb: 2 }}>
                Quick Actions
              </Typography>
              <Stack spacing={1}>
                <Button
                  onClick={() => navigate('/products/add')}
                  variant="outlined"
                  fullWidth
                  sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                >
                  📦 Add Your First Product
                </Button>
                <Button
                  onClick={() => navigate('/rfq')}
                  variant="outlined"
                  fullWidth
                  sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                >
                  📋 Browse RFQ Opportunities
                </Button>
                <Button
                  onClick={() => navigate('/compliance')}
                  variant="outlined"
                  fullWidth
                  sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
                >
                  ✅ Upload Certificates
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
            items={sellerChecklistItems}
          />
        </Box>
      )}
    </>
  );
};

// Hook for managing seller onboarding state
export const useSellerOnboarding = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user } = useAppStore();

  useEffect(() => {
    // Check if user is a seller and hasn't completed onboarding
    if (user?.role === UserRole.SUPPLIER) {
      const hasCompletedOnboarding = localStorage.getItem('seller-onboarding-completed');
      setIsOnboardingComplete(!!hasCompletedOnboarding);
      setShowOnboarding(!hasCompletedOnboarding);
    }
  }, [user]);

  const completeOnboarding = () => {
    localStorage.setItem('seller-onboarding-completed', 'true');
    setIsOnboardingComplete(true);
    setShowOnboarding(false);
  };

  const restartOnboarding = () => {
    localStorage.removeItem('seller-onboarding-completed');
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