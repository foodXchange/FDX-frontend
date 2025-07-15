import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
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
      <div className="min-h-screen bg-gray-50 viewport-container">
        {/* Header */}
        <ModernHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex">
          {/* Sidebar */}
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          {/* Main Content */}
          <main className={`flex-1 transition-all duration-300 overflow-auto ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
            <div className="px-4 sm:px-6 lg:px-8 py-8">
              {/* Breadcrumbs */}
              <Breadcrumbs />
              
              {/* Page Content */}
              <div className="mt-4">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </MonitoringProvider>
  );
};

export default MainLayout;