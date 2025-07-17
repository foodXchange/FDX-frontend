import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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
  IconButton,
  InputAdornment,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle
} from '@mui/icons-material';
import { api } from '@/services/api-client';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setErrorMessage('Invalid reset token');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await api.auth.resetPassword(token, data.password);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
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
        <Card sx={{ maxWidth: 'md', width: '100%' }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
              Invalid Reset Link
            </Typography>
            <Typography color="text.secondary" paragraph>
              This password reset link is invalid or has expired.
            </Typography>
            <Button
              component={Link}
              to="/forgot-password"
              variant="contained"
              fullWidth
              size="large"
            >
              Request New Reset Link
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (isSuccess) {
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
        <Card sx={{ maxWidth: 'md', width: '100%' }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <Box
              sx={{
                mx: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 48,
                width: 48,
                borderRadius: '50%',
                bgcolor: 'success.light',
                mb: 3
              }}
            >
              <CheckCircle sx={{ fontSize: 24, color: 'success.main' }} />
            </Box>
            <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
              Password Reset Successful
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Your password has been reset. Redirecting to login...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

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
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
              Reset your password
            </Typography>
            <Typography color="text.secondary">
              Enter your new password below
            </Typography>
          </Box>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack spacing={3}>
                  <TextField
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    label="New Password"
                    fullWidth
                    autoComplete="new-password"
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

                  <TextField
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm New Password"
                    fullWidth
                    autoComplete="new-password"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            aria-label="toggle confirm password visibility"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {errorMessage && (
                    <Alert severity="error" sx={{ width: '100%' }}>
                      {errorMessage}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
};

export default ResetPassword;