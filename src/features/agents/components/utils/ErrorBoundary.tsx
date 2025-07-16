import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
  Chip,
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  BugReport,
  ExpandMore,
  ExpandLess,
  Home,
} from '@mui/icons-material';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  showDetails: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  level: 'page' | 'component' | 'critical';
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  showReportButton?: boolean;
  allowRetry?: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = generateErrorId();
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level } = this.props;
    const { errorId } = this.state;

    this.setState({
      errorInfo,
    });

    // Log error to monitoring service
    this.logErrorToService(error, errorInfo, errorId, level);

    // Call custom error handler if provided
    onError?.(error, errorInfo, errorId);

    // Report critical errors immediately
    if (level === 'critical') {
      this.reportCriticalError(error, errorInfo, errorId);
    }
  }

  private logErrorToService = (
    error: Error,
    errorInfo: ErrorInfo,
    errorId: string,
    level: string
  ) => {
    // In a real application, this would send to a service like Sentry, LogRocket, etc.
    const errorReport = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      buildVersion: process.env.REACT_APP_VERSION || 'unknown',
    };

    console.error('Error Boundary Caught Error:', errorReport);

    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      }).catch((reportingError) => {
        console.error('Failed to report error:', reportingError);
      });
    }
  };

  private reportCriticalError = (
    error: Error,
    errorInfo: ErrorInfo,
    errorId: string
  ) => {
    // For critical errors, we might want to:
    // 1. Send immediate alerts to the development team
    // 2. Show a more prominent error message
    // 3. Potentially redirect users to a safe page
    console.error('CRITICAL ERROR DETECTED:', {
      errorId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  };

  private getUserId = (): string => {
    // Get user ID from your auth system
    return localStorage.getItem('userId') || 'anonymous';
  };

  private getSessionId = (): string => {
    // Get session ID from your session management
    return sessionStorage.getItem('sessionId') || 'unknown';
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
        showDetails: false,
      });
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorInfo, errorId } = this.state;
    const bugReportUrl = `mailto:support@company.com?subject=Bug Report - ${errorId}&body=${encodeURIComponent(
      `Error ID: ${errorId}\n\nError: ${error?.message}\n\nPlease describe what you were doing when this error occurred:\n\n`
    )}`;
    window.open(bugReportUrl);
  };

  private toggleDetails = () => {
    this.setState(prev => ({
      showDetails: !prev.showDetails,
    }));
  };

  private renderComponentError = () => {
    const { error, errorId, showDetails, errorInfo } = this.state;
    const { allowRetry = true, showReportButton = true } = this.props;
    const canRetry = this.retryCount < this.maxRetries && allowRetry;

    return (
      <Card sx={{ m: 2, border: '2px solid', borderColor: 'error.main' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <ErrorOutline color="error" fontSize="large" />
            <Box>
              <Typography variant="h6" color="error">
                Something went wrong
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Error ID: {errorId}
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" paragraph>
            An unexpected error occurred in this component. Our team has been notified.
          </Typography>

          <Box display="flex" gap={1} mb={2}>
            {canRetry && (
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleRetry}
                size="small"
              >
                Try Again ({this.maxRetries - this.retryCount} attempts left)
              </Button>
            )}
            
            {showReportButton && (
              <Button
                variant="outlined"
                startIcon={<BugReport />}
                onClick={this.handleReportBug}
                size="small"
              >
                Report Bug
              </Button>
            )}

            <Button
              variant="text"
              startIcon={showDetails ? <ExpandLess /> : <ExpandMore />}
              onClick={this.toggleDetails}
              size="small"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </Box>

          <Collapse in={showDetails}>
            <Alert severity="error">
              <AlertTitle>Technical Details</AlertTitle>
              <Typography variant="body2" component="pre" sx={{ 
                whiteSpace: 'pre-wrap',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                maxHeight: 200,
                overflow: 'auto',
              }}>
                {error?.message}
                {error?.stack && `\n\nStack Trace:\n${error.stack}`}
                {errorInfo?.componentStack && `\n\nComponent Stack:${errorInfo.componentStack}`}
              </Typography>
            </Alert>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  private renderPageError = () => {
    const { error, errorId } = this.state;
    const { allowRetry = true } = this.props;
    const canRetry = this.retryCount < this.maxRetries && allowRetry;

    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        p={4}
        textAlign="center"
      >
        <ErrorOutline 
          sx={{ 
            fontSize: 120, 
            color: 'error.main',
            mb: 3,
          }} 
        />
        
        <Typography variant="h3" gutterBottom>
          Oops! Something went wrong
        </Typography>
        
        <Typography variant="h6" color="text.secondary" paragraph>
          We're sorry for the inconvenience. Our team has been notified.
        </Typography>

        <Chip 
          label={`Error ID: ${errorId}`} 
          variant="outlined" 
          size="small"
          sx={{ mb: 3 }}
        />

        <Box display="flex" gap={2}>
          {canRetry && (
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={this.handleRetry}
              size="large"
            >
              Try Again
            </Button>
          )}
          
          <Button
            variant="outlined"
            startIcon={<Home />}
            onClick={this.handleGoHome}
            size="large"
          >
            Go Home
          </Button>
          
          <Button
            variant="text"
            startIcon={<BugReport />}
            onClick={this.handleReportBug}
            size="large"
          >
            Report Issue
          </Button>
        </Box>
      </Box>
    );
  };

  private renderCriticalError = () => {
    const { errorId } = this.state;

    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        bgcolor="error.dark"
        color="error.contrastText"
        p={4}
        textAlign="center"
      >
        <ErrorOutline 
          sx={{ 
            fontSize: 150, 
            mb: 3,
          }} 
        />
        
        <Typography variant="h2" gutterBottom>
          Critical Error
        </Typography>
        
        <Typography variant="h5" paragraph>
          The application encountered a critical error and needs to restart.
        </Typography>

        <Typography variant="body1" paragraph>
          Error ID: {errorId}
        </Typography>

        <Button
          variant="contained"
          color="inherit"
          startIcon={<Refresh />}
          onClick={() => window.location.reload()}
          size="large"
          sx={{ mt: 2 }}
        >
          Restart Application
        </Button>
      </Box>
    );
  };

  render() {
    const { hasError } = this.state;
    const { children, fallback, level } = this.props;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      // Level-specific error UIs
      switch (level) {
        case 'critical':
          return this.renderCriticalError();
        case 'page':
          return this.renderPageError();
        case 'component':
        default:
          return this.renderComponentError();
      }
    }

    return children;
  }
}

// Helper function to generate unique error IDs
function generateErrorId(): string {
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substring(2, 8);
  return `ERR-${timestamp}-${randomString}`.toUpperCase();
}

// HOC for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary level="component" {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Hook for manual error reporting
export function useErrorReporting() {
  const reportError = (error: Error, context?: Record<string, any>) => {
    const errorId = generateErrorId();
    const errorReport = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    console.error('Manual Error Report:', errorReport);

    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      }).catch((reportingError) => {
        console.error('Failed to report error:', reportingError);
      });
    }

    return errorId;
  };

  return { reportError };
}

export default ErrorBoundary;