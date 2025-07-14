import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { cn } from '@utils/cn';
import { Button } from '@components/ui/Button';

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for the target element
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick: () => void;
  };
  highlight?: boolean;
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  isOpen: boolean;
  startStep?: number;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  onComplete,
  onSkip,
  isOpen,
  startStep = 0,
}) => {
  const [currentStep, setCurrentStep] = useState(startStep);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  useEffect(() => {
    if (isOpen && currentStepData?.target) {
      const element = document.querySelector(currentStepData.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight class if needed
        if (currentStepData.highlight) {
          element.classList.add('tour-highlight');
        }
        
        return () => {
          element.classList.remove('tour-highlight');
        };
      }
    }
    return undefined;
  }, [currentStep, currentStepData, isOpen]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, onComplete]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const handleSkip = useCallback(() => {
    onSkip?.();
  }, [onSkip]);

  const getTooltipPosition = () => {
    if (!targetRect || !currentStepData.placement) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const spacing = 16;
    const positions = {
      top: {
        top: `${targetRect.top - spacing}px`,
        left: `${targetRect.left + targetRect.width / 2}px`,
        transform: 'translate(-50%, -100%)',
      },
      bottom: {
        top: `${targetRect.bottom + spacing}px`,
        left: `${targetRect.left + targetRect.width / 2}px`,
        transform: 'translateX(-50%)',
      },
      left: {
        top: `${targetRect.top + targetRect.height / 2}px`,
        left: `${targetRect.left - spacing}px`,
        transform: 'translate(-100%, -50%)',
      },
      right: {
        top: `${targetRect.top + targetRect.height / 2}px`,
        left: `${targetRect.right + spacing}px`,
        transform: 'translateY(-50%)',
      },
      center: {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      },
    };

    return positions[currentStepData.placement] || positions.center;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000]">
        {/* Backdrop with spotlight effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-60"
          onClick={handleSkip}
        >
          {targetRect && currentStepData.highlight && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute bg-transparent border-4 border-[#B08D57] rounded-lg"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
              }}
            />
          )}
        </motion.div>

        {/* Tour Tooltip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute glass-morphism rounded-xl p-6 max-w-sm shadow-2xl"
          style={getTooltipPosition()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-2 right-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>

          {/* Step indicator */}
          <div className="flex items-center justify-center mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full mx-1 transition-all',
                  index === currentStep
                    ? 'w-8 bg-gradient-to-r from-[#1E4C8A] to-[#2E6BB8]'
                    : index < currentStep
                    ? 'bg-[#1E4C8A]'
                    : 'bg-gray-300'
                )}
              />
            ))}
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 gradient-text">
              {currentStepData.title}
            </h3>
            <p className="text-sm text-gray-600">{currentStepData.content}</p>
          </div>

          {/* Custom action */}
          {currentStepData.action && (
            <div className="mb-4">
              <Button
                variant="gold"
                size="sm"
                onClick={currentStepData.action.onClick}
                className="w-full"
              >
                {currentStepData.action.label}
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={cn(isFirstStep && 'invisible')}
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <Button
              variant="link"
              size="sm"
              onClick={handleSkip}
              className="text-gray-500"
            >
              Skip tour
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleNext}
            >
              {isLastStep ? 'Finish' : 'Next'}
              {!isLastStep && <ChevronRightIcon className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Welcome Modal Component
export const WelcomeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
  userName?: string;
}> = ({ isOpen, onClose, onStartTour, userName }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1900] p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="glass-morphism rounded-2xl p-8 max-w-md w-full text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
            }}
            transition={{
              duration: 0.5,
              delay: 0.5,
            }}
            className="text-6xl mb-6"
          >
            👋
          </motion.div>

          <h2 className="text-2xl font-bold mb-4 gradient-text">
            Welcome to FoodXchange{userName ? `, ${userName}` : ''}!
          </h2>

          <p className="text-gray-600 mb-8">
            We're excited to have you here. FoodXchange is your all-in-one B2B food commerce platform 
            designed to streamline procurement, ensure compliance, and connect you with trusted suppliers.
          </p>

          <div className="space-y-4">
            <Button
              variant="default"
              size="lg"
              onClick={onStartTour}
              className="w-full hover-lift"
            >
              Take a Quick Tour
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="w-full"
            >
              I'll Explore on My Own
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            You can always access the tour later from the help menu
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Progress Checklist Component
export const OnboardingChecklist: React.FC<{
  items: {
    id: string;
    label: string;
    completed: boolean;
    action?: () => void;
  }[];
  className?: string;
}> = ({ items, className }) => {
  const completedCount = items.filter((item) => item.completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('glass-morphism rounded-xl p-6', className)}
    >
      <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{completedCount} of {items.length} completed</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#1E4C8A] to-[#2E6BB8]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg transition-all',
              item.completed ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
            )}
          >
            <div className="flex items-center">
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center',
                  item.completed
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300'
                )}
              >
                {item.completed && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                )}
              </div>
              <span
                className={cn(
                  'text-sm',
                  item.completed ? 'text-gray-600 line-through' : 'text-gray-900'
                )}
              >
                {item.label}
              </span>
            </div>
            
            {!item.completed && item.action && (
              <Button
                variant="link"
                size="sm"
                onClick={item.action}
                className="text-[#1E4C8A]"
              >
                Start
              </Button>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};