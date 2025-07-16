interface UploadConfig {
  maxFileSize: number; // in bytes
  allowedTypes: string[];
  bucket: string;
  folder?: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadResult {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

interface UploadError {
  code: string;
  message: string;
  details?: any;
}

class FileUploadService {
  private defaultConfig: UploadConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
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
      'text/csv',
    ],
    bucket: 'expert-marketplace-files',
  };

  async uploadFile(
    file: File,
    config: Partial<UploadConfig> = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const uploadConfig = { ...this.defaultConfig, ...config };
    
    // Validate file
    this.validateFile(file, uploadConfig);

    // Get signed upload URL
    const { uploadUrl, fileId } = await this.getSignedUploadUrl(file, uploadConfig);

    // Upload file with progress tracking
    return this.performUpload(file, uploadUrl, fileId, onProgress);
  }

  async uploadMultipleFiles(
    files: File[],
    config: Partial<UploadConfig> = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    let totalLoaded = 0;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    for (const file of files) {
      const fileResult = await this.uploadFile(file, config, (fileProgress) => {
        const overallProgress = {
          loaded: totalLoaded + fileProgress.loaded,
          total: totalSize,
          percentage: Math.round(((totalLoaded + fileProgress.loaded) / totalSize) * 100),
        };
        onProgress?.(overallProgress);
      });

      results.push(fileResult);
      totalLoaded += file.size;
    }

    return results;
  }

  async deleteFile(fileId: string): Promise<void> {
    const response = await fetch(`/api/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('expert_marketplace_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }
  }

  async getFileInfo(fileId: string): Promise<UploadResult> {
    const response = await fetch(`/api/files/${fileId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('expert_marketplace_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get file info');
    }

    return response.json();
  }

  async generateDownloadUrl(fileId: string, expiresIn: number = 3600): Promise<string> {
    const response = await fetch(`/api/files/${fileId}/download-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('expert_marketplace_token')}`,
      },
      body: JSON.stringify({ expiresIn }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate download URL');
    }

    const { downloadUrl } = await response.json();
    return downloadUrl;
  }

  private validateFile(file: File, config: UploadConfig): void {
    // Check file size
    if (file.size > config.maxFileSize) {
      throw new UploadError({
        code: 'FILE_TOO_LARGE',
        message: `File size exceeds maximum allowed size of ${this.formatFileSize(config.maxFileSize)}`,
        details: { fileSize: file.size, maxSize: config.maxFileSize },
      });
    }

    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
      throw new UploadError({
        code: 'INVALID_FILE_TYPE',
        message: `File type ${file.type} is not allowed`,
        details: { fileType: file.type, allowedTypes: config.allowedTypes },
      });
    }

    // Check for malicious files (basic check)
    if (this.isSuspiciousFile(file)) {
      throw new UploadError({
        code: 'SUSPICIOUS_FILE',
        message: 'File appears to be suspicious and cannot be uploaded',
        details: { filename: file.name },
      });
    }
  }

  private async getSignedUploadUrl(
    file: File,
    config: UploadConfig
  ): Promise<{ uploadUrl: string; fileId: string }> {
    const response = await fetch('/api/files/upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('expert_marketplace_token')}`,
      },
      body: JSON.stringify({
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        bucket: config.bucket,
        folder: config.folder,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }

    return response.json();
  }

  private async performUpload(
    file: File,
    uploadUrl: string,
    fileId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          };
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            // Get file info after successful upload
            const fileInfo = await this.getFileInfo(fileId);
            resolve(fileInfo);
          } catch (error) {
            reject(new Error('Upload completed but failed to get file info'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was aborted'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  }

  private isSuspiciousFile(file: File): boolean {
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    const filename = file.name.toLowerCase();
    
    return suspiciousExtensions.some(ext => filename.endsWith(ext));
  }

  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  // Utility methods
  createFilePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('File is not an image'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async resizeImage(
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}

class UploadError extends Error {
  code: string;
  details?: any;

  constructor({ code, message, details }: { code: string; message: string; details?: any }) {
    super(message);
    this.name = 'UploadError';
    this.code = code;
    this.details = details;
  }
}

export const fileUploadService = new FileUploadService();
export type { UploadConfig, UploadProgress, UploadResult, UploadError };