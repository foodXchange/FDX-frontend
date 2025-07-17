import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  CheckCircle,
  CloudUpload,
  Phone,
  WhatsApp,
  LocationOn,
  School,
  VerifiedUser,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { useAgentStore } from '../store';
import { agentApi } from '../services';
import { OnboardingStatus, OnboardingStep } from '../types';

const AgentOnboarding: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { currentAgent } = useAgentStore();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepData, setStepData] = useState<Record<string, any>>({});

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      setIsLoading(true);
      const status = await agentApi.getOnboardingStatus();
      setOnboardingStatus(status);
      setActiveStep(status.currentStep);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to load onboarding status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepData = (stepId: string, data: Record<string, any>) => {
    setStepData((prev) => ({
      ...prev,
      [stepId]: { ...prev[stepId], ...data },
    }));
  };

  const completeStep = async (stepId: string) => {
    try {
      setIsLoading(true);
      const stepDataForSubmission = stepData[stepId] || {};
      
      // Update step with data
      if (Object.keys(stepDataForSubmission).length > 0) {
        await agentApi.updateOnboardingStep(stepId, stepDataForSubmission);
      }
      
      // Complete the step
      const updatedStatus = await agentApi.completeOnboardingStep(stepId);
      setOnboardingStatus(updatedStatus);
      
      if (activeStep < updatedStatus.totalSteps - 1) {
        setActiveStep(activeStep + 1);
      } else if (updatedStatus.isCompleted) {
        // Onboarding complete, redirect to dashboard
        window.location.href = '/agents/dashboard';
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to complete step');
    } finally {
      setIsLoading(false);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (onboardingStatus && stepIndex <= onboardingStatus.currentStep) {
      setActiveStep(stepIndex);
    }
  };

  const renderStepContent = (step: OnboardingStep) => {
    const data = stepData[step.id] || {};

    switch (step.type) {
      case 'info':
        return (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {step.description}
              </Typography>
              <Alert severity="info">
                Welcome to the FDX Agent Program! This quick setup will help you get started.
              </Alert>
            </CardContent>
          </Card>
        );

      case 'form':
        if (step.id === 'personal_info') {
          return (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={data.firstName || currentAgent?.firstName || ''}
                      onChange={(e) => handleStepData(step.id, { firstName: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={data.lastName || currentAgent?.lastName || ''}
                      onChange={(e) => handleStepData(step.id, { lastName: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={data.phone || currentAgent?.phone || ''}
                      onChange={(e) => handleStepData(step.id, { phone: e.target.value })}
                      InputProps={{
                        startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="WhatsApp Number"
                      value={data.whatsappNumber || currentAgent?.whatsappNumber || ''}
                      onChange={(e) => handleStepData(step.id, { whatsappNumber: e.target.value })}
                      InputProps={{
                        startAdornment: <WhatsApp sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={data.address || ''}
                      onChange={(e) => handleStepData(step.id, { address: e.target.value })}
                      multiline
                      rows={2}
                      InputProps={{
                        startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} />,
                      }}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="City"
                      value={data.city || ''}
                      onChange={(e) => handleStepData(step.id, { city: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="State"
                      value={data.state || ''}
                      onChange={(e) => handleStepData(step.id, { state: e.target.value })}
                      required
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          );
        }

        if (step.id === 'territory_selection') {
          return (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Select Your Territory Preferences
                </Typography>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Territory Type</InputLabel>
                  <Select
                    value={data.territoryType || ''}
                    onChange={(e) => handleStepData(step.id, { territoryType: e.target.value })}
                    label="Territory Type"
                  >
                    <MenuItem value="city">City-based</MenuItem>
                    <MenuItem value="region">Regional</MenuItem>
                    <MenuItem value="postal_code">Postal Code Areas</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Preferred Areas (comma separated)"
                  value={data.preferredAreas || ''}
                  onChange={(e) => handleStepData(step.id, { preferredAreas: e.target.value })}
                  placeholder="e.g., Downtown, Business District, Industrial Area"
                  multiline
                  rows={3}
                  helperText="List the areas where you'd like to work"
                />
              </CardContent>
            </Card>
          );
        }
        
        return (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography>Form content for {step.title}</Typography>
            </CardContent>
          </Card>
        );

      case 'document':
        return (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Document Upload
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Please upload required documents for verification
              </Alert>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {['ID Document', 'Proof of Address', 'Business License (if applicable)'].map((docType) => (
                  <Paper
                    key={docType}
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CloudUpload color="action" />
                      <Typography>{docType}</Typography>
                    </Box>
                    <Button variant="outlined" size="small">
                      Upload
                    </Button>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        );

      case 'verification':
        return (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Account Verification
              </Typography>
              <Alert severity="warning" sx={{ mb: 3 }}>
                Your account is under review. This typically takes 1-2 business days.
              </Alert>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircle color="success" />
                  <Typography>Identity verification</Typography>
                  <Chip label="Completed" color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} />
                  <Typography>Background check</Typography>
                  <Chip label="In Progress" color="warning" size="small" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <VerifiedUser color="action" />
                  <Typography>Reference verification</Typography>
                  <Chip label="Pending" color="default" size="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        );

      case 'training':
        return (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Training Modules
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Complete these training modules to get started
              </Alert>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  'Platform Overview',
                  'Lead Management',
                  'Commission Structure',
                  'Communication Best Practices',
                ].map((module) => (
                  <Box
                    key={module}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <School color="primary" />
                      <Typography>{module}</Typography>
                    </Box>
                    <Button variant="outlined" size="small">
                      Start
                    </Button>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Typography>Content for {step.title}</Typography>
        );
    }
  };

  if (isLoading && !onboardingStatus) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!onboardingStatus) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load onboarding information. Please try again.
        </Alert>
      </Container>
    );
  }

  const currentStep = onboardingStatus.steps[activeStep];
  const progress = ((activeStep + 1) / onboardingStatus.totalSteps) * 100;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.grey[50], py: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={2} sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
              Agent Onboarding
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Welcome! Let's get your agent account set up in just a few steps.
            </Typography>
            
            {/* Progress */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Step {activeStep + 1} of {onboardingStatus.totalSteps}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(progress)}% Complete
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Stepper */}
          <Stepper
            activeStep={activeStep}
            orientation={isMobile ? 'vertical' : 'horizontal'}
            sx={{ mb: 4 }}
          >
            {onboardingStatus.steps.map((step, index) => (
              <Step key={step.id} completed={step.isCompleted}>
                <StepLabel
                  onClick={() => goToStep(index)}
                  sx={{ cursor: index <= onboardingStatus.currentStep ? 'pointer' : 'default' }}
                >
                  {step.title}
                </StepLabel>
                {isMobile && (
                  <StepContent>
                    {index === activeStep && renderStepContent(step)}
                  </StepContent>
                )}
              </Step>
            ))}
          </Stepper>

          {/* Step Content (for desktop) */}
          {!isMobile && currentStep && (
            <Box>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                {currentStep.title}
              </Typography>
              {renderStepContent(currentStep)}
            </Box>
          )}

          {/* Navigation */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 4,
              pt: 3,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              startIcon={<ArrowBack />}
              sx={{ textTransform: 'none' }}
            >
              Previous
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {currentStep && !currentStep.isCompleted && (
                <Button
                  variant="contained"
                  onClick={() => completeStep(currentStep.id)}
                  disabled={isLoading}
                  endIcon={activeStep === onboardingStatus.totalSteps - 1 ? <CheckCircle /> : <ArrowForward />}
                  sx={{ textTransform: 'none' }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : activeStep === onboardingStatus.totalSteps - 1 ? (
                    'Complete Onboarding'
                  ) : (
                    'Continue'
                  )}
                </Button>
              )}

              {currentStep && currentStep.isCompleted && activeStep < onboardingStatus.totalSteps - 1 && (
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(activeStep + 1)}
                  endIcon={<ArrowForward />}
                  sx={{ textTransform: 'none' }}
                >
                  Next Step
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AgentOnboarding;