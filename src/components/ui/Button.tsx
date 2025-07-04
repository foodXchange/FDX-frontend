import React from 'react';
import { Plus, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode | string;
  iconPosition?: 'left' | 'right';
}

const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    create: Plus,
    filter: Filter,
    download: Download,
    search: ChevronLeft,
    'chevron-left': ChevronLeft,
    'chevron-right': ChevronRight,
  };
  
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500',
    secondary: 'bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-orange-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-orange-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1',
    md: 'px-4 py-2 text-base gap-2', 
    lg: 'px-6 py-3 text-lg gap-2'
  };
  
  const buttonClasses = ${baseClasses}   ;
  
  const iconElement = typeof icon === 'string' ? getIconComponent(icon) : icon;
  
  return (
    <button 
      className={buttonClasses}
      disabled={disabled}
      {...props}
    >
      {iconElement && iconPosition === 'left' && (
        <span className="flex-shrink-0">{iconElement}</span>
      )}
      {children}
      {iconElement && iconPosition === 'right' && (
        <span className="flex-shrink-0">{iconElement}</span>
      )}
    </button>
  );
};
