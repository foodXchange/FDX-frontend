import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ErrorHistoryEntry, ErrorContextValue, ErrorCategory, ErrorMetrics } from './types';
import { categorizeError, generateErrorId } from './utils';
import { logger } from '@/services/logger';

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
  maxHistorySize?: number;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ 
  children, 
  maxHistorySize = 50 
}) => {
  const [errorHistory, setErrorHistory] = useState<ErrorHistoryEntry[]>([]);

  const reportError = useCallback((error: Error, context?: Record<string, any>) => {
    const category = categorizeError(error);
    const errorEntry: ErrorHistoryEntry = {
      id: generateErrorId(),
      error,
      errorInfo: null,
      category,
      timestamp: Date.now(),
      url: window.location.href,
      userId: getUserId(),
      context,
    };

    // Log the error
    logger.error('Error reported to context', {
      errorId: errorEntry.id,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      category,
      context,
    });

    // Add to history
    setErrorHistory(prev => {
      const newHistory = [errorEntry, ...prev];
      // Keep only the most recent errors
      return newHistory.slice(0, maxHistorySize);
    });
  }, [maxHistorySize]);

  const clearErrorHistory = useCallback(() => {
    setErrorHistory([]);
    logger.info('Error history cleared');
  }, []);

  const value: ErrorContextValue = {
    errorHistory,
    reportError,
    clearErrorHistory,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

// Hook to use error context
export function useErrorContext() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
}

// Hook to get error metrics
export function useErrorMetrics(): ErrorMetrics {
  const { errorHistory } = useErrorContext();

  return React.useMemo(() => {
    const totalErrors = errorHistory.length;
    const errorsByCategory: Record<ErrorCategory, number> = {
      network: 0,
      business: 0,
      rendering: 0,
      async: 0,
      unknown: 0,
    };
    const errorsByPage: Record<string, number> = {};
    const recoveredErrors = errorHistory.filter(e => e.context?.recovered).length;

    errorHistory.forEach(entry => {
      // Count by category
      errorsByCategory[entry.category]++;

      // Count by page
      const pathname = new URL(entry.url).pathname;
      errorsByPage[pathname] = (errorsByPage[pathname] || 0) + 1;
    });

    const recoveryRate = totalErrors > 0 ? recoveredErrors / totalErrors : 0;

    // Calculate mean time to recovery (if recovery times are tracked)
    const recoveryTimes = errorHistory
      .filter(e => e.context?.recoveryTime)
      .map(e => e.context!.recoveryTime as number);
    
    const meanTimeToRecovery = recoveryTimes.length > 0
      ? recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length
      : 0;

    return {
      totalErrors,
      errorsByCategory,
      errorsByPage,
      recoveryRate,
      meanTimeToRecovery,
    };
  }, [errorHistory]);
}

// Hook to track error recovery
export function useErrorRecovery() {
  const { reportError } = useErrorContext();
  const [errorStartTime, setErrorStartTime] = useState<number | null>(null);

  const trackErrorStart = useCallback(() => {
    setErrorStartTime(Date.now());
  }, []);

  const trackErrorRecovery = useCallback((error: Error, context?: Record<string, any>) => {
    const recoveryTime = errorStartTime ? Date.now() - errorStartTime : undefined;
    
    reportError(error, {
      ...context,
      recovered: true,
      recoveryTime,
    });

    setErrorStartTime(null);
  }, [errorStartTime, reportError]);

  return {
    trackErrorStart,
    trackErrorRecovery,
  };
}

// Utility function to get user ID
function getUserId(): string | undefined {
  try {
    const authData = localStorage.getItem('auth-store');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.state?.user?.id;
    }
  } catch {
    // Ignore errors
  }
  return undefined;
}

// Error monitoring dashboard component
export const ErrorMonitoringDashboard: React.FC = () => {
  const { errorHistory, clearErrorHistory } = useErrorContext();
  const metrics = useErrorMetrics();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      right: 16,
      width: 320,
      maxHeight: 400,
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: 16,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 9999,
      overflow: 'auto',
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Error Monitor</h3>
      
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>Total Errors:</span>
          <strong>{metrics.totalErrors}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span>Recovery Rate:</span>
          <strong>{(metrics.recoveryRate * 100).toFixed(1)}%</strong>
        </div>
        {metrics.meanTimeToRecovery > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>Avg Recovery Time:</span>
            <strong>{(metrics.meanTimeToRecovery / 1000).toFixed(1)}s</strong>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: 14 }}>By Category</h4>
        {Object.entries(metrics.errorsByCategory).map(([category, count]) => (
          count > 0 && (
            <div key={category} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12 }}>{category}:</span>
              <span style={{ fontSize: 12 }}>{count}</span>
            </div>
          )
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: 14 }}>Recent Errors</h4>
        {errorHistory.slice(0, 5).map(entry => (
          <div key={entry.id} style={{ marginBottom: 8, fontSize: 12 }}>
            <div style={{ fontWeight: 600 }}>{entry.error.name}</div>
            <div style={{ color: '#6b7280' }}>{entry.error.message}</div>
            <div style={{ color: '#9ca3af' }}>
              {new Date(entry.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={clearErrorHistory}
        style={{
          width: '100%',
          padding: '8px 16px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        Clear History
      </button>
    </div>
  );
};