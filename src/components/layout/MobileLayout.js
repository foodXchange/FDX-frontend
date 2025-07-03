// File: src/components/layout/MobileLayout.js

import React, { useState, useEffect } from 'react';
import { cn, AutoIcon } from '../../lib/design-system';
import { Button, Badge } from '../ui';

// ===== MOBILE NAVIGATION COMPONENT =====
const MobileNavigation = ({ isOpen, onClose, currentPath }) => {
  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'RFQs', path: '/rfqs', icon: 'rfqs', badge: 5 },
    { name: 'Orders', path: '/orders', icon: 'orders', badge: 2 },
    { name: 'Suppliers', path: '/suppliers', icon: 'suppliers' },
    { name: 'Products', path: '/products', icon: 'products' },
    { name: 'Compliance', path: '/compliance', icon: 'compliance' },
    { name: 'Analytics', path: '/analytics', icon: 'analytics' },
    { name: 'Settings', path: '/settings', icon: 'settings' }
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
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Side panel */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <AutoIcon name="food" className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">FoodXchange</span>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <AutoIcon name="XMarkIcon" className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map(item => (
            <a
              key={item.path}
              href={item.path}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                currentPath === item.path
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
              onClick={onClose}
            >
              <AutoIcon name={item.icon} className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
              {item.badge && (
                <Badge variant="danger" size="sm">{item.badge}</Badge>
              )}
            </a>
          ))}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <AutoIcon name="user" className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">john@foodxchange.com</p>
            </div>
          </div>
          
          <Button variant="outline" size="sm" className="w-full" icon="ArrowRightOnRectangleIcon">
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
};

// ===== MOBILE HEADER COMPONENT =====
const MobileHeader = ({ onMenuClick, title, subtitle, actions }) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <AutoIcon name="Bars3Icon" className="w-5 h-5 text-gray-600" />
          </button>
          
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

// ===== BOTTOM NAVIGATION (MOBILE) =====
const BottomNavigation = ({ currentPath }) => {
  const bottomNavItems = [
    { name: 'Home', path: '/dashboard', icon: 'dashboard' },
    { name: 'RFQs', path: '/rfqs', icon: 'rfqs', badge: 5 },
    { name: 'Orders', path: '/orders', icon: 'orders' },
    { name: 'More', path: '/menu', icon: 'EllipsisHorizontalIcon' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-30 lg:hidden">
      <div className="flex items-center justify-around">
        {bottomNavItems.map(item => (
          <a
            key={item.path}
            href={item.path}
            className={cn(
              'flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors relative',
              currentPath === item.path
                ? 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <div className="relative">
              <AutoIcon name={item.icon} className="w-5 h-5" />
              {item.badge && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{item.badge}</span>
                </div>
              )}
            </div>
            <span className="text-xs font-medium">{item.name}</span>
          </a>
        ))}
      </div>
    </nav>
  );
};

// ===== DESKTOP SIDEBAR =====
const DesktopSidebar = ({ currentPath, collapsed, onToggleCollapse }) => {
  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'RFQs', path: '/rfqs', icon: 'rfqs', badge: 5 },
    { name: 'Orders', path: '/orders', icon: 'orders', badge: 2 },
    { name: 'Suppliers', path: '/suppliers', icon: 'suppliers' },
    { name: 'Products', path: '/products', icon: 'products' },
    { name: 'Compliance', path: '/compliance', icon: 'compliance' },
    { name: 'Analytics', path: '/analytics', icon: 'analytics' },
    { name: 'Settings', path: '/settings', icon: 'settings' }
  ];

  return (
    <aside className={cn(
      'hidden lg:flex lg:flex-col bg-white border-r border-gray-200 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <AutoIcon name="food" className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">FoodXchange</span>
          </div>
        )}
        
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <AutoIcon 
            name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'} 
            className="w-4 h-4 text-gray-600" 
          />
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map(item => (
          <a
            key={item.path}
            href={item.path}
            className={cn(
              'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors relative group',
              currentPath === item.path
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-100'
            )}
            title={collapsed ? item.name : undefined}
          >
            <AutoIcon name={item.icon} className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <Badge variant="danger" size="sm">{item.badge}</Badge>
                )}
              </>
            )}
            
            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.name}
                {item.badge && (
                  <span className="ml-2 px-1.5 py-0.5 bg-red-500 rounded-full text-xs">
                    {item.badge}
                  </span>
                )}
              </div>
            )}
          </a>
        ))}
      </nav>
    </aside>
  );
};

// ===== RESPONSIVE GRID COMPONENT =====
export const ResponsiveGrid = ({ children, className, ...props }) => (
  <div 
    className={cn(
      'grid gap-4',
      'grid-cols-1',
      'sm:grid-cols-2', 
      'lg:grid-cols-3',
      'xl:grid-cols-4',
      className
    )} 
    {...props}
  >
    {children}
  </div>
);

// ===== MAIN LAYOUT COMPONENT =====
export const MobileResponsiveLayout = ({ 
  children, 
  title = 'Dashboard',
  subtitle,
  headerActions,
  currentPath = '/dashboard'
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <DesktopSidebar 
        currentPath={currentPath}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Mobile Navigation */}
      <MobileNavigation 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentPath={currentPath}
      />
      
      {/* Main Content Area */}
      <div className={cn(
        'flex-1 flex flex-col',
        !isMobile && (sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64')
      )}>
        {/* Mobile Header */}
        <MobileHeader 
          onMenuClick={() => setMobileMenuOpen(true)}
          title={title}
          subtitle={subtitle}
          actions={headerActions}
        />
        
        {/* Desktop Header */}
        <header className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            
            {headerActions && (
              <div className="flex items-center space-x-3">
                {headerActions}
              </div>
            )}
          </div>
        </header>
        
        {/* Main Content */}
        <main className={cn(
          'flex-1 p-4 lg:p-6',
          isMobile && 'pb-20' // Add bottom padding for mobile nav
        )}>
          {children}
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <BottomNavigation currentPath={currentPath} />
    </div>
  );
};

// ===== MOBILE-OPTIMIZED COMPONENTS =====

// Mobile-friendly card
export const MobileCard = ({ children, className, ...props }) => (
  <div 
    className={cn(
      'bg-white rounded-lg shadow border border-gray-200',
      'p-4 lg:p-6',
      className
    )} 
    {...props}
  >
    {children}
  </div>
);

// Mobile-friendly button group
export const MobileButtonGroup = ({ children, className }) => (
  <div className={cn(
    'flex flex-col space-y-2',
    'sm:flex-row sm:space-y-0 sm:space-x-2',
    className
  )}>
    {children}
  </div>
);

// Mobile-friendly form layout
export const MobileFormLayout = ({ children, className }) => (
  <div className={cn(
    'space-y-4',
    'lg:space-y-6',
    className
  )}>
    {children}
  </div>
);

// Mobile-friendly stats grid
export const MobileStatsGrid = ({ children, className }) => (
  <div className={cn(
    'grid gap-4',
    'grid-cols-1',
    'sm:grid-cols-2',
    'lg:grid-cols-4',
    className
  )}>
    {children}
  </div>
);

// ===== MOBILE UTILITIES =====

// Hook to detect mobile device
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return isMobile;
};

// Touch-friendly component wrapper
export const TouchFriendly = ({ children, className, ...props }) => (
  <div 
    className={cn(
      'touch-manipulation',
      'active:scale-95 transition-transform',
      className
    )} 
    {...props}
  >
    {children}
  </div>
);