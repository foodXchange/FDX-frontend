import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, GlobeAltIcon, CheckBadgeIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { Box, Container, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export const TrustBar: React.FC = () => {
  const theme = useTheme();
  
  const clients = [
    { name: 'Nestlé', logo: 'N', color: 'linear-gradient(135deg, #EF4444 0%, #F97316 50%, #EAB308 100%)' },
    { name: 'Unilever', logo: 'U', color: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)' },
    { name: 'PepsiCo', logo: 'P', color: 'linear-gradient(135deg, #2563EB 0%, #EF4444 50%, #EC4899 100%)' },
    { name: 'Kraft Heinz', logo: 'K', color: 'linear-gradient(135deg, #EAB308 0%, #F97316 50%, #EF4444 100%)' },
    { name: 'Tyson Foods', logo: 'T', color: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #3B82F6 100%)' },
    { name: 'Cargill', logo: 'C', color: 'linear-gradient(135deg, #F59E0B 0%, #F97316 50%, #EF4444 100%)' },
  ];

  return (
    <Box 
      component="section" 
      sx={{ 
        py: 16, 
        background: 'linear-gradient(to bottom, #ffffff, #f8fafc)', 
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Elements */}
      <Box 
        sx={{ 
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(139, 92, 246, 0.05), rgba(168, 85, 247, 0.05))'
        }}
      />
      <Box 
        sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.2), transparent)'
        }}
      />
      
      <Container maxWidth="xl" sx={{ position: 'relative', px: { xs: 2, sm: 3, md: 4, lg: 5 } }}>
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Box 
              sx={{ 
                display: 'inline-flex',
                alignItems: 'center',
                px: 2,
                py: 1,
                borderRadius: 6,
                background: 'linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                color: theme.palette.secondary.main,
                fontSize: '0.875rem',
                fontWeight: 500,
                mb: 3
              }}
            >
              <TrophyIcon className="h-6 w-6" style={{ marginRight: 8 }} />
              Trusted by Industry Leaders
            </Box>
            <Typography 
              variant="h2" 
              sx={{ 
                fontSize: { xs: '2.5rem', md: '3rem' },
                fontWeight: 700,
                color: 'text.primary',
                mb: 2
              }}
            >
              Join{' '}
              <Box 
                component="span" 
                sx={{ 
                  background: 'linear-gradient(to right, #8B5CF6, #A855F7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                500+ Companies
              </Box>
              <br />
              Already Scaling with Us
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                maxWidth: '32rem',
                mx: 'auto'
              }}
            >
              From Fortune 500 to innovative startups, leading companies choose FoodXchange
            </Typography>
          </Box>
        </Box>

        {/* Client Logos with Enhanced Design */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 4, mb: 12 }}>
          {clients.map((client, index) => (
            <Box key={index}>
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 30, rotateY: -90 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover .logo': {
                    transform: 'scale(1.1) rotate(3deg)',
                    boxShadow: theme.shadows[20]
                  },
                  '&:hover .overlay': {
                    opacity: 1
                  },
                  '&:hover .name': {
                    color: 'text.primary'
                  }
                }}
              >
                <Box sx={{ position: 'relative', mb: 2 }}>
                  <Box
                    className="logo"
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 6,
                      background: client.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 900,
                      fontSize: '1.5rem',
                      boxShadow: theme.shadows[8],
                      transition: 'all 0.5s ease',
                    }}
                  >
                    {client.logo}
                  </Box>
                  <Box
                    className="overlay"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 6,
                      background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.2), transparent)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    }}
                  />
                </Box>
                <Typography 
                  className="name"
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 600,
                    transition: 'color 0.3s ease'
                  }}
                >
                  {client.name}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Trust Indicators with Glassmorphism */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 4, maxWidth: '80rem', mx: 'auto' }}>
          {[
            {
              icon: ShieldCheckIcon,
              title: "ISO 27001 Certified",
              description: "Enterprise Security",
              color: "linear-gradient(to right, #10B981, #22C55E)",
              bgColor: "linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(34, 197, 94, 0.1))"
            },
            {
              icon: CheckBadgeIcon,
              title: "SOC 2 Type II",
              description: "Data Protection",
              color: "linear-gradient(to right, #3B82F6, #6366F1)",
              bgColor: "linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))"
            },
            {
              icon: GlobeAltIcon,
              title: "GDPR Compliant",
              description: "Global Standards",
              color: "linear-gradient(to right, #8B5CF6, #A855F7)",
              bgColor: "linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))"
            }
          ].map((item, index) => (
            <Box key={index}>
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                sx={{ 
                  position: 'relative',
                  '&:hover .blur-bg': {
                    filter: 'blur(32px)'
                  },
                  '&:hover .card': {
                    borderColor: 'rgba(255, 255, 255, 0.4)'
                  }
                }}
              >
                <Box
                  className="blur-bg"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to right, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2))',
                    borderRadius: 6,
                    filter: 'blur(24px)',
                    transition: 'all 0.3s ease'
                  }}
                />
                <Box
                  className="card"
                  sx={{
                    position: 'relative',
                    p: 4,
                    borderRadius: 6,
                    background: item.bgColor,
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 4,
                        background: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        boxShadow: theme.shadows[4]
                      }}
                    >
                      <item.icon className="h-6 w-6" style={{ color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Box 
                    sx={{ 
                      width: '100%',
                      height: '1px',
                      background: 'linear-gradient(to right, transparent, rgba(156, 163, 175, 1), transparent)'
                    }}
                  />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Bottom Stats */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          sx={{ mt: 12, textAlign: 'center' }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 4, maxWidth: '64rem', mx: 'auto' }}>
            {[
              { number: "500+", label: "Companies" },
              { number: "50+", label: "Countries" },
              { number: "99.9%", label: "Uptime" },
              { number: "24/7", label: "Support" }
            ].map((stat, index) => (
              <Box key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 900,
                      background: 'linear-gradient(to right, #8B5CF6, #A855F7)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      color: 'transparent',
                      mb: 1
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 500
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};