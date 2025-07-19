import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Container,
  Button,
  Stack
} from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { ChevronDownIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  currentUser?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout: () => void;
  onMenuToggle?: () => void;
}

export function Header({ currentUser, onLogout, onMenuToggle }: HeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications] = useState(3); // Mock notification count
  const isProfileOpen = Boolean(anchorEl);

  const defaultUser: {
    name: string;
    email: string;
    avatar?: string;
  } = {
    name: 'Demo User',
    email: 'demo@foodxchange.com'
  };

  const user = currentUser || defaultUser;

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileClose();
    onLogout();
  };

  return (
    <AppBar position="static" sx={{ bgcolor: 'white', color: 'text.primary', boxShadow: 1 }}>
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3, lg: 4 } }}>
          {/* Left side - Logo and Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Mobile menu button */}
            <IconButton
              onClick={onMenuToggle}
              sx={{ 
                display: { md: 'none' },
                mr: 2,
                color: 'text.primary'
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                <Box component="span" sx={{ color: 'orange.500' }}>X</Box>
                <Box component="span" sx={{ color: 'teal.600' }}>FOOD</Box>
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  display: { xs: 'none', sm: 'block' },
                  color: 'grey.300',
                  mx: 1
                }}
              >
                |
              </Typography>
              <Typography 
                variant="h6" 
                component="h1"
                sx={{ 
                  display: { xs: 'none', sm: 'block' },
                  fontWeight: 600,
                  color: 'grey.800'
                }}
              >
                FoodXchange
              </Typography>
            </Box>
          </Box>

          {/* Right side - Actions and Profile */}
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Notifications */}
            <IconButton sx={{ color: 'text.primary' }}>
              <Badge badgeContent={notifications} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Settings */}
            <IconButton sx={{ color: 'text.primary' }}>
              <SettingsIcon />
            </IconButton>

            {/* Profile Dropdown */}
            <Button
              onClick={handleProfileClick}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: 'text.primary',
                textTransform: 'none',
                gap: 1
              }}
            >
              {user.avatar ? (
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <Box component={UserCircleIcon} sx={{ fontSize: 32, color: 'grey.400' }} />
              )}
              <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left' }}>
                <Typography variant="body2" sx={{ color: 'grey.700' }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'grey.500' }}>
                  {user.email}
                </Typography>
              </Box>
              <Box component={ChevronDownIcon} sx={{ fontSize: 16, color: 'grey.400' }} />
            </Button>

            {/* Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={isProfileOpen}
              onClose={handleProfileClose}
              sx={{
                '& .MuiPaper-root': {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: 3
                }
              }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="body2" sx={{ color: 'grey.900', fontWeight: 'medium' }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'grey.500' }}>
                  {user.email}
                </Typography>
              </Box>
              
              <Divider />
              
              <MenuItem onClick={handleProfileClose}>
                <Box component={UserCircleIcon} sx={{ mr: 2, fontSize: 16 }} />
                Profile Settings
              </MenuItem>
              
              <MenuItem onClick={handleProfileClose}>
                <Box component={SettingsIcon} sx={{ mr: 2, fontSize: 16 }} />
                Account Settings
              </MenuItem>
              
              <Divider />
              
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <Box component={ArrowRightOnRectangleIcon} sx={{ mr: 2, fontSize: 16 }} />
                Sign Out
              </MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}