import React from 'react';
import { Badge } from './Badge';

export interface StatusBadgeProps {
  status: string;
  type?: 'rfq' | 'order' | 'proposal' | 'compliance' | 'general';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  type = 'general', 
  size = 'md', 
  className 
}) => {
  const getStatusVariant = (status: string, type: string) => {
    const statusLower = status.toLowerCase();
    
    switch (type) {
      case 'rfq':
        switch (statusLower) {
          case 'draft':
            return 'default';
          case 'published':
          case 'active':
            return 'primary';
          case 'closed':
          case 'awarded':
            return 'success';
          case 'expired':
          case 'cancelled':
            return 'warning';
          default:
            return 'default';
        }
      
      case 'order':
        switch (statusLower) {
          case 'pending':
            return 'default';
          case 'confirmed':
          case 'processing':
            return 'primary';
          case 'shipped':
          case 'delivered':
          case 'completed':
            return 'success';
          case 'cancelled':
          case 'refunded':
            return 'warning';
          default:
            return 'default';
        }
      
      case 'proposal':
        switch (statusLower) {
          case 'draft':
          case 'submitted':
            return 'default';
          case 'under_review':
          case 'under review':
            return 'primary';
          case 'accepted':
            return 'success';
          case 'rejected':
          case 'withdrawn':
            return 'warning';
          default:
            return 'default';
        }
      
      case 'compliance':
        switch (statusLower) {
          case 'pending':
            return 'default';
          case 'valid':
          case 'compliant':
            return 'success';
          case 'invalid':
          case 'non-compliant':
            return 'warning';
          case 'expired':
            return 'warning';
          case 'warning':
            return 'warning';
          default:
            return 'default';
        }
      
      default:
        switch (statusLower) {
          case 'active':
          case 'success':
          case 'completed':
          case 'approved':
            return 'success';
          case 'pending':
          case 'in_progress':
          case 'in progress':
            return 'primary';
          case 'inactive':
          case 'failed':
          case 'rejected':
          case 'cancelled':
            return 'warning';
          default:
            return 'default';
        }
    }
  };

  const getStatusText = (status: string) => {
    return status
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const variant = getStatusVariant(status, type);
  const displayText = getStatusText(status);

  return (
    <Badge 
      variant={variant} 
      size={size} 
      className={className}
    >
      {displayText}
    </Badge>
  );
};