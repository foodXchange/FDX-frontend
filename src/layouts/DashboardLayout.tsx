import React from 'react';
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import { Sidebar } from "../components/layout/Sidebar";
import { ModernHeader } from "../components/layout/ModernHeader";

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <ModernHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;