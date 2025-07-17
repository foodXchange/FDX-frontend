import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  CircularProgress,
  Link,
  Stack
} from '@mui/material';
import {
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onLogin: (data: LoginFormData) => void;
  loading?: boolean;
  error?: string;
}

export function LoginForm({ onLogin, loading = false, error }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: 'demo@foodxchange.com',
      password: 'demo123',
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginFormData) => {
    onLogin(data);
  };

  const fillDemoCredentials = () => {
    reset({
      email: 'demo@foodxchange.com',
      password: 'demo123',
      rememberMe: false,
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.50',
        py: 3,
        px: { xs: 2, sm: 3, lg: 4 }
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={4}>
          {/* Logo and Header */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              component="div"
              sx={{
                fontWeight: 'bold',
                mb: 2,
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              <Box component="span" sx={{ color: 'warning.main' }}>X</Box>
              <Box component="span" sx={{ color: 'info.main' }}>FOOD</Box>
            </Typography>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              FoodXchange
            </Typography>
            <Typography color="text.secondary">
              Transforming Global Food Sourcing
            </Typography>
          </Box>

          {/* Login Card */}
          <Card sx={{ boxShadow: 3 }}>
            <CardHeader
              title="Welcome Back"
              subheader="Sign in to access your FoodXchange dashboard"
              titleTypographyProps={{ align: 'center', variant: 'h5' }}
              subheaderTypographyProps={{ align: 'center' }}
              sx={{ pb: 0 }}
            />

            <CardContent sx={{ p: 3 }}>
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack spacing={3}>
                  {/* Global Error */}
                  {error && (
                    <Alert severity="error" sx={{ width: '100%' }}>
                      {error}
                    </Alert>
                  )}

                  {/* Email Field */}
                  <TextField
                    {...register('email')}
                    type="email"
                    label="Email Address"
                    fullWidth
                    autoComplete="email"
                    placeholder="Enter your email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />

                  {/* Password Field */}
                  <TextField
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
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
                            aria-label="toggle password visibility"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Remember Me */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...register('rememberMe')}
                        color="primary"
                      />
                    }
                    label="Remember me for 30 days"
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={!isValid || loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>

                  {/* Demo Credentials */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant="text"
                      onClick={fillDemoCredentials}
                      color="primary"
                      sx={{ textTransform: 'none' }}
                    >
                      Use Demo Credentials
                    </Button>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Demo: demo@foodxchange.com / demo123
                    </Typography>
                  </Box>

                  {/* Forgot Password */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Link
                      href="/forgot-password"
                      underline="hover"
                      color="text.secondary"
                      sx={{ cursor: 'pointer' }}
                    >
                      Forgot your password?
                    </Link>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {/* Footer */}
          <Typography
            variant="caption"
            align="center"
            color="text.secondary"
            sx={{ mt: 3 }}
          >
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}