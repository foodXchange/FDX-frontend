import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger';
import crypto from 'crypto';

import { UPLOAD_CONFIG } from '../config/upload';

type FileCategory = typeof UPLOAD_CONFIG.CATEGORIES[number];

// Sanitize filename to prevent path traversal
const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, UPLOAD_CONFIG.FILENAME_MAX_LENGTH);
};

// Generate secure unique filename
const generateUniqueFilename = (originalName: string): string => {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const sanitizedName = sanitizeFilename(name);
  const uniqueId = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `${sanitizedName}-${timestamp}-${uniqueId}${ext}`;
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), UPLOAD_CONFIG.UPLOAD_DIR);
const ensureUploadsDir = async () => {
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
};

// Initialize uploads directory
ensureUploadsDir().catch(err => {
  logger.error('Failed to create uploads directory', err);
});

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const category = getFileCategory(file.mimetype);
      const uploadPath = path.join(uploadsDir, category);
      
      // Create category directory if it doesn't exist
      try {
        await fs.access(uploadPath);
      } catch {
        await fs.mkdir(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    try {
      const filename = generateUniqueFilename(file.originalname);
      cb(null, filename);
    } catch (error) {
      cb(error as Error, '');
    }
  }
});

// File filter with enhanced validation
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  if (!UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
  
  // Check file extension matches mimetype
  const ext = path.extname(file.originalname).toLowerCase();
  const expectedExtensions = UPLOAD_CONFIG.ALLOWED_EXTENSIONS[file.mimetype as keyof typeof UPLOAD_CONFIG.ALLOWED_EXTENSIONS];
  if (expectedExtensions && !expectedExtensions.includes(ext)) {
    return cb(new Error(`File extension ${ext} does not match mimetype ${file.mimetype}`));
  }
  
  cb(null, true);
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
    files: UPLOAD_CONFIG.MAX_FILES,
    fieldNameSize: 100,
    fieldSize: 1024 * 1024, // 1MB for form fields
  },
});

// Upload middleware
export const uploadSingle = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'File size too large (max 10MB)',
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            error: 'Too many files (max 5)',
          });
        }
        return res.status(400).json({
          success: false,
          error: 'Upload error: ' + err.message,
        });
      }
      
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message,
        });
      }

      // Log successful upload
      if (req.file) {
        logger.info('File uploaded successfully', {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
        });
      }

      next();
    });
  };
};

// Upload multiple files
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'File size too large (max 10MB)',
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            error: `Too many files (max ${maxCount})`,
          });
        }
        return res.status(400).json({
          success: false,
          error: 'Upload error: ' + err.message,
        });
      }
      
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message,
        });
      }

      // Log successful uploads
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file) => {
          logger.info('File uploaded successfully', {
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
          });
        });
      }

      next();
    });
  };
};

// Upload fields (mixed)
export const uploadFields = (fields: { name: string; maxCount: number }[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.fields(fields)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'File size too large (max 10MB)',
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            error: 'Too many files',
          });
        }
        return res.status(400).json({
          success: false,
          error: 'Upload error: ' + err.message,
        });
      }
      
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message,
        });
      }

      // Log successful uploads
      if (req.files && typeof req.files === 'object') {
        Object.entries(req.files).forEach(([fieldName, files]) => {
          if (Array.isArray(files)) {
            files.forEach((file) => {
              logger.info('File uploaded successfully', {
                fieldName,
                filename: file.filename,
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                path: file.path,
              });
            });
          }
        });
      }

      next();
    });
  };
};

// File deletion helper
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    // Validate file path is within uploads directory
    const normalizedPath = path.normalize(filePath);
    const normalizedUploadsDir = path.normalize(uploadsDir);
    
    if (!normalizedPath.startsWith(normalizedUploadsDir)) {
      throw new Error('Invalid file path: outside uploads directory');
    }
    
    await fs.unlink(filePath);
    logger.info('File deleted successfully', { filePath });
  } catch (error) {
    logger.error('Failed to delete file', error as Error, { filePath });
    throw error;
  }
};

// Get file info
export const getFileInfo = async (filePath: string): Promise<fs.Stats> => {
  try {
    // Validate file path is within uploads directory
    const normalizedPath = path.normalize(filePath);
    const normalizedUploadsDir = path.normalize(uploadsDir);
    
    if (!normalizedPath.startsWith(normalizedUploadsDir)) {
      throw new Error('Invalid file path: outside uploads directory');
    }
    
    return await fs.stat(filePath);
  } catch (error) {
    throw error;
  }
};

// File type helpers
export const isImage = (mimetype: string): boolean => {
  return mimetype.startsWith('image/');
};

export const isDocument = (mimetype: string): boolean => {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];
  return documentTypes.includes(mimetype);
};

export const getFileCategory = (mimetype: string): FileCategory => {
  if (isImage(mimetype)) return 'images';
  if (isDocument(mimetype)) return 'documents';
  return 'general';
};

// Find file across categories securely
export const findFile = async (filename: string): Promise<{ path: string; category: FileCategory } | null> => {
  // Sanitize filename
  const sanitizedFilename = sanitizeFilename(filename);
  
  for (const category of UPLOAD_CONFIG.CATEGORIES) {
    const filePath = path.join(uploadsDir, category, sanitizedFilename);
    
    try {
      await fs.access(filePath);
      return { path: filePath, category };
    } catch {
      continue;
    }
  }
  
  return null;
};

// Response interfaces
export interface UploadResponse {
  success: boolean;
  data?: {
    id: string;
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    category: FileCategory;
    url: string;
  };
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}