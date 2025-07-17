import React from 'react';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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

export const formatPercentage = (value: number, decimals = 1) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const formatBusinessHours = (schedule: { [key: string]: { start: string; end: string }[] }) => {
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return daysOfWeek.map((day, index) => {
    const slots = schedule[day] || [];
    const dayName = dayNames[index];
    
    if (slots.length === 0) {
      return `${dayName}: Closed`;
    }
    
    const times = slots.map(slot => `${slot.start}-${slot.end}`).join(', ');
    return `${dayName}: ${times}`;
  });
};