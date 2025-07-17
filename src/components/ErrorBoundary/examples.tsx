import React from 'react';
import { EnhancedErrorBoundary, PageErrorBoundary, SectionErrorBoundary, ComponentErrorBoundary, withAsyncErrorHandling, withRetry, withTimeout, useAsyncError, useErrorContext, useErrorRecovery } from './index';
import { Alert, Button, Box } from '@mui/material';

// Example 1: Dashboard with multiple sections
export const DashboardExample = () => {
  return (
    <PageErrorBoundary>
      <Box sx={{ p: 3 }}>
        <h1>Dashboard</h1>
        
        {/* Each section has its own error boundary */}
        <SectionErrorBoundary>
          <SalesMetricsSection />
        </SectionErrorBoundary>

        <SectionErrorBoundary>
          <InventorySection />
        </SectionErrorBoundary>

        <SectionErrorBoundary>
          <OrdersSection />
        </SectionErrorBoundary>
      </Box>
    </PageErrorBoundary>
  );
};

// Example 2: Critical form with custom error handling
export const CriticalFormExample = () => {
  const { reportError } = useErrorContext();
  const throwError = useAsyncError();

  const handleSubmit = async (data: any) => {
    try {
      const result = await withAsyncErrorHandling(
        async () => {
          // Simulate API call with timeout
          const response = await withTimeout(
            fetch('/api/submit', {
              method: 'POST',
              body: JSON.stringify(data),
            }),
            5000 // 5 second timeout
          );
          
          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
          }
          
          return response.json();
        },
        {
          onError: (error) => {
            reportError(error, { 
              form: 'critical-form',
              data: data 
            });
          },
          showToast: true,
          toastMessage: 'Failed to submit form. Please try again.',
        }
      );

      return result;
    } catch (error) {
      // This will be caught by the error boundary
      throwError(error as Error);
    }
  };

  return (
    <EnhancedErrorBoundary
      level="section"
      fallback={
        <Alert severity="error">
          Form submission failed. Your data has been saved locally.
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </Alert>
      }
      enableAutoRetry={false} // Don't auto-retry form submissions
    >
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>
    </EnhancedErrorBoundary>
  );
};

// Example 3: Data fetching with retry
export const DataFetchingExample = () => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch with retry logic
        const result = await withRetry(
          async () => {
            const response = await fetch('/api/data');
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
          },
          {
            maxRetries: 3,
            exponentialBackoff: true,
            shouldRetry: (error, _attempt) => {
              // Only retry on network errors
              return error.message.includes('fetch') || 
                     error.message.includes('HTTP 5');
            },
          }
        );

        setData(result);
      } catch (error) {
        // Error will be caught by error boundary
        throw error;
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ComponentErrorBoundary isolate={true}>
      <DataDisplay data={data} />
    </ComponentErrorBoundary>
  );
};

// Example 4: Feature-specific error boundaries
export const RFQFeatureExample = () => {
  return (
    <SectionErrorBoundary>
      <Box sx={{ p: 3 }}>
        <h2>RFQ Management</h2>
        <div>RFQ List Component</div>
        <div>RFQ Form Component</div>
      </Box>
    </SectionErrorBoundary>
  );
};

export const AgentFeatureExample = () => {
  return (
    <SectionErrorBoundary>
      <Box sx={{ p: 3 }}>
        <h2>Agent Dashboard</h2>
        <div>Agent Stats Component</div>
        <div>Lead Pipeline Component</div>
      </Box>
    </SectionErrorBoundary>
  );
};

// Example 5: Custom error fallback component
const CustomErrorFallback = ({ error, retry, resetError }: { error: Error, retry: () => void, resetError: () => void }) => {
  const isNetworkError = error.message.includes('Network');
  
  return (
    <Box
      sx={{
        p: 4,
        textAlign: 'center',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <h3>Oops! Something went wrong</h3>
      {isNetworkError ? (
        <p>It looks like you're offline. Please check your connection.</p>
      ) : (
        <p>An unexpected error occurred. We've been notified.</p>
      )}
      
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button variant="contained" onClick={retry}>
          Try Again
        </Button>
        <Button variant="outlined" onClick={resetError}>
          Dismiss
        </Button>
      </Box>
    </Box>
  );
};

export const CustomFallbackExample = () => {
  return (
    <EnhancedErrorBoundary
      level="section"
      fallbackComponent={CustomErrorFallback}
    >
      <RiskyComponent />
    </EnhancedErrorBoundary>
  );
};

// Example 6: Error recovery tracking
export const ErrorRecoveryExample = () => {
  const { trackErrorStart, trackErrorRecovery } = useErrorRecovery();
  
  const handleRiskyOperation = async (): Promise<React.ReactElement | void> => {
    trackErrorStart();
    
    try {
      await riskyOperation();
    } catch (error) {
      // Track that we recovered from this error
      trackErrorRecovery(error as Error, {
        operation: 'risky-operation',
        recovered: true,
      });
      
      // Show fallback UI
      return <FallbackUI />;
    }
  };

  return (
    <SectionErrorBoundary>
      <RiskySection onAction={handleRiskyOperation} />
    </SectionErrorBoundary>
  );
};

// Placeholder components for examples
const SalesMetricsSection = () => <div>Sales Metrics</div>;
const InventorySection = () => <div>Inventory</div>;
const OrdersSection = () => <div>Orders</div>;
const DataDisplay = ({ data }: { data: any }) => <div>Data: {JSON.stringify(data)}</div>;
const RFQList = () => <div>RFQ List</div>;
const RFQForm = () => <div>RFQ Form</div>;
const AgentStats = () => <div>Agent Stats</div>;
const LeadPipeline = () => <div>Lead Pipeline</div>;
const RiskyComponent = () => <div>Risky Component</div>;
const FallbackUI = () => <div>Fallback UI</div>;
const RiskySection = ({ onAction }: { onAction: () => void }) => <div onClick={onAction}>Risky Section</div>;

// Utility functions for examples
const riskyOperation = async () => {
  // Simulated risky operation
  if (Math.random() > 0.5) {
    throw new Error('Random failure');
  }
  return { success: true };
};

// Hook usage example
export function useErrorHandling() {
  const { reportError } = useErrorContext();
  const throwError = useAsyncError();

  const handleError = React.useCallback((error: Error, context?: any) => {
    // Report to monitoring
    reportError(error, context);
    
    // Optionally throw to error boundary
    if (error.message.includes('Critical')) {
      throwError(error);
    }
  }, [reportError, throwError]);

  return { handleError };
}