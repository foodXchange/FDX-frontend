import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Toast } from '@components/ui/Toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  AppBar, 
  Toolbar, 
  Checkbox, 
  FormControlLabel, 
  IconButton, 
  InputAdornment, 
  CircularProgress 
} from '@mui/material';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          bgcolor: 'background.paper', 
          borderBottom: 1, 
          borderColor: 'divider',
          color: 'text.primary'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#FF6B35',
                    mr: 1.5,
                  }}
                >
                  <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>
                    F
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  FoodXchange
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                sx={{ fontWeight: 500 }}
              >
                Contact Sales
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content - Two Column Layout */}
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Left Column - Login Form */}
        <Box
          sx={{
            width: { xs: '100%', md: '40%' },
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            px: { xs: 3, sm: 6, lg: 8 },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                Enterprise Login
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                Access your partner portal
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Transforming Global Food Sourcing
              </Typography>
            </Box>

            {/* Trust Indicators */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: 'grey.50',
                p: 2,
                mb: 3,
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    bgcolor: 'success.main',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1,
                  }}
                >
                  <Typography sx={{ color: 'white', fontSize: '0.75rem' }}>✓</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                  Your data is encrypted with 256-bit SSL
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  GDPR Compliant
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  •
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  SOC 2 Type II Certified
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block' }}>
                Join 5,000+ food businesses
              </Typography>
            </Paper>

            {/* Demo Credentials */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: 'info.light',
                p: 2,
                mb: 3,
                borderRadius: 2,
                border: 1,
                borderColor: 'info.main',
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'info.dark', fontWeight: 600, mb: 1 }}>
                  Demo Credentials
                </Typography>
                <Typography variant="caption" sx={{ color: 'info.main' }}>
                  Copy and paste to test the login
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Company:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
                        Demo Foods Inc.
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      color="info"
                      sx={{ fontSize: '0.75rem' }}
                      onClick={() => {
                        const companyInput = document.getElementById('company') as HTMLInputElement;
                        if (companyInput) companyInput.value = 'Demo Foods Inc.';
                      }}
                    >
                      Copy
                    </Button>
                  </Box>
                </Paper>
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Email:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
                        demo@foodsupply.com
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      color="info"
                      sx={{ fontSize: '0.75rem' }}
                      onClick={() => {
                        const emailInput = document.getElementById('email') as HTMLInputElement;
                        if (emailInput) emailInput.value = 'demo@foodsupply.com';
                      }}
                    >
                      Copy
                    </Button>
                  </Box>
                </Paper>
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Password:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.primary' }}>
                        Demo123!
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      color="info"
                      sx={{ fontSize: '0.75rem' }}
                      onClick={() => {
                        const passwordInput = document.getElementById('password') as HTMLInputElement;
                        if (passwordInput) passwordInput.value = 'Demo123!';
                      }}
                    >
                      Copy
                    </Button>
                  </Box>
                </Paper>
              </Box>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  sx={{ fontSize: '0.75rem' }}
                  onClick={() => {
                    const companyInput = document.getElementById('company') as HTMLInputElement;
                    const emailInput = document.getElementById('email') as HTMLInputElement;
                    const passwordInput = document.getElementById('password') as HTMLInputElement;
                    if (companyInput) companyInput.value = 'Demo Foods Inc.';
                    if (emailInput) emailInput.value = 'demo@foodsupply.com';
                    if (passwordInput) passwordInput.value = 'Demo123!';
                  }}
                >
                  Fill All Demo Data
                </Button>
              </Box>
            </Paper>

            {/* Login Form Card */}
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Company/Organization Field */}
                <TextField
                  id="company"
                  label="Company/Organization"
                  variant="outlined"
                  fullWidth
                  placeholder="Enter your company name"
                />

                {/* Email Field */}
                <TextField
                  {...register('email')}
                  id="email"
                  label="Email address"
                  type="email"
                  variant="outlined"
                  fullWidth
                  autoComplete="email"
                  placeholder="Enter your email address"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />

                {/* Password Field */}
                <TextField
                  {...register('password')}
                  id="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  fullWidth
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeSlashIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Remember Me & Forgot Password */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...register('rememberMe')}
                        id="rememberMe"
                        color="primary"
                      />
                    }
                    label="Remember me"
                  />
                  <Button
                    component={Link}
                    to="/forgot-password"
                    variant="text"
                    color="primary"
                    sx={{ fontSize: '0.875rem' }}
                  >
                    Forgot password?
                  </Button>
                </Box>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isLoading}
                  sx={{ py: 1.5, fontSize: '1rem', fontWeight: 500 }}
                >
                  {isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} color="inherit" />
                      Signing in...
                    </Box>
                  ) : (
                    'Sign in'
                  )}
                </Button>

                {/* Request Demo Link */}
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    component={Link}
                    to="/request-demo"
                    variant="text"
                    sx={{ 
                      color: '#FF6B35',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      '&:hover': {
                        color: '#E55100',
                      }
                    }}
                  >
                    Request Demo
                  </Button>
                </Box>
              </Box>
            </Paper>

            {/* Additional Links */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2 }}>
                <Button
                  component={Link}
                  to="/compliance"
                  variant="text"
                  color="inherit"
                  sx={{ fontSize: '0.875rem' }}
                >
                  Compliance Standards
                </Button>
                <Button
                  component={Link}
                  to="/security"
                  variant="text"
                  color="inherit"
                  sx={{ fontSize: '0.875rem' }}
                >
                  Security
                </Button>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Don't have an account?{' '}
                <Button
                  component={Link}
                  to="/register"
                  variant="text"
                  color="primary"
                  sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                >
                  Create a new account
                </Button>
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right Column - Hero Image */}
        <Box
          sx={{
            width: { xs: '0%', md: '60%' },
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            background: 'linear-gradient(135deg, #f8fafc 0%, #fef3f2 100%)',
          }}
        >
          <Box sx={{ maxWidth: 400, textAlign: 'center' }}>
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  background: 'linear-gradient(135deg, #1E4C8A 0%, #FF6B35 100%)',
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'white',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography sx={{ color: 'primary.main', fontWeight: 700, fontSize: '1.125rem' }}>
                    F
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
                Global Food Sourcing Platform
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4 }}>
                Connect with verified suppliers, streamline procurement, and ensure compliance across your supply chain.
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#52B788', mr: 1 }} />
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      500+ Verified Suppliers
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1E4C8A', mr: 1 }} />
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      Global Compliance
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#FF6B35', mr: 1 }} />
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      Real-time Tracking
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#B08D57', mr: 1 }} />
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      Secure Transactions
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          py: 2,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
            <Button
              component={Link}
              to="/privacy"
              variant="text"
              color="inherit"
              sx={{ fontSize: '0.875rem' }}
            >
              Privacy Policy
            </Button>
            <Button
              component={Link}
              to="/terms"
              variant="text"
              color="inherit"
              sx={{ fontSize: '0.875rem' }}
            >
              Terms of Service
            </Button>
            <Button
              component={Link}
              to="/support"
              variant="text"
              color="inherit"
              sx={{ fontSize: '0.875rem' }}
            >
              Support
            </Button>
          </Box>
        </Container>
      </Box>

      {showToast && (
        <Toast
          id="login-error"
          title="Login Failed"
          message={error || 'Login failed'}
          type="error"
          onClose={() => setShowToast(false)}
        />
      )}
    </Box>
  );
};