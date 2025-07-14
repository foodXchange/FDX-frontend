import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';

interface ProgressIndicatorProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'linear' | 'circular' | 'steps';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'linear',
  color = 'primary',
  showLabel = false,
  label,
  className,
  animated = true,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    linear: {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-4',
    },
    circular: {
      sm: 'w-12 h-12',
      md: 'w-16 h-16',
      lg: 'w-24 h-24',
    },
    steps: {
      sm: 'h-8',
      md: 'h-10',
      lg: 'h-12',
    },
  };

  const colorClasses = {
    primary: 'from-[#1E4C8A] to-[#2E6BB8]',
    success: 'from-green-500 to-green-600',
    warning: 'from-yellow-500 to-yellow-600',
    danger: 'from-red-500 to-red-600',
  };

  if (variant === 'linear') {
    return (
      <div className={cn('w-full', className)}>
        {(showLabel || label) && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {label || 'Progress'}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        <div className={cn(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          sizeClasses.linear[size]
        )}>
          <motion.div
            className={cn(
              'h-full bg-gradient-to-r rounded-full',
              colorClasses[color]
            )}
            initial={animated ? { width: 0 } : { width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'circular') {
    const radius = size === 'sm' ? 20 : size === 'md' ? 28 : 40;
    const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className={cn('relative inline-flex', sizeClasses.circular[size], className)}>
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            className={cn('text-[#1E4C8A]')}
            style={{
              strokeDasharray: circumference,
              stroke: `url(#gradient-${color})`,
            }}
            initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={cn('text-[#1E4C8A]')} stopColor="currentColor" />
              <stop offset="100%" className={cn('text-[#2E6BB8]')} stopColor="currentColor" />
            </linearGradient>
          </defs>
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              'font-semibold',
              size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'
            )}>
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'steps') {
    const steps = 5;
    const activeSteps = Math.ceil((percentage / 100) * steps);

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <div className="mb-2">
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </div>
        )}
        <div className="flex space-x-2">
          {Array.from({ length: steps }).map((_, index) => (
            <motion.div
              key={index}
              className={cn(
                'flex-1 rounded-full',
                sizeClasses.steps[size],
                index < activeSteps
                  ? `bg-gradient-to-r ${colorClasses[color]}`
                  : 'bg-gray-200'
              )}
              initial={animated ? { scale: 0.8, opacity: 0 } : {}}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            />
          ))}
        </div>
        {showLabel && (
          <div className="mt-2 text-center">
            <span className="text-sm font-medium text-gray-700">
              Step {activeSteps} of {steps}
            </span>
          </div>
        )}
      </div>
    );
  }

  return null;
};

// Loading Spinner Component
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}> = ({ size = 'md', color = 'text-[#1E4C8A]', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <svg
      className={cn('animate-spin', sizeClasses[size], color, className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Page Loading Component
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};