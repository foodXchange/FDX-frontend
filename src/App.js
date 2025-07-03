import React, { useState, useEffect } from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';
import { AuthProvider } from './contexts/AuthContext';

// ===== DESIGN SYSTEM =====
const cn = (...classes) => classes.filter(Boolean).join(' ');

const IconMap = {
  approved: 'CheckCircleIcon',
  pending: 'ClockIcon',
  rejected: 'XCircleIcon',
  active: 'PlayIcon',
  dashboard: 'Squares2X2Icon',
  rfqs: 'DocumentTextIcon',
  suppliers: 'BuildingOfficeIcon',
  orders: 'ShoppingCartIcon',
  analytics: 'ChartBarIcon',
  settings: 'Cog6ToothIcon',
  user: 'UserIcon',
  users: 'UsersIcon',
  notification: 'BellIcon',
  menu: 'Bars3Icon',
  close: 'XMarkIcon',
  food: 'CakeIcon',
  sync: 'ArrowPathIcon',
  create: 'PlusIcon',
  edit: 'PencilIcon',
  view: 'EyeIcon',
  delete: 'TrashIcon',
  search: 'MagnifyingGlassIcon',
  filter: 'FunnelIcon',
  download: 'ArrowDownTrayIcon'
};

const AutoIcon = ({ name, className = 'w-5 h-5', spin = false, ...props }) => {
  const iconName = IconMap[name] || name;
  const IconComponent = HeroIcons[iconName];
  
  if (!IconComponent) {
    return <HeroIcons.QuestionMarkCircleIcon className={cn(className, spin && 'animate-spin')} {...props} />;
  }
  
  return <IconComponent className={cn(className, spin && 'animate-spin')} {...props} />;
};

// ===== UI COMPONENTS =====
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon,
  loading = false,
  disabled = false,
  className,
  ...props 
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
    ghost: 'hover:bg-gray-100 text-gray-700'
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <AutoIcon name="sync" spin className="mr-2 w-4 h-4" />}
      {!loading && icon && <AutoIcon name={icon} className="mr-2 w-4 h-4" />}
      {children}
    </button>
  );
};

const Card = ({ children, className, ...props }) => (
  <div className={cn('bg-white rounded-lg shadow border border-gray-200', className)} {...props}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', size = 'md', className }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm'
  };

  return (
    <span className={cn('inline-flex items-center rounded-full font-medium', variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};

// ===== MOBILE NAVIGATION =====
const MobileNavigation = ({ isOpen, onClose, currentView, onNavigate }) => {
  const navigationItems = [
    { name: 'Dashboard', key: 'dashboard', icon: 'dashboard' },
    { name: 'RFQs', key: 'rfqs', icon: 'rfqs', badge: 5 },
    { name: 'Orders', key: 'orders', icon: 'orders', badge: 2 },
    { name: 'Suppliers', key: 'suppliers', icon: 'suppliers' },
    { name: 'Analytics', key: 'analytics', icon: 'analytics' },
    { name: 'Settings', key: 'settings', icon: 'settings' }
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <AutoIcon name="food" className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">FoodXchange</span>
          </div>
          
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <AutoIcon name="close" className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map(item => (
            <button
              key={item.key}
              onClick={() => {
                onNavigate(item.key);
                onClose();
              }}
              className={cn(
                'w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left',
                currentView === item.key
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <AutoIcon name={item.icon} className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
              {item.badge && (
                <Badge variant="danger" size="sm">{item.badge}</Badge>
              )}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

// ===== RFQ COMPONENT =====
const RFQCard = ({ rfq, onStatusUpdate, isUpdating }) => {
  const statusConfig = {
    active: { color: 'blue', bgColor: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50', icon: 'active' },
    pending: { color: 'yellow', bgColor: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50', icon: 'pending' },
    approved: { color: 'green', bgColor: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50', icon: 'approved' },
    rejected: { color: 'red', bgColor: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50', icon: 'rejected' }
  };
  
  const config = statusConfig[rfq.status] || statusConfig.pending;
  
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className={`h-1 ${config.bgColor} -mx-6 -mt-6 mb-4`} />
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{rfq.title}</h3>
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${config.bgLight} ${config.textColor}`}>
            <AutoIcon name={config.icon} className="w-4 h-4" />
            <span>{rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}</span>
          </div>
        </div>
        
        {rfq.updatedBy && (
          <div className="text-xs text-gray-500 text-right bg-gray-50 rounded-lg p-2">
            <div className="flex items-center space-x-1 mb-1">
              <AutoIcon name="user" className="w-3 h-3" />
              <span className="font-medium">{rfq.updatedBy.username}</span>
            </div>
            <div className="flex items-center space-x-1">
              <AutoIcon name="ClockIcon" className="w-3 h-3" />
              <span>{new Date(rfq.lastUpdate).toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">{rfq.progress}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full ${config.bgColor} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${rfq.progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center space-x-2">
          <AutoIcon name="CalendarIcon" className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-gray-500">Deadline</p>
            <p className="font-medium">{rfq.deadline}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <AutoIcon name="CurrencyDollarIcon" className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-gray-500">Budget</p>
            <p className="font-medium">{rfq.budget || 'TBD'}</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        {['approved', 'pending', 'rejected'].map(status => {
          const buttonConfig = statusConfig[status];
          const isActive = rfq.status === status;
          
          return (
            <button
              key={status}
              onClick={() => onStatusUpdate(rfq.id, status)}
              disabled={isActive || isUpdating}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1',
                isActive
                  ? `${buttonConfig.bgLight} ${buttonConfig.textColor} cursor-default`
                  : `${buttonConfig.bgLight} ${buttonConfig.textColor} hover:bg-opacity-80 border border-gray-200 hover:shadow-md`,
                isUpdating && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isUpdating ? (
                <AutoIcon name="sync" spin className="w-4 h-4" />
              ) : (
                <>
                  <AutoIcon name={buttonConfig.icon} className="w-4 h-4" />
                  <span className="capitalize">{status}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
};

// ===== MAIN APPLICATION =====
const CompleteFoodXchangeApp = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [notifications, setNotifications] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [ws, setWs] = useState(null);
  
  const [rfqs, setRfqs] = useState([
    {
      id: 'rfq-001',
      title: 'Premium Organic Cornflakes Supply',
      status: 'active',
      deadline: '2025-05-15',
      progress: 65,
      budget: '$45,000',
      lastUpdate: new Date(),
      updatedBy: null
    },
    {
      id: 'rfq-002',
      title: 'Gluten-Free Pasta Import - Europe',
      status: 'pending',
      deadline: '2025-06-01',
      progress: 30,
      budget: '$78,000',
      lastUpdate: new Date(),
      updatedBy: null
    }
  ]);

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const userId = 'user-' + Math.random().toString(36).substr(2, 9);
        const username = 'User' + Math.floor(Math.random() * 1000);
        const websocket = new WebSocket(`ws://localhost:3001/ws?userId=${userId}&username=${username}`);
        
        websocket.onopen = () => {
          console.log('✅ WebSocket connected');
          setConnectionStatus('connected');
          setWs(websocket);
          addNotification('Connected to FoodXchange Platform', 'success');
        };
        
        websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 Received:', data);
            
            switch (data.type) {
              case 'rfq_update':
                handleRFQUpdate(data);
                break;
              case 'user_joined':
                addNotification(`${data.user.username} joined`, 'info');
                break;
              case 'active_users':
                setActiveUsers(data.users || []);
                break;
            }
          } catch (error) {
            console.error('❌ WebSocket message error:', error);
          }
        };
        
        websocket.onclose = () => {
          console.log('❌ WebSocket disconnected');
          setConnectionStatus('disconnected');
          setTimeout(connectWebSocket, 3000);
        };
        
      } catch (error) {
        console.error('❌ WebSocket connection failed:', error);
        setConnectionStatus('error');
      }
    };
    
    connectWebSocket();
    
    return () => {
      if (ws) ws.close();
    };
  }, []);

  const handleRFQUpdate = (data) => {
    setRfqs(prev => prev.map(rfq => 
      rfq.id === data.rfq.id 
        ? { 
            ...rfq, 
            ...data.rfq, 
            lastUpdate: new Date(data.timestamp),
            updatedBy: data.updatedBy 
          }
        : rfq
    ));
    
    addNotification(`RFQ "${data.rfq.title}" updated to ${data.rfq.status}`, 'info');
  };

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 3)]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const updateRFQStatus = (rfqId, newStatus) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      addNotification('Not connected to server', 'error');
      return;
    }

    const rfq = rfqs.find(r => r.id === rfqId);
    if (!rfq) return;

    const updatedRFQ = {
      ...rfq,
      status: newStatus,
      progress: newStatus === 'approved' ? 100 : newStatus === 'rejected' ? 0 : rfq.progress,
      lastUpdate: new Date()
    };

    ws.send(JSON.stringify({
      type: 'rfq_update',
      rfq: updatedRFQ
    }));

    setRfqs(prev => prev.map(r => r.id === rfqId ? updatedRFQ : r));
    addNotification(`RFQ status updating to ${newStatus}...`, 'info');
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'rfqs': return 'Request for Quotes';
      case 'orders': return 'Orders';
      case 'suppliers': return 'Suppliers';
      case 'analytics': return 'Analytics';
      case 'settings': return 'Settings';
      default: return 'FoodXchange';
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'rfqs':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Active RFQs</h2>
                <p className="text-gray-600 mt-1">Manage your requests for quotes</p>
              </div>
              <Button icon="create" className="mt-4 sm:mt-0">
                New RFQ
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rfqs.map(rfq => (
                <RFQCard
                  key={rfq.id}
                  rfq={rfq}
                  onStatusUpdate={updateRFQStatus}
                />
              ))}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Welcome to FoodXchange
                  </h2>
                  <p className="text-gray-600">
                    Transform your global food sourcing with unified digital solutions
                  </p>
                </div>
                <div className="hidden sm:block">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <AutoIcon name="food" className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {rfqs.slice(0, 2).map(rfq => (
                <RFQCard
                  key={rfq.id}
                  rfq={rfq}
                  onStatusUpdate={updateRFQStatus}
                />
              ))}
            </div>
          </div>
        );
    }
  };

  const connectionStatusConfig = {
    connected: { color: 'bg-green-500', label: 'Live' },
    connecting: { color: 'bg-yellow-500', label: 'Connecting...' },
    disconnected: { color: 'bg-red-500', label: 'Offline' },
    error: { color: 'bg-red-500', label: 'Error' }
  };

  const statusConfig = connectionStatusConfig[connectionStatus];

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNavigation 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentView={currentView}
        onNavigate={setCurrentView}
      />
      
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                <AutoIcon name="menu" className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <AutoIcon name="food" className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">FoodXchange</h1>
                  <p className="text-sm text-gray-600 hidden sm:block">{getViewTitle()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={cn('w-2 h-2 rounded-full', statusConfig.color)} />
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  {statusConfig.label}
                </span>
              </div>
              
              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-gray-100">
                  <AutoIcon name="notification" className="w-5 h-5 text-gray-600" />
                </button>
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{notifications.length}</span>
                  </div>
                )}
              </div>
              
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <AutoIcon name="user" className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 lg:p-6 pb-20 lg:pb-6">
        <div className="fixed top-20 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={cn(
                'p-3 rounded-lg shadow-lg border max-w-sm transform transition-all duration-300',
                notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                'bg-blue-50 border-blue-200 text-blue-800'
              )}
            >
              <p className="text-sm font-medium">{notification.message}</p>
              <p className="text-xs opacity-75 mt-1">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
        
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-30 lg:hidden">
        <div className="flex items-center justify-around">
          {[
            { name: 'Home', key: 'dashboard', icon: 'dashboard' },
            { name: 'RFQs', key: 'rfqs', icon: 'rfqs' },
            { name: 'Orders', key: 'orders', icon: 'orders' },
            { name: 'More', key: 'analytics', icon: 'analytics' }
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setCurrentView(item.key)}
              className={cn(
                'flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors',
                currentView === item.key ? 'text-blue-600' : 'text-gray-600'
              )}
            >
              <AutoIcon name={item.icon} className="w-5 h-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

// ===== MAIN APP COMPONENT =====
function App() {
  return (
    <AuthProvider>
      <CompleteFoodXchangeApp />
    </AuthProvider>
  );
}

export default App;