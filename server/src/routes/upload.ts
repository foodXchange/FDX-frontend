import { Router } from 'express';
import { uploadSingle, uploadMultiple, uploadFields, deleteFile, getFileInfo, getFileCategory, findFile, ApiResponse, UploadResponse } from '../middleware/upload';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../services/logger';

const router = Router();

// Single file upload
router.post('/single', uploadSingle('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      } as ApiResponse);
    }

    const category = getFileCategory(req.file.mimetype);
    
    const response: UploadResponse = {
      success: true,
      data: {
        id: req.file.filename,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        category,
        url: `/uploads/${category}/${req.file.filename}`,
      },
    };
    
    logger.info('Single file uploaded successfully', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    res.json(response);
  } catch (error) {
    logger.error('Single file upload failed', error as Error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
    } as ApiResponse);
  }
});

// Multiple files upload
router.post('/multiple', uploadMultiple('files'), (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded',
      } as ApiResponse);
    }

    const uploadedFiles = req.files.map(file => {
      const category = getFileCategory(file.mimetype);
      return {
        id: file.filename,
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        category,
        url: `/uploads/${category}/${file.filename}`,
      };
    });

    logger.info('Multiple files uploaded successfully', {
      count: uploadedFiles.length,
      totalSize: uploadedFiles.reduce((sum, file) => sum + file.size, 0)
    });

    res.json({
      success: true,
      data: {
        files: uploadedFiles,
        count: uploadedFiles.length,
      },
    } as ApiResponse);
  } catch (error) {
    logger.error('Multiple files upload failed', error as Error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
    } as ApiResponse);
  }
});

// Mixed fields upload (e.g., avatar + documents)
router.post('/fields', uploadFields([
  { name: 'avatar', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
  { name: 'images', maxCount: 10 }
]), (req, res) => {
  try {
    if (!req.files || typeof req.files !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded',
      } as ApiResponse);
    }

    const result: Record<string, any> = {};
    let totalFiles = 0;
    let totalSize = 0;
    
    Object.entries(req.files).forEach(([fieldName, files]) => {
      if (Array.isArray(files)) {
        result[fieldName] = files.map(file => {
          const category = getFileCategory(file.mimetype);
          totalFiles++;
          totalSize += file.size;
          return {
            id: file.filename,
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            category,
            url: `/uploads/${category}/${file.filename}`,
          };
        });
      }
    });

    logger.info('Field files uploaded successfully', {
      fields: Object.keys(result),
      totalFiles,
      totalSize
    });

    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error) {
    logger.error('Field files upload failed', error as Error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
    } as ApiResponse);
  }
});

// Get file info
router.get('/info/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename',
      } as ApiResponse);
    }

    const fileInfo = await findFile(filename);
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
      } as ApiResponse);
    }

    const stats = await getFileInfo(fileInfo.path);

    res.json({
      success: true,
      data: {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        category: fileInfo.category,
        url: `/uploads/${fileInfo.category}/${filename}`,
      },
    } as ApiResponse);
  } catch (error) {
    logger.error('Failed to get file info', error as Error, { filename: req.params.filename });
    res.status(500).json({
      success: false,
      error: 'Failed to get file info',
    } as ApiResponse);
  }
});

// Delete file
router.delete('/delete/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename',
      } as ApiResponse);
    }

    const fileInfo = await findFile(filename);
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
      } as ApiResponse);
    }

    await deleteFile(fileInfo.path);

    logger.info('File deleted successfully', { filename, category: fileInfo.category });

    res.json({
      success: true,
      message: 'File deleted successfully',
    } as ApiResponse);
  } catch (error) {
    logger.error('Failed to delete file', error as Error, { filename: req.params.filename });
    res.status(500).json({
      success: false,
      error: 'Failed to delete file',
    } as ApiResponse);
  }
});

// List files
router.get('/list/:category?', async (req, res) => {
  try {
    const { category = 'all' } = req.params;
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    const validCategories = ['images', 'documents', 'general'];
    const categories = category === 'all' 
      ? validCategories
      : validCategories.includes(category) ? [category] : [];
    
    if (categories.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
      } as ApiResponse);
    }
    
    const files: any[] = [];

    for (const cat of categories) {
      const categoryPath = path.join(uploadsDir, cat);
      try {
        await fs.access(categoryPath);
        const categoryFiles = await fs.readdir(categoryPath);
        
        for (const filename of categoryFiles) {
          const filePath = path.join(categoryPath, filename);
          const stats = await fs.stat(filePath);
          
          files.push({
            filename,
            category: cat,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            url: `/uploads/${cat}/${filename}`,
          });
        }
      } catch {
        // Directory doesn't exist, skip
        continue;
      }
    }

    // Sort by creation date (newest first)
    files.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    res.json({
      success: true,
      data: {
        files,
        count: files.length,
        category,
      },
    } as ApiResponse);
  } catch (error) {
    logger.error('Failed to list files', error as Error, { category: req.params.category });
    res.status(500).json({
      success: false,
      error: 'Failed to list files',
    } as ApiResponse);
  }
});

// Get upload stats
router.get('/stats', async (req, res) => {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const categories = ['images', 'documents', 'general'];
    
    const stats = {
      total: 0,
      categories: {} as Record<string, { count: number; size: number }>,
      totalSize: 0,
    };

    for (const category of categories) {
      const categoryPath = path.join(uploadsDir, category);
      try {
        await fs.access(categoryPath);
        const files = await fs.readdir(categoryPath);
        let categorySize = 0;
        
        for (const filename of files) {
          const filePath = path.join(categoryPath, filename);
          const fileStats = await fs.stat(filePath);
          categorySize += fileStats.size;
        }

        stats.categories[category] = {
          count: files.length,
          size: categorySize,
        };
        
        stats.total += files.length;
        stats.totalSize += categorySize;
      } catch {
        stats.categories[category] = {
          count: 0,
          size: 0,
        };
      }
    }

    res.json({
      success: true,
      data: stats,
    } as ApiResponse);
  } catch (error) {
    logger.error('Failed to get upload stats', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to get upload stats',
    } as ApiResponse);
  }
});

export default router;