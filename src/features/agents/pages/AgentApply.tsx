import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Stack,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Paper,
  Chip,
  Grid
} from '@mui/material';
import { Business, CheckCircle, Work } from '@mui/icons-material';
import { Logo } from '../../../components/ui/Logo';

const steps = [
  'Personal Information',
  'Business Details',
  'Experience',
  'Review & Submit'
];

const industries = [
  'Food & Beverage',
  'Pharmaceuticals',
  'Cosmetics',
  'Chemicals',
  'Packaging',
  'Raw Materials',
  'Equipment & Machinery',
  'Other'
];

const languages = [
  'English',
  'Spanish',
  'Mandarin',
  'Hindi',
  'Arabic',
  'French',
  'Portuguese',
  'Russian',
  'German',
  'Japanese'
];

const regions = [
  'North America',
  'South America',
  'Europe',
  'Middle East',
  'Africa',
  'Asia Pacific',
  'Australia & Oceania'
];

export const AgentApply: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    // Business Details
    companyName: '',
    businessType: '',
    yearsInBusiness: '',
    website: '',
    linkedIn: '',
    // Experience
    industries: [] as string[],
    languages: [] as string[],
    regions: [] as string[],
    currentClients: '',
    monthlyVolume: '',
    achievements: '',
    // Agreement
    termsAccepted: false,
    backgroundCheck: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleMultiSelect = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter((v) => v !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }));
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess(true);
      setTimeout(() => {
        navigate('/agent/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName} onChange={handleChange} required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName} onChange={handleChange} required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email} onChange={handleChange} required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone} onChange={handleChange} required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.country} onChange={handleChange} required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city} onChange={handleChange} required
                />
              </Grid>
            </Grid>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Business Details
            </Typography>
            <TextField
              fullWidth
              label="Company Name (if applicable)"
              name="companyName"
              value={formData.companyName} onChange={handleChange}
            />
            <TextField
              fullWidth
              select
              label="Business Type"
              name="businessType"
              value={formData.businessType} onChange={handleChange} required
            >
              <MenuItem value="individual">Individual Consultant</MenuItem>
              <MenuItem value="agency">Agency</MenuItem>
              <MenuItem value="trading">Trading Company</MenuItem>
              <MenuItem value="broker">Broker</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Years in Business"
              name="yearsInBusiness"
              type="number"
              value={formData.yearsInBusiness} onChange={handleChange} required
            />
            <TextField
              fullWidth
              label="Website (optional)"
              name="website"
              value={formData.website} onChange={handleChange}
            />
            <TextField
              fullWidth
              label="LinkedIn Profile (optional)"
              name="linkedIn"
              value={formData.linkedIn} onChange={handleChange}
            />
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Experience & Expertise
            </Typography>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Industries you specialize in:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {industries.map((industry) => (
                  <Chip
                    key={industry} label={industry} onClick={() => handleMultiSelect('industries', industry)} color={formData.industries.includes(industry) ? 'primary' : 'default'} variant={formData.industries.includes(industry) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Languages you speak:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {languages.map((language) => (
                  <Chip
                    key={language} label={language} onClick={() => handleMultiSelect('languages', language)} color={formData.languages.includes(language) ? 'primary' : 'default'} variant={formData.languages.includes(language) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Regions you operate in:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {regions.map((region) => (
                  <Chip
                    key={region} label={region} onClick={() => handleMultiSelect('regions', region)} color={formData.regions.includes(region) ? 'primary' : 'default'} variant={formData.regions.includes(region) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>
            <TextField
              fullWidth
              label="Current number of active clients"
              name="currentClients"
              type="number"
              value={formData.currentClients} onChange={handleChange}
            />
            <TextField
              fullWidth
              select
              label="Average monthly transaction volume"
              name="monthlyVolume"
              value={formData.monthlyVolume} onChange={handleChange}
            >
              <MenuItem value="< $10K">Less than $10, 000</MenuItem>
              <MenuItem value="$10K-$50K">$10, 000 - $50, 000</MenuItem>
              <MenuItem value="$50K-$100K">$50, 000 - $100, 000</MenuItem>
              <MenuItem value="$100K-$500K">$100, 000 - $500, 000</MenuItem>
              <MenuItem value="> $500K">More than $500, 000</MenuItem>
            </TextField>
            <TextField
              fullWidth
              multiline
              rows={4} label="Notable achievements or success stories"
              name="achievements"
              value={formData.achievements} onChange={handleChange} placeholder="Share any relevant accomplishments, certifications, or successful deals..."
            />
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Review & Submit
            </Typography>
            <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Application Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body1">{formData.firstName} {formData.lastName}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{formData.email}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">Business Type</Typography>
                  <Typography variant="body1">{formData.businessType}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">Years in Business</Typography>
                  <Typography variant="body1">{formData.yearsInBusiness}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Industries</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {formData.industries.map((industry) => (
                      <Chip key={industry} label={industry} size="small" />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.termsAccepted} onChange={handleChange} name="termsAccepted"
                  />
                }
                label="I agree to the Agent Terms of Service and Commission Agreement"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.backgroundCheck} onChange={handleChange} name="backgroundCheck"
                  />
                }
                label="I consent to a background verification check"
              />
            </Box>
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" icon={<CheckCircle />}>
                Application submitted successfully! We'll review your application and contact you within 2-3 business days.
              </Alert>
            )}
          </Stack>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo size="large" variant="full" />
          </Link>
        </Box>

        <Card elevation={0} sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Work sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Become an FDX Agent
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Join our network of successful agents and grow your business
              </Typography>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mt: 4 }}>
              {getStepContent(activeStep)}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0} onClick={handleBack}
              >
                Back
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit} disabled={loading || !formData.termsAccepted || !formData.backgroundCheck}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit Application'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already an agent?{' '}
            <Link
              to="/agent/login"
              style={{
                color: 'inherit',
                textDecoration: 'underline'
              }}
            >
              Sign in here
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AgentApply;