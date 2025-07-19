import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Box, Alert, Typography, List, ListItem, ListItemText, TextField, TextFieldProps } from '@mui/material';


// Enhanced text field component with error handling
interface FormError {
  field?: string;
  message: string;
  code?: string;
}

interface FormErrorContextType {
  errors: FormError[],
  hasErrors: boolean;
  hasFieldErrors: boolean,
  hasGlobalErrors: boolean;
  addError: (error: FormError) => void,
  addErrors: (errors: FormError[]) => void,
  clearErrors: () => void;
  clearFieldErrors: () => void,
  getFieldError: (field: string) => string | null,
  setFieldError: (field: string, message: string) => void,
  removeFieldError: (field: string) => void;
}

const FormErrorContext = createContext<FormErrorContextType | null>(null);

export const useFormErrors = () => {
  const context = useContext(FormErrorContext);
  if (!context) {
    throw new Error('useFormErrors must be used within a FormErrorProvider');
  }
  return context;
};

interface FormErrorProviderProps {
  children: ReactNode;
}

export const FormErrorProvider: React.FC<FormErrorProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<FormError[]>([]);

  const addError = useCallback((error: FormError) => {
    setErrors(prev => [...prev, error]);
  }, []);

  const addErrors = useCallback((newErrors: FormError[]) => {
    setErrors(prev => [...prev, ...newErrors]);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearFieldErrors = useCallback(() => {
    setErrors(prev => prev.filter(error => !error.field));
  }, []);

  const getFieldError = useCallback((field: string) => {
    const error = errors.find(error => error.field === field);
    return error ? error.message : null;
  }, [errors]);

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors(prev => {
      const filtered = prev.filter(error => error.field !== field);
      return [...filtered, { field, message }];
    });
  }, []);

  const removeFieldError = useCallback((field: string) => {
    setErrors(prev => prev.filter(error => error.field !== field));
  }, []);

  const hasErrors = errors.length > 0;
  const hasFieldErrors = errors.some(error => error.field);
  const hasGlobalErrors = errors.some(error => !error.field);

  const value: FormErrorContextType = {
    errors,
    hasErrors,
    hasFieldErrors,
    hasGlobalErrors,
    addError,
    addErrors,
    clearErrors,
    clearFieldErrors,
    getFieldError,
    setFieldError,
    removeFieldError,
  };

  return (
    <FormErrorContext.Provider value={value}>
      {children}
    </FormErrorContext.Provider>
  );
};

interface FormErrorDisplayProps {
  maxErrors?: number;
  showFieldErrors?: boolean;
  showGlobalErrors?: boolean;
}

export const FormErrorDisplay: React.FC<FormErrorDisplayProps> = ({
  maxErrors = 5,
  showFieldErrors = true,
  showGlobalErrors = true,
}) => {
  const { errors, hasErrors } = useFormErrors();

  if (!hasErrors) return null;

  const fieldErrors = errors.filter(error => error.field);
  const globalErrors = errors.filter(error => !error.field);

  return (
    <Box sx={{ mb: 2 }}>
      {showGlobalErrors && globalErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 1 }}>
          <Typography variant="body2" fontWeight="medium">
            Form Validation Errors
          </Typography>
          <List dense>
            {globalErrors.slice(0, maxErrors).map((error, index) => (
              <ListItem key={index} sx={{ py: 0, px: 0 }}>
                <ListItemText
                  primary={error.message} sx={{ margin: 0 }}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {showFieldErrors && fieldErrors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          <Typography variant="body2" fontWeight="medium">
            Field Errors
          </Typography>
          <List dense>
            {fieldErrors.slice(0, maxErrors).map((error, index) => (
              <ListItem key={index} sx={{ py: 0, px: 0 }}>
                <ListItemText
                  primary={`${error.field}: ${error.message}`}
                  sx={{ margin: 0 }}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}
    </Box>
  );
};

// Enhanced TextField with error handling
interface EnhancedTextFieldProps extends Omit<TextFieldProps, 'error'> {
  name: string;
  showFormErrors?: boolean;
}

export const EnhancedTextField: React.FC<EnhancedTextFieldProps> = ({
  name,
  showFormErrors = true,
  ...props
}) => {
  const { getFieldError } = useFormErrors();
  const fieldError = getFieldError(name);

  return (
    <TextField
      {...props}
      name={name}
      error={!!fieldError}
      helperText={fieldError}
    />
  );
};

export default FormErrorProvider;