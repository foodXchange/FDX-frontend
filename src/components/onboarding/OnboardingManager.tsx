import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, Button, Dialog, DialogContent, DialogTitle, Avatar, Stack, Fab, Backdrop, Paper, IconButton, Divider } from '@mui/material';
import { SellerOnboardingTour, useSellerOnboarding } from './SellerOnboardingTour';
import { BuyerOnboardingTour, useBuyerOnboarding } from './BuyerOnboardingTour';
import { DemoShowcase } from './InteractiveDemoComponents';
import { useAppStore } from '../../store/useAppStore';
import { UserRole } from '../../shared/types';

interface OnboardingManagerProps {
  forceShow?: boolean;
  onClose?: () => void;
}

export const OnboardingManager: React.FC<OnboardingManagerProps> = ({
  forceShow = false,
  onClose
}) => {
  const { user } = useAppStore();
  const [showDemoShowcase, setShowDemoShowcase] = useState(false);
  const [onboardingMode, setOnboardingMode] = useState<'auto' | 'demo' | null>(null);

  // Hooks for role-specific onboarding
  const sellerOnboarding = useSellerOnboarding();
  const buyerOnboarding = useBuyerOnboarding();

  // Determine which onboarding to show
  const shouldShowOnboarding = forceShow || 
    (user?.role === UserRole.SUPPLIER && sellerOnboarding.showOnboarding) ||
    (user?.role === UserRole.BUYER && buyerOnboarding.showOnboarding);

  useEffect(() => {
    if (shouldShowOnboarding && !onboardingMode) {
      setOnboardingMode('auto');
    }
  }, [shouldShowOnboarding, onboardingMode]);

  const handleOnboardingComplete = () => {
    if (user?.role === UserRole.SUPPLIER) {
      sellerOnboarding.completeOnboarding();
    } else if (user?.role === UserRole.BUYER) {
      buyerOnboarding.completeOnboarding();
    }
    setOnboardingMode(null);
    onClose?.();
  };

  const handleShowDemo = () => {
    setOnboardingMode('demo');
    setShowDemoShowcase(true);
  };

  const handleCloseDemo = () => {
    setShowDemoShowcase(false);
    setOnboardingMode(null);
    onClose?.();
  };

  const getRoleSpecificContent = () => {
    if (user?.role === UserRole.SUPPLIER) {
      return {
        title: 'Welcome to FoodXchange for Suppliers',
        description: 'Showcase your products, respond to RFQs, and grow your business with AI-powered insights.',
        icon: ShoppingBagIcon,
        color: 'linear-gradient(135deg, #4ade80, #3b82f6)'
      };
    } else if (user?.role === UserRole.BUYER) {
      return {
        title: 'Welcome to FoodXchange for Buyers',
        description: 'Find verified suppliers, streamline procurement, and make data-driven purchasing decisions.',
        icon: UserGroupIcon,
        color: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
      };
    }
    return {
      title: 'Welcome to FoodXchange',
      description: 'The future of B2B food commerce is here.',
      icon: SparklesIcon,
      color: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
    };
  };

  const roleContent = getRoleSpecificContent();
  const IconComponent = roleContent.icon;

  // Show role-specific onboarding tours
  if (onboardingMode === 'auto' && user?.role === UserRole.SUPPLIER) {
    return (
      <SellerOnboardingTour
        autoStart={true}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  if (onboardingMode === 'auto' && user?.role === UserRole.BUYER) {
    return (
      <BuyerOnboardingTour
        autoStart={true}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // Show demo showcase
  if (showDemoShowcase) {
    return (
      <Dialog
        open={showDemoShowcase}
        onClose={handleCloseDemo}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Platform Demo
          </Typography>
          <IconButton onClick={handleCloseDemo}>
            <XMarkIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DemoShowcase />
        </DialogContent>
      </Dialog>
    );
  }

  // Show welcome modal for new users or forced show
  if (!shouldShowOnboarding && !forceShow) {
    return null;
  }

  return (
    <Backdrop open={true} sx={{ zIndex: 1300 }}>
      <Paper 
        sx={{ 
          p: 4, 
          maxWidth: 480, 
          width: '90%', 
          borderRadius: 3,
          textAlign: 'center'
        }}
      >
        {/* Animated Icon */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 3,
              background: roleContent.color
            }}
          >
            <IconComponent sx={{ fontSize: 40, color: 'white' }} />
          </Avatar>
        </motion.div>

        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
          {roleContent.title}
        </Typography>

        <Typography variant="body1" sx={{ color: 'grey.600', mb: 4 }}>
          {roleContent.description}
        </Typography>

        <Stack spacing={2}>
          <Button
            variant="contained"
            size="large"
            onClick={() => setOnboardingMode('auto')}
            startIcon={<SparklesIcon />}
            fullWidth
          >
            Start Guided Tour
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={handleShowDemo}
            startIcon={<UserGroupIcon />}
            fullWidth
          >
            See Platform Demo
          </Button>

          <Button
            variant="text"
            size="small"
            onClick={handleOnboardingComplete}
            fullWidth
          >
            Skip - I'll Explore on My Own
          </Button>
        </Stack>

        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SparklesIcon sx={{ fontSize: 16, mr: 1, color: 'grey.500' }} />
          <Typography variant="caption" sx={{ color: 'grey.500' }}>
            You can always access these tours from the help menu
          </Typography>
        </Box>
      </Paper>
    </Backdrop>
  );
};

// Quick action floating button for accessing onboarding
export const OnboardingFloatingButton: React.FC = () => {
  const [showManager, setShowManager] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAppStore();

  const actions = [
    {
      label: 'Take Tour',
      icon: SparklesIcon,
      onClick: () => setShowManager(true),
      color: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
    },
    {
      label: 'View Demo',
      icon: UserGroupIcon,
      onClick: () => setShowManager(true),
      color: 'linear-gradient(135deg, #4ade80, #3b82f6)'
    }
  ];

  if (!user) return null;

  return (
    <>
      <Box sx={{ position: 'fixed', bottom: 24, left: 24, zIndex: 1000 }}>
        <Box sx={{ position: 'relative' }}>
          {/* Action buttons */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                sx={{ position: 'absolute', bottom: 80, left: 0 }}
              >
                <Stack spacing={1}>
                  {actions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <motion.div
                        key={action.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Button
                          variant="contained"
                          startIcon={<IconComponent />}
                          onClick={action.onClick}
                          sx={{
                            background: action.color,
                            color: 'white',
                            fontWeight: 'medium',
                            fontSize: '0.875rem',
                            boxShadow: 3,
                            '&:hover': {
                              boxShadow: 6,
                              transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          {action.label}
                        </Button>
                      </motion.div>
                    );
                  })}
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main floating button */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Fab
              color="primary"
              onClick={() => setIsExpanded(!isExpanded)}
              sx={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 6
                }
              }}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <SparklesIcon />
              </motion.div>
            </Fab>
          </motion.div>
        </Box>
      </Box>

      {/* Onboarding Manager */}
      {showManager && (
        <OnboardingManager
          forceShow={true}
          onClose={() => setShowManager(false)}
        />
      )}
    </>
  );
};

// Hook for programmatic control
export const useOnboardingManager = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user } = useAppStore();

  const startOnboarding = (_mode: 'tour' | 'demo' = 'tour') => {
    setShowOnboarding(true);
  };

  const closeOnboarding = () => {
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    if (user?.role === UserRole.SUPPLIER) {
      localStorage.removeItem('seller-onboarding-completed');
    } else if (user?.role === UserRole.BUYER) {
      localStorage.removeItem('buyer-onboarding-completed');
    }
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    startOnboarding,
    closeOnboarding,
    resetOnboarding
  };
};