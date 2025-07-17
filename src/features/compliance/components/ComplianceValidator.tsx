import React, { useState } from 'react';
import { Box, Card, CardContent, CardHeader, Typography, Button, Chip, Tabs, Tab, List, ListItem, ListItemIcon, ListItemText, Alert, AlertTitle, CircularProgress, Stack, Paper } from '@mui/material';

interface ValidationResult {
  passed: boolean;
  score: number;
  criticalErrors: string[];
  warnings: string[];
  suggestions: string[];
  certificationsRequired: string[];
  estimatedFixTime: string;
  marketCompliance: {
    compliant: boolean;
    requirements: string[];
    missingElements: string[];
  };
}

interface ComplianceValidatorProps {
  rfqId?: string;
  productType: string;
  specifications: any;
  onValidationComplete?: (result: ValidationResult) => void;
}

export const ComplianceValidator: React.FC<ComplianceValidatorProps> = ({
  rfqId,
  productType,
  specifications,
  onValidationComplete
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'errors' | 'warnings' | 'certifications'>('errors');
  const [realTimeErrors] = useState<Record<string, string>>({});

  // Full compliance validation
  const runFullValidation = async () => {
    setIsValidating(true);
    try {
      const response = await fetch('/api/compliance/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productType,
          specifications,
          targetMarket: 'US',
          rfqId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setValidationResult(data.validation);
        if (onValidationComplete) {
          onValidationComplete(data.validation);
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // Color validation preview (prevent cornflake color error)
  const ColorValidationPreview = ({ color }: { color: any }) => {
    const isValid = !['green', 'blue', 'purple', 'red'].includes(color?.colorName?.toLowerCase());
    
    return (
      <Alert
        severity={isValid ? 'success' : 'error'}
        sx={{ border: 2, borderColor: isValid ? 'success.main' : 'error.main' }}
        icon={isValid ? <CheckCircleIcon /> : <XCircleIcon />}
      >
        <AlertTitle>Color Specification</AlertTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2">
              {color?.colorName || 'Not specified'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {color?.hexCode && (
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1,
                  border: 2,
                  borderColor: 'divider',
                  bgcolor: color.hexCode
                }}
              />
            )}
          </Box>
        </Box>
        {!isValid && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="error">
              <strong>Critical Error:</strong> This color will cause product rejection.
              <br />Allowed colors: golden, light golden, amber, honey
            </Typography>
          </Box>
        )}
      </Alert>
    );
  };

  // Validation score display
  const ScoreDisplay = ({ score }: { score: number }) => {
    const getScoreColor = () => {
      if (score >= 80) return 'success.main';
      if (score >= 60) return 'warning.main';
      return 'error.main';
    };

    const getScoreBackground = () => {
      if (score >= 80) return 'success.light';
      if (score >= 60) return 'warning.light';
      return 'error.light';
    };

    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: 2,
          py: 1,
          borderRadius: '50px',
          bgcolor: getScoreBackground(),
        }}
      >
        <Typography variant="h4" sx={{ color: getScoreColor(), fontWeight: 'bold' }}>
          {score}
        </Typography>
        <Typography variant="body2" sx={{ ml: 0.5, color: 'text.secondary' }}>
          /100
        </Typography>
      </Box>
    );
  };

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

  return (
    <Card sx={{ boxShadow: 3 }}>
      <CardHeader
        avatar={<ShieldCheckIcon color="primary" />}
        title="Compliance Validation"
        titleTypographyProps={{ variant: 'h5' }}
        action={
          <Button
            variant="contained"
            onClick={runFullValidation}
            disabled={isValidating}
            startIcon={isValidating ? <CircularProgress size={20} /> : null}
          >
            {isValidating ? 'Validating...' : 'Run Full Validation'}
          </Button>
        }
      />
      <CardContent>
        <Stack spacing={3}>

          {/* Real-time errors */}
          {Object.keys(realTimeErrors).length > 0 && (
            <Alert severity="error">
              <AlertTitle>Real-time Validation Errors</AlertTitle>
              <Box>
                {Object.entries(realTimeErrors).map(([field, error]) => (
                  <Typography key={field} variant="body2" sx={{ mb: 0.5 }}>
                    <strong>{field}:</strong> {error}
                  </Typography>
                ))}
              </Box>
            </Alert>
          )}

          {/* Color preview for cornflakes */}
          {productType === 'cornflakes' && specifications?.specifications?.visual?.primaryColor && (
            <ColorValidationPreview color={specifications.specifications.visual.primaryColor} />
          )}

          {/* Validation Results */}
          {validationResult && (
            <Stack spacing={3}>
              {/* Score and Status */}
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ScoreDisplay score={validationResult.score} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Compliance Status
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: validationResult.passed ? 'success.main' : 'error.main',
                          fontWeight: 'bold'
                        }}
                      >
                        {validationResult.passed ? 'PASSED' : 'FAILED'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">
                      Estimated Fix Time
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {validationResult.estimatedFixTime}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Tabs */}
              <Tabs 
                value={activeTab === 'errors' ? 0 : activeTab === 'warnings' ? 1 : 2}
                onChange={(_, newValue) => {
                  setActiveTab(newValue === 0 ? 'errors' : newValue === 1 ? 'warnings' : 'certifications');
                }}
              >
                <Tab 
                  label={`Critical Errors (${validationResult.criticalErrors.length})`}
                  sx={{ color: 'error.main' }}
                />
                <Tab 
                  label={`Warnings (${validationResult.warnings.length})`}
                  sx={{ color: 'warning.main' }}
                />
                <Tab 
                  label={`Certifications (${validationResult.certificationsRequired.length})`}
                  sx={{ color: 'primary.main' }}
                />
              </Tabs>

              {/* Tab Content */}
              <Box sx={{ minHeight: 200 }}>
                <TabPanel value={activeTab === 'errors' ? 0 : activeTab === 'warnings' ? 1 : 2} index={0}>
                  <Stack spacing={2}>
                    {validationResult.criticalErrors.length === 0 ? (
                      <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                        No critical errors found!
                      </Typography>
                    ) : (
                      validationResult.criticalErrors.map((error, index) => (
                        <Alert key={index} severity="error" icon={<XCircleIcon />}>
                          <Typography variant="body2" fontWeight="medium">
                            {error}
                          </Typography>
                          {validationResult.suggestions[index] && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              <strong>Fix:</strong> {validationResult.suggestions[index]}
                            </Typography>
                          )}
                        </Alert>
                      ))
                    )}
                  </Stack>
                </TabPanel>

                <TabPanel value={activeTab === 'errors' ? 0 : activeTab === 'warnings' ? 1 : 2} index={1}>
                  <Stack spacing={2}>
                    {validationResult.warnings.length === 0 ? (
                      <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                        No warnings found!
                      </Typography>
                    ) : (
                      validationResult.warnings.map((warning, index) => (
                        <Alert key={index} severity="warning" icon={<ExclamationTriangleIcon />}>
                          <Typography variant="body2">{warning}</Typography>
                        </Alert>
                      ))
                    )}
                  </Stack>
                </TabPanel>

                <TabPanel value={activeTab === 'errors' ? 0 : activeTab === 'warnings' ? 1 : 2} index={2}>
                  <List>
                    {validationResult.certificationsRequired.map((cert, index) => (
                      <ListItem key={index} sx={{ bgcolor: 'info.light', mb: 1, borderRadius: 1 }}>
                        <ListItemIcon>
                          <ClipboardDocumentCheckIcon color="info" />
                        </ListItemIcon>
                        <ListItemText primary={cert} />
                        <Chip label="Required" color="info" size="small" />
                      </ListItem>
                    ))}
                  </List>
                </TabPanel>
              </Box>

              {/* Market Compliance */}
              {validationResult.marketCompliance && (
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Market Compliance (US)
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {validationResult.marketCompliance.compliant ? (
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    ) : (
                      <XCircleIcon color="error" sx={{ mr: 1 }} />
                    )}
                    <Typography
                      color={validationResult.marketCompliance.compliant ? 'success.main' : 'error.main'}
                      fontWeight="medium"
                    >
                      {validationResult.marketCompliance.compliant ? 'Market Compliant' : 'Not Market Compliant'}
                    </Typography>
                  </Box>
                  {validationResult.marketCompliance.missingElements.length > 0 && (
                    <Box sx={{ ml: 4 }}>
                      <Typography variant="body2" fontWeight="medium" gutterBottom>
                        Missing Requirements:
                      </Typography>
                      <List dense>
                        {validationResult.marketCompliance.missingElements.map((element, idx) => (
                          <ListItem key={idx} sx={{ py: 0.5 }}>
                            <Typography variant="body2" color="error">
                              • {element}
                            </Typography>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Paper>
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};