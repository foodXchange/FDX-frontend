import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Fade,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Phone,
  Email,
  TrendingUp,
  GroupWork,
  AttachMoney,
} from '@mui/icons-material';
import { useAgentStore } from '../store';
import { agentApi } from '../services';

interface LoginFormData {
  email: string;
  password: string;
}

const AgentPortal: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { currentAgent, isAuthenticated, setAgent } = useAgentStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated && currentAgent) {
      // Redirect to dashboard
      window.location.href = '/agents/dashboard';
    }
  }, [isAuthenticated, currentAgent]);

  const handleInputChange = (field: keyof LoginFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setError(null);
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { agent } = await agentApi.login(formData.email, formData.password);
      setAgent(agent);
      
      // Connect to WebSocket for real-time updates
      agentApi.connect();
      
      // Redirect to dashboard or onboarding
      if (!agent.onboardingStatus.isCompleted) {
        window.location.href = '/agents/onboarding';
      } else {
        window.location.href = '/agents/dashboard';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Implement forgot password functionality
    alert('Please contact support to reset your password.');
  };

  const features = [
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Track Performance',
      description: 'Monitor your leads, conversions, and earnings in real-time',
    },
    {
      icon: <GroupWork sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      title: 'Manage Leads',
      description: 'Organize and nurture leads through our intuitive CRM system',
    },
    {
      icon: <AttachMoney sx={{ fontSize: 40, color: theme.palette.success.main }} />,
      title: 'Earn Commissions',
      description: 'Get paid for every successful deal you close',
    },
  ];

  if (isAuthenticated && currentAgent) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.grey[100],
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.grey[50],
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 4,
            alignItems: 'center',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {/* Left Side - Branding and Features */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <Fade in timeout={1000}>
              <Box>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Agent Portal
                </Typography>
                <Typography
                  variant="h5"
                  color="text.secondary"
                  sx={{ mb: 4, lineHeight: 1.4 }}
                >
                  Manage leads, track performance, and grow your earnings with our powerful agent platform
                </Typography>
              </Box>
            </Fade>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {features.map((feature, index) => (
                <Fade
                  key={feature.title}
                  in
                  timeout={1000 + index * 200}
                >
                  <Card
                    sx={{
                      p: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow: theme.shadows[1],
                      '&:hover': {
                        boxShadow: theme.shadows[4],
                        transform: 'translateY(-2px)',
                        transition: 'all 0.3s ease',
                      },
                    }}
                  >
                    <CardContent sx={{ display: 'flex', gap: 2, p: '16px !important' }}>
                      <Box sx={{ flexShrink: 0 }}>
                        {feature.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              ))}
            </Box>
          </Box>

          {/* Right Side - Login Form */}
          <Box sx={{ flex: 1, maxWidth: isMobile ? '100%' : 400 }}>
            <Fade in timeout={1200}>
              <Paper
                elevation={8}
                sx={{
                  p: 4,
                  borderRadius: 2,
                  backgroundColor: 'white',
                }}
              >
                <Box component="form" onSubmit={handleLogin}>
                  <Typography
                    variant="h4"
                    component="h2"
                    sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}
                  >
                    Welcome Back
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 4, textAlign: 'center' }}
                  >
                    Sign in to access your agent dashboard
                  </Typography>

                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    disabled={isLoading}
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    disabled={isLoading}
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading || !formData.email || !formData.password}
                    sx={{
                      mb: 2,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant="text"
                      color="primary"
                      onClick={handleForgotPassword}
                      sx={{ textTransform: 'none' }}
                    >
                      Forgot your password?
                    </Button>
                  </Box>
                </Box>

                <Box
                  sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    New to our platform?
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      startIcon={<Phone />}
                      size="small"
                      sx={{ textTransform: 'none' }}
                    >
                      Call Us
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Email />}
                      size="small"
                      sx={{ textTransform: 'none' }}
                    >
                      Email Us
                    </Button>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Contact support to become an agent
                  </Typography>
                </Box>
              </Paper>
            </Fade>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AgentPortal;