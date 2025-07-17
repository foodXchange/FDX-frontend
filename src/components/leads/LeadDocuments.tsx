import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { Description as DocumentIcon,  } from '@mui/icons-material';
import { FileUpload } from '../ui/FileUpload';
import { format } from 'date-fns';

interface Document {
  id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
  category: string;
  description?: string;
}

interface LeadDocumentsProps {
  leadId: string;
  leadName: string;
  documents?: Document[];
  onDocumentAdd?: (document: Document) => void;
  onDocumentDelete?: (documentId: string) => void;
}

const documentCategories = [
  'Contract',
  'Invoice',
  'Quote',
  'Specification',
  'Correspondence',
  'Legal',
  'Technical',
  'Other',
];

export const LeadDocuments: React.FC<LeadDocumentsProps> = ({
  leadName,
  documents = [],
  onDocumentAdd,
  onDocumentDelete,
}) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [category, setCategory] = useState('Other');
  const [description, setDescription] = useState('');
  const [localDocuments, setLocalDocuments] = useState<Document[]>(documents);

  const getFileIcon = (mimetype: string) => {
    if (mimetype.includes('pdf')) return <PdfIcon />;
    if (mimetype.includes('image')) return <ImageIcon />;
    return <DocumentIcon />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUploadSuccess = (file: any) => {
    const newDocument: Document = {
      id: Date.now().toString(),
      ...file,
      uploadedAt: new Date(),
      uploadedBy: 'Current Agent', // In real app, get from auth context
      category,
      description: description || undefined,
    };

    setLocalDocuments(prev => [...prev, newDocument]);
    onDocumentAdd?.(newDocument);
    
    // Reset form
    setCategory('Other');
    setDescription('');
    setUploadDialogOpen(false);
  };

  const handleDeleteDocument = (documentId: string) => {
    setLocalDocuments(prev => prev.filter(doc => doc.id !== documentId));
    onDocumentDelete?.(documentId);
  };

  const getCategoryColor = (category: string): any => {
    const colors: Record<string, any> = {
      Contract: 'primary',
      Invoice: 'success',
      Quote: 'info',
      Specification: 'warning',
      Legal: 'error',
      Technical: 'secondary',
      Correspondence: 'default',
      Other: 'default',
    };
    return colors[category] || 'default';
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Documents</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setUploadDialogOpen(true)}
        >
          Upload Document
        </Button>
      </Box>

      {localDocuments.length === 0 ? (
        <Box textAlign="center" py={4}>
          <AttachIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">
            No documents uploaded yet
          </Typography>
        </Box>
      ) : (
        <List>
          {localDocuments.map((doc) => (
            <ListItem
              key={doc.id}
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <ListItemIcon>{getFileIcon(doc.mimetype)}</ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1">{doc.originalname}</Typography>
                    <Chip
                      label={doc.category}
                      size="small"
                      color={getCategoryColor(doc.category)}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" display="block">
                      {formatFileSize(doc.size)} • Uploaded by {doc.uploadedBy} on{' '}
                      {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                    </Typography>
                    {doc.description && (
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        {doc.description}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  href={`http://localhost:3002${doc.url}`}
                  target="_blank"
                  sx={{ mr: 1 }}
                >
                  <ViewIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  href={`http://localhost:3002${doc.url}`}
                  download
                  sx={{ mr: 1 }}
                >
                  <DownloadIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteDocument(doc.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Document for {leadName}</DialogTitle>
        <DialogContent>
          <Box py={2}>
            <TextField
              select
              fullWidth
              label="Document Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ mb: 2 }}
            >
              {documentCategories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              sx={{ mb: 3 }}
            />

            <FileUpload
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              maxSize={10}
              onUploadSuccess={handleUploadSuccess}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};