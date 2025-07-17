import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { logger } from '@/services/logger';
import { logErrorToService } from '@/utils/errorReporting';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error', {
      error: error.message,
      componentStack: errorInfo.componentStack,
    });
    
    // Report to error tracking service
    logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
          <Paper sx={{ maxWidth: 'md', width: '100%', p: 3, borderRadius: 2 }} elevation={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, mx: 'auto', bgcolor: 'error.light', borderRadius: '50%' }}>
              <Box component="svg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                sx={{ width: 24, height: 24, color: '#d32f2f' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </Box>
            </Box>
            
            <Typography variant="h5" sx={{ mt: 2, fontWeight: 600, textAlign: 'center', color: 'text.primary' }}>
              Something went wrong
            </Typography>
            
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', color: 'text.secondary' }}>
              An unexpected error occurred. Please try refreshing the page.
            </Typography>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box component="details" sx={{ marginTop: 16 }}>
                <Box component="summary" sx={{ cursor: 'pointer', fontSize: '0.875rem', color: '#757575' }}>
                  Error details
                </Box>
                <Box sx={{ mt: 1, p: 1.5, bgcolor: 'grey.100', borderRadius: 1, fontSize: '0.75rem', overflow: 'auto' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{this.state.error.toString()}</Typography>
                  {this.state.errorInfo && (
                    <Box component="pre" sx={{ marginTop: 8 }}>{this.state.errorInfo.componentStack}</Box>
                  )}
                </Box>
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}