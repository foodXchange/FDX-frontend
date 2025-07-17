import React from 'react';
import { motion } from 'framer-motion';
import { Box, Container, Typography, Paper } from '@mui/material';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '1',
      title: 'Create Your Company Profile',
      description: 'Set up your business profile with compliance requirements, product categories, and sourcing preferences in under 60 seconds',
      gif: '/gifs/create-profile.gif',
      color: '#1E4C8A',
      icon: '🏢'
    },
    {
      step: '2',
      title: 'AI-Powered Supplier Matching',
      description: 'Our intelligent system finds the perfect suppliers based on your requirements, location, and quality standards',
      gif: '/gifs/supplier-matching.gif',
      color: '#52B788',
      icon: '🤖'
    },
    {
      step: '3',
      title: 'Secure Deal Negotiation',
      description: 'Compare quotes, verify certifications, and negotiate terms with built-in communication tools and AI insights',
      gif: '/gifs/negotiation.gif',
      color: '#FF6B35',
      icon: '🤝'
    },
    {
      step: '4',
      title: 'Real-time Order Tracking',
      description: 'Monitor shipments with live tracking, quality checks, temperature monitoring, and delivery confirmations',
      gif: '/gifs/order-tracking.gif',
      color: '#B08D57',
      icon: '📦'
    }
  ];

  return (
    <Box component="section" sx={{ py: 10, bgcolor: 'grey.50' }}>
      <Container maxWidth="xl">
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          sx={{ textAlign: 'center', mb: 6 }}
        >
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 700, color: 'text.primary', mb: 2 }}>
            Start Sourcing in 4 Simple Steps
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 'md', mx: 'auto' }}>
            From profile creation to delivery tracking - see how FoodXchange transforms your supply chain in minutes
          </Typography>
        </Box>

        {/* Interactive Timeline */}
        <Box sx={{ position: 'relative', maxWidth: '6xl', mx: 'auto' }}>
          {/* Timeline line */}
          <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', height: '100%', width: 4, background: 'linear-gradient(to bottom, #bfdbfe, #bbf7d0, #fed7aa, #fde68a)', display: { xs: 'none', lg: 'block' } }} />
          
          {/* Steps */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {steps.map((step, index) => (
              <Box
                component={motion.div}
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                sx={{ display: 'flex', alignItems: 'center', flexDirection: { xs: 'column', lg: index % 2 === 0 ? 'row' : 'row-reverse' }, gap: 4 }}
              >
                {/* Content */}
                <Box sx={{ flex: 1, textAlign: { xs: 'center', lg: index % 2 === 0 ? 'right' : 'left' }, pr: { lg: index % 2 === 0 ? 4 : 0 }, pl: { lg: index % 2 === 0 ? 0 : 4 } }}>
                  <Paper
                    component={motion.div}
                    whileHover={{ scale: 1.05 }}
                    elevation={3}
                    sx={{ p: 4, borderRadius: 4, transition: 'all 0.3s', '&:hover': { boxShadow: 6 } }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Typography component="span" sx={{ fontSize: '2rem', mr: 1.5 }}>{step.icon}</Typography>
                      <Typography variant="h5" component="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>{step.title}</Typography>
                    </Box>
                    <Typography sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>{step.description}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, fontSize: '0.875rem', fontWeight: 500, color: step.color }}>
                      <span>Step {step.step}</span>
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Box>
                  </Paper>
                </Box>
                
                {/* Timeline dot */}
                <Box sx={{ position: 'relative', zIndex: 10, flexShrink: 0 }}>
                  <Box
                    component={motion.div}
                    whileHover={{ scale: 1.1 }}
                    sx={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.25rem', boxShadow: 3, backgroundColor: step.color }}
                  >
                    {step.step}
                  </Box>
                </Box>
                
                {/* Visual/GIF */}
                <Box sx={{ flex: 1, pl: { lg: index % 2 === 0 ? 4 : 0 }, pr: { lg: index % 2 === 0 ? 0 : 4 } }}>
                  <Box
                    component={motion.div}
                    whileHover={{ scale: 1.02 }}
                    sx={{ position: 'relative', borderRadius: 4, overflow: 'hidden', boxShadow: 3, transition: 'all 0.3s', '&:hover': { boxShadow: 6 } }}
                  >
                    <img 
                      src={step.gif} 
                      alt={step.title}
                      sx={{ width: '100%', height: 256, objectFit: 'cover' }}
                      onError={(e) => {
                        // Fallback to placeholder if GIF fails
                        const target = e.target as HTMLImageElement;
                        target.src = `data:image/svg+xml,%3Csvg width='400' height='256' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad${index}' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='${step.color}' stop-opacity='0.3'/%3E%3Cstop offset='100%25' stop-color='${step.color}' stop-opacity='0.1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grad${index})'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='${step.color}'%3E${step.icon}%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                    <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)' }} />
                    <Box sx={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                      <Paper sx={{ bgcolor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)', borderRadius: 2, p: 1.5 }}>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'grey.800' }}>{step.title}</Typography>
                      </Paper>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};