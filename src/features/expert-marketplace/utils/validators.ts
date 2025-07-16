import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const phoneSchema = z.string().regex(
  /^\+?[\d\s\-\(\)]{10,}$/,
  'Invalid phone number'
);

export const urlSchema = z.string().url('Invalid URL');

export const timeSlotSchema = z.object({
  start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
});

export const expertProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  title: z.string().min(1, 'Title is required'),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  company: z.string().optional(),
  hourlyRate: z.number().min(1, 'Hourly rate must be greater than 0'),
  experience: z.number().min(0, 'Experience must be 0 or greater'),
});

export const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Category is required'),
  deliverables: z.array(z.string()).min(1, 'At least one deliverable is required'),
  duration: z.object({
    value: z.number().min(1, 'Duration must be greater than 0'),
    unit: z.enum(['hours', 'days', 'weeks', 'months']),
    isEstimate: z.boolean(),
  }),
  pricing: z.object({
    type: z.enum(['hourly', 'fixed', 'milestone', 'subscription']),
    amount: z.number().min(1, 'Amount must be greater than 0'),
    currency: z.string().length(3, 'Currency must be 3 characters'),
  }),
});

export const bookingSchema = z.object({
  scheduledDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid date format'
  ),
  timeSlot: timeSlotSchema,
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  type: z.enum(['consultation', 'service', 'follow_up']),
  notes: z.string().optional(),
});

export const collaborationSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  startDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid start date format'
  ),
  endDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid end date format'
  ).optional(),
});

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
});

export const ratingSchema = z.object({
  overall: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  expertise: z.number().min(1).max(5),
  professionalism: z.number().min(1).max(5),
  value: z.number().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
});

// Validation helper functions
export const validateTimeSlot = (start: string, end: string): boolean => {
  const startTime = new Date(`2000-01-01T${start}:00`);
  const endTime = new Date(`2000-01-01T${end}:00`);
  return endTime > startTime;
};

export const validateDateRange = (startDate: string, endDate?: string): boolean => {
  if (!endDate) return true;
  return new Date(endDate) > new Date(startDate);
};

export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};