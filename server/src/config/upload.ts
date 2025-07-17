export const UPLOAD_CONFIG = {
  // File size limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5,
  
  // Allowed file types
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ] as const,
  
  // File categories
  CATEGORIES: ['images', 'documents', 'general'] as const,
  
  // Rate limiting
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // max uploads per window
  },
  
  // Security
  FILENAME_MAX_LENGTH: 100,
  ALLOWED_EXTENSIONS: {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/plain': ['.txt'],
    'text/csv': ['.csv']
  } as const,
  
  // Paths
  UPLOAD_DIR: 'uploads',
  LOGS_DIR: 'logs',
} as const;

export type FileCategory = typeof UPLOAD_CONFIG.CATEGORIES[number];
export type AllowedMimeType = typeof UPLOAD_CONFIG.ALLOWED_TYPES[number];