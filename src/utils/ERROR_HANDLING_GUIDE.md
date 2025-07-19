# Error Handling Implementation Guide

This guide provides comprehensive instructions for implementing consistent error handling across the FDX frontend application.

## Overview

The error handling system consists of several key components:

1. **Standardized Error Utilities** (`errorHandling.ts`)
2. **Enhanced Error Boundaries** (`StandardErrorBoundary.tsx`)
3. **Form Error Handling** (`FormErrorHandler.tsx`)
4. **API Error Handling** (enhanced `api.ts`)
5. **File Upload Error Handling** (enhanced `useFileUpload.ts`)
6. **WebSocket Error Handling** (enhanced `websocket.ts`)

## Key Features

### 1. Standardized Error Classification

All errors are classified into standard types and severity levels:

```typescript
enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  UNKNOWN = 'UNKNOWN'
}

enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}
```

### 2. Retry Mechanisms

Built-in retry logic with exponential backoff:

```typescript
const result = await withRetry(
  () => apiCall(),
  {
    maxRetries: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    maxDelay: 30000,
    retryCondition: (error) => error.retryable
  }
);
```

### 3. Circuit Breaker Pattern

Prevents cascading failures:

```typescript
const circuitBreaker = new CircuitBreaker(5, 60000, 10000);
const result = await circuitBreaker.execute(async () => {
  return await apiCall();
});
```

## Implementation Guide

### 1. Component Error Boundaries

Wrap components with appropriate error boundaries:

```typescript
import { StandardErrorBoundary, PageErrorBoundary } from '@/components/ErrorBoundary';

// For page-level components
<PageErrorBoundary>
  <YourPageComponent />
</PageErrorBoundary>

// For section-level components
<StandardErrorBoundary level="section" context={{ componentName: 'UserProfile' }}>
  <UserProfileSection />
</StandardErrorBoundary>
```

### 2. API Error Handling

Use the enhanced API service with built-in error handling:

```typescript
import { api } from '@/services/api';

// Automatic retry and error handling
const data = await api.get('/users', {
  retries: 3,
  timeout: 10000
});

// File upload with progress and error handling
const uploadResult = await api.uploadFile(
  '/upload',
  file,
  {
    onProgress: (progress) => console.log(`Upload: ${progress}%`),
    onError: (error) => console.error('Upload failed:', error)
  }
);
```

### 3. Form Error Handling

Wrap forms with error handling components:

```typescript
import { ErrorAwareForm, ErrorAwareTextField } from '@/components/forms/FormErrorHandler';

<ErrorAwareForm
  onSubmit={handleSubmit}
  showErrors={true}
  errorDisplayProps={{ collapsible: true }}
>
  <ErrorAwareTextField
    name="email"
    label="Email"
    type="email"
    required
  />
  <ErrorAwareTextField
    name="password"
    label="Password"
    type="password"
    required
  />
  <Button type="submit">Submit</Button>
</ErrorAwareForm>
```

### 4. File Upload Error Handling

Use the enhanced file upload hook:

```typescript
import { useFileUpload } from '@/hooks/useFileUpload';

const {
  uploadFile,
  uploading,
  progress,
  error,
  retryCount,
  cancelUpload
} = useFileUpload({
  uploadUrl: '/api/upload',
  validation: {
    maxSize: 10, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
  },
  enableRetry: true,
  maxRetries: 3,
  enableChunking: true
});

// Upload with automatic error handling and retry
const result = await uploadFile(file);
```

### 5. WebSocket Error Handling

Use the enhanced WebSocket service:

```typescript
import { websocket } from '@/services/websocket';

// Connect with automatic reconnection
websocket.connect();

// Handle errors
websocket.on('error', (errorInfo) => {
  console.error('WebSocket error:', errorInfo.message);
});

// Send with retry
const success = await websocket.sendWithRetry('message', { data: 'test' }, 3);

// Health check
const health = await websocket.healthCheck();
console.log('WebSocket health:', health);
```

### 6. Custom Error Handling

Use the enhanced error handler hook:

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

const {
  handleError,
  handleApiError,
  handleFormError,
  handleFileUploadError,
  handleWebSocketError
} = useErrorHandler();

// Generic error handling
try {
  await someOperation();
} catch (error) {
  handleError(error, {
    context: { operation: 'someOperation' },
    retryAction: () => someOperation(),
    fallbackAction: () => showFallbackUI()
  });
}

// API-specific error handling
try {
  await api.post('/users', userData);
} catch (error) {
  handleApiError(error, {
    context: { endpoint: '/users', method: 'POST' }
  });
}
```

## Best Practices

### 1. Error Boundary Placement

- **Global Level**: Wrap the entire app for catching unhandled errors
- **Page Level**: Wrap each page component
- **Section Level**: Wrap complex sections that might fail independently
- **Component Level**: Wrap individual components with critical functionality

### 2. Error Context

Always provide meaningful context:

```typescript
const standardError = errorHandler.handle(error, {
  component: 'UserProfileForm',
  action: 'updateProfile',
  userId: user.id,
  formData: formData
});
```

### 3. User-Friendly Messages

Ensure all errors have user-friendly messages:

```typescript
// Good
error.userMessage = 'Unable to save your profile. Please try again.';

// Bad
error.userMessage = 'HTTP 500: Internal Server Error';
```

### 4. Logging and Monitoring

All errors are automatically logged with context:

```typescript
logger.error('Operation failed', {
  error: standardError.message,
  type: standardError.type,
  severity: standardError.severity,
  context: standardError.context
});
```

### 5. Retry Strategy

Only retry appropriate errors:

```typescript
const retryableErrors = [
  ErrorType.NETWORK,
  ErrorType.TIMEOUT,
  ErrorType.RATE_LIMIT,
  ErrorType.SERVER_ERROR
];

if (retryableErrors.includes(error.type)) {
  await retryOperation();
}
```

## Error Recovery Strategies

### 1. Automatic Recovery

- **Network Errors**: Retry with exponential backoff
- **Timeout Errors**: Retry with increased timeout
- **Rate Limit**: Wait and retry after rate limit reset
- **Server Errors**: Retry with circuit breaker

### 2. User-Driven Recovery

- **Reload Page**: For critical component failures
- **Clear Cache**: For data inconsistency issues
- **Logout/Login**: For authentication issues
- **Report Error**: For unknown errors

### 3. Graceful Degradation

- **Offline Mode**: Show cached data when network is unavailable
- **Fallback UI**: Show simplified interface when features fail
- **Progressive Enhancement**: Disable non-essential features

## Testing Error Handling

### 1. Unit Tests

Test error scenarios:

```typescript
describe('ErrorHandler', () => {
  it('should handle network errors correctly', async () => {
    const networkError = new Error('Network Error');
    networkError.name = 'NetworkError';
    
    const result = errorHandler.handle(networkError);
    
    expect(result.type).toBe(ErrorType.NETWORK);
    expect(result.retryable).toBe(true);
  });
});
```

### 2. Integration Tests

Test error boundaries:

```typescript
describe('ErrorBoundary', () => {
  it('should catch and display errors', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };
    
    const { getByText } = render(
      <StandardErrorBoundary>
        <ThrowError />
      </StandardErrorBoundary>
    );
    
    expect(getByText(/component error/i)).toBeInTheDocument();
  });
});
```

### 3. End-to-End Tests

Test error flows:

```typescript
describe('Error Handling E2E', () => {
  it('should handle API errors gracefully', async () => {
    // Mock API to return error
    cy.intercept('POST', '/api/users', { statusCode: 500 });
    
    // Trigger operation
    cy.get('[data-testid="submit-button"]').click();
    
    // Verify error message is shown
    cy.get('[data-testid="error-message"]').should('be.visible');
  });
});
```

## Monitoring and Analytics

### 1. Error Metrics

Track important error metrics:

- Error frequency by type
- Error severity distribution
- Recovery success rates
- User impact metrics

### 2. Error Reporting

Automatic error reporting includes:

- Error details and stack trace
- User context and session info
- Browser and device information
- Reproduction steps

### 3. Performance Impact

Monitor error handling performance:

- Error boundary render time
- Retry mechanism overhead
- Circuit breaker efficiency
- Recovery time metrics

## Configuration

### 1. Environment Variables

```env
# Error reporting
REACT_APP_ERROR_REPORTING_ENDPOINT=https://errors.example.com/report
REACT_APP_ERROR_REPORTING_ENABLED=true

# Retry configuration
REACT_APP_MAX_RETRIES=3
REACT_APP_INITIAL_RETRY_DELAY=1000
REACT_APP_MAX_RETRY_DELAY=30000

# Circuit breaker configuration
REACT_APP_CIRCUIT_BREAKER_THRESHOLD=5
REACT_APP_CIRCUIT_BREAKER_TIMEOUT=60000
```

### 2. Runtime Configuration

```typescript
// Configure error handler
errorHandler.updateConfig({
  enableReporting: true,
  enableLogging: true,
  enableUserNotification: true,
  maxRetries: 3,
  retryDelay: 1000
});
```

## Troubleshooting

### Common Issues

1. **Error boundaries not catching errors**
   - Ensure error boundaries are placed correctly
   - Check that errors are thrown in render methods

2. **Retry loops**
   - Verify retry conditions
   - Check circuit breaker configuration

3. **Memory leaks**
   - Clean up event listeners
   - Cancel pending requests on unmount

4. **Performance issues**
   - Optimize error logging
   - Implement error throttling

### Debug Tools

1. **Error Console**: View detailed error information
2. **Network Tab**: Monitor API errors and retries
3. **React DevTools**: Inspect error boundary states
4. **Performance Tab**: Monitor error handling performance

## Migration Guide

### From Legacy Error Handling

1. **Replace try/catch blocks**:
   ```typescript
   // Before
   try {
     await apiCall();
   } catch (error) {
     console.error(error);
     alert('Something went wrong');
   }
   
   // After
   try {
     await apiCall();
   } catch (error) {
     handleError(error, {
       context: { operation: 'apiCall' },
       retryAction: () => apiCall()
     });
   }
   ```

2. **Update error boundaries**:
   ```typescript
   // Before
   <ErrorBoundary>
     <Component />
   </ErrorBoundary>
   
   // After
   <StandardErrorBoundary level="component" context={{ name: 'Component' }}>
     <Component />
   </StandardErrorBoundary>
   ```

3. **Update form error handling**:
   ```typescript
   // Before
   <form onSubmit={handleSubmit}>
     {error && <div className="error">{error}</div>}
     <input name="email" />
   </form>
   
   // After
   <ErrorAwareForm onSubmit={handleSubmit}>
     <ErrorAwareTextField name="email" />
   </ErrorAwareForm>
   ```

This comprehensive error handling system ensures consistent, user-friendly error management across the entire application while providing robust recovery mechanisms and detailed monitoring capabilities.