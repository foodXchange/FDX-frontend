import React from 'react';
import { useState } from 'react';
import { MagnifyingGlassIcon, BellIcon, UserCircleIcon, Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { Box, IconButton, TextField, Badge, Typography } from '@mui/material';

interface ModernHeaderProps {
  onMenuClick: () => void;
  notificationCount?: number;
  onLogout?: () => void;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({ onMenuClick, notificationCount = 0, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Box component="header" sx={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(10px)', bgcolor: 'rgba(255, 255, 255, 0.8)', borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
      <Box sx={{ px: { xs: 2, sm: 3, lg: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={onMenuClick} sx={{ p: 1, borderRadius: 2, '&:hover': { bgcolor: 'rgba(156, 163, 175, 0.2)' } }}>
              <Box component={Bars3Icon} sx={{ width: 24, height: 24 }} />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, background: 'linear-gradient(135deg, #B08D57, #1E4C8A)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>FX</Typography>
              </Box>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, background: 'linear-gradient(90deg, #B08D57, #1E4C8A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: { xs: 'none', sm: 'block' } }}>
                FoodXchange
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ flex: 1, maxWidth: 672, mx: { xs: 2, sm: 4 } }}>
            <Box sx={{ position: 'relative' }}>
              <Box component={MagnifyingGlassIcon} sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, color: 'text.secondary' }} />
              <TextField
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, suppliers, or RFQs..."
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    pl: 5,
                    bgcolor: 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: 'rgba(229, 231, 235, 0.5)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(229, 231, 235, 0.7)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: 2
                    }
                  }
                }}
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <IconButton sx={{ p: 1, borderRadius: 2, position: 'relative', '&:hover': { bgcolor: 'rgba(156, 163, 175, 0.2)' } }}>
              <Badge badgeContent={notificationCount} color="error" sx={{ '& .MuiBadge-badge': { bgcolor: '#FF6B35', right: -3, top: -3 } }}>
                <Box component={BellIcon} sx={{ width: 24, height: 24 }} />
              </Badge>
            </IconButton>
            <IconButton sx={{ p: 1, borderRadius: 2, '&:hover': { bgcolor: 'rgba(156, 163, 175, 0.2)' } }}>
              <Box component={UserCircleIcon} sx={{ width: 24, height: 24 }} />
            </IconButton>
            {onLogout && (
              <IconButton 
                onClick={onLogout}
                sx={{ p: 1, borderRadius: 2, color: 'error.main', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}
                title="Logout"
              >
                <Box component={ArrowRightOnRectangleIcon} sx={{ width: 24, height: 24 }} />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};