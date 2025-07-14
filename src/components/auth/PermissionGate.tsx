import React from 'react';
import { usePermissions, Permission } from '@hooks/usePermissions';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: Permission | Permission[];
  role?: string | string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  role,
  requireAll = false,
  fallback = null,
}) => {
  const { can, canAny, canAll, isRole, isAnyRole } = usePermissions();

  let hasAccess = true;

  // Check permissions
  if (permission) {
    if (Array.isArray(permission)) {
      hasAccess = requireAll ? canAll(permission) : canAny(permission);
    } else {
      hasAccess = can(permission);
    }
  }

  // Check roles
  if (role && hasAccess) {
    if (Array.isArray(role)) {
      hasAccess = requireAll ? role.every(r => isRole(r)) : isAnyRole(role);
    } else {
      hasAccess = isRole(role);
    }
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};