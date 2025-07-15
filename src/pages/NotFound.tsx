import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@components/ui/Button';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Box, Typography, Container } from '@mui/material';

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
          <Box
            component="svg"
            sx={{
              width: '100%',
              height: '100%',
              color: 'text.disabled',
            }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
            />
          </Box>
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
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <Button
              variant="default"
              sx={{ width: '100%' }}
              leftIcon={<HomeIcon className="h-6 w-6" />}
            >
              Go to Dashboard
            </Button>
          </Link>
          
          <Button
            variant="outline"
            sx={{ width: '100%' }}
            onClick={() => window.history.back()}
            leftIcon={<ArrowLeftIcon className="h-6 w-6" />}
          >
            Go Back
          </Button>
        </Box>

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