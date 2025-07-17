import React from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  AlertTitle,
  CircularProgress,
  Container,
  Collapse,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Warning as ExclamationTriangleIcon,
  Refresh as ArrowPathIcon,
  ExpandMore as ChevronDownIcon,
  ExpandLess as ChevronUpIcon,
  Home as HomeIcon,
  BugReport as BugAntIcon,
  Wifi as WifiIcon,
  Storage as ServerIcon,
  Code as CodeBracketIcon,
  AccessTime as ClockIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorFallbackProps, ErrorCategory } from './types';
import { getUserFriendlyMessage } from './utils';
import { useNavigate } from 'react-router-dom';

// Icon mapping for error categories
const errorIcons: Record<ErrorCategory, React.ElementType> = {
  network: WifiIcon,
  business: ServerIcon,
  rendering: CodeBracketIcon,
  async: ClockIcon,
  unknown: BugAntIcon,
};

// Color mapping for error categories
const errorColors: Record<ErrorCategory, string> = {
  network: 'warning.main',
  business: 'error.main',
  rendering: 'error.main',
  async: 'info.main',
  unknown: 'error.main',
};

// Global Error Fallback (full page)
export const GlobalErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  errorCategory,
  resetError: _resetError,
  retry,
  retryCount,
  maxRetries,
  isRetrying,
  showDetails,
  toggleDetails,
}) => {
  const navigate = useNavigate();
  const Icon = errorIcons[errorCategory];
  const errorColor = errorColors[errorCategory];
  const userMessage = getUserFriendlyMessage(error, errorCategory);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Progress indicator for retries */}
            {isRetrying && (
              <LinearProgress
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                }}
              />
            )}

            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: `${errorColor}15`,
                  borderRadius: '50%',
                }}
              >
                <Icon
                  style={{
                    width: 40,
                    height: 40,
                    color: errorColor,
                  }}
                />
              </Box>
            </motion.div>

            {/* Error Title */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 2,
              }}
            >
              Oops! Something went wrong
            </Typography>

            {/* Error Category Chip */}
            <Chip
              label={errorCategory.toUpperCase()}
              size="small"
              color={errorCategory === 'network' ? 'warning' : 'error'}
              sx={{ mb: 2 }}
            />

            {/* User-friendly message */}
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                mb: 3,
                px: 2,
              }}
            >
              {userMessage}
            </Typography>

            {/* Retry indicator */}
            {retryCount > 0 && (
              <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                <AlertTitle>Auto-retry in progress</AlertTitle>
                Attempt {retryCount} of {maxRetries}. The system is trying to recover automatically.
              </Alert>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
              <Button
                variant="contained"
                onClick={retry}
                disabled={isRetrying || retryCount >= maxRetries}
                startIcon={
                  isRetrying ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <ArrowPathIcon style={{ width: 20, height: 20 }} />
                  )
                }
                sx={{ minWidth: 140 }}
              >
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                startIcon={<HomeIcon style={{ width: 20, height: 20 }} />}
              >
                Go Home
              </Button>
            </Box>

            {/* Additional Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                size="small"
                onClick={() => window.location.reload()}
                sx={{ textTransform: 'none' }}
              >
                Refresh Page
              </Button>
              <Button
                size="small"
                onClick={() => navigate('/support')}
                sx={{ textTransform: 'none' }}
              >
                Contact Support
              </Button>
            </Box>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 3, textAlign: 'left' }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={toggleDetails}
                  endIcon={
                    showDetails ? (
                      <ChevronUpIcon style={{ width: 16, height: 16 }} />
                    ) : (
                      <ChevronDownIcon style={{ width: 16, height: 16 }} />
                    )
                  }
                  sx={{ mb: 2 }}
                >
                  {showDetails ? 'Hide' : 'Show'} Error Details
                </Button>

                <Collapse in={showDetails}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 2,
                      maxHeight: 400,
                      overflow: 'auto',
                    }}
                  >
                    <Typography variant="caption" color="error" display="block" gutterBottom>
                      {error.name}: {error.message}
                    </Typography>
                    {error.stack && (
                      <Typography
                        variant="caption"
                        component="pre"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {error.stack}
                      </Typography>
                    )}
                    {errorInfo?.componentStack && (
                      <>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                          Component Stack:
                        </Typography>
                        <Typography
                          variant="caption"
                          component="pre"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {errorInfo.componentStack}
                        </Typography>
                      </>
                    )}
                  </Paper>
                </Collapse>
              </Box>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

// Page Error Fallback
export const PageErrorFallback: React.FC<ErrorFallbackProps> = (props) => {
  return <GlobalErrorFallback {...props} />;
};

// Section Error Fallback
export const SectionErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorCategory,
  resetError: _resetError,
  retry,
  isRetrying,
}) => {
  const userMessage = getUserFriendlyMessage(error, errorCategory);
  const Icon = errorIcons[errorCategory];

  return (
    <Alert
      severity="error"
      sx={{
        m: 2,
        borderRadius: 2,
      }}
      icon={<Icon style={{ width: 24, height: 24 }} />}
      action={
        <Button
          color="inherit"
          size="small"
          onClick={retry}
          disabled={isRetrying}
          startIcon={
            isRetrying ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <ArrowPathIcon style={{ width: 16, height: 16 }} />
            )
          }
        >
          {isRetrying ? 'Retrying...' : 'Retry'}
        </Button>
      }
    >
      <AlertTitle>Section Error</AlertTitle>
      {userMessage}
    </Alert>
  );
};

// Component Error Fallback
export const ComponentErrorFallback: React.FC<ErrorFallbackProps & { isolate?: boolean }> = ({
  error,
  errorCategory,
  resetError: _resetError,
  retry,
  isRetrying,
  isolate = true,
}) => {
  const userMessage = getUserFriendlyMessage(error, errorCategory);

  if (!isolate) {
    // Silent failure - just return null
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: 'grey.50',
            borderRadius: 2,
            borderColor: 'error.light',
            borderStyle: 'dashed',
          }}
        >
          <ExclamationTriangleIcon
            style={{
              width: 32,
              height: 32,
              color: '#ef4444',
              marginBottom: 8,
            }}
          />
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Component Error
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
            {userMessage}
          </Typography>
          <Button
            size="small"
            onClick={retry}
            disabled={isRetrying}
            startIcon={
              isRetrying ? <CircularProgress size={12} color="inherit" /> : undefined
            }
          >
            {isRetrying ? 'Retrying...' : 'Retry'}
          </Button>
        </Paper>
      </motion.div>
    </AnimatePresence>
  );
};

// Feature-specific Error Fallbacks
export const RFQErrorFallback: React.FC<ErrorFallbackProps> = (props) => {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error" sx={{ mb: 3 }}>
        <AlertTitle>RFQ System Error</AlertTitle>
        The RFQ system encountered an error. Your data has been saved and you can continue from where you left off.
      </Alert>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={props.retry}>
          Retry
        </Button>
        <Button variant="outlined" onClick={() => navigate('/rfq')}>
          Back to RFQ List
        </Button>
      </Box>
    </Box>
  );
};

export const AgentErrorFallback: React.FC<ErrorFallbackProps> = (props) => {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error" sx={{ mb: 3 }}>
        <AlertTitle>Agent System Error</AlertTitle>
        The agent system is temporarily unavailable. Please try again in a few moments.
      </Alert>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={props.retry}>
          Retry
        </Button>
        <Button variant="outlined" onClick={() => navigate('/agents')}>
          Back to Agent Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export const ExpertMarketplaceErrorFallback: React.FC<ErrorFallbackProps> = (props) => {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error" sx={{ mb: 3 }}>
        <AlertTitle>Expert Marketplace Error</AlertTitle>
        Unable to load expert marketplace. Your bookings and conversations are safe.
      </Alert>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={props.retry}>
          Retry
        </Button>
        <Button variant="outlined" onClick={() => navigate('/experts')}>
          Back to Experts
        </Button>
      </Box>
    </Box>
  );
};