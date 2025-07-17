import React, { useState, useContext, createContext } from 'react';
import { Box, Tabs as MuiTabs, Tab as MuiTab } from '@mui/material';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
};

interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  defaultValue,
  onValueChange,
  children,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  
  const currentValue = value !== undefined ? value : internalValue;
  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <Box sx={{ width: '100%' }}>
        {children}
      </Box>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children }) => {
  const { value, onValueChange } = useTabsContext();
  
  // Extract tab values from children
  const tabs = React.Children.toArray(children).filter(
    child => React.isValidElement(child) && child.type === TabsTrigger
  );

  return (
    <MuiTabs
      value={value}
      onChange={(_, newValue) => onValueChange(newValue)}
      sx={{
        minHeight: 40,
        bgcolor: 'grey.100',
        borderRadius: 2,
        p: 0.5,
        '& .MuiTabs-indicator': {
          display: 'none',
        },
        '& .MuiTabs-flexContainer': {
          gap: 0.5,
        },
      }}
      role="tablist"
    >
      {tabs}
    </MuiTabs>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  disabled = false,
}) => {
  const { value: currentValue } = useTabsContext();
  const isActive = currentValue === value;

  return (
    <MuiTab
      value={value}
      label={children}
      disabled={disabled}
      sx={{
        minHeight: 32,
        textTransform: 'none',
        fontSize: '0.875rem',
        fontWeight: 500,
        px: 2,
        py: 1,
        borderRadius: 1,
        transition: 'all 0.2s',
        bgcolor: isActive ? 'background.paper' : 'transparent',
        color: isActive ? 'text.primary' : 'text.secondary',
        boxShadow: isActive ? 1 : 0,
        '&:hover': {
          bgcolor: isActive ? 'background.paper' : 'action.hover',
          color: 'text.primary',
        },
        '&.Mui-disabled': {
          opacity: 0.5,
        },
      }}
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
    />
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
}) => {
  const { value: currentValue } = useTabsContext();
  
  if (currentValue !== value) {
    return null;
  }

  return (
    <Box
      sx={{
        mt: 2,
        outline: 'none',
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
    >
      {children}
    </Box>
  );
};