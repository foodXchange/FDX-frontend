import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Button,
  Stack
} from '@mui/material';
import { 
  Home as HomeIcon, 
  ArrowBack as ArrowLeftIcon,
  SentimentVeryDissatisfied
} from '@mui/icons-material';

const NotFound: React.FC = () => {
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.50',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        py: 6,
        px: { xs: 3, sm: 6, lg: 8 },
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          mt: 4,
          textAlign: 'center',
        }}
      >
        {/* 404 Illustration */}
        <Box
          sx={{
            mx: 'auto',
            width: 160,
            height: 160,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SentimentVeryDissatisfied
            sx={{
              fontSize: 160,
              color: 'text.disabled',
            }}
          />
        </Box>

        {/* Error Message */}
        <Typography
          variant="h1"
          sx={{
            mt: 3,
            fontSize: '6rem',
            fontWeight: 800,
            color: 'text.primary',
          }}
        >
          404
        </Typography>
        <Typography
          variant="h5"
          sx={{
            mt: 1,
            fontWeight: 500,
            color: 'text.primary',
          }}
        >
          Page not found
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mt: 1,
            color: 'text.secondary',
          }}
        >
          Sorry, we couldn't find the page you're looking for.
        </Typography>

        {/* Action Buttons */}
        <Stack spacing={2} sx={{ mt: 4 }}>
          <Button
            component={Link}
            to="/dashboard"
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            sx={{ width: '100%' }}
          >
            Go to Dashboard
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            onClick={() => window.history.back()}
            startIcon={<ArrowLeftIcon />}
            sx={{ width: '100%' }}
          >
            Go Back
          </Button>
        </Stack>

        {/* Help Text */}
        <Typography
          variant="body2"
          sx={{
            mt: 3,
            color: 'text.disabled',
          }}
        >
          If you believe this is an error, please{' '}
          <Box
            component={Link}
            to="/support"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                color: 'primary.dark',
              },
            }}
          >
            contact support
          </Box>
          .
        </Typography>
      </Container>
    </Box>
  );
};

export default NotFound;