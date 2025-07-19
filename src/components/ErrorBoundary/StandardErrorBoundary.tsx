import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Alert, Stack  } from "@mui/material";
import { Refresh, Home, BugReport, ExpandMore, ExpandLess  } from "@mui/icons-material";
interface StandardErrorBoundaryProps {
      children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  enableReporting?: boolean;
  level?: 'page' | 'section' | 'component' | 'global';
  context?: Record<string, any>;
}

interface StandardErrorBoundaryState {
  hasError: boolean,
  error: Error | null;
  errorInfo: ErrorInfo | null,
  errorId: string | null;
  retryCount: number,
  showDetails: boolean;
}

export class StandardErrorBoundary extends Component<
  StandardErrorBoundaryProps,
  StandardErrorBoundaryState
> {
  private maxRetries = 3;
  constructor(props: StandardErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<StandardErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by StandardErrorBoundary:', error, errorInfo);
    // Update state with error info
    this.setState({
      errorInfo
     });
    // Call custom error handler if provided
    if(this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
    } catch(handlerError) {
        console.error('Error in custom error handler:', handlerError);
      }
    }
  }
  handleRetry = () => {
      if(this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({ 
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        retryCount: prevState.retryCount + 1,
        showDetails: false
      }));
    }
  };
  handleReload = () => {
      window.location.reload();
    };
  handleGoHome = () => {
    window.location.href = '/';
  };
  handleReportError = () => {
      if(this.state.error && this.state.errorInfo) {
      const errorReport = {
        error: this.state.error.message,
        stack: this.state.error.stack,
        componentStack: this.state.errorInfo.componentStack,
        level: this.props.level,
        context: this.props.context,
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      console.info('Error reported by user:', errorReport);
      alert('Error reported successfully. Thank you for helping us improve the application.');
    }
  };
  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };
  render() {
    if(this.state.hasError) {
      // Use custom fallback if provided
      if(this.props.fallback) {
        return this.props.fallback;
      }
      const isRetryable = this.state.retryCount < this.maxRetries && this.props.enableRetry !== false;
      return (
        <Paper
          elevation={3} sx={{
            p: 3,
            m: 2,
            maxWidth: 800,
            mx: 'auto',
            backgroundColor: 'background.paper'
          }}
        >
          <Stack spacing={2}>
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {this.getErrorTitle()}
              </Typography>
              <Typography variant="body2">
                {this.getErrorMessage()}
              </Typography>
            </Alert>
            {this.state.errorId && (
              <Typography variant="caption" color="text.secondary">
                Error ID: {this.state.errorId}
              </Typography>
            )}
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {isRetryable && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Refresh />} onClick={this.handleRetry} size="small"
                >
                  Try Again ({this.maxRetries - this.state.retryCount} attempts left)
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<Refresh />} onClick={this.handleReload} size="small"
              >
                Reload Page
              </Button>
              {this.props.level === 'global' && (
                <Button
                  variant="outlined"
                  startIcon={<Home />} onClick={this.handleGoHome} size="small"
                >
                  Go Home
                </Button>
              )}
              {this.props.enableReporting !== false && (
                <Button
                  variant="outlined"
                  startIcon={<BugReport />} onClick={this.handleReportError} size="small"
                >
                  Report Error
                </Button>
              )}
            </Stack>
            {process.env.NODE_ENV === 'development' && (
              <>
                <Button
                  variant="text"
                  startIcon={this.state.showDetails ? <ExpandLess /> : <ExpandMore />} onClick={this.toggleDetails} size="small"
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {this.state.showDetails ? 'Hide' : 'Show'} Error Details
                </Button>
                {this.state.showDetails && (
                  <Box
                    sx={{
                      backgroundColor: 'grey.100',
                      p: 2,
                      borderRadius: 1,
                      maxHeight: 400,
                      overflow: 'auto'
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      Error Details (Development Mode)
                    </Typography>
                    <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                      {this.state.error?.stack}
                    </Typography>
                    {this.state.errorInfo && (
                      <>
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                          Component Stack
                        </Typography>
                        <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                          {this.state.errorInfo.componentStack}
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
              </>
            )}
          </Stack>
        </Paper>
      );
    }
    return this.props.children;
  }
  private getErrorTitle(): string {
    const level = this.props.level || 'component';
    switch(level) {
      case 'global':
        return 'Application Error';
      case 'page':
        return 'Page Error';
      case 'section':
        return 'Section Error';
      case 'component':
      default:
        return 'Component Error';
    }
  }
  private getErrorMessage(): string {
    if (!this.state.error) return 'An unexpected error occurred.';
    const errorMessage = this.state.error.message.toLowerCase();
    if (errorMessage.includes('chunk') || errorMessage.includes('loading')) {
      return 'A resource failed to load. This might be due to a network issue or an application update.';
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'A network error occurred. Please check your internet connection and try again.';
    }
    if (errorMessage.includes('permission') || errorMessage.includes('forbidden')) {
      return 'You do not have permission to access this resource.';
    }
    return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
  }
}
// HOC for easy error boundary wrapping
export function withStandardErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<StandardErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <StandardErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </StandardErrorBoundary>
  );
  WrappedComponent.displayName = `withStandardErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}
// Predefined error boundary configurations
export const GlobalErrorBoundary = ({ children, ...props }: Omit<StandardErrorBoundaryProps, 'level'>) => (
  <StandardErrorBoundary level="global" {...props}>
    {children}
  </StandardErrorBoundary>
);
export const PageErrorBoundary = ({ children, ...props }: Omit<StandardErrorBoundaryProps, 'level'>) => (
  <StandardErrorBoundary level="page" {...props}>
    {children}
  </StandardErrorBoundary>
);
export const SectionErrorBoundary = ({ children, ...props }: Omit<StandardErrorBoundaryProps, 'level'>) => (
  <StandardErrorBoundary level="section" {...props}>
    {children}
  </StandardErrorBoundary>
);
export const ComponentErrorBoundary = ({ children, ...props }: Omit<StandardErrorBoundaryProps, 'level'>) => (
  <StandardErrorBoundary level="component" {...props}>
    {children}
  </StandardErrorBoundary>
);
