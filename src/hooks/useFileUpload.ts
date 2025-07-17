import { useState, useCallback } from 'react';

interface UploadedFile {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
}

interface UseFileUploadOptions {
  uploadUrl?: string;
  maxSize?: number; // in MB
  onSuccess?: (file: UploadedFile) => void;
  onError?: (error: string) => void;
}

export const useFileUpload = ({
  uploadUrl = 'http://localhost:3003/api/upload',
  maxSize = 10,
  onSuccess,
  onError,
}: UseFileUploadOptions = {}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    // Reset state
    setError(null);
    setUploadedFile(null);
    setProgress(0);

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const errorMsg = `File size exceeds maximum of ${maxSize}MB`;
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      });

      // Create promise for the request
      const uploadPromise = new Promise<UploadedFile>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success && response.data) {
                resolve(response.data);
              } else {
                reject(new Error(response.error || 'Upload failed'));
              }
            } catch (e) {
              reject(new Error('Invalid server response'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.onabort = () => reject(new Error('Upload aborted'));
      });

      xhr.open('POST', uploadUrl);
      xhr.send(formData);

      const result = await uploadPromise;
      setUploadedFile(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    } finally {
      setUploading(false);
    }
  }, [uploadUrl, maxSize, onSuccess, onError]);

  const reset = useCallback(() => {
    setError(null);
    setUploadedFile(null);
    setProgress(0);
    setUploading(false);
  }, []);

  return {
    uploadFile,
    uploading,
    progress,
    error,
    uploadedFile,
    reset,
  };
};