import React from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  ShoppingCartIcon,
  UsersIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@utils/cn';
import { Button } from './Button';

export type EmptyStateType = 'no-data' | 'no-results' | 'error' | 'coming-soon';

interface EmptyStateProps {
  type?: EmptyStateType;
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'secondary';
  };
  className?: string;
}

const defaultIcons = {
  'no-data': FolderOpenIcon,
  'no-results': MagnifyingGlassIcon,
  'error': DocumentTextIcon,
  'coming-soon': PlusCircleIcon,
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-data',
  icon,
  title,
  description,
  action,
  className,
}) => {
  const Icon = icon || defaultIcons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-[#B08D57] to-[#1E4C8A] opacity-10 blur-3xl rounded-full" />
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Icon className="relative w-24 h-24 text-gray-400" />
        </motion.div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      
      {description && (
        <p className="text-sm text-gray-600 mb-6 max-w-sm">{description}</p>
      )}

      {action && (
        <Button
          variant={action.variant || 'default'}
          onClick={action.onClick}
          className="hover-lift"
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
};

// Predefined Empty States
export const NoProductsEmptyState: React.FC<{ onAddProduct?: () => void }> = ({ onAddProduct }) => (
  <EmptyState
    icon={ShoppingCartIcon}
    title="No Products Found"
    description="Start adding products to your marketplace to see them here."
    action={
      onAddProduct
        ? {
            label: 'Add Your First Product',
            onClick: onAddProduct,
          }
        : undefined
    }
  />
);

export const NoRFQsEmptyState: React.FC<{ onCreateRFQ?: () => void }> = ({ onCreateRFQ }) => (
  <EmptyState
    icon={DocumentTextIcon}
    title="No RFQs Yet"
    description="Create your first Request for Quotation to start sourcing products."
    action={
      onCreateRFQ
        ? {
            label: 'Create New RFQ',
            onClick: onCreateRFQ,
          }
        : undefined
    }
  />
);

export const NoSuppliersEmptyState: React.FC<{ onInviteSuppliers?: () => void }> = ({ onInviteSuppliers }) => (
  <EmptyState
    icon={UsersIcon}
    title="No Suppliers Connected"
    description="Invite suppliers to join your network and start collaborating."
    action={
      onInviteSuppliers
        ? {
            label: 'Invite Suppliers',
            onClick: onInviteSuppliers,
          }
        : undefined
    }
  />
);

export const SearchEmptyState: React.FC<{ searchTerm?: string; onClearSearch?: () => void }> = ({
  searchTerm,
  onClearSearch,
}) => (
  <EmptyState
    type="no-results"
    title={`No results for "${searchTerm}"`}
    description="Try adjusting your search terms or filters."
    action={
      onClearSearch
        ? {
            label: 'Clear Search',
            onClick: onClearSearch,
            variant: 'secondary',
          }
        : undefined
    }
  />
);

export const ComingSoonEmptyState: React.FC<{ feature?: string }> = ({ feature }) => (
  <EmptyState
    type="coming-soon"
    title={`${feature || 'This Feature'} Coming Soon`}
    description="We're working hard to bring you this feature. Stay tuned!"
  />
);

// Animated Empty State with Illustration
export const IllustratedEmptyState: React.FC<{
  illustration: 'products' | 'orders' | 'analytics';
  title: string;
  description?: string;
  action?: EmptyStateProps['action'];
}> = ({ illustration, title, description, action }) => {
  const illustrations = {
    products: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <motion.rect
          x="50"
          y="50"
          width="100"
          height="100"
          rx="10"
          fill="none"
          stroke="#B08D57"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="100"
          cy="100"
          r="30"
          fill="#1E4C8A"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
        />
      </svg>
    ),
    orders: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <motion.path
          d="M50 100 L100 50 L150 100 L100 150 Z"
          fill="none"
          stroke="#1E4C8A"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="100"
          cy="100"
          r="20"
          fill="#B08D57"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
        />
      </svg>
    ),
    analytics: (
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <motion.line
          x1="40"
          y1="160"
          x2="160"
          y2="160"
          stroke="#1E4C8A"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.line
          x1="40"
          y1="40"
          x2="40"
          y2="160"
          stroke="#1E4C8A"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.polyline
          points="60,140 80,100 100,120 120,80 140,100"
          fill="none"
          stroke="#B08D57"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1, duration: 1.5, ease: 'easeInOut' }}
        />
      </svg>
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="w-48 h-48 mb-8">
        {illustrations[illustration]}
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      
      {description && (
        <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      )}

      {action && (
        <Button
          variant={action.variant || 'default'}
          onClick={action.onClick}
          className="hover-lift"
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
};