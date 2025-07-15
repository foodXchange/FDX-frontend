import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SellerOnboardingTour, useSellerOnboarding } from './SellerOnboardingTour';
import { BuyerOnboardingTour, useBuyerOnboarding } from './BuyerOnboardingTour';
import { DemoShowcase } from './InteractiveDemoComponents';
import { useAppStore } from '../../store/useAppStore';
import { UserRole } from '../../shared/types';
import { Button } from '../ui/Button';
import { 
  UserGroupIcon, 
  ShoppingBagIcon, 
  SparklesIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

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
        color: 'from-green-500 to-blue-600'
      };
    } else if (user?.role === UserRole.BUYER) {
      return {
        title: 'Welcome to FoodXchange for Buyers',
        description: 'Find verified suppliers, streamline procurement, and make data-driven purchasing decisions.',
        icon: UserGroupIcon,
        color: 'from-blue-500 to-purple-600'
      };
    }
    return {
      title: 'Welcome to FoodXchange',
      description: 'The future of B2B food commerce is here.',
      icon: SparklesIcon,
      color: 'from-indigo-500 to-purple-600'
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
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold gradient-text">Platform Demo</h2>
              <button
                onClick={handleCloseDemo}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              <DemoShowcase />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Show welcome modal for new users or forced show
  if (!shouldShowOnboarding && !forceShow) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-morphism rounded-2xl p-8 max-w-lg w-full text-center"
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
            className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-gradient-to-r ${roleContent.color}`}
          >
            <IconComponent className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-2xl font-bold mb-4 gradient-text">
            {roleContent.title}
          </h2>

          <p className="text-gray-600 mb-8 leading-relaxed">
            {roleContent.description}
          </p>

          <div className="space-y-4">
            <Button
              variant="default"
              size="lg"
              onClick={() => setOnboardingMode('auto')}
              className="w-full hover-lift"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              Start Guided Tour
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleShowDemo}
              className="w-full"
            >
              <UserGroupIcon className="w-5 h-5 mr-2" />
              See Platform Demo
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleOnboardingComplete}
              className="w-full text-gray-500"
            >
              Skip - I'll Explore on My Own
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center text-xs text-gray-500">
              <SparklesIcon className="w-4 h-4 mr-1" />
              You can always access these tours from the help menu
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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
      color: 'from-blue-500 to-purple-600'
    },
    {
      label: 'View Demo',
      icon: UserGroupIcon,
      onClick: () => setShowManager(true),
      color: 'from-green-500 to-blue-600'
    }
  ];

  if (!user) return null;

  return (
    <>
      <div className="fixed bottom-6 left-6 z-[1000]">
        <div className="relative">
          {/* Action buttons */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-16 left-0 space-y-2"
              >
                {actions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <motion.button
                      key={action.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={action.onClick}
                      className={`flex items-center px-4 py-2 rounded-lg text-white font-medium text-sm shadow-lg hover:shadow-xl transition-all hover-lift bg-gradient-to-r ${action.color}`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {action.label}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main floating button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-purple-500 to-pink-600 text-white flex items-center justify-center hover-lift"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <SparklesIcon className="w-6 h-6" />
            </motion.div>
          </motion.button>
        </div>
      </div>

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