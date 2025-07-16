import { FC, useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload,
  InsertDriveFile,
  Image,
  PictureAsPdf,
  Description,
  Download,
  Delete,
  Share,
  MoreVert,
  CreateNewFolder,
  Search,
  FilterList,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Document } from '../../types';

interface DocumentsPanelProps {
  documents: Document[];
  collaborationId: string;
  onDocumentUpload: (document: Document) => void;
  onDocumentDelete: (documentId: string) => void;
}

export const DocumentsPanel: FC<DocumentsPanelProps> = ({
  documents,
  collaborationId,
  onDocumentUpload,
  onDocumentDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Create document object
      const newDoc: Document = {
        id: Date.now().toString() + i,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
        uploadedBy: 'current-user',
        uploadedAt: new Date().toISOString(),
        version: 1,
      };

      onDocumentUpload(newDoc);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
    }

    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
    }, 500);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image />;
    if (type === 'application/pdf') return <PictureAsPdf />;
    if (type.includes('document') || type.includes('text')) return <Description />;
    return <InsertDriveFile />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDocumentMenu = (event: React.MouseEvent<HTMLElement>, doc: Document) => {
    setAnchorEl(event.currentTarget);
    setSelectedDoc(doc);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDoc(null);
  };

  const handleDelete = () => {
    if (selectedDoc) {
      onDocumentDelete(selectedDoc.id);
    }
    handleMenuClose();
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || doc.type.includes(filterType);
    return matchesSearch && matchesType;
  });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Documents ({documents.length})</Typography>
          <Box display="flex" gap={1}>
            <Button
              startIcon={<CreateNewFolder />}
              onClick={() => setCreateFolderOpen(true)}
            >
              New Folder
            </Button>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={handleFileSelect}
            />
          </Box>
        </Box>

        {/* Search and Filter */}
        <Box display="flex" gap={2}>
          <TextField
            size="small"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
            }}
            sx={{ flex: 1 }}
          />
          <Button
            startIcon={<FilterList />}
            onClick={() => {/* Add filter menu */}}
          >
            Filter
          </Button>
        </Box>

        {/* Upload Progress */}
        {isUploading && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Uploading...
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}
      </Paper>

      {/* Documents Grid */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {filteredDocs.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <InsertDriveFile sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No documents yet
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Upload documents to share with your collaborator
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredDocs.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start">
                      <Box display="flex" gap={1} alignItems="start" flex={1}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                          }}
                        >
                          {getFileIcon(doc.type)}
                        </Box>
                        <Box flex={1} minWidth={0}>
                          <Tooltip title={doc.name}>
                            <Typography variant="subtitle2" noWrap>
                              {doc.name}
                            </Typography>
                          </Tooltip>
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(doc.size)}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleDocumentMenu(e, doc)}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    <Box mt={2}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Uploaded by {doc.uploadedBy}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(doc.uploadedAt), 'MMM d, yyyy HH:mm')}
                      </Typography>
                      {doc.version && doc.version > 1 && (
                        <Chip
                          label={`v${doc.version}`}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </CardContent>
                  
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      href={doc.url}
                      download={doc.name}
                    >
                      Download
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Share />}
                    >
                      Share
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Document Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <Download sx={{ mr: 1 }} fontSize="small" />
          Download
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Share sx={{ mr: 1 }} fontSize="small" />
          Share Link
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Folder Dialog */}
      <Dialog open={createFolderOpen} onClose={() => setCreateFolderOpen(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateFolderOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              // Handle folder creation
              setCreateFolderOpen(false);
              setFolderName('');
            }}
            variant="contained"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};