import { FC } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Paper,
  Avatar,
  Rating,
} from '@mui/material';
import {
  Search,
  TrendingUp,
  Security,
  Schedule,
  Star,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const featuredExperts = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Supply Chain Optimization Expert',
    avatar: '/placeholder-avatar1.jpg',
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 150,
    expertise: ['Supply Chain', 'Logistics', 'Cost Optimization'],
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'Food Safety & Compliance Specialist',
    avatar: '/placeholder-avatar2.jpg',
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: 120,
    expertise: ['Food Safety', 'Regulatory Compliance', 'Quality Assurance'],
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    title: 'Sustainable Agriculture Consultant',
    avatar: '/placeholder-avatar3.jpg',
    rating: 4.9,
    reviewCount: 156,
    hourlyRate: 135,
    expertise: ['Sustainability', 'Agriculture', 'Environmental Impact'],
  },
];

const expertiseCategories = [
  'Supply Chain Optimization',
  'Food Safety & Compliance',
  'Quality Assurance',
  'Sustainable Agriculture',
  'Technology Integration',
  'Market Analysis',
  'Procurement Strategy',
  'Risk Management',
];

export const ExpertMarketplace: FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box textAlign="center" mb={8}>
        <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
          Expert Marketplace
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Connect with verified food industry experts to optimize your operations
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Search />}
            onClick={() => navigate('/experts/discover')}
          >
            Find Experts
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/experts/dashboard')}
          >
            Become an Expert
          </Button>
        </Stack>
      </Box>

      {/* Value Propositions */}
      <Grid container spacing={4} mb={8}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
            <Security sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Verified Experts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All experts are thoroughly vetted with verified credentials and proven track records
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
            <Schedule sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Flexible Scheduling
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Book consultations that fit your schedule with instant availability checking
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
            <TrendingUp sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Proven Results
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Work with experts who have delivered measurable improvements to food businesses
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Featured Experts */}
      <Box mb={8}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h2">
            Featured Experts
          </Typography>
          <Button
            endIcon={<ArrowForward />}
            onClick={() => navigate('/experts/discover')}
          >
            View All
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {featuredExperts.map((expert) => (
            <Grid item xs={12} md={4} key={expert.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => navigate(`/experts/profile/${expert.id}`)}
              >
                <CardContent>
                  <Box display="flex" gap={2} mb={2}>
                    <Avatar src={expert.avatar} sx={{ width: 60, height: 60 }}>
                      {expert.name[0]}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6">{expert.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {expert.title}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <Rating value={expert.rating} readOnly size="small" precision={0.1} />
                        <Typography variant="body2" color="text.secondary">
                          {expert.rating} ({expert.reviewCount})
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box display="flex" gap={0.5} flexWrap="wrap" mb={2}>
                    {expert.expertise.slice(0, 2).map((skill) => (
                      <Chip key={skill} label={skill} size="small" variant="outlined" />
                    ))}
                    {expert.expertise.length > 2 && (
                      <Chip
                        label={`+${expert.expertise.length - 2} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  <Typography variant="h6" color="primary">
                    ${expert.hourlyRate}/hour
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Expertise Categories */}
      <Box mb={8}>
        <Typography variant="h4" component="h2" gutterBottom>
          Expertise Categories
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Find experts specializing in your specific needs
        </Typography>
        
        <Grid container spacing={2}>
          {expertiseCategories.map((category) => (
            <Grid item xs={12} sm={6} md={3} key={category}>
              <Paper
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                  },
                }}
                onClick={() => navigate(`/experts/discover?category=${encodeURIComponent(category)}`)}
              >
                <Typography variant="body1" fontWeight="medium">
                  {category}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CTA Section */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 6,
          textAlign: 'center',
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Ready to optimize your food operations?
        </Typography>
        <Typography variant="h6" paragraph>
          Connect with the right expert today and start seeing results
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            bgcolor: 'white',
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'grey.100',
            },
          }}
          onClick={() => navigate('/experts/discover')}
        >
          Get Started
        </Button>
      </Paper>
    </Container>
  );
};