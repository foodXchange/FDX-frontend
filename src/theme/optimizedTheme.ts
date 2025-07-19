import { createTheme, ThemeOptions, responsiveFontSizes } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";

// Create a base theme with performance optimizations
const baseTheme: ThemeOptions = {
  palette: {
    primary: {
      main: '#1E4C8A',
      light: '#4A6FA5',
      dark: '#142F5C',
      contrastText: '#fff'
    },
    secondary: {
      main: '#B08D57',
      light: '#C4A574',
      dark: '#8B6F3E',
      contrastText: '#fff'
    },
    success: {
      main: '#52B788',
      light: '#74C9A0',
      dark: '#3A8F66'
    },
    error: {
      main: '#DC2626',
      light: '#EF4444',
      dark: '#B91C1C'
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706'
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB'
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6
    }
  },
  shape: {
    borderRadius: 8
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 16px'
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          borderRadius: 12,
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.20)'
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          backdropFilter: 'blur(8px)'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6
        }
      }
    }
  }
};

// Performance optimizations
const optimizations = {
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box'
        },
        html: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale'
        },
        body: {
          margin: 0,
          padding: 0
        }
      }
    }
  }
};

// Merge base theme with optimizations
const mergedTheme = deepmerge(baseTheme, optimizations);

// Create theme with responsive font sizes
export const optimizedTheme = responsiveFontSizes(createTheme(mergedTheme));

// Export individual theme options for customization
export const themeOptions = baseTheme;

export default optimizedTheme;