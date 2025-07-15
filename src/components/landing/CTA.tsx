import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, CalendarDaysIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { Box, Container, Typography, Button, Paper, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LandingErrorBoundary from '../ErrorBoundary/LandingErrorBoundary';

export const CTA: React.FC = () => {
  const theme = useTheme();
  
  const handleTrialClick = useCallback(() => {
    // Analytics tracking
    console.log('CTA Trial button clicked');
  }, []);

  const handleDemoClick = useCallback(() => {
    // Analytics tracking
    console.log('CTA Demo button clicked');
  }, []);

  return (
    <LandingErrorBoundary>
      <Box
        component="section"
        aria-labelledby="cta-heading"
        sx={{
          py: 12,
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.info.dark} 50%, ${theme.palette.primary.dark} 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.3,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden="true"
        />
      
        {/* Floating Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 80,
            left: 80,
            width: 160,
            height: 160,
            background: `${theme.palette.info.main}10`,
            borderRadius: '50%',
            filter: 'blur(64px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 80,
            right: 80,
            width: 240,
            height: 240,
            background: `${theme.palette.primary.light}10`,
            borderRadius: '50%',
            filter: 'blur(64px)',
          }}
        />
        
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10 }}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            sx={{ textAlign: 'center' }}
          >
            {/* Badge */}
            <Chip
              icon={<RocketLaunchIcon style={{ width: 14, height: 14 }} />}
              label="Ready to Get Started?"
              sx={{
                background: `${theme.palette.info.main}10`,
                border: `1px solid ${theme.palette.info.main}20`,
                color: theme.palette.info.light,
                fontSize: '0.875rem',
                fontWeight: 500,
                mb: 4,
                px: 2,
                py: 1,
                borderRadius: 6,
              }}
            />

            {/* Main Heading */}
            <Typography
              variant="h2"
              component="h2"
              id="cta-heading"
              sx={{
                fontSize: { xs: '2.5rem', md: '3rem' },
                fontWeight: 700,
                color: 'white',
                mb: 3,
                lineHeight: 1.2,
              }}
            >
              Transform Your Food Sourcing
              <br />
              <Box
                component="span"
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.info.light}, ${theme.palette.primary.light})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Starting Today
              </Box>
            </Typography>
            
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                color: 'rgba(255, 255, 255, 0.8)',
                mb: 6,
                maxWidth: '48rem',
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Join 500+ food importers who've streamlined their supply chain with FoodXchange. 
              Start your free trial and experience the difference.
            </Typography>
            
            {/* CTA Buttons */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                justifyContent: 'center',
                mb: 6,
              }}
            >
              <Button
                component={motion.a}
                href="/register"
                onClick={handleTrialClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                variant="contained"
                size="large"
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.primary.main})`,
                  px: 4,
                  py: 2,
                  borderRadius: 3,
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  boxShadow: `0 20px 40px ${theme.palette.info.main}25`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${theme.palette.info.dark}, ${theme.palette.primary.dark})`,
                    boxShadow: `0 25px 50px ${theme.palette.info.main}40`,
                  },
                }}
              >
                Start Free Trial
                <Box
                  component="svg"
                  sx={{ width: 20, height: 20, ml: 1 }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </Box>
              </Button>
              <Button
                component={motion.button}
                onClick={handleDemoClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  px: 4,
                  py: 2,
                  borderRadius: 3,
                  fontSize: '1.125rem',
                  fontWeight: 500,
                  backdropFilter: 'blur(16px)',
                  '&:hover': {
                    backgroundColor: 'white',
                    color: theme.palette.text.primary,
                    borderColor: 'white',
                  },
                }}
              >
                <CalendarDaysIcon className="h-6 w-6" style={{ marginRight: 8 }} />
                Schedule Demo
              </Button>
            </Box>
            
            {/* Trust Indicators */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 4,
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon className="h-6 w-6" style={{ marginRight: 8, color: theme.palette.success.main }} />
                <Typography variant="body2">No credit card required</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon className="h-6 w-6" style={{ marginRight: 8, color: theme.palette.success.main }} />
                <Typography variant="body2">Free trial</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon className="h-6 w-6" style={{ marginRight: 8, color: theme.palette.success.main }} />
                <Typography variant="body2">Cancel anytime</Typography>
              </Box>
            </Box>
          </Box>

          {/* Additional Stats */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            sx={{
              mt: 10,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 4,
              maxWidth: '64rem',
              mx: 'auto',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                textAlign: 'center',
                p: 3,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'white',
                  mb: 1,
                }}
              >
                60%
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                Faster Sourcing
              </Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                textAlign: 'center',
                p: 3,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'white',
                  mb: 1,
                }}
              >
                $2M+
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                Cost Savings
              </Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                textAlign: 'center',
                p: 3,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'white',
                  mb: 1,
                }}
              >
                24/7
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                Support
              </Typography>
            </Paper>
          </Box>
        </Container>
      </Box>
    </LandingErrorBoundary>
  );
};