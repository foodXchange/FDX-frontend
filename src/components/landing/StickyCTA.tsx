import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export const StickyCTA: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show sticky CTA when user scrolls down past hero section
      if (window.pageYOffset > 600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <Box
          component={motion.div}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            bgcolor: 'white', 
            boxShadow: 6, 
            borderTop: 1, 
            borderColor: 'grey.200', 
            p: 2, 
            zIndex: 50, 
            display: { md: 'none' } 
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              fullWidth
              sx={{ 
                bgcolor: '#ea580c', 
                py: 1.5,
                fontWeight: 700,
                '&:hover': { bgcolor: '#dc2626' }
              }}
            >
              Start Free Trial
            </Button>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              fullWidth
              sx={{ 
                bgcolor: 'primary.main',
                py: 1.5,
                fontWeight: 700
              }}
            >
              Login
            </Button>
          </Box>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', textAlign: 'center', mt: 1 }}>
            No credit card required • Free trial
          </Typography>
        </Box>
      )}
    </AnimatePresence>
  );
};