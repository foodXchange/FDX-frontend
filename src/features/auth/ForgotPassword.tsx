import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  CircularProgress,
  Stack
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle
} from '@mui/icons-material';
import { api } from '@/services/api-client';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      await api.auth.forgotPassword(data.email);
      setIsSuccess(true);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

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
              Check your email
            </Typography>
            <Typography color="text.secondary" variant="body2" paragraph>
              We've sent a password reset link to your email address.
            </Typography>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 2 }}
            >
              Back to Login
            </Button>
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
              Forgot your password?
            </Typography>
            <Typography color="text.secondary">
              Enter your email address and we'll send you a link to reset your password.
            </Typography>
          </Box>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack spacing={3}>
                  <TextField
                    {...register('email')}
                    type="email"
                    label="Email address"
                    fullWidth
                    autoComplete="email"
                    placeholder="you@example.com"
                    error={!!errors.email}
                    helperText={errors.email?.message}
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
                    {isLoading ? 'Sending...' : 'Send reset link'}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      component={Link}
                      to="/login"
                      color="primary"
                      startIcon={<ArrowBack />}
                      sx={{ textTransform: 'none' }}
                    >
                      Back to login
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
};

export default ForgotPassword;