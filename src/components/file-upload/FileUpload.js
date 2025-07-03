// File: src/components/file-upload/FileUpload.js

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn, AutoIcon } from '../../lib/design-system';
import { Button, Progress, Badge } from '../ui';

// ===== FILE TYPE CONFIGURATIONS =====
const FILE_TYPES = {
  documents: {
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    icon: 'DocumentIcon'
  },
  images: {
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    icon: 'PhotoIcon'
  },
  certificates: {
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    icon: 'DocumentIcon'
  }
};

// ===== INDIVIDUAL FILE COMPONENT =====
const FileItem = ({ file, onRemove, onPreview, progress }) => {
  const [imagePreview, setImagePreview] = useState(null);
  
  React.useEffect(() => {
    if (file.type?.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  }, [file]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (file.type?.startsWith('image/')) return 'PhotoIcon';
    if (file.type?.includes('pdf')) return 'DocumentIcon';
    if (file.type?.includes('excel') || file.type?.includes('csv')) return 'TableCellsIcon';
    if (file.type?.includes('word')) return 'DocumentIcon';
    return 'DocumentIcon';
  };

  return (
    <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
      {/* File preview/icon */}
      <div className="flex-shrink-0 mr-3">
        {imagePreview ? (
          <img 
            src={imagePreview} 
            alt={file.name}
            className="w-10 h-10 rounded object-cover cursor-pointer"
            onClick={() => onPreview?.(file)}
          />
        ) : (
          <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
            <AutoIcon name={getFileIcon()} className="w-5 h-5 text-blue-600" />
          </div>
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-500">
          {formatFileSize(file.size)}
        </p>
        
        {/* Upload progress */}
        {progress !== undefined && progress < 100 && (
          <div className="mt-2">
            <Progress value={progress} showLabel={false} className="h-1" />
            <p className="text-xs text-gray-500 mt-1">Uploading... {progress}%</p>
          </div>
        )}
      </div>

      {/* File status */}
      <div className="flex items-center space-x-2 ml-3">
        {progress === 100 && (
          <Badge variant="success" size="sm">
            <AutoIcon name="CheckIcon" className="w-3 h-3 mr-1" />
            Uploaded
          </Badge>
        )}
        
        {progress === undefined && (
          <Badge variant="primary" size="sm">Ready</Badge>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-1">
          {onPreview && (
            <button
              onClick={() => onPreview(file)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Preview"
            >
              <AutoIcon name="EyeIcon" className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => onRemove(file)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Remove"
          >
            <AutoIcon name="XMarkIcon" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN FILE UPLOAD COMPONENT =====
export const FileUpload = ({
  type = 'documents',
  multiple = false,
  maxFiles = 5,
  onFilesChange,
  onUpload,
  disabled = false,
  className,
  ...props
}) => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const config = FILE_TYPES[type] || FILE_TYPES.documents;

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setDragActive(false);

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          console.error(`File ${file.name}: ${error.message}`);
          // You can show toast notifications here
        });
      });
    }

    // Add accepted files
    const newFiles = acceptedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    const updatedFiles = multiple 
      ? [...files, ...newFiles].slice(0, maxFiles)
      : newFiles.slice(0, 1);

    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  }, [files, multiple, maxFiles, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: config.accept,
    maxSize: config.maxSize,
    disabled,
    multiple,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  });

  const removeFile = (fileToRemove) => {
    const updatedFiles = files.filter(f => f.id !== fileToRemove.id);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
    
    // Clean up object URL
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };

  const handleUpload = async () => {
    if (!onUpload || files.length === 0) return;

    for (const file of files) {
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
          setUploadProgress(prev => ({ ...prev, [file.id]: progress }));
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        await onUpload(file);
      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error);
        setUploadProgress(prev => ({ ...prev, [file.id]: -1 })); // Error state
      }
    }
  };

  const previewFile = (file) => {
    if (file.type.startsWith('image/')) {
      // Open image in modal or new tab
      window.open(file.preview || URL.createObjectURL(file), '_blank');
    } else {
      // For documents, you might want to implement a document viewer
      console.log('Preview document:', file.name);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-4', className)} {...props}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer',
          isDragActive || dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed',
          files.length > 0 && 'border-gray-200 bg-gray-50'
        )}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <AutoIcon 
              name={isDragActive ? 'CloudArrowDownIcon' : 'CloudArrowUpIcon'} 
              className="w-8 h-8 text-gray-400" 
            />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop files here' : 'Upload files'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Drag and drop files here, or click to browse
            </p>
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              Supported formats: {Object.values(config.accept).flat().join(', ')}
            </p>
            <p>
              Maximum file size: {formatFileSize(config.maxSize)}
            </p>
            {multiple && (
              <p>Maximum {maxFiles} files</p>
            )}
          </div>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              Files ({files.length}{multiple ? `/${maxFiles}` : ''})
            </h4>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || (multiple && files.length >= maxFiles)}
              >
                Add More
              </Button>
              
              {onUpload && (
                <Button
                  size="sm"
                  onClick={handleUpload}
                  disabled={disabled || files.length === 0}
                  loading={Object.values(uploadProgress).some(p => p > 0 && p < 100)}
                >
                  Upload All
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            {files.map(file => (
              <FileItem
                key={file.id}
                file={file}
                progress={uploadProgress[file.id]}
                onRemove={removeFile}
                onPreview={previewFile}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upload summary */}
      {files.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <AutoIcon name="InformationCircleIcon" className="w-4 h-4 text-blue-600" />
            <span>
              {files.length} file{files.length !== 1 ? 's' : ''} selected
              {files.reduce((acc, file) => acc + file.size, 0) > 0 && (
                <span className="ml-1">
                  ({formatFileSize(files.reduce((acc, file) => acc + file.size, 0))})
                </span>
              )}
            </span>
          </div>
          
          <button
            onClick={() => {
              setFiles([]);
              setUploadProgress({});
              onFilesChange?.([]);
            }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

// ===== SPECIALIZED FILE UPLOAD COMPONENTS =====

// Certificate upload component
export const CertificateUpload = (props) => (
  <FileUpload
    type="certificates"
    multiple={true}
    maxFiles={10}
    {...props}
  />
);

// Product image upload component
export const ProductImageUpload = (props) => (
  <FileUpload
    type="images"
    multiple={true}
    maxFiles={5}
    {...props}
  />
);

// Document upload component
export const DocumentUpload = (props) => (
  <FileUpload
    type="documents"
    multiple={true}
    maxFiles={20}
    {...props}
  />
);

// ===== FILE UPLOAD HOOK =====
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const uploadFile = async (file, endpoint = '/api/upload') => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        // Add progress tracking
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
        }
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFile,
    uploading,
    uploadProgress
  };
};