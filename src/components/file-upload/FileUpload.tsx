import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle, Plus } from 'lucide-react';

interface FileUploadProps {
  onUpload?: (files: File[]) => Promise<void>;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

interface FileWithProgress extends File {
  id: string;
  progress?: number;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  accept = "*/*",
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  disabled = false,
  className = ""
}) => {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileId = () => Math.random().toString(36).substr(2, 9);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return File size exceeds MB limit;
    }
    return null;
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: FileWithProgress[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      const fileWithProgress: FileWithProgress = {
        ...file,
        id: generateFileId(),
        progress: undefined,
        error
      };
      validFiles.push(fileWithProgress);
    });

    setFiles(prev => {
      const combined = [...prev, ...validFiles];
      return combined.slice(0, maxFiles);
    });
  }, [maxSize, maxFiles]);

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, [addFiles, disabled]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const simulateProgress = (fileId: string): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
          resolve();
        } else {
          setUploadProgress(prev => ({ ...prev, [fileId]: Math.floor(progress) }));
        }
      }, 200);
    });
  };

  const handleUpload = async () => {
    if (!onUpload || files.length === 0) return;

    try {
      // Simulate upload progress for each file
      const uploadPromises = files.map(file => simulateProgress(file.id));
      
      // Start all uploads
      await Promise.all(uploadPromises);
      
      // Call the actual upload function
      await onUpload(files);
      
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getProgressColor = (progress: number): string => {
    if (progress === 100) return 'bg-green-500';
    if (progress > 0) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  return (
    <div className={w-full }>
      {/* Drop Zone */}
      <div
        className={
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          
          
        }
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to browse
        </div>
        <div className="text-sm text-gray-500">
          Supports: {accept} • Max size: {(maxSize / (1024 * 1024)).toFixed(1)}MB per file
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="font-medium text-gray-900">Selected Files ({files.length})</h3>
          
          {files.map((file) => {
            const progress = uploadProgress[file.id];
            
            return (
              <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <File className="h-8 w-8 text-gray-400" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      {progress !== undefined && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Uploading...</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={h-2 rounded-full transition-all duration-300 }
                              style={{ width: ${progress}% }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Error message */}
                      {file.error && (
                        <div className="mt-1 flex items-center text-xs text-red-600">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {file.error}
                        </div>
                      )}
                    </div>
                    
                    {/* Status badges */}
                    <div className="flex items-center space-x-2 ml-3">
                      {progress === 100 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1"/>
                          Uploaded
                        </span>
                      )}
                      
                      {progress === undefined && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Ready
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Actions */}
      {files.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex items-center px-3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add More
            </button>
            
            {onUpload && (
              <button
                onClick={handleUpload}
                disabled={disabled || files.length === 0 || Object.values(uploadProgress).some((p: unknown) => typeof p === 'number' && p > 0 && p < 100)}
                className="flex items-center px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {Object.values(uploadProgress).some((p: unknown) => typeof p === 'number' && p > 0 && p < 100) ? 'Uploading...' : 'Upload All'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
