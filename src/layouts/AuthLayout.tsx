import React from 'react';
import { Outlet } from 'react-router-dom';
import { MonitoringProvider } from '@/providers/MonitoringProvider';

const AuthLayout: React.FC = () => {
  return (
    <MonitoringProvider>
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <Outlet />
      </div>
    </MonitoringProvider>
  );
};

export default AuthLayout;