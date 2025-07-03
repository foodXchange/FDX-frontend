// File: src/components/ui/index.js

import React, { forwardRef } from 'react';
import { cn, AutoIcon, ButtonVariants, SizeVariants, getStatusConfig } from '../../lib/design-system';

// ===== BUTTON COMPONENT =====
export const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className,
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-95',
        ButtonVariants[variant],
        SizeVariants[size],
        className
      )}
      {...props}
    >
      {loading && <AutoIcon name="sync" spin className="mr-2 w-4 h-4" />}
      {!loading && icon && iconPosition === 'left' && (
        <AutoIcon name={icon} className="mr-2 w-4 h-4" />
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <AutoIcon name={icon} className="ml-2 w-4 h-4" />
      )}
    </button>
  );
});

Button.displayName = 'Button';

// ===== INPUT COMPONENT =====
export const Input = forwardRef(({ 
  label,
  error,
  hint,
  icon,
  className,
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <AutoIcon name={icon} className="w-5 h-5 text-gray-400" />
          </div>
        )}
        
        <input
          ref={ref}
          className={cn(
            'block w-full rounded-lg border shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:bg-gray-50 disabled:text-gray-500',
            icon ? 'pl-10' : 'pl-3',
            'pr-3 py-2',
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
            className
          )}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-xs text-red-600 flex items-center">
          <AutoIcon name="error" className="w-3 h-3 mr-1" />
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// ===== CARD COMPONENT =====
export const Card = ({ children, variant = 'default', className, ...props }) => {
  const variants = {
    default: 'bg-white rounded-lg shadow border border-gray-200',
    elevated: 'bg-white rounded-xl shadow-lg border border-gray-100',
    glass: 'bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200',
    gradient: 'bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100'
  };

  return (
    <div 
      className={cn(variants[variant], className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }) => (
  <div className={cn('px-6 py-4 border-b border-gray-200', className)} {...props}>
    {children}
  </div>
);

export const CardContent = ({ children, className, ...props }) => (
  <div className={cn('px-6 py-4', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }) => (
  <div className={cn('px-6 py-4 border-t border-gray-200', className)} {...props}>
    {children}
  </div>
);

// ===== BADGE COMPONENT =====
export const Badge = ({ children, variant = 'default', size = 'md', className, ...props }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };

  return (
    <span 
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variants[variant],
        sizes[size],
        className
      )} 
      {...props}
    >
      {children}
    </span>
  );
};

// ===== STATUS BADGE COMPONENT =====
export const StatusBadge = ({ status, icon, className, ...props }) => {
  const config = getStatusConfig(status);
  
  const statusLabels = {
    active: 'Active',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    draft: 'Draft'
  };

  return (
    <div 
      className={cn(
        'inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium',
        config.bgLight,
        config.text,
        config.border,
        'border',
        className
      )}
      {...props}
    >
      {icon && <AutoIcon name={icon} className="w-4 h-4" />}
      <span>{statusLabels[status] || status}</span>
    </div>
  );
};

// ===== PROGRESS COMPONENT =====
export const Progress = ({ value = 0, max = 100, variant = 'primary', showLabel = true, className }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const variants = {
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className={cn('h-full rounded-full transition-all duration-1000 ease-out', variants[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ===== LOADING SPINNER =====
export const Spinner = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <AutoIcon 
      name="sync" 
      spin 
      className={cn(sizes[size], 'text-blue-500', className)} 
    />
  );
};

// ===== ALERT COMPONENT =====
export const Alert = ({ children, variant = 'info', icon, title, className, ...props }) => {
  const variants = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border-red-200 text-red-800'
  };

  const defaultIcons = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    danger: 'error'
  };

  return (
    <div 
      className={cn(
        'p-4 rounded-lg border',
        variants[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-start">
        <AutoIcon 
          name={icon || defaultIcons[variant]} 
          className="w-5 h-5 mr-3 mt-0.5" 
        />
        <div className="flex-1">
          {title && (
            <h4 className="font-medium mb-1">{title}</h4>
          )}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
};

// ===== TOOLTIP COMPONENT =====
export const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          className={cn(
            'absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg',
            'whitespace-nowrap',
            positions[position]
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};

// ===== EMPTY STATE COMPONENT =====
export const EmptyState = ({ 
  icon = 'folder', 
  title, 
  description, 
  action,
  className 
}) => (
  <div className={cn('text-center py-12', className)}>
    <AutoIcon 
      name={icon} 
      className="w-12 h-12 text-gray-400 mx-auto mb-4" 
    />
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    {description && (
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
    )}
    {action}
  </div>
);

// ===== SKELETON LOADER =====
export const Skeleton = ({ className, ...props }) => (
  <div 
    className={cn('animate-pulse bg-gray-200 rounded', className)} 
    {...props} 
  />
);

// ===== DIVIDER =====
export const Divider = ({ orientation = 'horizontal', className, ...props }) => {
  return (
    <div 
      className={cn(
        'bg-gray-200',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        className
      )}
      {...props}
    />
  );
};