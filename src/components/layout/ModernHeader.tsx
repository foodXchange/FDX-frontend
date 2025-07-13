import { useState } from 'react';
import { MagnifyingGlassIcon, BellIcon, UserCircleIcon, Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface ModernHeaderProps {
  onMenuClick: () => void;
  notificationCount?: number;
  onLogout?: () => void;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({ onMenuClick, notificationCount = 0, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 glass-morphism border-b border-white/10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-gray-100/20 transition-colors">
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#B08D57] to-[#1E4C8A] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FX</span>
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-[#B08D57] to-[#1E4C8A] bg-clip-text text-transparent hidden sm:block">
                FoodXchange
              </span>
            </div>
          </div>
          
          <div className="flex-1 max-w-2xl mx-4 sm:mx-8">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, suppliers, or RFQs..."
                className="w-full pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4C8A]/50 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative p-2 rounded-lg hover:bg-gray-100/20 transition-colors">
              <BellIcon className="w-6 h-6" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF6B35] text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100/20 transition-colors">
              <UserCircleIcon className="w-6 h-6" />
            </button>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="p-2 rounded-lg hover:bg-red-100/20 transition-colors text-red-600"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};