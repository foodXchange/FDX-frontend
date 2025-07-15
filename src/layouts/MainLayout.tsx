import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { ModernHeader } from '@components/layout/ModernHeader';
import { Sidebar } from '@components/layout/Sidebar';
import { Breadcrumbs } from '@components/layout/Breadcrumbs';
import { MonitoringProvider } from '@/providers/MonitoringProvider';
// import { useLocation } from 'react-router-dom'; // Uncomment when needed
// import { useAuth } from '@/contexts/AuthContext'; // Uncomment when needed

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // const location = useLocation(); // Uncomment when needed
  // const { user } = useAuth(); // Uncomment when needed

  return (
    <MonitoringProvider>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <ModernHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <Box sx={{ display: 'flex', flex: 1 }}>
          {/* Sidebar */}
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flex: 1,
              transition: 'all 0.3s',
              overflow: 'auto',
              ml: sidebarOpen ? '256px' : '64px',
            }}
          >
            <Container 
              maxWidth="xl" 
              sx={{ 
                px: { xs: 2, sm: 3, md: 4, lg: 5 },
                py: { xs: 3, sm: 4 },
                width: '100%',
                maxWidth: '1400px'
              }}
            >
              {/* Breadcrumbs */}
              <Breadcrumbs />
              
              {/* Page Content */}
              <Box sx={{ mt: 2 }}>
                <Outlet />
              </Box>
            </Container>
          </Box>
        </Box>
      </Box>
    </MonitoringProvider>
  );
};

export default MainLayout;