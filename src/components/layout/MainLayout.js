// File: C:\Users\foodz\Documents\GitHub\Development\FDX-frontend\src\components\layout\MainLayout.js

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import {
  HomeIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  BuildingOfficeIcon,
  TruckIcon,
  ShieldCheckIcon,
  MapIcon,
  ChartBarIcon,
  UserIcon,
  Cog6ToothIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, unreadCount } = useNotification();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'RFQs', href: '/rfqs', icon: DocumentTextIcon },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingBagIcon },
    { name: 'Suppliers', href: '/suppliers', icon: BuildingOfficeIcon },
    { name: 'Orders', href: '/orders', icon: TruckIcon },
    { name: 'Compliance', href: '/compliance', icon: ShieldCheckIcon },
    { name: 'Logistics', href: '/logistics', icon: MapIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <div className="text-orange-500 text-lg font-bold">FOOD</div>
              <div className="text-teal-600 text-lg font-bold">XCHANGE</div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1 ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="text-orange-500 text-lg font-bold">FOOD</div>
              <div className="text-teal-600 text-lg font-bold">XCHANGE</div>
            </div>
          </div>
          <nav className="flex-1 px-4 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1 ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <h1 className="ml-2 text-xl font-semibold text-gray-900 lg:ml-0">
                {navigation.find(item => isActive(item.href))?.name || 'FoodXchange'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative text-gray-500 hover:text-gray-700">
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* User Menu */}
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.company}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/profile"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <UserIcon className="h-5 w-5" />
                    </Link>
                    <Link
                      to="/settings"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-gray-500 hover:text-red-600"
                      title="Logout"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;