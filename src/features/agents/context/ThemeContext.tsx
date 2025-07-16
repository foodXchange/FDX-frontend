import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  actualMode: 'light' | 'dark';
  theme: Theme;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom theme configurations
const getTheme = (mode: 'light' | 'dark'): Theme => {
  const isDark = mode === 'dark';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#90caf9' : '#1976d2',
        light: isDark ? '#e3f2fd' : '#42a5f5',
        dark: isDark ? '#1565c0' : '#1565c0',
        contrastText: isDark ? '#000' : '#fff',
      },
      secondary: {
        main: isDark ? '#f48fb1' : '#dc004e',
        light: isDark ? '#fce4ec' : '#f06292',
        dark: isDark ? '#c2185b' : '#9a0036',
        contrastText: isDark ? '#000' : '#fff',
      },
      error: {
        main: isDark ? '#f44336' : '#d32f2f',
        light: isDark ? '#ffebee' : '#ef5350',
        dark: isDark ? '#c62828' : '#b71c1c',
      },
      warning: {
        main: isDark ? '#ff9800' : '#ed6c02',
        light: isDark ? '#fff3e0' : '#ff9800',
        dark: isDark ? '#e65100' : '#c77700',
      },
      info: {
        main: isDark ? '#29b6f6' : '#0288d1',
        light: isDark ? '#e1f5fe' : '#03a9f4',
        dark: isDark ? '#0277bd' : '#01579b',
      },
      success: {
        main: isDark ? '#66bb6a' : '#2e7d32',
        light: isDark ? '#e8f5e8' : '#4caf50',
        dark: isDark ? '#388e3c' : '#1b5e20',
      },
      background: {
        default: isDark ? '#121212' : '#fafafa',
        paper: isDark ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: isDark ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
        secondary: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        disabled: isDark ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.38)',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      action: {
        active: isDark ? 'rgba(255, 255, 255, 0.54)' : 'rgba(0, 0, 0, 0.54)',
        hover: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
        selected: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        disabled: isDark ? 'rgba(255, 255, 255, 0.26)' : 'rgba(0, 0, 0, 0.26)',
        disabledBackground: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
        lineHeight: 1.3,
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.75rem',
        lineHeight: 1.4,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.5,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: isDark ? '0 2px 8px rgba(255, 255, 255, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.15)',
            },
          },
          contained: {
            boxShadow: isDark ? '0 1px 3px rgba(255, 255, 255, 0.12)' : '0 1px 3px rgba(0, 0, 0, 0.12)',
            '&:hover': {
              boxShadow: isDark ? '0 2px 8px rgba(255, 255, 255, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.2)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDark 
              ? '0 1px 3px rgba(255, 255, 255, 0.12), 0 1px 2px rgba(255, 255, 255, 0.24)'
              : '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
            transition: 'box-shadow 0.2s ease-in-out',
            '&:hover': {
              boxShadow: isDark
                ? '0 3px 6px rgba(255, 255, 255, 0.16), 0 3px 6px rgba(255, 255, 255, 0.23)'
                : '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: isDark
              ? '0 1px 3px rgba(255, 255, 255, 0.12), 0 1px 2px rgba(255, 255, 255, 0.24)'
              : '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
            color: isDark ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
            boxShadow: isDark
              ? '0 1px 3px rgba(255, 255, 255, 0.12)'
              : '0 1px 3px rgba(0, 0, 0, 0.12)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
            borderRight: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '& fieldset': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)',
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  });
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme-mode');
    return (saved as ThemeMode) || 'system';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Calculate actual theme mode
  const actualMode: 'light' | 'dark' = mode === 'system' 
    ? (systemPrefersDark ? 'dark' : 'light')
    : mode;

  const theme = getTheme(actualMode);
  const isDarkMode = actualMode === 'dark';

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  // Update document class for CSS styling
  useEffect(() => {
    document.documentElement.className = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', actualMode);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDarkMode ? '#121212' : '#ffffff');
    }
  }, [isDarkMode, actualMode]);

  const toggleTheme = useCallback(() => {
    setMode(current => {
      switch (current) {
        case 'light': return 'dark';
        case 'dark': return 'system';
        case 'system': return 'light';
        default: return 'light';
      }
    });
  }, []);

  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  const contextValue: ThemeContextType = {
    mode,
    actualMode,
    theme,
    toggleTheme,
    setThemeMode,
    isDarkMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Custom CSS for additional dark mode styling
const injectGlobalStyles = () => {
  const styleId = 'dark-mode-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    :root {
      --transition-theme: all 0.2s ease-in-out;
    }

    /* Dark mode scrollbar */
    .dark ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    .dark ::-webkit-scrollbar-track {
      background: #2a2a2a;
    }

    .dark ::-webkit-scrollbar-thumb {
      background: #555;
      border-radius: 4px;
    }

    .dark ::-webkit-scrollbar-thumb:hover {
      background: #777;
    }

    /* Light mode scrollbar */
    .light ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    .light ::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .light ::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }

    .light ::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }

    /* Selection colors */
    .dark ::selection {
      background: rgba(144, 202, 249, 0.3);
    }

    .light ::selection {
      background: rgba(25, 118, 210, 0.3);
    }

    /* Focus visible styles */
    .dark *:focus-visible {
      outline: 2px solid #90caf9;
      outline-offset: 2px;
    }

    .light *:focus-visible {
      outline: 2px solid #1976d2;
      outline-offset: 2px;
    }

    /* Smooth transitions for theme changes */
    * {
      transition: var(--transition-theme);
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      * {
        transition: none !important;
        animation: none !important;
      }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .dark {
        --shadow-color: rgba(255, 255, 255, 0.5);
      }
      
      .light {
        --shadow-color: rgba(0, 0, 0, 0.5);
      }
    }

    /* Print styles */
    @media print {
      .dark * {
        background: white !important;
        color: black !important;
        box-shadow: none !important;
      }
    }
  `;

  document.head.appendChild(style);
};

// Initialize global styles
if (typeof window !== 'undefined') {
  injectGlobalStyles();
}

export default ThemeProvider;