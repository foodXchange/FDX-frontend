import { useState, useEffect } from 'react';
import './styles/global.css';
import { LoginForm } from './features/auth/LoginForm';
import { ModernHeader } from './components/layout/ModernHeader';
import { DashboardCards } from './features/dashboard/DashboardCards';
import { RFQList } from './features/rfq/RFQList';
import { ComplianceDashboard } from './features/compliance';
import { MarketplaceView } from './features/marketplace/MarketplaceView';
import { DataImport } from './features/admin/DataImport';
import { Card, CardContent } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { api } from './services/api-client';
import { websocket } from './services/websocket';
import config from './config/environment';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  ShoppingCartIcon, 
  ShieldCheckIcon, 
  TruckIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

// New UI Components
import { useToast, ToastContainer } from './components/ui/Toast';
import { OnboardingTour, WelcomeModal, OnboardingChecklist } from './components/onboarding/OnboardingTour';
import { InfoTooltip } from './components/ui/Tooltip';
import { ProgressIndicator, PageLoader } from './components/ui/ProgressIndicator';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [apiResponse, setApiResponse] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  
  // New state for onboarding
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [isFirstLogin] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  
  // Toast notifications
  const { toasts, success, error, info } = useToast();

  // Onboarding checklist state
  const [checklistItems, setChecklistItems] = useState([
    { id: 'profile', label: 'Complete your profile', completed: false },
    { id: 'first-rfq', label: 'Create your first RFQ', completed: false },
    { id: 'explore-marketplace', label: 'Explore the marketplace', completed: false },
    { id: 'compliance-check', label: 'Run a compliance check', completed: false },
    { id: 'invite-supplier', label: 'Invite a supplier', completed: false },
  ]);

  // Tour steps
  const tourSteps = [
    {
      id: 'welcome',
      title: 'Welcome to FoodXchange!',
      content: 'Let\'s take a quick tour to help you get started with the platform.',
      placement: 'center' as const,
    },
    {
      id: 'dashboard',
      title: 'Your Dashboard',
      content: 'This is your command center. See key metrics, recent activities, and quick actions all in one place.',
      target: '.dashboard-cards',
      placement: 'bottom' as const,
      highlight: true,
    },
    {
      id: 'rfq',
      title: 'Request for Quotations',
      content: 'Create and manage RFQs to source products from verified suppliers. Click here to get started.',
      target: '[data-tour="rfq-nav"]',
      placement: 'right' as const,
      highlight: true,
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      content: 'Browse thousands of products from trusted suppliers. Use filters to find exactly what you need.',
      target: '[data-tour="marketplace-nav"]',
      placement: 'right' as const,
      highlight: true,
    },
    {
      id: 'compliance',
      title: 'Compliance Center',
      content: 'Our AI-powered compliance checker helps prevent costly specification errors before they happen.',
      target: '[data-tour="compliance-nav"]',
      placement: 'right' as const,
      highlight: true,
    },
    {
      id: 'help',
      title: 'Need Help?',
      content: 'Click the help button anytime to access tutorials, documentation, or contact support.',
      target: '[data-tour="help-button"]',
      placement: 'left' as const,
      highlight: true,
    },
  ];

  useEffect(() => {
    if (!isLoggedIn) return;

    websocket.connect();
    
    const handleConnected = () => {
      setWsConnected(true);
      info('Connected to real-time updates');
    };
    
    const handleDisconnected = () => {
      setWsConnected(false);
      error('Lost connection to server', 'Attempting to reconnect...');
    };
    
    websocket.on('connected', handleConnected);
    websocket.on('disconnected', handleDisconnected);
    
    // Check if first login
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome && isFirstLogin) {
      setTimeout(() => setShowWelcome(true), 500);
    }
    
    return () => {
      websocket.off('connected', handleConnected);
      websocket.off('disconnected', handleDisconnected);
      websocket.disconnect();
    };
  }, [isLoggedIn]);

  const testAPI = async () => {
    try {
      setPageLoading(true);
      const data = await api.get('/health');
      setApiResponse(JSON.stringify(data, null, 2));
      success('API Connected', 'Successfully connected to backend');
    } catch (err) {
      setApiResponse('Error: ' + (err as Error).message);
      error('API Error', 'Failed to connect to backend');
    } finally {
      setPageLoading(false);
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
        success('Welcome back!', 'Successfully logged in to FoodXchange');
      } else {
        setLoginError('Invalid credentials. Use demo@foodxchange.com / demo123');
        error('Login Failed', 'Please check your credentials');
      }
    } catch (err) {
      setLoginError('Login failed. Please try again.');
      error('Login Error', 'An unexpected error occurred');
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
    info('Logged Out', 'You have been successfully logged out');
  };

  const handleStartTour = () => {
    setShowWelcome(false);
    setShowTour(true);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  const handleCompleteTour = () => {
    setShowTour(false);
    success('Tour Completed!', 'You can always access the tour from the help menu');
    
    // Update checklist
    setChecklistItems(prev => prev.map(item => 
      item.id === 'profile' ? { ...item, completed: true } : item
    ));
  };

  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: HomeIcon, 
      description: 'Overview & Analytics',
      tourId: 'dashboard-nav'
    },
    { 
      id: 'rfq', 
      label: 'RFQ Management', 
      icon: DocumentTextIcon, 
      description: 'Request for Quotations',
      tourId: 'rfq-nav'
    },
    { 
      id: 'marketplace', 
      label: 'Marketplace', 
      icon: ShoppingCartIcon, 
      description: 'Browse Products',
      tourId: 'marketplace-nav'
    },
    { 
      id: 'compliance', 
      label: 'Compliance Center', 
      icon: ShieldCheckIcon, 
      description: 'Validation & Safety',
      tourId: 'compliance-nav'
    },
    { 
      id: 'logistics', 
      label: 'Logistics', 
      icon: TruckIcon, 
      description: 'Shipping & Tracking',
      tourId: 'logistics-nav'
    },
    { 
      id: 'import', 
      label: 'Data Import', 
      icon: CloudArrowUpIcon, 
      description: 'Import Data',
      tourId: 'import-nav'
    },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-morphism p-8 rounded-2xl max-w-md w-full card-hover"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-[#B08D57]" />
            </motion.div>
            <h1 className="text-3xl font-bold gradient-text">
              FoodXchange
            </h1>
            <p className="text-gray-600 mt-2">B2B Food Commerce Platform</p>
            {config.isDevelopment && (
              <p className="text-xs text-gray-400 mt-1">Environment: {config.environment}</p>
            )}
          </div>
          <LoginForm onLogin={handleLogin} loading={loginLoading} error={loginError} />
        </motion.div>
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {pageLoading && <PageLoader message="Loading..." />}
      
      <ModernHeader 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        notificationCount={3}
        onLogout={handleLogout}
      />
      
      <div className="flex">
        {/* Enhanced Sidebar with animations */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-64 bg-white shadow-lg min-h-screen"
            >
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Navigation</h2>
                <nav className="space-y-1">
                  {navigationItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.id}
                        data-tour={item.tourId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          setCurrentView(item.id);
                          // Update checklist when exploring features
                          if (item.id === 'marketplace') {
                            setChecklistItems(prev => prev.map(ci => 
                              ci.id === 'explore-marketplace' ? { ...ci, completed: true } : ci
                            ));
                          }
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-all group hover-lift ${
                          currentView === item.id
                            ? 'bg-gradient-to-r from-[#1E4C8A] to-[#2E6BB8] text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${currentView === item.id ? 'text-white' : 'text-gray-500'}`} />
                          <div className="flex-1">
                            <div className="font-medium">{item.label}</div>
                            <div className={`text-xs ${currentView === item.id ? 'text-blue-100' : 'text-gray-500'}`}>
                              {item.description}
                            </div>
                          </div>
                          {item.id === 'compliance' && (
                            <InfoTooltip
                              content="AI-powered compliance validation"
                              className="ml-auto"
                            />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </nav>

                {/* Onboarding Progress */}
                <div className="mt-8">
                  <OnboardingChecklist
                    items={checklistItems.map(item => ({
                      ...item,
                      action: item.id === 'first-rfq' ? () => setCurrentView('rfq') : undefined
                    }))}
                  />
                </div>

                {/* Help Button */}
                <div className="mt-6">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setShowTour(true)}
                    data-tour="help-button"
                  >
                    <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                    Help & Tour
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content with animations */}
        <div className="flex-1 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentView === 'dashboard' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-3xl font-bold gradient-text">
                        Dashboard
                      </h1>
                      <p className="text-gray-600 mt-2">Welcome to FoodXchange - Your B2B Food Commerce Platform</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={testAPI}>
                      Test API
                    </Button>
                  </div>
                  <div className="dashboard-cards">
                    <DashboardCards />
                  </div>
                </div>
              )}

              {currentView === 'rfq' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">RFQ Management</h1>
                      <p className="text-gray-600 mt-2">Manage your Request for Quotations</p>
                    </div>
                    <Button 
                      variant="gold" 
                      className="hover-lift"
                      onClick={() => {
                        info('Coming Soon', 'RFQ creation wizard will be available soon');
                      }}
                    >
                      Create New RFQ
                    </Button>
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
                  <Card className="glass-morphism card-hover">
                    <CardContent className="p-8 text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <TruckIcon className="w-16 h-16 text-[#1E4C8A] mx-auto mb-4" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Logistics Management</h3>
                      <p className="text-gray-600">
                        Real-time shipment tracking, delivery scheduling, and logistics optimization.
                      </p>
                      <ProgressIndicator
                        value={65}
                        label="Implementation Progress"
                        className="mt-6"
                        showLabel
                        animated
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

              {currentView === 'import' && <DataImport />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Modern Footer with connection status */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <span className="text-sm">FoodXchange Platform v2.0 - Professional B2B Food Commerce</span>
          <div className="flex gap-6 text-sm">
            <span className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${apiResponse ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              Backend: {apiResponse ? 'Connected' : 'Disconnected'}
            </span>
            <span className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              WebSocket: {wsConnected ? 'Connected' : 'Disconnected'}
            </span>
            <span>Compliance: Active</span>
            <span>User: demo@foodxchange.com</span>
          </div>
        </div>
      </div>

      {/* Onboarding Components */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        onStartTour={handleStartTour}
        userName="Demo User"
      />

      <OnboardingTour
        steps={tourSteps}
        isOpen={showTour}
        onComplete={handleCompleteTour}
        onSkip={() => setShowTour(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default App;