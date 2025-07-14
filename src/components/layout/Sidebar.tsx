import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions, PERMISSIONS } from '@hooks/usePermissions';
import { 
  HomeIcon, 
  ChartBarIcon, 
  DocumentTextIcon,
  ShoppingCartIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentCheckIcon,
  FolderIcon,
  ChartPieIcon,
  BeakerIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  role?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Tracking', href: '/tracking', icon: ChartBarIcon },
  {
    name: 'RFQ Management',
    href: '/rfq',
    icon: DocumentTextIcon,
    children: [
      { name: 'All RFQs', href: '/rfq', icon: DocumentTextIcon },
      { name: 'Create RFQ', href: '/rfq/create', icon: DocumentTextIcon, permission: PERMISSIONS.RFQ_CREATE },
    ],
  },
  {
    name: 'Orders',
    href: '/orders',
    icon: ShoppingCartIcon,
    children: [
      { name: 'Order Lines', href: '/orders', icon: ShoppingCartIcon },
      { name: 'Standing Orders', href: '/orders/standing', icon: ShoppingCartIcon },
    ],
  },
  {
    name: 'Marketplace',
    href: '/marketplace',
    icon: BuildingStorefrontIcon,
    children: [
      { name: 'Browse', href: '/marketplace', icon: BuildingStorefrontIcon },
      { name: 'Products', href: '/marketplace/products', icon: BuildingStorefrontIcon },
      { name: 'Suppliers', href: '/marketplace/suppliers', icon: BuildingStorefrontIcon },
    ],
  },
  {
    name: 'Compliance',
    href: '/compliance',
    icon: ClipboardDocumentCheckIcon,
    permission: PERMISSIONS.COMPLIANCE_VIEW,
    children: [
      { name: 'Dashboard', href: '/compliance', icon: ClipboardDocumentCheckIcon },
      { name: 'Validator', href: '/compliance/validator', icon: ClipboardDocumentCheckIcon, permission: PERMISSIONS.COMPLIANCE_MANAGE },
    ],
  },
  { name: 'Documents', href: '/documents', icon: FolderIcon, permission: PERMISSIONS.DOCUMENT_VIEW },
  { name: 'Monitoring', href: '/monitoring', icon: ChartPieIcon },
  { name: 'Samples', href: '/samples', icon: BeakerIcon },
  {
    name: 'Admin',
    href: '/admin',
    icon: Cog6ToothIcon,
    role: 'admin',
    children: [
      { name: 'Data Import', href: '/admin/import', icon: Cog6ToothIcon },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { can, isRole } = usePermissions();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const canViewNavItem = (item: NavItem): boolean => {
    if (item.permission && !can(item.permission as any)) return false;
    if (item.role && !isRole(item.role)) return false;
    return true;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 bg-gray-900 transition-all duration-300 ${
          open ? 'w-64' : 'w-16'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
            {open && (
              <h2 className="text-xl font-semibold text-white">FoodXchange</h2>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white lg:hidden"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              if (!canViewNavItem(item)) return null;

              return (
                <div key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`
                    }
                    title={!open ? item.name : undefined}
                  >
                    <item.icon
                      className={`${
                        open ? 'mr-3' : 'mx-auto'
                      } h-6 w-6 flex-shrink-0`}
                    />
                    {open && <span>{item.name}</span>}
                  </NavLink>

                  {/* Children */}
                  {open && item.children && isActive(item.href) && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => {
                        if (!canViewNavItem(child)) return null;

                        return (
                          <NavLink
                            key={child.name}
                            to={child.href}
                            className={({ isActive }) =>
                              `group flex items-center px-2 py-1 text-sm font-medium rounded-md transition-colors ${
                                isActive
                                  ? 'text-white'
                                  : 'text-gray-400 hover:text-white'
                              }`
                            }
                          >
                            {child.name}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-700 p-4">
            {open ? (
              <div className="space-y-3">
                <NavLink
                  to="/profile"
                  className="flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <UserCircleIcon className="mr-3 h-6 w-6" />
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-400">{user?.role}</p>
                  </div>
                </NavLink>
                <button
                  onClick={logout}
                  className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <ArrowLeftOnRectangleIcon className="mr-3 h-6 w-6" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <NavLink
                  to="/profile"
                  className="flex items-center justify-center p-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
                  title="Profile"
                >
                  <UserCircleIcon className="h-6 w-6" />
                </NavLink>
                <button
                  onClick={logout}
                  className="flex items-center justify-center w-full p-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
                  title="Logout"
                >
                  <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};