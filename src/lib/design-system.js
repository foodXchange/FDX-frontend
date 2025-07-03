// File: src/lib/design-system.js

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as HeroIcons from '@heroicons/react/24/outline';
import * as HeroIconsSolid from '@heroicons/react/24/solid';

// Utility function for merging Tailwind classes
export const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};

// Enhanced Icon Mapping for Food Industry
export const IconMap = {
  // Status & Actions
  approved: 'CheckCircleIcon',
  pending: 'ClockIcon',
  rejected: 'XCircleIcon',
  active: 'PlayIcon',
  paused: 'PauseIcon',
  completed: 'CheckBadgeIcon',
  draft: 'DocumentIcon',
  
  // CRUD Operations
  create: 'PlusIcon',
  edit: 'PencilIcon',
  delete: 'TrashIcon',
  view: 'EyeIcon',
  copy: 'DocumentDuplicateIcon',
  download: 'ArrowDownTrayIcon',
  upload: 'ArrowUpTrayIcon',
  share: 'ShareIcon',
  save: 'CheckIcon',
  cancel: 'XMarkIcon',
  
  // Navigation & Menu
  dashboard: 'Squares2X2Icon',
  rfqs: 'DocumentTextIcon',
  suppliers: 'BuildingOfficeIcon',
  orders: 'ShoppingCartIcon',
  products: 'CubeIcon',
  compliance: 'ShieldCheckIcon',
  logistics: 'TruckIcon',
  analytics: 'ChartBarIcon',
  reports: 'DocumentChartBarIcon',
  settings: 'Cog6ToothIcon',
  profile: 'UserCircleIcon',
  
  // Communication
  chat: 'ChatBubbleLeftIcon',
  notification: 'BellIcon',
  message: 'EnvelopeIcon',
  phone: 'PhoneIcon',
  video: 'VideoCameraIcon',
  
  // Users & Teams
  user: 'UserIcon',
  users: 'UsersIcon',
  team: 'UserGroupIcon',
  admin: 'KeyIcon',
  
  // Food Industry Specific
  food: 'CakeIcon',
  organic: 'LeafIcon',
  certification: 'StarIcon',
  allergen: 'ExclamationTriangleIcon',
  temperature: 'FireIcon',
  frozen: 'CubeTransparentIcon',
  quality: 'BeakerIcon',
  packaging: 'ArchiveBoxIcon',
  shipping: 'TruckIcon',
  storage: 'BuildingStorefrontIcon',
  farm: 'HomeIcon',
  factory: 'BuildingOffice2Icon',
  
  // System & Status
  connection: 'WifiIcon',
  offline: 'WifiIcon',
  online: 'GlobeAltIcon',
  sync: 'ArrowPathIcon',
  refresh: 'ArrowPathIcon',
  loading: 'ArrowPathIcon',
  
  // Alerts & Feedback
  success: 'CheckCircleIcon',
  warning: 'ExclamationTriangleIcon',
  error: 'XCircleIcon',
  info: 'InformationCircleIcon',
  
  // Data & Files
  file: 'DocumentIcon',
  pdf: 'DocumentIcon',
  excel: 'TableCellsIcon',
  image: 'PhotoIcon',
  folder: 'FolderIcon',
  
  // Finance & Business
  money: 'CurrencyDollarIcon',
  invoice: 'ReceiptPercentIcon',
  payment: 'CreditCardIcon',
  budget: 'CalculatorIcon',
  profit: 'TrendingUpIcon',
  loss: 'TrendingDownIcon',
  
  // Search & Filter
  search: 'MagnifyingGlassIcon',
  filter: 'FunnelIcon',
  sort: 'Bars3BottomLeftIcon',
  
  // Calendar & Time
  calendar: 'CalendarIcon',
  clock: 'ClockIcon',
  deadline: 'CalendarDaysIcon',
  
  // Security & Privacy
  security: 'LockClosedIcon',
  unlock: 'LockOpenIcon',
  privacy: 'EyeSlashIcon',
  
  // Misc
  help: 'QuestionMarkCircleIcon',
  external: 'ArrowTopRightOnSquareIcon',
  expand: 'ArrowsPointingOutIcon',
  collapse: 'ArrowsPointingInIcon'
};

// Auto-Icon Component with Enhanced Features
export const AutoIcon = ({ 
  name, 
  variant = 'outline', 
  className = 'w-5 h-5', 
  spin = false,
  ...props 
}) => {
  const iconName = IconMap[name] || name;
  const IconComponent = variant === 'solid' 
    ? HeroIconsSolid[iconName] 
    : HeroIcons[iconName];
  
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found in Heroicons`);
    return <HeroIcons.QuestionMarkCircleIcon className={cn(className, spin && 'animate-spin')} {...props} />;
  }
  
  return <IconComponent className={cn(className, spin && 'animate-spin')} {...props} />;
};

// Color Schemes for Status System
export const StatusColors = {
  active: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    bgHover: 'hover:bg-blue-100',
    text: 'text-blue-700',
    textLight: 'text-blue-600',
    border: 'border-blue-200',
    ring: 'ring-blue-500/20'
  },
  pending: {
    bg: 'bg-yellow-500',
    bgLight: 'bg-yellow-50',
    bgHover: 'hover:bg-yellow-100',
    text: 'text-yellow-700',
    textLight: 'text-yellow-600',
    border: 'border-yellow-200',
    ring: 'ring-yellow-500/20'
  },
  approved: {
    bg: 'bg-green-500',
    bgLight: 'bg-green-50',
    bgHover: 'hover:bg-green-100',
    text: 'text-green-700',
    textLight: 'text-green-600',
    border: 'border-green-200',
    ring: 'ring-green-500/20'
  },
  rejected: {
    bg: 'bg-red-500',
    bgLight: 'bg-red-50',
    bgHover: 'hover:bg-red-100',
    text: 'text-red-700',
    textLight: 'text-red-600',
    border: 'border-red-200',
    ring: 'ring-red-500/20'
  },
  completed: {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-50',
    bgHover: 'hover:bg-purple-100',
    text: 'text-purple-700',
    textLight: 'text-purple-600',
    border: 'border-purple-200',
    ring: 'ring-purple-500/20'
  },
  draft: {
    bg: 'bg-gray-500',
    bgLight: 'bg-gray-50',
    bgHover: 'hover:bg-gray-100',
    text: 'text-gray-700',
    textLight: 'text-gray-600',
    border: 'border-gray-200',
    ring: 'ring-gray-500/20'
  }
};

// Button Variants System
export const ButtonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
  success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm',
  warning: 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  ghost: 'hover:bg-gray-100 text-gray-700',
  outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
};

// Size Variants
export const SizeVariants = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2 text-base',
  xl: 'px-6 py-3 text-lg'
};

// Animation Presets
export const Animations = {
  fadeIn: 'animate-in fade-in duration-200',
  slideIn: 'animate-in slide-in-from-bottom duration-300',
  scaleIn: 'animate-in zoom-in duration-200',
  bounceIn: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin'
};

// Spacing System
export const Spacing = {
  xs: 'space-y-1',
  sm: 'space-y-2', 
  md: 'space-y-4',
  lg: 'space-y-6',
  xl: 'space-y-8'
};

// Typography System
export const Typography = {
  h1: 'text-3xl font-bold tracking-tight text-gray-900',
  h2: 'text-2xl font-bold tracking-tight text-gray-900',
  h3: 'text-xl font-semibold text-gray-900',
  h4: 'text-lg font-semibold text-gray-900',
  body: 'text-base text-gray-700',
  small: 'text-sm text-gray-600',
  xs: 'text-xs text-gray-500',
  lead: 'text-lg text-gray-600'
};

// Card Variants
export const CardVariants = {
  default: 'bg-white rounded-lg shadow border border-gray-200',
  elevated: 'bg-white rounded-xl shadow-lg border border-gray-100',
  glass: 'bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200',
  gradient: 'bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100'
};

// Form Field Variants
export const FieldVariants = {
  default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
  error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-300 focus:border-green-500 focus:ring-green-500'
};

// Utility Functions
export const getStatusConfig = (status) => {
  return StatusColors[status] || StatusColors.draft;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};