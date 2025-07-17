# FDX Frontend Error Boundary System Guide

## Overview

The FDX Frontend application implements a comprehensive error boundary system that provides robust error handling, user-friendly error messages, and developer debugging capabilities. The system is built on React's Error Boundary API and enhanced with Material-UI components.

## Architecture

### Error Boundary Hierarchy

1. **Global Error Boundary** - Catches all unhandled errors in the application
2. **Page Error Boundaries** - Protect individual pages/routes
3. **Section Error Boundaries** - Isolate errors in page sections
4. **Component Error Boundaries** - Fine-grained error isolation

### Error Categories

- **Network Errors** - API failures, timeouts, connection issues
- **Business Errors** - Validation, authorization, business logic failures
- **Rendering Errors** - React component errors, UI failures
- **Async Errors** - Promise rejections, async operation failures
- **Unknown Errors** - Uncategorized errors

## Usage

### Basic Error Boundary

```tsx
import { PageErrorBoundary } from '@/components/ErrorBoundary';

function MyPage() {
  return (
    <PageErrorBoundary>
      <YourPageContent />
    </PageErrorBoundary>
  );
}
```

### With Custom Fallback

```tsx
import { EnhancedErrorBoundary } from '@/components/ErrorBoundary';

function MyComponent() {
  return (
    <EnhancedErrorBoundary
      level="section"
      fallback={<CustomErrorComponent />}
      onError={(error, errorInfo, category) => {
        console.log('Error occurred:', error, 'Category:', category);
      }}
    >
      <YourContent />
    </EnhancedErrorBoundary>
  );
}
```

### Feature-Specific Error Boundaries

```tsx
import { RFQErrorBoundary, AgentErrorBoundary } from '@/components/ErrorBoundary';

// RFQ Feature
<RFQErrorBoundary>
  <RFQManagement />
</RFQErrorBoundary>

// Agent Feature
<AgentErrorBoundary>
  <AgentDashboard />
</AgentErrorBoundary>
```

### Async Error Handling

```tsx
import { withAsyncErrorHandling } from '@/components/ErrorBoundary';

// Wrap async operations
const fetchData = async () => {
  const result = await withAsyncErrorHandling(
    async () => {
      const response = await api.getData();
      return response.data;
    },
    {
      fallbackValue: [],
      showToast: true,
      toastMessage: 'Failed to load data',
    }
  );
  return result || [];
};
```

### Using Error Context

```tsx
import { useErrorContext, useErrorMetrics } from '@/components/ErrorBoundary';

function ErrorStats() {
  const { errorHistory, reportError } = useErrorContext();
  const metrics = useErrorMetrics();

  // Report custom error
  const handleError = (error: Error) => {
    reportError(error, { 
      context: 'user-action',
      userId: currentUser.id 
    });
  };

  return (
    <div>
      <p>Total Errors: {metrics.totalErrors}</p>
      <p>Recovery Rate: {(metrics.recoveryRate * 100).toFixed(1)}%</p>
    </div>
  );
}
```

## Features

### Auto-Retry Mechanism

Errors are automatically retried based on their category:
- Network errors: 3 retries with exponential backoff
- Chunk load errors: Immediate retry
- Async errors: Configurable retry strategy

### Error Reporting

Errors are automatically reported to monitoring services with:
- Error categorization
- User context
- Browser information
- Component stack traces
- Performance metrics

### User Experience

- Clear, user-friendly error messages
- Recovery options (retry, refresh, go home)
- Loading states during retries
- Accessibility-compliant error displays

### Developer Experience

- Detailed error information in development
- Component stack traces
- Error monitoring dashboard
- Integration with browser DevTools

## Best Practices

### 1. Choose the Right Error Boundary Level

```tsx
// Global - for critical app-wide errors
<GlobalErrorBoundary>
  <App />
</GlobalErrorBoundary>

// Page - for route-level errors
<PageErrorBoundary>
  <DashboardPage />
</PageErrorBoundary>

// Section - for feature sections
<SectionErrorBoundary>
  <DataTable />
</SectionErrorBoundary>

// Component - for isolated components
<ComponentErrorBoundary isolate={true}>
  <RiskyComponent />
</ComponentErrorBoundary>
```

### 2. Handle Async Errors

```tsx
// Use AsyncErrorHandler at app level
<AsyncErrorHandler>
  <YourApp />
</AsyncErrorHandler>

// Use withRetry for critical operations
const data = await withRetry(
  () => api.fetchCriticalData(),
  { maxRetries: 5, exponentialBackoff: true }
);
```

### 3. Provide Context

```tsx
<EnhancedErrorBoundary
  level="section"
  onError={(error, errorInfo, category) => {
    // Log additional context
    logger.error('Section error', {
      feature: 'user-management',
      action: 'delete-user',
      error,
    });
  }}
>
  <UserManagement />
</EnhancedErrorBoundary>
```

### 4. Custom Error Messages

```tsx
const CustomFallback = ({ error, retry }) => (
  <Alert severity="error">
    <AlertTitle>Data Loading Failed</AlertTitle>
    Unable to load user data. This might be due to network issues.
    <Button onClick={retry}>Try Again</Button>
  </Alert>
);

<EnhancedErrorBoundary fallback={<CustomFallback />}>
  <UserData />
</EnhancedErrorBoundary>
```

## Configuration

### Environment Variables

```env
# Enable error reporting to external service
REACT_APP_ERROR_REPORTING_ENDPOINT=https://api.example.com/errors

# Log level
REACT_APP_LOG_LEVEL=error

# Enable development features
NODE_ENV=development
```

### Error Boundary Props

```tsx
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error, errorInfo) => ReactNode);
  onError?: (error, errorInfo, category) => void;
  onReset?: () => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  level?: 'global' | 'page' | 'section' | 'component';
  showErrorDetails?: boolean;
  enableReporting?: boolean;
  enableAutoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  fallbackComponent?: React.ComponentType<ErrorFallbackProps>;
}
```

## Testing

### Testing Error Boundaries

```tsx
import { render, screen } from '@testing-library/react';
import { PageErrorBoundary } from '@/components/ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

test('renders error fallback', () => {
  render(
    <PageErrorBoundary>
      <ThrowError />
    </PageErrorBoundary>
  );
  
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});
```

### Simulating Errors

```tsx
// In development, use ErrorMonitoringDashboard
// Or programmatically:
const { reportError } = useErrorContext();
reportError(new Error('Simulated error'), { test: true });
```

## Monitoring

The error boundary system integrates with:
- Application Insights (Azure)
- Custom error reporting endpoints
- Browser console logging
- Development error dashboard

## Accessibility

All error displays are accessible with:
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- High contrast mode support
- Focus management

## Performance

The error boundary system is optimized for:
- Minimal overhead in production
- Lazy loading of error UI components
- Efficient error batching and reporting
- Memory-conscious error history management