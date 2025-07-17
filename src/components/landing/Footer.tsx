import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
// TODO: Replace with actual logo from https://github.com/foodXchange/FDX-frontend/issues/4#issue-3233238788
// import FoodXchangeLogo from '@/assets/foodxchange-logo.svg';
const FoodXchangeLogo = ''; // Placeholder until logo is downloaded

export const Footer: React.FC = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container 
        maxWidth="xl"
        sx={{ 
          px: { xs: 2, sm: 3, md: 4, lg: 5 },
          width: '100%',
          maxWidth: '1400px'
        }}
      >
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: { 
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: '2fr repeat(4, 1fr)'
            },
            gap: 4,
            mb: 5
          }}
        >
          {/* Logo and Description */}
          <Box sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1', md: 'auto' } }}>
            <Box sx={{ mb: 3 }}>
              <img 
                src={FoodXchangeLogo} 
                alt="FoodXchange" 
                height={32}
                onError={(e) => {
                  // Fallback if logo not found
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const nextElement = target.nextElementSibling as HTMLElement;
                  if (nextElement) nextElement.style.display = 'flex';
                }}
              />
              <Box 
                sx={{ 
                  display: 'none',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem'
                  }}
                >
                  F
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  FoodXchange
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
              The global platform connecting food importers with verified suppliers worldwide.
            </Typography>
          </Box>
          
          {/* Solutions Column */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Solutions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/importers" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                For Importers
              </Link>
              <Link href="/suppliers" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                For Suppliers
              </Link>
              <Link href="/compliance" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                Compliance
              </Link>
              <Link href="/logistics" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                Logistics
              </Link>
            </Box>
          </Box>
          
          {/* Resources Column */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Resources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/documentation" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                Documentation
              </Link>
              <Link href="/api" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                API Reference
              </Link>
              <Link href="/case-studies" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                Case Studies
              </Link>
              <Link href="/blog" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                Blog
              </Link>
            </Box>
          </Box>
          
          {/* Support Column */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/help" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                Help Center
              </Link>
              <Link href="/contact" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                Contact Us
              </Link>
              <Link href="/status" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                System Status
              </Link>
              <Link href="/security" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                Security
              </Link>
            </Box>
          </Box>
          
          {/* Legal Column */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/privacy" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                Privacy Policy
              </Link>
              <Link href="/terms" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                Terms of Service
              </Link>
              <Link href="/cookies" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                Cookie Policy
              </Link>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © 2024 FoodXchange. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};