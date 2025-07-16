import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Fab,
  useMediaQuery,
  Box,
  Typography,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  SettingsBrightness,
  DarkMode,
  LightMode,
  Computer,
  Palette,
  ContrastSharp,
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleButtonProps {
  variant?: 'icon' | 'fab' | 'menu';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  position?: 'fixed' | 'static';
  className?: string;
}

const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  variant = 'icon',
  size = 'medium',
  showLabel = false,
  position = 'static',
  className,
}) => {
  const { mode, actualMode, toggleTheme, setThemeMode, isDarkMode } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const open = Boolean(anchorEl);
  
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (variant === 'menu') {
      setAnchorEl(event.currentTarget);
    } else {
      toggleTheme();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModeSelect = (selectedMode: 'light' | 'dark' | 'system') => {
    setThemeMode(selectedMode);
    handleClose();
  };

  const getIcon = () => {
    switch (mode) {
      case 'light': return <LightMode />;
      case 'dark': return <DarkMode />;
      case 'system': return <Computer />;
      default: return <SettingsBrightness />;
    }
  };

  const getTooltipText = () => {
    switch (mode) {
      case 'light': return 'Switch to dark mode';
      case 'dark': return 'Switch to system mode';
      case 'system': return 'Switch to light mode';
      default: return 'Toggle theme';
    }
  };

  const getModeLabel = (themeMode: string) => {
    switch (themeMode) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System';
      default: return 'Unknown';
    }
  };

  const getModeDescription = (themeMode: string) => {
    switch (themeMode) {
      case 'light': return 'Always use light theme';
      case 'dark': return 'Always use dark theme';
      case 'system': return 'Follow system preference';
      default: return '';
    }
  };

  // Simple icon button variant
  if (variant === 'icon') {
    const IconComponent = showLabel ? Box : React.Fragment;
    const iconProps = showLabel ? { display: 'flex', alignItems: 'center', gap: 1 } : {};

    return (
      <IconComponent {...iconProps}>
        <Tooltip title={getTooltipText()}>
          <IconButton
            onClick={handleClick}
            color="inherit"
            size={size}
            className={className}
            aria-label={getTooltipText()}
            sx={{
              transition: prefersReducedMotion ? 'none' : 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: prefersReducedMotion ? 'none' : 'scale(1.1)',
              },
            }}
          >
            {getIcon()}
          </IconButton>
        </Tooltip>
        {showLabel && (
          <Typography variant="body2" sx={{ ml: 1 }}>
            {getModeLabel(mode)}
          </Typography>
        )}
      </IconComponent>
    );
  }

  // Floating action button variant
  if (variant === 'fab') {
    return (
      <Tooltip title={getTooltipText()}>
        <Fab
          onClick={handleClick}
          color="primary"
          size={size}
          className={className}
          aria-label={getTooltipText()}
          sx={{
            position: position === 'fixed' ? 'fixed' : 'relative',
            bottom: position === 'fixed' ? 16 : 'auto',
            right: position === 'fixed' ? 16 : 'auto',
            zIndex: position === 'fixed' ? 1000 : 'auto',
            transition: prefersReducedMotion ? 'none' : 'all 0.3s ease-in-out',
            '&:hover': {
              transform: prefersReducedMotion ? 'none' : 'scale(1.05)',
            },
          }}
        >
          {getIcon()}
        </Fab>
      </Tooltip>
    );
  }

  // Menu variant with advanced options
  return (
    <>
      <Tooltip title="Theme settings">
        <IconButton
          onClick={handleClick}
          color="inherit"
          size={size}
          className={className}
          aria-label="Theme settings"
          aria-controls={open ? 'theme-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Palette />
        </IconButton>
      </Tooltip>

      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'theme-button',
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            minWidth: 240,
            maxWidth: 300,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Theme Preference
          </Typography>
        </Box>

        <MenuItem
          onClick={() => handleModeSelect('light')}
          selected={mode === 'light'}
        >
          <ListItemIcon>
            <LightMode fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Light"
            secondary="Always use light theme"
          />
        </MenuItem>

        <MenuItem
          onClick={() => handleModeSelect('dark')}
          selected={mode === 'dark'}
        >
          <ListItemIcon>
            <DarkMode fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Dark"
            secondary="Always use dark theme"
          />
        </MenuItem>

        <MenuItem
          onClick={() => handleModeSelect('system')}
          selected={mode === 'system'}
        >
          <ListItemIcon>
            <Computer fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="System"
            secondary="Follow system preference"
          />
        </MenuItem>

        <Divider />

        <MenuItem onClick={() => setShowAdvanced(!showAdvanced)}>
          <ListItemIcon>
            <SettingsBrightness fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Advanced" />
        </MenuItem>

        {showAdvanced && (
          <>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current: {getModeLabel(actualMode)} mode
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={!prefersReducedMotion}
                    size="small"
                    disabled
                  />
                }
                label="Animations"
                sx={{ 
                  fontSize: '0.875rem',
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem',
                  },
                }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={window.matchMedia('(prefers-contrast: high)').matches}
                    size="small"
                    disabled
                  />
                }
                label="High contrast"
                sx={{ 
                  fontSize: '0.875rem',
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem',
                  },
                }}
              />
            </Box>

            <Divider />

            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary">
                System preferences are detected automatically
              </Typography>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

// Preset variants for common use cases
export const HeaderThemeToggle: React.FC = () => (
  <ThemeToggleButton variant="icon" size="medium" />
);

export const FloatingThemeToggle: React.FC = () => (
  <ThemeToggleButton variant="fab" size="medium" position="fixed" />
);

export const ThemeSettingsMenu: React.FC = () => (
  <ThemeToggleButton variant="menu" size="medium" />
);

export const CompactThemeToggle: React.FC = () => (
  <ThemeToggleButton variant="icon" size="small" showLabel />
);

// Keyboard shortcut support
export const useThemeKeyboardShortcut = () => {
  const { toggleTheme } = useTheme();

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + T to toggle theme
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
        event.preventDefault();
        toggleTheme();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme]);
};

export default ThemeToggleButton;