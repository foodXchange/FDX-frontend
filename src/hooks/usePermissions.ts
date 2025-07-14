import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Define all available permissions in the system
export const PERMISSIONS = {
  // RFQ Permissions
  RFQ_VIEW: 'rfq.view',
  RFQ_CREATE: 'rfq.create',
  RFQ_EDIT: 'rfq.edit',
  RFQ_DELETE: 'rfq.delete',
  RFQ_APPROVE: 'rfq.approve',
  
  // Order Permissions
  ORDER_VIEW: 'order.view',
  ORDER_CREATE: 'order.create',
  ORDER_EDIT: 'order.edit',
  ORDER_DELETE: 'order.delete',
  ORDER_APPROVE: 'order.approve',
  
  // Product Permissions
  PRODUCT_VIEW: 'product.view',
  PRODUCT_CREATE: 'product.create',
  PRODUCT_EDIT: 'product.edit',
  PRODUCT_DELETE: 'product.delete',
  
  // Compliance Permissions
  COMPLIANCE_VIEW: 'compliance.view',
  COMPLIANCE_MANAGE: 'compliance.manage',
  COMPLIANCE_APPROVE: 'compliance.approve',
  
  // Document Permissions
  DOCUMENT_VIEW: 'document.view',
  DOCUMENT_UPLOAD: 'document.upload',
  DOCUMENT_DELETE: 'document.delete',
  
  // User Management Permissions
  USER_VIEW: 'user.view',
  USER_CREATE: 'user.create',
  USER_EDIT: 'user.edit',
  USER_DELETE: 'user.delete',
  
  // Reporting Permissions
  REPORT_VIEW: 'report.view',
  REPORT_CREATE: 'report.create',
  REPORT_EXPORT: 'report.export',
  
  // Settings Permissions
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_MANAGE: 'settings.manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Define role-based permission mappings
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: Object.values(PERMISSIONS), // Admin has all permissions
  
  supplier: [
    PERMISSIONS.RFQ_VIEW,
    PERMISSIONS.RFQ_CREATE,
    PERMISSIONS.RFQ_EDIT,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_EDIT,
    PERMISSIONS.COMPLIANCE_VIEW,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],
  
  buyer: [
    PERMISSIONS.RFQ_VIEW,
    PERMISSIONS.RFQ_CREATE,
    PERMISSIONS.RFQ_EDIT,
    PERMISSIONS.RFQ_APPROVE,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_EDIT,
    PERMISSIONS.ORDER_APPROVE,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.COMPLIANCE_VIEW,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_CREATE,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.SETTINGS_VIEW,
  ],
  
  viewer: [
    PERMISSIONS.RFQ_VIEW,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.COMPLIANCE_VIEW,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.REPORT_VIEW,
  ],
};

export const usePermissions = () => {
  const { user, hasPermission, hasRole } = useAuth();

  const can = useCallback((permission: Permission): boolean => {
    return hasPermission(permission);
  }, [hasPermission]);

  const canAny = useCallback((permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const canAll = useCallback((permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  const isRole = useCallback((role: string): boolean => {
    return hasRole(role);
  }, [hasRole]);

  const isAnyRole = useCallback((roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  }, [hasRole]);

  return {
    user,
    can,
    canAny,
    canAll,
    isRole,
    isAnyRole,
    permissions: user?.permissions || [],
    role: user?.role,
  };
};