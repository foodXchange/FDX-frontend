import { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Button, Stack } from '@mui/material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class LandingErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Landing page error caught:', error, errorInfo);
    
    // Log to error reporting service
    this.logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Integration with error reporting service like Sentry
    // This is where you'd send the error to your monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
      console.error('Production error:', error, errorInfo);
    }
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReportError = () => {
    // Allow users to report the error
    const subject = encodeURIComponent('Landing Page Error Report');
    const body = encodeURIComponent(`
Error: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
    `);
    
    window.open(`mailto:support@foodxchange.com?subject=${subject}&body=${body}`);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box sx={{ p: 2, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ bgcolor: 'white', p: 4, maxWidth: 400, borderRadius: 2, boxShadow: 3, textAlign: 'center' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
              >
                <Box sx={{ bgcolor: 'error.light', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: 64, height: 64, mx: 'auto', mb: 3 }}>
                  <ExclamationTriangleIcon sx={{ fontSize: 32, color: 'error.main' }} />
                </Box>
              </motion.div>
              
              <Typography variant="h5" sx={{ color: 'grey.900', mb: 2, fontWeight: 'bold' }}>
                Something went wrong
              </Typography>
              
              <Typography variant="body2" sx={{ color: 'grey.600', mb: 4, lineHeight: 1.6 }}>
                We encountered an unexpected error while loading this page. 
                Please try refreshing or contact support if the problem persists.
              </Typography>
              
              <Stack spacing={2}>
                <Button
                  component={motion.button}
                  onClick={this.handleRetry}
                  variant="contained"
                  fullWidth
                  sx={{ borderRadius: 2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Try Again
                </Button>
                
                <Button
                  component={motion.button}
                  onClick={this.handleReportError}
                  fullWidth
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Report Error
                </Button>
              </Stack>
              
              {process.env.NODE_ENV === 'development' && (
                <Box sx={{ mt: 3, textAlign: 'left' }}>
                  <details>
                    <summary sx={{ fontSize: '0.875rem', color: '#9ca3af', cursor: 'pointer' }}>
                      Error Details (Development Only)
                    </summary>
                    <Box component="pre" sx={{ mt: 1, fontSize: '0.75rem', color: 'error.main', bgcolor: 'error.light', p: 1, borderRadius: 1, overflow: 'auto' }}>
                      {this.state.error?.message}
                      {this.state.error?.stack}
                    </Box>
                  </details>
                </Box>
              )}
            </Box>
          </motion.div>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default LandingErrorBoundary;