import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Backdrop,
  Stack,
  LinearProgress,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider
} from '@mui/material';
import {
  Close as XMarkIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Check as CheckIcon
} from '@mui/icons-material';

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
      <Backdrop open={true} sx={{ zIndex: 2000 }}>
        {/* Backdrop with spotlight effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)'
          }}
          onClick={handleSkip}
        >
          {targetRect && currentStepData.highlight && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                position: 'absolute',
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                borderRadius: 8,
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
          style={{
            position: 'absolute',
            maxWidth: 320,
            zIndex: 2001,
            ...getTooltipPosition()
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 6 }}>
            {/* Close button */}
            <IconButton
              onClick={handleSkip}
              sx={{ position: 'absolute', top: 8, right: 8 }}
              size="small"
            >
              <XMarkIcon sx={{ fontSize: 20 }} />
            </IconButton>

            {/* Step indicator */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              {steps.map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: index === currentStep ? 32 : 8,
                    height: 8,
                    borderRadius: 1,
                    transition: 'all 0.3s ease',
                    background: index === currentStep 
                      ? 'linear-gradient(90deg, #1E4C8A, #2E6BB8)'
                      : index < currentStep 
                        ? '#1E4C8A' 
                        : 'grey.300'
                  }}
                />
              ))}
            </Box>

            {/* Content */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'grey.900', mb: 1 }}>
                {currentStepData.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                {currentStepData.content}
              </Typography>
            </Box>

            {/* Custom action */}
            {currentStepData.action && (
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={currentStepData.action.onClick}
                  fullWidth
                  sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
                >
                  {currentStepData.action.label}
                </Button>
              </Box>
            )}

            {/* Navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Button
                variant="text"
                size="small"
                onClick={handlePrevious}
                disabled={isFirstStep}
                startIcon={<ChevronLeftIcon />}
                sx={{ visibility: isFirstStep ? 'hidden' : 'visible' }}
              >
                Previous
              </Button>

              <Button
                variant="text"
                size="small"
                onClick={handleSkip}
                sx={{ color: 'grey.500' }}
              >
                Skip tour
              </Button>

              <Button
                variant="contained"
                size="small"
                onClick={handleNext}
                endIcon={!isLastStep ? <ChevronRightIcon /> : null}
              >
                {isLastStep ? 'Finish' : 'Next'}
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Backdrop>
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
      <Backdrop open={true} sx={{ zIndex: 1300 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Paper sx={{ p: 4, maxWidth: 480, borderRadius: 3, textAlign: 'center' }}>
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.5,
                }}
                style={{ fontSize: '4rem', marginBottom: 24 }}
              >
                👋
              </motion.div>

              <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                Welcome to FoodXchange{userName ? `, ${userName}` : ''}!
              </Typography>

              <Typography variant="body1" sx={{ color: 'grey.600', mb: 4 }}>
                We're excited to have you here. FoodXchange is your all-in-one B2B food commerce platform 
                designed to streamline procurement, ensure compliance, and connect you with trusted suppliers.
              </Typography>

              <Stack spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={onStartTour}
                  fullWidth
                >
                  Take a Quick Tour
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={onClose}
                  fullWidth
                >
                  I'll Explore on My Own
                </Button>
              </Stack>

              <Typography variant="caption" sx={{ color: 'grey.500', mt: 3, display: 'block' }}>
                You can always access the tour later from the help menu
              </Typography>
            </Paper>
          </motion.div>
        </motion.div>
      </Backdrop>
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
    >
      <Paper 
        sx={{ 
          p: 4, 
          borderRadius: 3, 
          backdropFilter: 'blur(10px)', 
          bgcolor: 'rgba(255, 255, 255, 0.9)' 
        }}
        className={className || ''}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          Getting Started
        </Typography>
        
        {/* Progress bar */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ color: 'grey.600' }}>
              {completedCount} of {items.length} completed
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.600' }}>
              {Math.round(progress)}%
            </Typography>
          </Box>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 8, borderRadius: 1 }}
            />
          </motion.div>
        </Box>

        {/* Checklist items */}
        <List>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ListItem
                sx={{
                  bgcolor: item.completed ? 'success.light' : 'grey.50',
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    bgcolor: item.completed ? 'success.light' : 'grey.100'
                  }
                }}
              >
                <ListItemIcon>
                  <Checkbox
                    checked={item.completed}
                    readOnly
                    sx={{
                      color: item.completed ? 'success.main' : 'grey.300',
                      '&.Mui-checked': {
                        color: 'success.main'
                      }
                    }}
                    icon={<Box sx={{ width: 20, height: 20, border: 2, borderColor: 'grey.300', borderRadius: '50%' }} />}
                    checkedIcon={
                      <Box sx={{ width: 20, height: 20, bgcolor: 'success.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <CheckIcon sx={{ color: 'white', fontSize: 16 }} />
                        </motion.div>
                      </Box>
                    }
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography 
                      variant="body2" 
                      sx={{
                        textDecoration: item.completed ? 'line-through' : 'none',
                        color: item.completed ? 'grey.600' : 'grey.900'
                      }}
                    >
                      {item.label}
                    </Typography>
                  }
                />
                {!item.completed && item.action && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={item.action}
                    sx={{ color: 'primary.main' }}
                  >
                    Start
                  </Button>
                )}
              </ListItem>
            </motion.div>
          ))}
        </List>
      </Paper>
    </motion.div>
  );
};