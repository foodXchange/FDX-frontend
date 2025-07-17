import React, { Component, ReactNode, Suspense } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Alert, 
  AlertTitle,
  CircularProgress,
  Container,
  Collapse
} from '@mui/material';
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { logger } from '@/services/logger';
import { SkeletonLoader } from '@components/ui/SkeletonLoader';
import { ERROR_MESSAGES } from '@/constants';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
  showErrorDetails?: boolean;
  enableAutoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
  retryCount: number;
  isRetrying: boolean;
  showDetails: boolean;
}

export class AsyncErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null;
  private previousResetKeys: Array<string | number> = [];
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      retryCount: 0,
      isRetrying: false,
      showDetails: false,
    };
    this.previousResetKeys = props.resetKeys || [];
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      isRetrying: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { 
      onError, 
      level = 'component',
      enableAutoRetry = true,
      maxRetries = 3,
      retryDelay = 1000
    } = this.props;
    const { errorCount, retryCount } = this.state;

    // Enhanced error logging with more context
    logger.error(`${level} Error Boundary caught error`, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      context: {
        level,
        errorCount: errorCount + 1,
        retryCount,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      },
    });

    // Call custom error handler
    onError?.(error, errorInfo);

    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Auto-retry logic for recoverable errors
    if (enableAutoRetry && 
        retryCount < maxRetries && 
        this.shouldAutoRetry(error)) {
      this.scheduleRetry(retryDelay * Math.pow(2, retryCount)); // Exponential backoff
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      // Reset on prop changes if enabled
      if (resetOnPropsChange && prevProps.children !== this.props.children) {
        this.resetErrorBoundary();
      }

      // Reset on resetKeys change
      if (resetKeys && this.hasResetKeysChanged(resetKeys)) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    this.clearTimeouts();
  }

  private clearTimeouts() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }
  }

  private hasResetKeysChanged(resetKeys: Array<string | number>): boolean {
    if (resetKeys.length !== this.previousResetKeys.length) {
      this.previousResetKeys = [...resetKeys];
      return true;
    }
    
    for (let i = 0; i < resetKeys.length; i++) {
      if (resetKeys[i] !== this.previousResetKeys[i]) {
        this.previousResetKeys = [...resetKeys];
        return true;
      }
    }
    
    return false;
  }

  private shouldAutoRetry(error: Error): boolean {
    // Retry on network errors, chunk load errors, or temporary failures
    const retryableErrors = [
      'ChunkLoadError',
      'NetworkError',
      'TimeoutError',
      'Loading chunk',
      'Failed to fetch',
      'ERR_NETWORK',
      'ERR_INTERNET_DISCONNECTED',
      'Loading CSS chunk',
    ];
    
    return retryableErrors.some(errorType => 
      error.name.includes(errorType) || 
      error.message.includes(errorType) ||
      error.stack?.includes(errorType)
    );
  }

  private scheduleRetry(delay: number) {
    this.setState({ isRetrying: true });
    
    this.retryTimeoutId = setTimeout(() => {
      logger.info('Auto-retrying after error', { 
        delay, 
        retryCount: this.state.retryCount + 1,
        maxRetries: this.props.maxRetries || 3
      });
      
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
        isRetrying: false,
      }));
    }, delay);
  }

  private resetErrorBoundary = () => {
    this.clearTimeouts();
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      retryCount: 0,
      isRetrying: false,
      showDetails: false,
    });
  };

  private toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  private getErrorMessage(error: Error): string {
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return ERROR_MESSAGES.network;
    }
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return ERROR_MESSAGES.network;
    }
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return ERROR_MESSAGES.timeout;
    }
    return ERROR_MESSAGES.generic;
  }

  render() {
    const { 
      hasError, 
      error, 
      errorCount, 
      retryCount, 
      isRetrying, 
      showDetails, 
      errorInfo 
    } = this.state;
    const { 
      children, 
      fallback, 
      isolate, 
      level = 'component',
      showErrorDetails = false,
      maxRetries = 3
    } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default fallback based on level
      return (
        <Box sx={{ width: '100%', height: '100%' }}>
          {level === 'page' ? (
            <PageErrorFallback
              error={error}
              errorInfo={errorInfo}
              resetError={this.resetErrorBoundary}
              errorCount={errorCount}
              retryCount={retryCount}
              maxRetries={maxRetries}
              isRetrying={isRetrying}
              showDetails={showDetails}
              toggleDetails={this.toggleDetails}
              showErrorDetails={showErrorDetails}
              getErrorMessage={this.getErrorMessage}
            />
          ) : level === 'section' ? (
            <SectionErrorFallback
              error={error}
              errorInfo={errorInfo}
              resetError={this.resetErrorBoundary}
              errorCount={errorCount}
              retryCount={retryCount}
              maxRetries={maxRetries}
              isRetrying={isRetrying}
              showDetails={showDetails}
              toggleDetails={this.toggleDetails}
              showErrorDetails={showErrorDetails}
              getErrorMessage={this.getErrorMessage}
            />
          ) : (
            <ComponentErrorFallback
              error={error}
              errorInfo={errorInfo}
              resetError={this.resetErrorBoundary}
              errorCount={errorCount}
              retryCount={retryCount}
              maxRetries={maxRetries}
              isRetrying={isRetrying}
              isolate={isolate}
              getErrorMessage={this.getErrorMessage}
            />
          )}
        </Box>
      );
    }

    // Wrap children in Suspense for lazy-loaded components
    return (
      <Suspense fallback={<LoadingFallback level={level} />}>
        {children}
      </Suspense>
    );
  }
}

// Enhanced Fallback Components
interface FallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo | null;
  resetError: () => void;
  errorCount: number;
  retryCount: number;
  maxRetries: number;
  isRetrying: boolean;
  showDetails?: boolean;
  toggleDetails?: () => void;
  showErrorDetails?: boolean;
  getErrorMessage: (error: Error) => string;
  isolate?: boolean;
}

const PageErrorFallback: React.FC<FallbackProps> = ({ 
  error, 
  errorInfo,
  resetError, 
  errorCount, 
  retryCount, 
  maxRetries,
  isRetrying,
  showDetails,
  toggleDetails,
  showErrorDetails,
  getErrorMessage
}) => {
  
  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 3
          }}
        >
          <Box 
            sx={{ 
              width: 64, 
              height: 64, 
              mx: 'auto', 
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'error.light',
              borderRadius: '50%'
            }}
          >
            <Box
              component={ExclamationTriangleIcon}
              sx={{ 
                width: 32, 
                height: 32, 
                color: 'error.main' 
              }} 
            />
          </Box>
          
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: 'text.primary', 
              mb: 2
            }}
          >
            Something went wrong
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary', 
              mb: 3
            }}
          >
            {getErrorMessage(error)}
          </Typography>

          {errorCount > 2 && (
            <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
              <AlertTitle>Multiple errors detected</AlertTitle>
              This error has occurred {errorCount} times. You may need to refresh the page or contact support.
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
            <Button
              variant="contained"
              onClick={resetError}
              disabled={isRetrying || retryCount >= maxRetries}
              startIcon={isRetrying ? <CircularProgress size={16} /> : <Box component={ArrowPathIcon} sx={{ width: 20, height: 20 }} />}
              sx={{ minWidth: 120 }}
            >
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              disabled={isRetrying}
            >
              Refresh Page
            </Button>
          </Box>

          {retryCount > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Retry attempt {retryCount} of {maxRetries}
            </Typography>
          )}

          {showErrorDetails && (
            <Box sx={{ textAlign: 'left' }}>
              <Button
                variant="text"
                size="small"
                onClick={toggleDetails}
                endIcon={showDetails ? <Box component={ChevronUpIcon} sx={{ width: 16, height: 16 }} /> : <Box component={ChevronDownIcon} sx={{ width: 16, height: 16 }} />}
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
                    borderRadius: 2
                  }}
                >
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Error: {error.name}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
                    {error.message}
                  </Typography>
                  {errorInfo && (
                    <>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Component Stack:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {errorInfo.componentStack}
                      </Typography>
                    </>
                  )}
                </Paper>
              </Collapse>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

const SectionErrorFallback: React.FC<FallbackProps> = ({ 
  error, 
  resetError, 
  isRetrying,
  getErrorMessage
}) => (
  <Alert 
    severity="error" 
    sx={{ 
      m: 2,
      borderRadius: 2
    }}
    action={
      <Button 
        color="inherit" 
        size="small" 
        onClick={resetError}
        disabled={isRetrying}
        startIcon={isRetrying ? <CircularProgress size={16} /> : <Box component={ArrowPathIcon} sx={{ width: 16, height: 16 }} />}
      >
        {isRetrying ? 'Retrying...' : 'Retry'}
      </Button>
    }
  >
    <AlertTitle>Section Error</AlertTitle>
    {getErrorMessage(error)}
  </Alert>
);

const ComponentErrorFallback: React.FC<FallbackProps> = ({ 
  resetError, 
  isRetrying,
  isolate
}) => {
  if (isolate) {
    return (
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 2, 
          textAlign: 'center',
          bgcolor: 'grey.50',
          borderRadius: 2
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Component unavailable
        </Typography>
        <Button
          size="small"
          onClick={resetError}
          disabled={isRetrying}
          startIcon={isRetrying ? <CircularProgress size={12} /> : undefined}
        >
          {isRetrying ? 'Retrying...' : 'Retry'}
        </Button>
      </Paper>
    );
  }

  return null; // Silent failure for non-isolated components
};

const LoadingFallback: React.FC<{ level: string }> = ({ level }) => {
  if (level === 'page') {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}
      >
        <SkeletonLoader variant="rectangular" width={400} height={300} />
      </Box>
    );
  }

  if (level === 'section') {
    return (
      <Box sx={{ m: 2 }}>
        <SkeletonLoader variant="rectangular" width="100%" height={256} />
      </Box>
    );
  }

  return <SkeletonLoader variant="rectangular" width="100%" height={80} />;
};

// Export enhanced error boundary with better defaults
export const ErrorBoundary: React.FC<{
  children: ReactNode;
  level?: 'page' | 'section' | 'component';
  showErrorDetails?: boolean;
  enableAutoRetry?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}> = ({ 
  children, 
  level = 'component',
  showErrorDetails = process.env.NODE_ENV === 'development',
  enableAutoRetry = true,
  onError
}) => (
  <AsyncErrorBoundary
    level={level}
    showErrorDetails={showErrorDetails}
    enableAutoRetry={enableAutoRetry}
    onError={onError}
    maxRetries={3}
    retryDelay={1000}
  >
    {children}
  </AsyncErrorBoundary>
);

export default AsyncErrorBoundary;