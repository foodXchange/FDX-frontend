// Utility functions for formatting data
export const formatCurrency = (
  amount: number, 
  options: {
    locale?: string;
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  const {
    locale = 'en-US',
    currency = 'USD',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(amount);
};

export const formatNumber = (
  value: number,
  options: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
  } = {}
): string => {
  const {
    locale = 'en-US',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    notation = 'standard'
  } = options;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    notation
  }).format(value);
};

export const formatPercentage = (
  value: number,
  options: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  const {
    locale = 'en-US',
    minimumFractionDigits = 0,
    maximumFractionDigits = 1
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);
};

export const formatDate = (
  date: Date | string | number,
  options: {
    locale?: string;
    dateStyle?: 'full' | 'long' | 'medium' | 'short';
    timeStyle?: 'full' | 'long' | 'medium' | 'short';
  } = {}
): string => {
  const {
    locale = 'en-US',
    dateStyle = 'medium',
    timeStyle
  } = options;

  const dateObj = date instanceof Date ? date : new Date(date);
  
  return new Intl.DateTimeFormat(locale, {
    dateStyle,
    timeStyle
  }).format(dateObj);
};

export const formatRelativeTime = (
  date: Date | string | number,
  options: {
    locale?: string;
    numeric?: 'always' | 'auto';
  } = {}
): string => {
  const {
    locale = 'en-US',
    numeric = 'auto'
  } = options;

  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diff = dateObj.getTime() - now.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric });

  if (Math.abs(days) > 0) {
    return rtf.format(days, 'day');
  } else if (Math.abs(hours) > 0) {
    return rtf.format(hours, 'hour');
  } else if (Math.abs(minutes) > 0) {
    return rtf.format(minutes, 'minute');
  } else {
    return rtf.format(seconds, 'second');
  }
};

export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};