import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyDetailed = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercentage = (value: number, decimals = 1) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatDate = (date: string | Date, formatStr = 'MMM dd, yyyy') => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr);
};

export const formatDateTime = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM dd, yyyy HH:mm');
};

export const formatRelativeTime = (date: string | Date) => {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(targetDate)) {
    return `Today at ${format(targetDate, 'HH:mm')}`;
  }
  
  if (isTomorrow(targetDate)) {
    return `Tomorrow at ${format(targetDate, 'HH:mm')}`;
  }
  
  if (isPast(targetDate)) {
    return formatDistanceToNow(targetDate, { addSuffix: true });
  }
  
  return format(targetDate, 'MMM d, yyyy \'at\' HH:mm');
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const formatInitials = (name: string) => {
  const parts = name.split(' ');
  return parts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
};

export const formatPhoneNumber = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phone;
};

export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export const formatOrderNumber = (id: string): string => {
  return `ORD-${id.toUpperCase().substring(0, 8)}`;
};

export const formatInvoiceNumber = (id: string): string => {
  return `INV-${new Date().getFullYear()}-${id.toUpperCase().substring(0, 5)}`;
};

export const formatContractNumber = (id: string): string => {
  return `CNT-${new Date().getFullYear()}-${id.toUpperCase().substring(0, 5)}`;
};