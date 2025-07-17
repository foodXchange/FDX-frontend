import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { FileUpload } from '../ui/FileUpload';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface ImportExportWithUploadProps {
  onImport?: (data: any[]) => void;
  exportData?: any[];
  dataType: 'leads' | 'agents' | 'analytics';
}

const steps = ['Upload File', 'Preview Data', 'Import Complete'];

export const ImportExportWithUpload: React.FC<ImportExportWithUploadProps> = ({
  onImport,
  exportData = [],
  dataType,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importStats, setImportStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
  });

  const handleFileUpload = async (file: any) => {
    setError(null);
    setParsing(true);

    try {
      // Fetch the uploaded file
      const response = await fetch(`http://localhost:3003${file.url}`);
      const blob = await response.blob();
      
      // Parse based on file type
      if (file.mimetype === 'text/csv') {
        const text = await blob.text();
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              setError('CSV parsing errors: ' + results.errors[0].message);
            } else {
              setImportedData(results.data);
              setActiveStep(1);
            }
            setParsing(false);
          },
        });
      } else if (file.mimetype.includes('spreadsheet') || file.mimetype.includes('excel')) {
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(firstSheet);
        setImportedData(data);
        setActiveStep(1);
        setParsing(false);
      } else {
        throw new Error('Unsupported file type. Please upload CSV or Excel files.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
      setParsing(false);
    }
  };

  const handleImport = async () => {
    setError(null);
    const stats = { total: importedData.length, success: 0, failed: 0 };

    try {
      // Validate and process data based on type
      const processedData = importedData.map((row) => {
        if (dataType === 'leads') {
          return {
            companyName: row.companyName || row['Company Name'] || '',
            contactPerson: row.contactPerson || row['Contact Person'] || '',
            email: row.email || row['Email'] || '',
            phone: row.phone || row['Phone'] || '',
            businessType: row.businessType || row['Business Type'] || 'Other',
            estimatedRevenue: parseFloat(row.estimatedRevenue || row['Estimated Revenue'] || '0'),
            status: 'new',
          };
        } else if (dataType === 'agents') {
          return {
            name: row.name || row['Name'] || '',
            email: row.email || row['Email'] || '',
            phone: row.phone || row['Phone'] || '',
            department: row.department || row['Department'] || '',
            tier: row.tier || row['Tier'] || 'bronze',
            status: 'active',
          };
        }
        return row;
      });

      // Simulate import process
      for (let i = 0; i < processedData.length; i++) {
        try {
          // In real app, this would be an API call
          await new Promise(resolve => setTimeout(resolve, 100));
          stats.success++;
        } catch {
          stats.failed++;
        }
      }

      setImportStats(stats);
      onImport?.(processedData);
      setActiveStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    }
  };

  const handleExport = (format: 'csv' | 'excel') => {
    if (exportData.length === 0) {
      setError('No data to export');
      return;
    }

    try {
      if (format === 'csv') {
        const csv = Papa.unparse(exportData);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dataType}_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      } else {
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, dataType);
        XLSX.writeFile(wb, `${dataType}_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      }
    } catch (err) {
      setError('Export failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const reset = () => {
    setActiveStep(0);
    setImportedData([]);
    setError(null);
    setImportStats({ total: 0, success: 0, failed: 0 });
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Import Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Import {dataType.charAt(0).toUpperCase() + dataType.slice(1)}
            </Typography>

            <Stepper activeStep={activeStep} sx={{ my: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {activeStep === 0 && (
              <Box>
                <FileUpload
                  accept=".csv,.xlsx,.xls"
                  maxSize={20}
                  onUploadSuccess={handleFileUpload}
                />
                {parsing && (
                  <Box display="flex" justifyContent="center" mt={3}>
                    <CircularProgress />
                  </Box>
                )}
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Preview ({importedData.length} records)
                </Typography>
                <TableContainer sx={{ maxHeight: 300, mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {Object.keys(importedData[0] || {}).slice(0, 5).map((key) => (
                          <TableCell key={key}>{key}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {importedData.slice(0, 5).map((row, index) => (
                        <TableRow key={index}>
                          {Object.values(row).slice(0, 5).map((value: any, i) => (
                            <TableCell key={i}>{value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {importedData.length > 5 && (
                  <Typography variant="caption" color="text.secondary">
                    ... and {importedData.length - 5} more records
                  </Typography>
                )}
                <Box display="flex" gap={2} mt={3}>
                  <Button variant="outlined" onClick={reset}>
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleImport}
                    startIcon={<UploadIcon />}
                  >
                    Import Data
                  </Button>
                </Box>
              </Box>
            )}

            {activeStep === 2 && (
              <Box textAlign="center">
                <SuccessIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Import Complete!
                </Typography>
                <Box display="flex" justifyContent="center" gap={2} my={2}>
                  <Chip
                    label={`Total: ${importStats.total}`}
                    color="default"
                  />
                  <Chip
                    label={`Success: ${importStats.success}`}
                    color="success"
                  />
                  {importStats.failed > 0 && (
                    <Chip
                      label={`Failed: ${importStats.failed}`}
                      color="error"
                    />
                  )}
                </Box>
                <Button variant="contained" onClick={reset} sx={{ mt: 2 }}>
                  Import More Data
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Export Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Export {dataType.charAt(0).toUpperCase() + dataType.slice(1)}
            </Typography>
            
            <Box my={3}>
              <Alert severity="info">
                Export your {dataType} data in CSV or Excel format
              </Alert>
            </Box>

            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('csv')}
                fullWidth
              >
                Export as CSV
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('excel')}
                fullWidth
              >
                Export as Excel
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" display="block" mt={3}>
              {exportData.length} records available for export
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};