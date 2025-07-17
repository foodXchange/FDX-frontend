import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Card, CardContent, CardHeader, Typography, Button, IconButton, Chip, Grid, Tabs, Tab, LinearProgress, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Menu, MenuItem, Divider, TextField, InputAdornment, Select, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { Upload, Download, Add as Plus, FolderOpen, Search, Shield, CheckCircle, Archive, Delete as Trash2 } from '@mui/icons-material';
import { format, isAfter, isBefore, addDays } from 'date-fns';

interface DocumentFile {
  id: string;
  name: string;
  type: 'certificate' | 'invoice' | 'compliance' | 'quality' | 'shipping' | 'other';
  mimeType: string;
  size: number;
  uploadDate: Date;
  expiryDate?: Date;
  status: 'active' | 'expired' | 'expiring_soon' | 'draft';
  version: number;
  uploadedBy: string;
  tags: string[];
  description?: string;
  relatedEntity?: {
    type: 'order' | 'supplier' | 'product';
    id: string;
    name: string;
  };
  url?: string;
  thumbnailUrl?: string;
}

interface UploadProgress {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface DocumentStats {
  totalDocuments: number;
  expiringThisMonth: number;
  recentUploads: number;
  storageUsed: number; // in MB
  storageLimit: number; // in MB
}

const documentTypeConfig = {
  certificate: {
    label: 'Certificate',
    color: 'info' as const,
    icon: Shield,
  },
  invoice: {
    label: 'Invoice',
    color: 'success' as const,
    icon: FileText,
  },
  compliance: {
    label: 'Compliance',
    color: 'secondary' as const,
    icon: FileCheck,
  },
  quality: {
    label: 'Quality Doc',
    color: 'warning' as const,
    icon: CheckCircle,
  },
  shipping: {
    label: 'Shipping',
    color: 'info' as const,
    icon: Archive,
  },
  other: {
    label: 'Other',
    color: 'default' as const,
    icon: File,
  },
};

const statusConfig = {
  active: {
    label: 'Active',
    color: 'success' as const,
    icon: CheckCircle,
  },
  expired: {
    label: 'Expired',
    color: 'error' as const,
    icon: AlertTriangle,
  },
  expiring_soon: {
    label: 'Expiring Soon',
    color: 'warning' as const,
    icon: Clock,
  },
  draft: {
    label: 'Draft',
    color: 'default' as const,
    icon: File,
  },
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.includes('pdf')) return FileText;
  return File;
};

const checkExpiryStatus = (expiryDate?: Date): DocumentFile['status'] => {
  if (!expiryDate) return 'active';
  
  const now = new Date();
  const thirtyDaysFromNow = addDays(now, 30);
  
  if (isBefore(expiryDate, now)) return 'expired';
  if (isBefore(expiryDate, thirtyDaysFromNow)) return 'expiring_soon';
  return 'active';
};

export const DocumentUploadCenter: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadProgress[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stats, setStats] = useState<DocumentStats>({
    totalDocuments: 0,
    expiringThisMonth: 0,
    recentUploads: 0,
    storageUsed: 0,
    storageLimit: 1000, // 1GB limit
  });

  // Mock data
  React.useEffect(() => {
    const mockDocuments: DocumentFile[] = [
      {
        id: '1',
        name: 'HACCP_Certificate_2024.pdf',
        type: 'certificate',
        mimeType: 'application/pdf',
        size: 2048576, // 2MB
        uploadDate: new Date('2024-01-15'),
        expiryDate: new Date('2025-01-15'),
        status: 'active',
        version: 1,
        uploadedBy: 'John Smith',
        tags: ['HACCP', 'Food Safety', 'Certification'],
        description: 'Annual HACCP certification for food handling processes',
        relatedEntity: {
          type: 'supplier',
          id: 'SUP-001',
          name: 'Munich Mills GmbH',
        },
      },
      {
        id: '2',
        name: 'Invoice_ORD-2024-1234.pdf',
        type: 'invoice',
        mimeType: 'application/pdf',
        size: 512000, // 500KB
        uploadDate: new Date('2024-12-01'),
        status: 'active',
        version: 1,
        uploadedBy: 'Sarah Johnson',
        tags: ['Invoice', 'Payment'],
        relatedEntity: {
          type: 'order',
          id: 'ORD-2024-1234',
          name: 'Organic Wheat Flour Order',
        },
      },
      {
        id: '3',
        name: 'Organic_Certification.jpg',
        type: 'compliance',
        mimeType: 'image/jpeg',
        size: 1024000, // 1MB
        uploadDate: new Date('2024-06-01'),
        expiryDate: new Date('2024-12-25'),
        status: 'expiring_soon',
        version: 2,
        uploadedBy: 'Mike Chen',
        tags: ['Organic', 'EU Regulation', 'Compliance'],
        description: 'EU Organic certification for agricultural products',
      },
      {
        id: '4',
        name: 'Quality_Report_Q3_2024.pdf',
        type: 'quality',
        mimeType: 'application/pdf',
        size: 3072000, // 3MB
        uploadDate: new Date('2024-09-30'),
        status: 'active',
        version: 1,
        uploadedBy: 'Emma Wilson',
        tags: ['Quality', 'Q3 2024', 'Lab Results'],
        description: 'Third quarter quality assurance report',
      },
      {
        id: '5',
        name: 'ISO22000_Certificate.pdf',
        type: 'certificate',
        mimeType: 'application/pdf',
        size: 1536000, // 1.5MB
        uploadDate: new Date('2023-03-01'),
        expiryDate: new Date('2024-12-20'),
        status: 'expiring_soon',
        version: 1,
        uploadedBy: 'David Brown',
        tags: ['ISO22000', 'Food Safety', 'Management'],
        description: 'ISO 22000 Food Safety Management System certification',
      },
    ];

    // Update documents with calculated status
    const documentsWithStatus = mockDocuments.map(doc => ({
      ...doc,
      status: doc.expiryDate ? checkExpiryStatus(doc.expiryDate) : doc.status,
    }));

    setDocuments(documentsWithStatus);

    // Calculate stats
    const totalSize = documentsWithStatus.reduce((sum, doc) => sum + doc.size, 0);
    const expiringCount = documentsWithStatus.filter(doc => 
      doc.status === 'expiring_soon' || doc.status === 'expired'
    ).length;
    const recentCount = documentsWithStatus.filter(doc => 
      isAfter(doc.uploadDate, addDays(new Date(), -30))
    ).length;

    setStats({
      totalDocuments: documentsWithStatus.length,
      expiringThisMonth: expiringCount,
      recentUploads: recentCount,
      storageUsed: Math.round(totalSize / (1024 * 1024)), // Convert to MB
      storageLimit: 1000,
    });

    setLoading(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  }, []);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFileUpload(files);
    }
  };

  const handleFileUpload = (files: File[]) => {
    files.forEach((file) => {
      const uploadId = Math.random().toString(36).substr(2, 9);
      
      // Add to uploading files
      setUploadingFiles(prev => [...prev, {
        id: uploadId,
        name: file.name,
        progress: 0,
        status: 'uploading',
      }]);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Mark as completed
          setUploadingFiles(prev => 
            prev.map(upload => 
              upload.id === uploadId 
                ? { ...upload, progress: 100, status: 'completed' }
                : upload
            )
          );

          // Add to documents after 1 second
          setTimeout(() => {
            const newDocument: DocumentFile = {
              id: uploadId,
              name: file.name,
              type: 'other',
              mimeType: file.type,
              size: file.size,
              uploadDate: new Date(),
              status: 'draft',
              version: 1,
              uploadedBy: 'Current User',
              tags: [],
            };

            setDocuments(prev => [newDocument, ...prev]);
            setUploadingFiles(prev => prev.filter(upload => upload.id !== uploadId));
          }, 1000);
        } else {
          setUploadingFiles(prev => 
            prev.map(upload => 
              upload.id === uploadId 
                ? { ...upload, progress }
                : upload
            )
          );
        }
      }, 200);
    });
  };

  const removeUploadingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(upload => upload.id !== id));
  };

  const handleDocumentAction = (action: string, documentId: string) => {
    console.log(`Action: ${action} for document ${documentId}`);
    // TODO: Implement document actions
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getStatusChip = (status: DocumentFile['status']) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Chip
        icon={<Icon />}
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };

  const getTypeChip = (type: DocumentFile['type']) => {
    const config = documentTypeConfig[type];
    const Icon = config.icon;
    return (
      <Chip
        icon={<Icon />}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography>Loading documents...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Document Upload Center
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage compliance documents and certifications
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleFileSelect}
            startIcon={<Plus />}
          >
            Upload Document
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardHeader
                title="Total Documents"
                titleTypographyProps={{ variant: 'body2' }}
                avatar={<FolderOpen color="primary" />}
              />
              <CardContent>
                <Typography variant="h4" component="div">
                  {stats.totalDocuments}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  All document types
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardHeader
                title="Expiring Soon"
                titleTypographyProps={{ variant: 'body2' }}
                avatar={<AlertTriangle sx={{ color: 'warning.main' }} />}
              />
              <CardContent>
                <Typography variant="h4" component="div">
                  {stats.expiringThisMonth}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Need attention
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardHeader
                title="Recent Uploads"
                titleTypographyProps={{ variant: 'body2' }}
                avatar={<Upload sx={{ color: 'success.main' }} />}
              />
              <CardContent>
                <Typography variant="h4" component="div">
                  {stats.recentUploads}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last 30 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardHeader
                title="Storage Used"
                titleTypographyProps={{ variant: 'body2' }}
                avatar={<Archive sx={{ color: 'secondary.main' }} />}
              />
              <CardContent>
                <Typography variant="h4" component="div">
                  {stats.storageUsed} MB
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  of {stats.storageLimit} MB limit
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(stats.storageUsed / stats.storageLimit) * 100}
                  sx={{ mt: 1, height: 8, borderRadius: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Upload Area */}
        <Paper
          sx={{
            border: 2,
            borderStyle: 'dashed',
            borderColor: dragOver ? 'primary.main' : 'divider',
            bgcolor: dragOver ? 'primary.light' : 'background.paper',
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Upload
              sx={{
                fontSize: 48,
                color: dragOver ? 'primary.main' : 'text.disabled',
                mb: 2
              }}
            />
            <Typography variant="h6" gutterBottom>
              {dragOver ? "Drop files here" : "Drag and drop files here"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              or click to browse files (PDF, Images, Documents)
            </Typography>
            <Button variant="outlined" onClick={handleFileSelect}>
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
              onChange={handleFileChange}
              sx={{ display: 'none' }}
            />
          </Box>
        </Paper>

        {/* Upload Progress */}
        {uploadingFiles.length > 0 && (
          <Card>
            <CardHeader title="Uploading Files" />
            <CardContent>
              <Stack spacing={2}>
                {uploadingFiles.map((upload) => (
                  <Box key={upload.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <File sx={{ color: 'text.secondary' }} />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {upload.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => removeUploadingFile(upload.id)}
                        >
                          <X fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={upload.progress}
                          sx={{ flex: 1, height: 6, borderRadius: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {Math.round(upload.progress)}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1 }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Document Type</InputLabel>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              label="Document Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              {Object.entries(documentTypeConfig).map(([key, config]) => (
                <MenuItem key={key} value={key}>{config.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Documents Table */}
        <Paper sx={{ width: '100%' }}>
          <Tabs defaultValue={0}>
            <Tab label="All Documents" />
            <Tab label="Expiring Soon" />
            <Tab label="Certificates" />
            <Tab label="Invoices" />
          </Tabs>

          <TabPanel value={0} index={0}>
            <Card>
              <CardHeader
                title="Document Library"
                subheader={`${filteredDocuments.length} documents found`}
              />
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Document</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Upload Date</TableCell>
                        <TableCell>Expiry Date</TableCell>
                        <TableCell>Uploaded By</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredDocuments.map((doc) => {
                        const FileIcon = getFileIcon(doc.mimeType);
                        const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
                        
                        return (
                          <TableRow key={doc.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <FileIcon sx={{ color: 'text.secondary' }} />
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    {doc.name}
                                  </Typography>
                                  {doc.description && (
                                    <Typography variant="caption" color="text.secondary">
                                      {doc.description}
                                    </Typography>
                                  )}
                                  {doc.tags.length > 0 && (
                                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                      {doc.tags.slice(0, 2).map((tag, index) => (
                                        <Chip
                                          key={index}
                                          label={tag}
                                          size="small"
                                          variant="outlined"
                                        />
                                      ))}
                                      {doc.tags.length > 2 && (
                                        <Typography variant="caption" color="text.secondary">
                                          +{doc.tags.length - 2} more
                                        </Typography>
                                      )}
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>{getTypeChip(doc.type)}</TableCell>
                            <TableCell>{getStatusChip(doc.status)}</TableCell>
                            <TableCell>{formatFileSize(doc.size)}</TableCell>
                            <TableCell>
                              {format(doc.uploadDate, 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              {doc.expiryDate ? (
                                <Box>
                                  <Typography variant="body2">
                                    {format(doc.expiryDate, 'MMM dd, yyyy')}
                                  </Typography>
                                  {doc.status === 'expiring_soon' && (
                                    <Typography variant="caption" color="warning.main">
                                      Expires soon
                                    </Typography>
                                  )}
                                  {doc.status === 'expired' && (
                                    <Typography variant="caption" color="error">
                                      Expired
                                    </Typography>
                                  )}
                                </Box>
                              ) : (
                                <Typography color="text.secondary">—</Typography>
                              )}
                            </TableCell>
                            <TableCell>{doc.uploadedBy}</TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={(e) => setAnchorEl(e.currentTarget)}
                              >
                                <MoreHorizontal />
                              </IconButton>
                              <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={() => setAnchorEl(null)}
                              >
                                <MenuItem onClick={() => {
                                  handleDocumentAction('view', doc.id);
                                  setAnchorEl(null);
                                }}>
                                  <Eye sx={{ mr: 1, fontSize: 18 }} />
                                  View
                                </MenuItem>
                                <MenuItem onClick={() => {
                                  handleDocumentAction('download', doc.id);
                                  setAnchorEl(null);
                                }}>
                                  <Download sx={{ mr: 1, fontSize: 18 }} />
                                  Download
                                </MenuItem>
                                <Divider />
                                <MenuItem 
                                  onClick={() => {
                                    handleDocumentAction('delete', doc.id);
                                    setAnchorEl(null);
                                  }}
                                  sx={{ color: 'error.main' }}
                                >
                                  <Trash2 sx={{ mr: 1, fontSize: 18 }} />
                                  Delete
                                </MenuItem>
                              </Menu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={1} index={1}>
            <Card>
              <CardHeader title="Expiring Documents" />
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <AlertTriangle sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
                  <Typography color="text.secondary">
                    Expiring documents view would show filtered content
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={2} index={2}>
            <Card>
              <CardHeader title="Certificates" />
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Shield sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
                  <Typography color="text.secondary">
                    Certificates view would show filtered content
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={3} index={3}>
            <Card>
              <CardHeader title="Invoices" />
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <FileText sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
                  <Typography color="text.secondary">
                    Invoices view would show filtered content
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>
        </Paper>
      </Stack>
    </Box>
  );
};