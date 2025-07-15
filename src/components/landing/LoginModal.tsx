import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Alert,
  Paper,
  CircularProgress,
  Link,
  Slide,
  useTheme,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { BRAND_COLORS, ICON_CLASS } from '@/constants';
import { logger } from '@/services/logger';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
      handleClose();
    } catch (err) {
      logger.error('Login error in modal', {
        error: err instanceof Error ? err.message : 'Unknown error',
        email: data.email,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setShowPassword(false);
    setIsLoading(false);
    onClose();
  };

  const fillDemoData = () => {
    setValue('email', 'demo@foodsupply.com');
    setValue('password', 'Demo123!');
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      TransitionComponent={Transition}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Sign In
          </Typography>
          <IconButton
            onClick={handleClose}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
              },
            }}
          >
            <XMarkIcon className={ICON_CLASS} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Demo Credentials */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: 'info.light',
            p: 2,
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.info.main}`,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'info.dark', fontWeight: 600, mb: 1 }}>
              Demo Credentials
            </Typography>
            <Typography variant="caption" sx={{ color: 'info.main' }}>
              Use these credentials to test the login
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              Email: <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>demo@foodsupply.com</Box>
            </Typography>
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              Password: <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>Demo123!</Box>
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              size="small"
              onClick={fillDemoData}
              sx={{
                bgcolor: BRAND_COLORS.secondary,
                '&:hover': {
                  bgcolor: BRAND_COLORS.secondary,
                  filter: 'brightness(0.9)',
                },
              }}
            >
              Fill Demo Data
            </Button>
          </Box>
        </Paper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Email Field */}
          <TextField
            {...register('email')}
            label="Email address"
            type="email"
            fullWidth
            autoComplete="email"
            placeholder="Enter your email address"
            error={!!errors.email}
            helperText={errors.email?.message}
            variant="outlined"
          />

          {/* Password Field */}
          <TextField
            {...register('password')}
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            autoComplete="current-password"
            placeholder="Enter your password"
            error={!!errors.password}
            helperText={errors.password?.message}
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className={ICON_CLASS} />
                    ) : (
                      <EyeIcon className={ICON_CLASS} />
                    )}
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
                sx={{
                  color: BRAND_COLORS.secondary,
                  '&.Mui-checked': {
                    color: BRAND_COLORS.secondary,
                  },
                }}
              />
            }
            label="Remember me"
          />

          {/* Sign In Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 500,
              bgcolor: BRAND_COLORS.secondary,
              '&:hover': {
                bgcolor: BRAND_COLORS.secondary,
                filter: 'brightness(0.9)',
              },
              '&:disabled': {
                bgcolor: 'action.disabled',
              },
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} sx={{ color: 'white' }} />
                Signing in...
              </Box>
            ) : (
              'Sign in'
            )}
          </Button>

          {/* Additional Links */}
          <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Link 
              href="/forgot-password" 
              sx={{ 
                color: BRAND_COLORS.secondary,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Forgot password?
            </Link>
            
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Don't have an account?{' '}
              <Link 
                href="/enterprise"
                sx={{ 
                  color: BRAND_COLORS.secondary,
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Enterprise SSO Login →
              </Link>
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};