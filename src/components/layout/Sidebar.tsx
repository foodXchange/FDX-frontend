import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions, PERMISSIONS } from '@hooks/usePermissions';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Collapse } from '@mui/material';
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
  XMarkIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  EyeIcon,
  ChartBarIcon as ChartAnalyticsIcon
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  permission?: string;
  role?: string;
  agentOnly?: boolean;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Tracking', href: '/tracking', icon: ChartBarIcon },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: ChartPieIcon,
    children: [
      { name: 'Advanced Analytics', href: '/analytics', icon: ChartBarIcon },
      { name: 'Multi-Role Dashboard', href: '/analytics/multi-role', icon: HomeIcon },
      { name: 'Reporting Engine', href: '/analytics/reporting', icon: DocumentTextIcon },
      { name: 'Supplier Analytics', href: '/analytics/suppliers', icon: BuildingStorefrontIcon },
      { name: 'Compliance Tracker', href: '/analytics/compliance', icon: ClipboardDocumentCheckIcon },
    ],
  },
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
    name: 'AI Recommendations',
    href: '/ai-recommendations',
    icon: SparklesIcon,
    children: [
      { name: 'Recommendation Engine', href: '/ai-recommendations', icon: SparklesIcon },
      { name: 'Visual Similarity', href: '/ai-recommendations/visual-similarity', icon: EyeIcon },
      { name: 'Predictive Analytics', href: '/ai-recommendations/predictive-analytics', icon: ChartAnalyticsIcon },
    ],
  },
  {
    name: 'Collaboration',
    href: '/collaboration',
    icon: BriefcaseIcon,
    children: [
      { name: 'Collaboration Hub', href: '/collaboration', icon: BriefcaseIcon },
      { name: 'Project Management', href: '/collaboration/projects', icon: DocumentTextIcon },
    ],
  },
  // Agent-specific navigation items
  { 
    name: 'My Leads', 
    href: '/agent/leads', 
    icon: BriefcaseIcon, 
    agentOnly: true 
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
      { name: 'Certification Manager', href: '/compliance/certifications', icon: ClipboardDocumentCheckIcon },
      { name: 'Audit Manager', href: '/compliance/audits', icon: ClipboardDocumentCheckIcon },
      { name: 'Compliance Tracker', href: '/compliance/tracker', icon: ClipboardDocumentCheckIcon },
      { name: 'Validator', href: '/compliance/validator', icon: ClipboardDocumentCheckIcon, permission: PERMISSIONS.COMPLIANCE_MANAGE },
    ],
  },
  { name: 'Documents', href: '/documents', icon: FolderIcon, permission: PERMISSIONS.DOCUMENT_VIEW },
  { name: 'Monitoring', href: '/monitoring', icon: ChartPieIcon },
  { name: 'Samples', href: '/samples', icon: BeakerIcon },
  // Agent-specific navigation items
  { 
    name: 'Earnings', 
    href: '/agent/earnings', 
    icon: CurrencyDollarIcon, 
    agentOnly: true 
  },
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
    if (item.agentOnly && (!user?.isAgent && user?.role !== 'agent')) return false;
    return true;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(75, 85, 99, 0.75)',
            zIndex: 20,
            display: { lg: 'none' }
          }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 30,
          bgcolor: 'grey.900',
          transition: 'width 0.3s',
          width: open ? 256 : 64
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, px: 2, bgcolor: 'grey.800' }}>
            {open && (
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>FoodXchange</Typography>
            )}
            <IconButton
              onClick={onClose}
              sx={{ color: 'grey.400', '&:hover': { color: 'white' }, display: { lg: 'none' } }}
            >
              <Box component={XMarkIcon} sx={{ width: 24, height: 24 }} />
            </IconButton>
          </Box>

          {/* Navigation */}
          <Box component="nav" sx={{ flex: 1, px: 1, py: 2, overflowY: 'auto' }}>
            <List sx={{ '& > *': { mb: 0.5 } }}>
              {navigation.map((item) => {
                if (!canViewNavItem(item)) return null;

                return (
                  <Box key={item.name}>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={NavLink}
                        to={item.href}
                        sx={{
                          borderRadius: 2,
                          px: 1,
                          py: 1,
                          minHeight: 40,
                          color: 'grey.300',
                          '&:hover': {
                            bgcolor: 'grey.700',
                            color: 'white'
                          },
                          '&.active': {
                            bgcolor: 'grey.800',
                            color: 'white'
                          }
                        }}
                        title={!open ? item.name : undefined}
                      >
                        <ListItemIcon sx={{ minWidth: open ? 40 : 'auto', justifyContent: 'center' }}>
                          <Box component={item.icon} sx={{ width: 24, height: 24, color: 'inherit' }} />
                        </ListItemIcon>
                        {open && <ListItemText primary={item.name} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />}
                      </ListItemButton>
                    </ListItem>

                    {/* Children */}
                    {open && item.children && (
                      <Collapse in={isActive(item.href)} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding sx={{ pl: 4 }}>
                          {item.children.map((child) => {
                            if (!canViewNavItem(child)) return null;

                            return (
                              <ListItem key={child.name} disablePadding>
                                <ListItemButton
                                  component={NavLink}
                                  to={child.href}
                                  sx={{
                                    borderRadius: 2,
                                    py: 0.5,
                                    minHeight: 32,
                                    color: 'grey.400',
                                    '&:hover': {
                                      color: 'white'
                                    },
                                    '&.active': {
                                      color: 'white'
                                    }
                                  }}
                                >
                                  <ListItemText primary={child.name} primaryTypographyProps={{ fontSize: '0.875rem' }} />
                                </ListItemButton>
                              </ListItem>
                            );
                          })}
                        </List>
                      </Collapse>
                    )}
                  </Box>
                );
              })}
            </List>
          </Box>

          {/* User section */}
          <Box sx={{ borderTop: 1, borderColor: 'grey.700', p: 2 }}>
            {open ? (
              <Box sx={{ '& > *': { mb: 1.5 } }}>
                <ListItemButton
                  component={NavLink}
                  to="/profile"
                  sx={{
                    borderRadius: 2,
                    px: 1,
                    py: 1,
                    color: 'grey.300',
                    '&:hover': {
                      bgcolor: 'grey.700',
                      color: 'white'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Box component={UserCircleIcon} sx={{ width: 24, height: 24 }} />
                  </ListItemIcon>
                  <Box>
                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{user?.name}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: 'grey.400' }}>{user?.role}</Typography>
                  </Box>
                </ListItemButton>
                <ListItemButton
                  onClick={logout}
                  sx={{
                    borderRadius: 2,
                    px: 1,
                    py: 1,
                    color: 'grey.300',
                    '&:hover': {
                      bgcolor: 'grey.700',
                      color: 'white'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Box component={ArrowLeftOnRectangleIcon} sx={{ width: 24, height: 24 }} />
                  </ListItemIcon>
                  <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />
                </ListItemButton>
              </Box>
            ) : (
              <Box sx={{ '& > *': { mb: 1.5 } }}>
                <IconButton
                  component={NavLink}
                  to="/profile"
                  sx={{
                    width: '100%',
                    color: 'grey.300',
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: 'grey.700',
                      color: 'white'
                    }
                  }}
                  title="Profile"
                >
                  <Box component={UserCircleIcon} sx={{ width: 24, height: 24 }} />
                </IconButton>
                <IconButton
                  onClick={logout}
                  sx={{
                    width: '100%',
                    color: 'grey.300',
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: 'grey.700',
                      color: 'white'
                    }
                  }}
                  title="Logout"
                >
                  <Box component={ArrowLeftOnRectangleIcon} sx={{ width: 24, height: 24 }} />
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};