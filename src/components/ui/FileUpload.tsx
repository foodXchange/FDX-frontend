import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import {  } from '@mui/icons-material';
import { TrashIcon } from '@heroicons/react/24/outline';

interface UploadedFile {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
}

interface FileUploadProps {
  onUploadSuccess?: (file: UploadedFile) => void;
  onUploadError?: (error: string) => void;
  maxSize?: number; // in MB
  accept?: string;
  multiple?: boolean;
  uploadUrl?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  maxSize = 10,
  accept = '*/*',
  multiple = false,
  uploadUrl = 'http://localhost:3003/api/upload',
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    validateAndSetFiles(selectedFiles);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    validateAndSetFiles(droppedFiles);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const validateAndSetFiles = (selectedFiles: File[]) => {
    setError(null);
    setSuccess(false);

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSizeBytes);
    
    if (oversizedFiles.length > 0) {
      setError(`File(s) exceed maximum size of ${maxSize}MB`);
      return;
    }

    if (multiple) {
      setFiles(prev => [...prev, ...selectedFiles]);
    } else {
      setFiles(selectedFiles.slice(0, 1));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);

    try {
      const uploaded: UploadedFile[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Upload failed');
        }

        uploaded.push(data.data);
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      setUploadedFiles(prev => [...prev, ...uploaded]);
      setFiles([]);
      setSuccess(true);
      
      uploaded.forEach(file => {
        onUploadSuccess?.(file);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          sx={{ display: 'none' }}
        />
        
        <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Drop files here or click to upload
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Maximum file size: {maxSize}MB
        </Typography>
      </Paper>

      {files.length > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            Selected Files:
          </Typography>
          <List>
            {files.map((file, index) => (
              <ListItem key={index}>
                <FileIcon sx={{ mr: 2 }} />
                <ListItemText
                  primary={file.name}
                  secondary={formatFileSize(file.size)}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    <TrashIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          
          <Button
            variant="contained"
            color="primary"
            onClick={uploadFiles}
            disabled={uploading || files.length === 0}
            startIcon={<UploadIcon />}
            fullWidth
            sx={{ mt: 2 }}
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </Box>
      )}

      {uploading && (
        <Box mt={2}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="body2" color="text.secondary" align="center" mt={1}>
            {Math.round(uploadProgress)}% uploaded
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mt: 2 }}
          onClose={() => setSuccess(false)}
          icon={<SuccessIcon />}
        >
          Files uploaded successfully!
        </Alert>
      )}

      {uploadedFiles.length > 0 && (
        <Box mt={3}>
          <Typography variant="subtitle1" gutterBottom>
            Uploaded Files:
          </Typography>
          <List>
            {uploadedFiles.map((file, index) => (
              <ListItem key={index}>
                <FileIcon sx={{ mr: 2 }} />
                <ListItemText
                  primary={file.originalname}
                  secondary={
                    <Box>
                      <Typography variant="caption" display="block">
                        {formatFileSize(file.size)} • {file.mimetype}
                      </Typography>
                      <Chip
                        label="View"
                        size="small"
                        component="a"
                        href={`http://localhost:3003${file.url}`}
                        target="_blank"
                        clickable
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};