import { useState, useEffect } from 'react';
import './styles/global.css';
import { LoginForm } from './features/auth/LoginForm';
import { ModernHeader } from './components/layout/ModernHeader';
import { DashboardCards } from './features/dashboard/DashboardCards';
import { RFQList } from './features/rfq/RFQList';
import { ComplianceDashboard } from './features/compliance';
import { MarketplaceView } from './features/marketplace/MarketplaceView';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { api } from './services/api';
import { websocket } from './services/websocket';
import config from './config/environment';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  ShoppingCartIcon, 
  ShieldCheckIcon, 
  TruckIcon,
  CloudArrowUpIcon 
} from '@heroicons/react/24/outline';
import { DataImport } from './features/admin/DataImport';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [apiResponse, setApiResponse] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  
useEffect(() => {
    if (!isLoggedIn) return;

    websocket.connect();
    
    const handleConnected = () => setWsConnected(true);
    const handleDisconnected = () => setWsConnected(false);
    
    websocket.on('connected', handleConnected);
    websocket.on('disconnected', handleDisconnected);
    
    return () => {
      websocket.off('connected', handleConnected);
      websocket.off('disconnected', handleDisconnected);
      websocket.disconnect();
    };
  }, [isLoggedIn]);

  const testAPI = async () => {
    try {
      const data = await api.get('/health');
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setApiResponse('Error: ' + (error as Error).message);
    }
  };

  const testComplianceAPI = async () => {
    try {
      const data = await api.get('/compliance/health');
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setApiResponse('Compliance API Error: ' + (error as Error).message);
    }
  };

  const handleLogin = async (data: { email: string; password: string; rememberMe?: boolean }) => {
    setLoginLoading(true);
    setLoginError('');
    
    try {
      // For demo purposes
      if (data.email === 'demo@foodxchange.com' && data.password === 'demo123') {
        setIsLoggedIn(true);
        localStorage.setItem('token', 'demo-token-123');
      } else {
        setLoginError('Invalid credentials. Use demo@foodxchange.com / demo123');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('dashboard');
    setApiResponse('');
    setLoginError('');
    localStorage.removeItem('token');
    websocket.disconnect();
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, description: 'Overview & Analytics' },
    { id: 'rfq', label: 'RFQ Management', icon: DocumentTextIcon, description: 'Request for Quotations' },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCartIcon, description: 'Browse Products' },
    { id: 'compliance', label: 'Compliance Center', icon: ShieldCheckIcon, description: 'Validation & Safety' },
    { id: 'logistics', label: 'Logistics', icon: TruckIcon, description: 'Shipping & Tracking' },
    { id: 'import', label: 'Data Import', icon: CloudArrowUpIcon, description: 'Import Data' },

    ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="glass-morphism p-8 rounded-2xl max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#B08D57] to-[#1E4C8A] bg-clip-text text-transparent">
              FoodXchange
            </h1>
            <p className="text-gray-600 mt-2">B2B Food Commerce Platform</p>
            {config.isDevelopment && (
              <p className="text-xs text-gray-400 mt-1">Environment: {config.environment}</p>
            )}
          </div>
          <LoginForm onLogin={handleLogin} loading={loginLoading} error={loginError} />
          <Card className="mt-6 glass-morphism">
            <CardHeader>
              <CardTitle className="text-sm">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" size="sm" onClick={testAPI} className="w-full">
                  Test Backend API
                </Button>
                <Button variant="outline" size="sm" onClick={testComplianceAPI} className="w-full">
                  Test Compliance API
                </Button>
                {apiResponse && (
                  <div className="mt-3">
                    <h4 className="font-semibold mb-2 text-sm">API Response:</h4>
                    <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
                      {apiResponse}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        notificationCount={3}
        onLogout={handleLogout}
      />
      
      <div className="flex">
        {/* Modern Sidebar */}
        <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-white shadow-lg min-h-screen transition-all duration-300 overflow-hidden`}>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Navigation</h2>
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all group ${
                      currentView === item.id
                        ? 'bg-gradient-to-r from-[#1E4C8A] to-[#2E6BB8] text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${currentView === item.id ? 'text-white' : 'text-gray-500'}`} />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className={`text-xs ${currentView === item.id ? 'text-blue-100' : 'text-gray-500'}`}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#B08D57] to-[#1E4C8A] bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-gray-600 mt-2">Welcome to FoodXchange - Your B2B Food Commerce Platform</p>
              </div>
              <DashboardCards />
            </div>
          )}

          {currentView === 'rfq' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">RFQ Management</h1>
                <p className="text-gray-600 mt-2">Manage your Request for Quotations</p>
              </div>
              <RFQList />
            </div>
          )}

          {currentView === 'marketplace' && <MarketplaceView />}
          
          {currentView === 'compliance' && <ComplianceDashboard />}
          
          {currentView === 'logistics' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Logistics & Shipping</h1>
                <p className="text-gray-600 mt-2">Track shipments and manage logistics operations</p>
              </div>
              <Card className="glass-morphism">
                <CardContent className="p-8 text-center">
                  <TruckIcon className="w-16 h-16 text-[#1E4C8A] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Logistics Management</h3>
                  <p className="text-gray-600">
                    Real-time shipment tracking, delivery scheduling, and logistics optimization.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {currentView === 'import' && <DataImport />}
        </div>
      </div>

      {/* Modern Footer */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <span className="text-sm">FoodXchange Platform v2.0 - Professional B2B Food Commerce</span>
          <div className="flex gap-6 text-sm">
            <span className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${apiResponse ? 'bg-green-400' : 'bg-red-400'}`}></div>
              Backend: {apiResponse ? 'Connected' : 'Disconnected'}
            </span>
            <span className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              WebSocket: {wsConnected ? 'Connected' : 'Disconnected'}
            </span>
            <span>Compliance: Active</span>
            <span>User: demo@foodxchange.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;