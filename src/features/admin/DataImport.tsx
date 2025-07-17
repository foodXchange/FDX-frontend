import React from 'react';
import { useState } from 'react';
import { CloudUpload as CloudArrowUpIcon, Description as DocumentTextIcon, CheckCircle as CheckCircleIcon, Cancel as XCircleIcon } from '@mui/icons-material';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Box,
  Stack,
  Grid,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Divider
} from '@mui/material';

interface ImportResult {
  success: boolean;
  message: string;
  imported?: number;
  failed?: number;
}

export const DataImport: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<string>('products');

  const importTypes = [
    { id: 'products', label: 'Products', endpoint: '/import/products' },
    { id: 'suppliers', label: 'Suppliers', endpoint: '/import/suppliers' },
    { id: 'categories', label: 'Categories', endpoint: '/import/categories' },
    { id: 'certifications', label: 'Certifications', endpoint: '/import/certifications' },
    { id: 'users', label: 'Users', endpoint: '/import/users' },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', importType);

    try {
      const endpoint = importTypes.find(t => t.id === importType)?.endpoint || '/import/data';
      const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const result = await response.json();
      setResults([...results, result]);
    } catch (error) {
      setResults([...results, {
        success: false,
        message: `Import failed: ${(error as Error).message}`,
      }]);
    } finally {
      setImporting(false);
      setSelectedFile(null);
    }
  };

  const downloadTemplate = (type: string) => {
    const templates: Record<string, any> = {
      products: {
        headers: ['name', 'description', 'sku', 'category', 'price', 'moq', 'unit', 'supplier', 'certifications', 'leadTime'],
        example: [
          'Organic Quinoa Flour', 
          'High-quality organic quinoa flour', 
          'QF-001', 
          'Grains & Flours', 
          '4.50', 
          '500', 
          'kg', 
          'Global Grains Co.', 
          'Organic,Non-GMO,Gluten-Free', 
          '2-3 weeks'
        ]
      },
      suppliers: {
        headers: ['name', 'email', 'phone', 'country', 'city', 'certifications', 'verified', 'rating'],
        example: ['Global Grains Co.', 'contact@globalgrains.com', '+1234567890', 'USA', 'New York', 'ISO9001,HACCP', 'true', '4.5']
      },
      categories: {
        headers: ['name', 'parentCategory', 'description', 'isActive'],
        example: ['Grains & Flours', 'Food Ingredients', 'All types of grains and flours', 'true']
      },
      certifications: {
        headers: ['name', 'type', 'description', 'validityDays'],
        example: ['Organic', 'Product', 'USDA Organic Certification', '365']
      },
      users: {
        headers: ['email', 'firstName', 'lastName', 'company', 'role', 'phone'],
        example: ['buyer@company.com', 'John', 'Doe', 'ABC Foods Ltd', 'buyer', '+1234567890']
      }
    };

    const template = templates[type];
    if (!template) return;

    // Create CSV content
    const csvContent = [
      template.headers.join(','),
      template.example.join(','),
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foodxchange_${type}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ color: 'grey.900', fontWeight: 'bold', mb: 1 }}>
            Data Import Center
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.600' }}>
            Import your data into FoodXchange platform
          </Typography>
        </Box>

        {/* Import Type Selection */}
        <Card>
          <CardHeader>
            <Typography variant="h6">
              Select Import Type
            </Typography>
          </CardHeader>
          <CardContent>
            <Grid container spacing={2}>
              {importTypes.map((type) => (
                <Grid item xs={12} sm={6} md={4} key={type.id}>
                  <Paper
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      textAlign: 'center',
                      border: 2,
                      borderColor: importType === type.id ? 'primary.main' : 'grey.300',
                      bgcolor: importType === type.id ? 'primary.light' : 'transparent',
                      '&:hover': {
                        borderColor: importType === type.id ? 'primary.main' : 'grey.400'
                      }
                    }}
                    onClick={() => setImportType(type.id)}
                  >
                    <DocumentTextIcon
                      sx={{
                        fontSize: 48,
                        color: importType === type.id ? 'primary.main' : 'grey.400',
                        mb: 1
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 'medium',
                        color: importType === type.id ? 'primary.main' : 'grey.700',
                        mb: 2
                      }}
                    >
                      {type.label}
                    </Typography>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadTemplate(type.id);
                      }}
                      variant="outlined"
                      size="small"
                      fullWidth
                    >
                      Download Template
                    </Button>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <Typography variant="h6">
              Upload File
            </Typography>
          </CardHeader>
          <CardContent>
            <Stack spacing={3}>
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  border: 2,
                  borderStyle: 'dashed',
                  borderColor: 'grey.300',
                  bgcolor: 'grey.50',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.light'
                  }
                }}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <CloudArrowUpIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="body1" sx={{ color: 'grey.600', mb: 2 }}>
                  Drag and drop your CSV or Excel file here, or click to browse
                </Typography>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <Button
                  variant="contained"
                  component="span"
                >
                  Choose File
                </Button>
                {selectedFile && (
                  <Typography variant="body2" sx={{ color: 'grey.600', mt: 2 }}>
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </Typography>
                )}
              </Paper>

              <Button
                onClick={handleImport}
                disabled={!selectedFile || importing}
                variant="contained"
                size="large"
                fullWidth
              >
                {importing ? 'Importing...' : 'Import Data'}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Import Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <Typography variant="h6">
                Import Results
              </Typography>
            </CardHeader>
            <CardContent>
              <Stack spacing={2}>
                {results.map((result, index) => (
                  <Alert
                    key={index}
                    severity={result.success ? 'success' : 'error'}
                    icon={result.success ? <CheckCircleIcon /> : <XCircleIcon />}
                    sx={{ alignItems: 'flex-start' }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {result.message}
                      </Typography>
                      {result.imported !== undefined && (
                        <Typography variant="caption" sx={{ color: 'grey.600', mt: 1, display: 'block' }}>
                          Imported: {result.imported}, Failed: {result.failed || 0}
                        </Typography>
                      )}
                    </Box>
                  </Alert>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <Typography variant="h6">
              Import Instructions
            </Typography>
          </CardHeader>
          <CardContent>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" sx={{ color: 'grey.900', mb: 2 }}>
                  File Format Requirements:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="CSV files with comma separation" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Excel files (.xlsx or .xls)" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="First row must contain column headers" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="UTF-8 encoding for special characters" />
                  </ListItem>
                </List>
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="subtitle1" sx={{ color: 'grey.900', mb: 2 }}>
                  Data Validation:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Email addresses must be valid format" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Prices must be numeric values" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Dates in YYYY-MM-DD format" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Boolean fields: true/false or yes/no" />
                  </ListItem>
                </List>
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="subtitle1" sx={{ color: 'grey.900', mb: 2 }}>
                  Import Process:
                </Typography>
                <List dense>
                  <ListItem>
                    <Chip label="1" size="small" sx={{ mr: 1 }} />
                    <ListItemText primary="Download the template for your data type" />
                  </ListItem>
                  <ListItem>
                    <Chip label="2" size="small" sx={{ mr: 1 }} />
                    <ListItemText primary="Fill in your data following the format" />
                  </ListItem>
                  <ListItem>
                    <Chip label="3" size="small" sx={{ mr: 1 }} />
                    <ListItemText primary="Save as CSV or Excel file" />
                  </ListItem>
                  <ListItem>
                    <Chip label="4" size="small" sx={{ mr: 1 }} />
                    <ListItemText primary="Upload and import" />
                  </ListItem>
                  <ListItem>
                    <Chip label="5" size="small" sx={{ mr: 1 }} />
                    <ListItemText primary="Review import results" />
                  </ListItem>
                </List>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
};