import React, { useCallback, useContext, createContext, ReactNode, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { errorHandler, ErrorType, ErrorSeverity, StandardError } from "../utils/errorHandling";
import { useNotification } from "./useNotification";

interface ErrorContextType {
  reportError: (_error: StandardError) => StandardError;
  clearError: () => void;
  retryLastAction: () => Promise<void>;
  currentError: StandardError | null;
  isRetrying: boolean;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

export const useStandardErrorHandler = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useStandardErrorHandler must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [currentError, setCurrentError] = useState<StandardError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastAction] = useState<(() => Promise<void>) | null>(null);
  const navigate = useNavigate();
  const { showError, showWarning } = useNotification();

  // Removed unused _getErrorTitle function

  const handleCriticalError = (_error: StandardError) => {
    // Log critical error
    console.error('Critical error occurred:', _error);
    
    // Navigate to error page for critical errors
    navigate('/error', { state: { error: _error } });
  };

  const handleAuthenticationError = (_error: StandardError) => {
    // Clear current session/token
    localStorage.removeItem('token');
    
    // Navigate to login
    navigate('/login', { state: { message: 'Please log in again' } });
  };

  const reportError = useCallback((_error: StandardError): StandardError => {
    const standardError = errorHandler.handle(_error, {});
    setCurrentError(standardError);

    // Show user notification for non-low severity errors
    if (standardError.severity !== ErrorSeverity.LOW) {
      if (standardError.severity === ErrorSeverity.CRITICAL) {
        showError(standardError.userMessage);
      } else {
        showWarning(standardError.userMessage);
      }
    }

    // Handle critical errors
    if (standardError.severity === ErrorSeverity.CRITICAL) {
      handleCriticalError(standardError);
    }

    // Handle authentication errors
    if (standardError.type === ErrorType.AUTHENTICATION) {
      handleAuthenticationError(standardError);
    }

    return standardError;
  }, [showError, showWarning, navigate]);

  const clearError = useCallback(() => {
    setCurrentError(null);
  }, []);

  const retryLastAction = useCallback(async () => {
    if (!lastAction) {
      return;
    }

    setIsRetrying(true);
    try {
      await lastAction();
      clearError();
    } catch (error) {
      reportError(error as any);
    } finally {
      setIsRetrying(false);
    }
  }, [lastAction, clearError, reportError]);

  const contextValue: ErrorContextType = {
    reportError,
    clearError,
    retryLastAction,
    currentError,
    isRetrying
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
};

export default useStandardErrorHandler;