import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressIndicator } from '../../components/ui/ProgressIndicator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Upload,
  File,
  FileText,
  FileImage,
  FileCheck,
  FolderOpen,
  Download,
  Eye,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Plus,
  Search,
  Shield,
  Archive,
  Trash2,
} from 'lucide-react';
import { cn } from '../../utils/cn';
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
    color: 'bg-blue-100 text-blue-700',
    icon: Shield,
  },
  invoice: {
    label: 'Invoice',
    color: 'bg-green-100 text-green-700',
    icon: FileText,
  },
  compliance: {
    label: 'Compliance',
    color: 'bg-purple-100 text-purple-700',
    icon: FileCheck,
  },
  quality: {
    label: 'Quality Doc',
    color: 'bg-orange-100 text-orange-700',
    icon: CheckCircle,
  },
  shipping: {
    label: 'Shipping',
    color: 'bg-cyan-100 text-cyan-700',
    icon: Archive,
  },
  other: {
    label: 'Other',
    color: 'bg-gray-100 text-gray-700',
    icon: File,
  },
};

const statusConfig = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  expired: {
    label: 'Expired',
    color: 'bg-red-100 text-red-700',
    icon: AlertTriangle,
  },
  expiring_soon: {
    label: 'Expiring Soon',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
  },
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-700',
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

  const getStatusBadge = (status: DocumentFile['status']) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: DocumentFile['type']) => {
    const config = documentTypeConfig[type];
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading documents...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Upload Center</h1>
          <p className="text-muted-foreground">
            Manage compliance documents and certifications
          </p>
        </div>
        <Button onClick={handleFileSelect}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FolderOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">All document types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringThisMonth}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
            <Upload className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentUploads}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Archive className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.storageUsed} MB</div>
            <p className="text-xs text-muted-foreground">
              of {stats.storageLimit} MB limit
            </p>
            <ProgressIndicator 
              value={(stats.storageUsed / stats.storageLimit) * 100} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-6">
          <Upload className={cn(
            "h-10 w-10 mb-4",
            dragOver ? "text-primary" : "text-muted-foreground"
          )} />
          <div className="text-center">
            <p className="text-lg font-medium mb-2">
              {dragOver ? "Drop files here" : "Drag and drop files here"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse files (PDF, Images, Documents)
            </p>
            <Button variant="outline" onClick={handleFileSelect}>
              Select Files
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            onChange={handleFileChange}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploading Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadingFiles.map((upload) => (
                <div key={upload.id} className="flex items-center gap-4">
                  <File className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{upload.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUploadingFile(upload.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <ProgressIndicator value={upload.progress} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground">
                        {Math.round(upload.progress)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Types</option>
          {Object.entries(documentTypeConfig).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Documents Table */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Document Library</CardTitle>
              <p className="text-sm text-muted-foreground">
                {filteredDocuments.length} documents found
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => {
                    const FileIcon = getFileIcon(doc.mimeType);
                    
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <FileIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              {doc.description && (
                                <p className="text-xs text-muted-foreground">
                                  {doc.description}
                                </p>
                              )}
                              {doc.tags.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {doc.tags.slice(0, 2).map((tag, index) => (
                                    <span
                                      key={index}
                                      className="text-xs bg-muted px-1 py-0.5 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {doc.tags.length > 2 && (
                                    <span className="text-xs text-muted-foreground">
                                      +{doc.tags.length - 2} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(doc.type)}</TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell>{formatFileSize(doc.size)}</TableCell>
                        <TableCell>
                          {format(doc.uploadDate, 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {doc.expiryDate ? (
                            <div>
                              <p className="text-sm">
                                {format(doc.expiryDate, 'MMM dd, yyyy')}
                              </p>
                              {doc.status === 'expiring_soon' && (
                                <p className="text-xs text-yellow-600">
                                  Expires soon
                                </p>
                              )}
                              {doc.status === 'expired' && (
                                <p className="text-xs text-red-600">
                                  Expired
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>{doc.uploadedBy}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem 
                                onClick={() => handleDocumentAction('view', doc.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDocumentAction('download', doc.id)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDocumentAction('delete', doc.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring">
          <Card>
            <CardHeader>
              <CardTitle>Expiring Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Expiring documents view would show filtered content</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Certificates view would show filtered content</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Invoices view would show filtered content</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};