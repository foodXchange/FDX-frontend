import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  LinearProgress,
  Stack,
  Link,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  company: z.string().min(2, 'Company name is required'),
  role: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: registerUser, error } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        name: data.name,
        company: data.company,
        role: data.role as 'supplier' | 'buyer',
      });
      navigate('/dashboard');
    } catch (err) {
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password || '');

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
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Or{' '}
            <Link
              component={RouterLink}
              to="/login"
              underline="hover"
            >
              sign in to existing account
            </Link>
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={3}>
                <TextField
                  {...register('name')}
                  fullWidth
                  label="Full Name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />

                <TextField
                  {...register('email')}
                  fullWidth
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />

                <TextField
                  {...register('company')}
                  fullWidth
                  label="Company"
                  type="text"
                  placeholder="ACME Corp"
                  error={!!errors.company}
                  helperText={errors.company?.message}
                />

                <FormControl fullWidth error={!!errors.role}>
                  <InputLabel>I am a</InputLabel>
                  <Select
                    {...register('role')}
                    label="I am a"
                    defaultValue=""
                  >
                    <MenuItem value="">Select role</MenuItem>
                    <MenuItem value="buyer">Buyer</MenuItem>
                    <MenuItem value="supplier">Supplier</MenuItem>
                  </Select>
                  {errors.role && (
                    <FormHelperText>{errors.role.message}</FormHelperText>
                  )}
                </FormControl>

                <TextField
                  {...register('password')}
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  error={!!errors.password}
                  helperText={errors.password?.message}
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
                    )
                  }}
                />
                {password && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                      {[...Array(5)].map((_, i) => (
                        <LinearProgress
                          key={i}
                          variant="determinate"
                          value={i < passwordStrength ? 100 : 0}
                          sx={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: 
                                passwordStrength <= 2 ? 'error.main' :
                                passwordStrength <= 3 ? 'warning.main' :
                                'success.main'
                            }
                          }}
                        />
                      ))}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Password strength: {passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Medium' : 'Strong'}
                    </Typography>
                  </Box>
                )}

                <TextField
                  {...register('confirmPassword')}
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...register('acceptTerms')}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I agree to the{' '}
                        <Link component={RouterLink} to="/terms" underline="hover">
                          Terms and Conditions
                        </Link>{' '}
                        and{' '}
                        <Link component={RouterLink} to="/privacy" underline="hover">
                          Privacy Policy
                        </Link>
                      </Typography>
                    }
                  />
                  {errors.acceptTerms && (
                    <FormHelperText error>{errors.acceptTerms.message}</FormHelperText>
                  )}
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        <Snackbar
          open={showToast}
          autoHideDuration={6000}
          onClose={() => setShowToast(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setShowToast(false)}
            severity="error"
            sx={{ width: '100%' }}
          >
            {error || 'Registration failed'}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};