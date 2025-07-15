import React from 'react';
import { motion } from 'framer-motion';
import { 
  GlobeAltIcon, 
  ShieldCheckIcon, 
  TruckIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  LockClosedIcon,
  ArrowRightIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';
import { Box, Container, Typography, Button, Paper, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LandingErrorBoundary from '../ErrorBoundary/LandingErrorBoundary';

// Types for better type safety
interface FeatureData {
  icon: React.ElementType;
  title: string;
  description: string;
  stats: string;
  color: string;
  gradient: string;
}

interface FeatureCardProps extends FeatureData {
  index: number;
}

// Memoized feature card component for better performance
const FeatureCard: React.FC<FeatureCardProps> = React.memo(({ 
  icon: Icon, 
  title, 
  description, 
  stats, 
  color, 
  gradient, 
  index
}) => {
  const theme = useTheme();
  
  const getGradientColors = (gradientClass: string) => {
    const gradientMap: { [key: string]: string } = {
      'from-blue-500 via-indigo-500 to-purple-500': `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main}, ${theme.palette.secondary.main})`,
      'from-emerald-500 via-green-500 to-teal-500': `linear-gradient(135deg, ${theme.palette.success.main}, #10B981, #14B8A6)`,
      'from-orange-500 via-red-500 to-pink-500': `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.error.main}, #EC4899)`,
      'from-purple-500 via-violet-500 to-indigo-500': `linear-gradient(135deg, #8B5CF6, #7C3AED, ${theme.palette.primary.main})`,
      'from-cyan-500 via-blue-500 to-indigo-500': `linear-gradient(135deg, #06B6D4, ${theme.palette.info.main}, ${theme.palette.primary.main})`,
      'from-slate-500 via-gray-500 to-zinc-500': `linear-gradient(135deg, #64748B, #6B7280, #71717A)`,
    };
    return gradientMap[gradientClass] || gradientMap['from-blue-500 via-indigo-500 to-purple-500'];
  };

  const getTextColor = (colorClass: string) => {
    const colorMap: { [key: string]: string } = {
      'text-blue-600': theme.palette.primary.main,
      'text-emerald-600': theme.palette.success.main,
      'text-orange-600': theme.palette.warning.main,
      'text-purple-600': theme.palette.secondary.main,
      'text-cyan-600': theme.palette.info.main,
      'text-slate-600': theme.palette.text.secondary,
    };
    return colorMap[colorClass] || theme.palette.primary.main;
  };
  
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      viewport={{ once: true }}
      sx={{ position: 'relative' }}
    >
      {/* Background Glow */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(45deg, ${theme.palette.secondary.main}08, ${theme.palette.primary.main}08)`,
          borderRadius: 6,
          filter: 'blur(40px)',
          transition: 'all 0.5s ease',
          '&:hover': {
            filter: 'blur(60px)',
          },
        }}
      />
      
      <Paper
        component={motion.div}
        whileHover={{ y: -10, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        elevation={0}
        sx={{
          position: 'relative',
          height: '100%',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          borderRadius: 6,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          transition: 'all 0.5s ease',
          '&:hover': {
            border: '1px solid rgba(255, 255, 255, 0.4)',
          },
        }}
      >
        {/* Animated Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.05,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.03'%3E%3Cpath d='M20 20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm0-20v20h20V0H20z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Header with Icon */}
        <Box
          sx={{
            position: 'relative',
            height: 160,
            background: getGradientColors(gradient),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          {/* Floating Animation Elements */}
          <Box sx={{ position: 'absolute', inset: 0 }}>
            {[...Array(3)].map((_, i) => (
              <Box
                key={i}
                component={motion.div}
                sx={{
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  left: `${20 + i * 30}%`,
                  top: `${20 + i * 20}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </Box>
          
          <Box sx={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
            <Box
              component={motion.div}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
              sx={{
                width: 80,
                height: 80,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(16px)',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              }}
            >
              <Icon className="h-6 w-6" style={{ color: 'white' }} />
            </Box>
            <Typography
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              variant="h6"
              sx={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color: 'white',
              }}
            >
              {stats}
            </Typography>
          </Box>
        </Box>
        
        {/* Content Section */}
        <Box sx={{ p: 4 }}>
          <Typography
            variant="h5"
            component="h3"
            sx={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 2,
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              mb: 3,
              lineHeight: 1.6,
              fontSize: '1.125rem',
            }}
          >
            {description}
          </Typography>
          
          {/* Learn More Link */}
          <Box
            component={motion.div}
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: getTextColor(color),
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'inherit' }}>
              Explore feature
            </Typography>
            <ArrowRightIcon className="h-6 w-6" style={{ marginLeft: 8, color: 'inherit' }} />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
});

export const Features: React.FC = () => {
  const theme = useTheme();
  
  const features = [
    {
      icon: GlobeAltIcon,
      title: 'Global Supplier Network',
      description: 'Access 10,000+ verified suppliers across 50 countries with real-time availability and instant communication',
      stats: '95% response rate',
      color: 'text-blue-600',
      gradient: 'from-blue-500 via-indigo-500 to-purple-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Compliance Automation',
      description: 'FDA, HACCP, organic certifications verified automatically with blockchain tracking and audit trails',
      stats: '3x faster approvals',
      color: 'text-emerald-600',
      gradient: 'from-emerald-500 via-green-500 to-teal-500'
    },
    {
      icon: TruckIcon,
      title: 'Real-time Logistics',
      description: 'Track perishables with temperature monitoring, predictive delivery analytics, and automated alerts',
      stats: '99.5% on-time delivery',
      color: 'text-orange-600',
      gradient: 'from-orange-500 via-red-500 to-pink-500'
    },
    {
      icon: DocumentTextIcon,
      title: 'Smart RFQ Management',
      description: 'AI-powered quote comparison with automated supplier matching, negotiation assistance, and cost optimization',
      stats: '40% cost savings',
      color: 'text-purple-600',
      gradient: 'from-purple-500 via-violet-500 to-indigo-500'
    },
    {
      icon: ChartBarIcon,
      title: 'Market Intelligence',
      description: 'Real-time pricing data, seasonal trends, supply chain risk analytics, and predictive market insights',
      stats: '85% better forecasting',
      color: 'text-cyan-600',
      gradient: 'from-cyan-500 via-blue-500 to-indigo-500'
    },
    {
      icon: LockClosedIcon,
      title: 'Enterprise Security',
      description: 'SOC 2 compliant with end-to-end encryption, advanced threat protection, and enterprise-grade access controls',
      stats: '99.9% uptime',
      color: 'text-slate-600',
      gradient: 'from-slate-500 via-gray-500 to-zinc-500'
    }
  ];

  return (
    <LandingErrorBoundary>
    <Box
      component="section"
      id="features"
      sx={{
        position: 'relative',
        py: 16,
        background: `linear-gradient(to bottom, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(45deg, ${theme.palette.secondary.main}03, ${theme.palette.primary.main}03)`,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${theme.palette.secondary.main}20, transparent)`,
        },
      }}
    >
      <Container maxWidth="xl" sx={{ position: 'relative' }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          sx={{ textAlign: 'center', mb: 12 }}
        >
          <Chip
            icon={<SparklesIcon className="h-6 w-6" />}
            label="Comprehensive B2B Platform"
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.secondary.main}10, ${theme.palette.primary.main}10)`,
              border: `1px solid ${theme.palette.secondary.main}20`,
              color: theme.palette.secondary.main,
              fontSize: '0.875rem',
              fontWeight: 500,
              mb: 4,
              px: 3,
              py: 1.5,
              borderRadius: 6,
            }}
          />
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
              fontWeight: 900,
              color: theme.palette.text.primary,
              mb: 3,
              lineHeight: 1.2,
            }}
          >
            Everything You Need for{' '}
            <Box
              component="span"
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Modern Food Sourcing
            </Box>
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              color: theme.palette.text.secondary,
              maxWidth: '64rem',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Streamline your supply chain with our comprehensive platform designed for the modern food industry
          </Typography>
        </Box>
        
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 4,
            mb: 12,
          }}
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </Box>
        
        {/* Premium CTA Section */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          sx={{ textAlign: 'center' }}
        >
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                borderRadius: 6,
                filter: 'blur(40px)',
                opacity: 0.3,
              }}
            />
            <Button
              component={motion.a}
              href="/register"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              variant="contained"
              size="large"
              sx={{
                position: 'relative',
                background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                px: 6,
                py: 3,
                borderRadius: 6,
                fontSize: '1.25rem',
                fontWeight: 700,
                boxShadow: `0 25px 50px ${theme.palette.secondary.main}25`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.primary.dark})`,
                  boxShadow: `0 25px 50px ${theme.palette.secondary.main}40`,
                },
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center' }}>
                Experience the Platform
                <Box
                  component={motion.svg}
                  sx={{ width: 24, height: 24, ml: 1.5 }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </Box>
              </Box>
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
    </LandingErrorBoundary>
  );
};