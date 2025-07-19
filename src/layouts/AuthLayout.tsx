import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { MonitoringProvider } from '@/providers/MonitoringProvider';

const AuthLayout: React.FC = () => {
  return (
    <MonitoringProvider>
      <Box sx={{ minHeight: '100vh', position: 'relative' }}>
        <Outlet />
      </Box>
    </MonitoringProvider>
  );
};

export default AuthLayout;
export { AuthLayout };
