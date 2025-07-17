import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, Container, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
// TODO: Replace with actual logo from https://github.com/foodXchange/FDX-frontend/issues/4#issue-3233238788
// import FoodXchangeLogo from '@/assets/foodxchange-logo.svg';
const FoodXchangeLogo = ''; // Placeholder until logo is downloaded

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: 'Solutions', href: '/solutions' },
    { label: 'For Suppliers', href: '/suppliers' },
    { label: 'For Buyers', href: '/buyers' },
    { label: 'Pricing', href: '/pricing' },
  ];

  const drawer = (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ py: 2 }}>
        <img 
          src={FoodXchangeLogo} 
          alt="FoodXchange" 
          height={40}
        />
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton 
              component={Link} 
              to={item.href}
              sx={{ textAlign: 'center' }}
              onClick={handleDrawerToggle}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 2 }} />
        <ListItem disablePadding>
          <Button 
            color="primary" 
            fullWidth 
            sx={{ mx: 2 }}
            onClick={handleDrawerToggle}
          >
            Request Demo
          </Button>
        </ListItem>
        <ListItem disablePadding>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            sx={{ mx: 2, mt: 1 }}
            component={Link}
            to="/login"
            onClick={handleDrawerToggle}
          >
            Login
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        color="inherit" 
        elevation={0}
        sx={{ 
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)'
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
          <Toolbar disableGutters>
            {/* Logo */}
            <Box sx={{ flexGrow: 0, mr: 4 }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <img 
                  src={FoodXchangeLogo} 
                  alt="FoodXchange" 
                  style={{ height: 40 }}
                  onError={(e) => {
                    // Fallback if logo not found
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const nextElement = target.nextElementSibling as HTMLElement;
                    if (nextElement) nextElement.style.display = 'block';
                  }}
                />
                <Box 
                  sx={{ 
                    display: 'none',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: 'primary.main',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1.25rem'
                    }}
                  >
                    F
                  </Box>
                  <Box
                    sx={{
                      color: 'text.primary',
                      fontWeight: 700,
                      fontSize: '1.25rem'
                    }}
                  >
                    FoodXchange
                  </Box>
                </Box>
              </Link>
            </Box>
            
            {/* Desktop Navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {navItems.map((item) => (
                <Button 
                  key={item.label}
                  component={Link}
                  to={item.href}
                  sx={{ 
                    color: 'text.primary',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    px: 2
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
            
            {/* Desktop CTA Buttons */}
            <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              <Button 
                color="primary"
                sx={{ fontWeight: 500 }}
              >
                Request Demo
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                component={Link}
                to="/login"
                sx={{ fontWeight: 500 }}
              >
                Login
              </Button>
            </Box>

            {/* Mobile Menu Button */}
            <Box sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
              >
                {mobileOpen ? <Box component={XMarkIcon} sx={{ width: 24, height: 24 }} /> : <Box component={Bars3Icon} sx={{ width: 24, height: 24 }} />}
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};