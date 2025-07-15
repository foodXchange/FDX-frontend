import React, { useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircleIcon, PlayCircleIcon, SparklesIcon, StarIcon } from '@heroicons/react/24/outline';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Types for better type safety
interface ParticleProps {
  shouldAnimate: boolean;
}

// Memoized particle component for performance
const FloatingParticle: React.FC<ParticleProps> = React.memo(({ shouldAnimate }) => {
  const particleStyle = useMemo(() => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
  }), []);

  if (!shouldAnimate) return null;

  return (
    <motion.div
      style={{
        position: 'absolute',
        width: 8,
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '50%',
        zIndex: 3,
        ...particleStyle,
      }}
      animate={{
        y: [0, -100, 0],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        delay: Math.random() * 3,
        ease: "easeInOut" as const
      }}
      initial={{ opacity: 0 }}
    />
  );
});

FloatingParticle.displayName = 'FloatingParticle';

export const HeroSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const theme = useTheme();
  
  // Memoized animation configs for performance
  const orbAnimations = useMemo(() => ({
    orb1: {
      animate: shouldReduceMotion ? {} : {
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      },
      transition: {
        duration: 8,
        repeat: shouldReduceMotion ? 0 : Infinity,
        ease: "easeInOut" as const
      }
    },
    orb2: {
      animate: shouldReduceMotion ? {} : {
        scale: [1, 1.3, 1],
        opacity: [0.2, 0.4, 0.2],
      },
      transition: {
        duration: 10,
        repeat: shouldReduceMotion ? 0 : Infinity,
        ease: "easeInOut" as const,
        delay: 1
      }
    },
    orb3: {
      animate: shouldReduceMotion ? {} : {
        scale: [1, 1.1, 1],
        x: [-100, 100, -100],
        y: [-50, 50, -50],
      },
      transition: {
        duration: 12,
        repeat: shouldReduceMotion ? 0 : Infinity,
        ease: "easeInOut" as const,
        delay: 2
      }
    }
  }), [shouldReduceMotion]);

  // Memoized particles for performance
  const particles = useMemo(() => 
    [...Array(20)].map((_, i) => (
      <FloatingParticle 
        key={i} 
        shouldAnimate={!shouldReduceMotion}
      />
    )), [shouldReduceMotion]
  );

  const handleDemoClick = useCallback(() => {
    // Analytics tracking could go here
    console.log('Demo button clicked');
  }, []);

  const handleTrialClick = useCallback(() => {
    // Analytics tracking could go here
    console.log('Trial button clicked');
  }, []);

  return (
    <Box
      component="section"
      role="banner"
      sx={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.info.main} 100%)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent, rgba(0,0,0,0.2))',
          zIndex: 1,
        },
      }}
    >
      {/* Animated Orbs */}
      <motion.div
        style={{
          position: 'absolute',
          top: theme.spacing(10),
          left: theme.spacing(10),
          width: 384,
          height: 384,
          background: `linear-gradient(45deg, ${theme.palette.secondary.main}20, ${theme.palette.error.main}20)`,
          borderRadius: '50%',
          filter: 'blur(48px)',
          zIndex: 2,
        }}
        animate={orbAnimations.orb1.animate}
        transition={orbAnimations.orb1.transition}
        initial={{ scale: 1, opacity: 0.3 }}
      />
      <motion.div
        style={{
          position: 'absolute',
          bottom: theme.spacing(10),
          right: theme.spacing(10),
          width: 320,
          height: 320,
          background: `linear-gradient(45deg, ${theme.palette.info.main}20, ${theme.palette.primary.light}20)`,
          borderRadius: '50%',
          filter: 'blur(48px)',
          zIndex: 2,
        }}
        animate={orbAnimations.orb2.animate}
        transition={orbAnimations.orb2.transition}
        initial={{ scale: 1, opacity: 0.2 }}
      />
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 256,
          height: 256,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
          borderRadius: '50%',
          filter: 'blur(32px)',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
        }}
        animate={orbAnimations.orb3.animate}
        transition={orbAnimations.orb3.transition}
        initial={{ scale: 1, x: -100, y: -50 }}
      />
      
      {/* Floating Particles */}
      {particles}
      
      {/* Content */}
      <Container
        maxWidth="xl"
        sx={{
          position: 'relative',
          zIndex: 10,
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          pt: { xs: 16, md: 20 },
          pb: { xs: 10, md: 12 },
          textAlign: 'center',
          width: '100%',
          maxWidth: '1400px'
        }}
      >
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Premium Badge */}
          <Paper
            component={motion.div}
            elevation={0}
            whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
            transition={{ duration: 0.2 }}
            role="banner"
            aria-label="Award badge"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 3,
              py: 1.5,
              borderRadius: 6,
              background: `linear-gradient(45deg, ${theme.palette.secondary.main}10, ${theme.palette.error.main}10)`,
              border: `1px solid ${theme.palette.secondary.main}30`,
              color: theme.palette.secondary.light,
              fontSize: theme.typography.body2.fontSize,
              fontWeight: 600,
              mb: 4,
              backdropFilter: 'blur(8px)',
            }}
          >
            <StarIcon className="h-6 w-6" style={{ marginRight: 8, color: theme.palette.warning.main }} aria-hidden="true" />
            <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
              #1 B2B Food Marketplace
            </Typography>
            <SparklesIcon className="h-6 w-6" style={{ marginLeft: 8, color: theme.palette.warning.main }} aria-hidden="true" />
          </Paper>

          {/* Main Headlines */}
          <Box sx={{ mb: 4 }}>
            <Typography
              component={motion.h1}
              variant="h1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                fontWeight: 900,
                color: 'white',
                mb: 2,
                lineHeight: 1.1,
              }}
            >
              Connect with{' '}
              <Box
                component={motion.span}
                animate={shouldReduceMotion ? {} : {
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: shouldReduceMotion ? 0 : Infinity,
                  ease: "linear" as const
                }}
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.secondary.light}, ${theme.palette.error.light}, ${theme.palette.secondary.light})`,
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                10,000+
              </Box>
            </Typography>
            <Typography
              component={motion.h2}
              variant="h2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              sx={{
                fontSize: { xs: '2rem', md: '3.5rem', lg: '4.5rem' },
                fontWeight: 900,
                color: 'white',
                lineHeight: 1.1,
              }}
            >
              <Box
                component="span"
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.info.light}, ${theme.palette.primary.light})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Verified
              </Box>{' '}
              Food Suppliers
            </Typography>
          </Box>

          {/* Subheadline */}
          <Typography
            component={motion.p}
            variant="h5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            sx={{
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              color: 'rgba(255, 255, 255, 0.8)',
              mb: 6,
              maxWidth: '64rem',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Transform your food sourcing with AI-powered supplier matching,{' '}
            <Box component="br" sx={{ display: { xs: 'none', md: 'block' } }} />
            automated compliance, and real-time logistics tracking
          </Typography>

          {/* CTA Buttons */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 3,
              justifyContent: 'center',
              mb: 8,
            }}
          >
            <Button
              component={motion.a}
              href="/register"
              onClick={handleTrialClick}
              variant="contained"
              size="large"
              whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -2 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              aria-label="Start free trial - no credit card required"
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                px: 5,
                py: 2.5,
                borderRadius: 3,
                fontSize: '1.125rem',
                fontWeight: 700,
                boxShadow: `0 20px 40px ${theme.palette.primary.main}25`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  boxShadow: `0 25px 50px ${theme.palette.primary.main}40`,
                },
              }}
            >
              Start Free Trial
              <Box
                component={motion.svg}
                sx={{ width: 20, height: 20, ml: 1 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={shouldReduceMotion ? {} : { x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: shouldReduceMotion ? 0 : Infinity }}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </Box>
            </Button>
            <Button
              component={motion.button}
              onClick={handleDemoClick}
              variant="outlined"
              size="large"
              whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -2 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              aria-label="Watch product demo video"
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                px: 5,
                py: 2.5,
                borderRadius: 3,
                fontSize: '1.125rem',
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
                '&:hover': {
                  backgroundColor: 'white',
                  color: theme.palette.text.primary,
                  borderColor: 'white',
                },
              }}
            >
              <PlayCircleIcon className="h-6 w-6" style={{ marginRight: 8 }} aria-hidden="true" />
              Watch Demo
            </Button>
          </Box>

          {/* Trust Indicators */}
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
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
              <Typography variant="body2">Free 14-day trial</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon className="h-6 w-6" style={{ marginRight: 8, color: theme.palette.success.main }} />
              <Typography variant="body2">60% faster sourcing</Typography>
            </Box>
          </Box>
        </Box>

        {/* Stats Section */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          sx={{
            mt: 16,
            maxWidth: '80rem',
            mx: 'auto',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 4,
            }}
          >
            {[
              { number: '10,000+', label: 'Verified Suppliers', color: theme.palette.secondary.main },
              { number: '$2M+', label: 'Saved Annually', color: theme.palette.info.main },
              { number: '95%', label: 'Response Rate', color: theme.palette.success.main }
            ].map((stat, index) => (
              <Box key={index}>
              <Paper
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 + index * 0.1 }}
                whileHover={{ y: -5 }}
                elevation={0}
                sx={{
                  position: 'relative',
                  textAlign: 'center',
                  p: 4,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                    borderRadius: 4,
                    filter: 'blur(20px)',
                    zIndex: -1,
                  },
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: '3rem',
                    fontWeight: 900,
                    mb: 1.5,
                    color: stat.color,
                  }}
                >
                  {stat.number}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: 600,
                  }}
                >
                  {stat.label}
                </Typography>
              </Paper>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};