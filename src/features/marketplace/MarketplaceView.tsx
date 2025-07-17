import React from 'react';
import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  AppBar,
  Toolbar,
  Container
} from '@mui/material';
import { ProductCard } from '../../components/ui/cards/ProductCard';

const mockProducts = [
  {
    id: '1',
    name: 'Organic Quinoa Flour',
    supplier: 'Global Grains Co.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    price: '$4.50/kg',
    moq: '500kg',
    certifications: ['Organic', 'Non-GMO', 'Gluten-Free'],
    leadTime: '2-3 weeks',
    verified: true
  },
  {
    id: '2',
    name: 'Premium Olive Oil',
    supplier: 'Mediterranean Imports',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
    price: '$12.00/L',
    moq: '200L',
    certifications: ['Organic', 'PDO'],
    leadTime: '3-4 weeks',
    verified: true
  }
];

export const MarketplaceView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: 'grid' | 'list'
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Sticky Header */}
      <AppBar 
        position="sticky" 
        sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.9)', 
          backdropFilter: 'blur(10px)',
          boxShadow: 1,
          color: 'text.primary'
        }}
      >
        <Toolbar>
          <Container maxWidth="xl">
            <Stack direction="row" spacing={4} alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h5" sx={{ color: 'grey.900', fontWeight: 'bold' }}>
                  Marketplace
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.500' }}>
                  2,847 products
                </Typography>
              </Box>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  startIcon={<FunnelIcon />}
                  sx={{ bgcolor: 'white' }}
                >
                  Filters
                </Button>
                <Paper sx={{ bgcolor: 'white' }}>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewModeChange}
                    aria-label="view mode"
                  >
                    <ToggleButton value="grid" aria-label="grid view">
                      <Squares2X2Icon />
                    </ToggleButton>
                    <ToggleButton value="list" aria-label="list view">
                      <ListBulletIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Paper>
              </Stack>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>
      
      {/* Product Grid */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {viewMode === 'grid' ? (
          <Grid container spacing={3}>
            {mockProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard
                  {...product}
                  onView={() => console.log('View', product.id)}
                  onRequestSample={() => console.log('Sample', product.id)}
                  onQuickRFQ={() => console.log('RFQ', product.id)}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Stack spacing={2}>
            {mockProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onView={() => console.log('View', product.id)}
                onRequestSample={() => console.log('Sample', product.id)}
                onQuickRFQ={() => console.log('RFQ', product.id)}
              />
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
};