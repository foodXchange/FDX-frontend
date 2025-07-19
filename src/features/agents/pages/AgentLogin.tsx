import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Work,
  TrendingUp,
  AttachMoney,
  Support,
  Shield,
  Speed
} from '@mui/icons-material';
import { Logo } from '../../../components/ui/Logo';
import { useAuth } from '../../../contexts/AuthContext';

const benefits = [
  {
    icon: <AttachMoney />,
    title: 'Competitive Commissions',
    description: '2-5% on all successful deals'
  },
  {
    icon: <TrendingUp />,
    title: 'Growth Opportunities',
    description: 'Access to exclusive leads and partnerships'
  },
  {
    icon: <Support />,
    title: 'Dedicated Support',
    description: '24/7 assistance for all your needs'
  },
  {
    icon: <Shield />,
    title: 'Secure Platform',
    description: 'Advanced security for your data and transactions'
  },
  {
    icon: <Speed />,
    title: 'Fast Payouts',
    description: 'Weekly commission payouts'
  },
  {
    icon: <Work />,
    title: 'Professional Tools',
    description: 'CRM, analytics, and lead management'
  }
];

export const AgentLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(formData.email, formData.password, 'agent');
      navigate('/agent/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo size="large" variant="full" />
          </Link>
        </Box>

        <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
          {/* Login Form */}
          <Card
            elevation={0} sx={{
              flex: '0 0 400px',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Work sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom fontWeight="bold">
                  Agent Login
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Access your agent dashboard
                </Typography>
              </Box>

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email} onChange={handleChange} required
                  />
                  
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={togglePasswordVisibility} edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  {error && (
                    <Alert severity="error">
                      {error}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading} sx={{ mt: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Sign In'}
                  </Button>
                </Stack>
              </form>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Not an agent yet?{' '}
                  <Link
                    to="/agent/apply"
                    style={{
                      color: 'inherit',
                      textDecoration: 'underline'
                    }}
                  >
                    Apply to become one
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Why Join FDX as an Agent?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Join thousands of successful agents who are growing their business with FDX
            </Typography>

            <Stack spacing={2}>
              {benefits.map((benefit, index) => (
                <Paper
                  key={index} elevation={0} sx={{
                    p: 2,
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      borderColor: 'primary.light'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {benefit.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                        {benefit.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {benefit.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Stack>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Chip
                label="Join 2, 500+ Active Agents"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 'medium' }}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AgentLogin;