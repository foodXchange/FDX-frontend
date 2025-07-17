import React, { useState, useRef, useCallback } from 'react';
import { Box, Paper, Typography, Card, CardContent, CardMedia, Grid, Button, IconButton, Stack, Chip, Alert, Dialog, DialogTitle, DialogContent, Slider, FormControlLabel, Switch, Collapse, List, ListItem, ListItemIcon, ListItemText, Badge, CircularProgress, useTheme, alpha,  } from '@mui/material';
import { CloudUpload, CameraAlt, FilterList, Close, CompareArrows, Refresh, PhotoLibrary, Palette, Category, TrendingUp, SwapHoriz, AutoAwesome, ImageSearch,  } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { aiServiceManager } from '../../../services/ai';
import { formatCurrency } from '../../../utils/format';

// Glassmorphism styles
const glassmorphismStyle = {
  background: (theme: any) => alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  borderRadius: 2,
  border: (theme: any) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: (theme: any) => `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
};

// Image Upload Zone
const ImageUploadZone: React.FC<{
  onImageUpload: (files: File[]) => void;
  processing: boolean;
}> = ({ onImageUpload, processing }) => {
  const theme = useTheme();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    onDrop: onImageUpload,
    multiple: false,
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        },
      }}
    >
      <input {...getInputProps()} />
      {processing ? (
        <Box>
          <CircularProgress size={48} />
          <Typography variant="body2" color="text.secondary" mt={2}>
            Analyzing image...
          </Typography>
        </Box>
      ) : (
        <>
          <CloudUpload sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Drop the image here' : 'Drag & drop or click to upload'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload a product image to find similar items
          </Typography>
          <Button
            variant="outlined"
            startIcon={<CameraAlt />}
            sx={{ mt: 2 }}
          >
            Take Photo
          </Button>
        </>
      )}
    </Box>
  );
};

// Similar Product Card
const SimilarProductCard: React.FC<{
  product: {
    id: string;
    name: string;
    image: string;
    supplier: string;
    price: number;
    similarity: number;
    availability: 'in_stock' | 'low_stock' | 'out_of_stock';
    certifications: string[];
    attributes: {
      color?: string;
      size?: string;
      category?: string;
      tags?: string[];
    };
    alternativeFor?: string;
  };
  onSelect: () => void;
  onCompare: () => void;
  selected: boolean;
}> = ({ product, onSelect, onCompare, selected }) => {
  const theme = useTheme();
  const [hovering, setHovering] = useState(false);

  const getAvailabilityColor = () => {
    switch (product.availability) {
      case 'in_stock':
        return theme.palette.success.main;
      case 'low_stock':
        return theme.palette.warning.main;
      case 'out_of_stock':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          ...glassmorphismStyle,
          height: '100%',
          position: 'relative',
          cursor: 'pointer',
          border: selected ? `2px solid ${theme.palette.primary.main}` : undefined,
        }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={onSelect}
      >
        {/* Similarity Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 1,
          }}
        >
          <Badge
            badgeContent={`${Math.round(product.similarity * 100)}%`}
            color="primary"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                height: 28,
                minWidth: 28,
                borderRadius: '14px',
              },
            }}
          />
        </Box>

        {/* Alternative Badge */}
        {product.alternativeFor && (
          <Chip
            icon={<SwapHoriz />}
            label="Alternative"
            size="small"
            color="warning"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 1,
            }}
          />
        )}

        <CardMedia
          component="img"
          height="200"
          image={product.image}
          alt={product.name}
          sx={{
            objectFit: 'cover',
            filter: hovering ? 'brightness(1.1)' : 'none',
            transition: 'filter 0.3s ease',
          }}
        />

        <CardContent>
          <Typography variant="h6" gutterBottom noWrap>
            {product.name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {product.supplier}
          </Typography>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" color="primary" fontWeight="bold">
              {formatCurrency(product.price)}
            </Typography>
            <Chip
              label={product.availability.replace('_', ' ')}
              size="small"
              sx={{
                bgcolor: alpha(getAvailabilityColor(), 0.1),
                color: getAvailabilityColor(),
                textTransform: 'capitalize',
              }}
            />
          </Box>

          {/* Attributes */}
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap mb={2}>
            {product.attributes.color && (
              <Chip
                icon={<Palette />}
                label={product.attributes.color}
                size="small"
                variant="outlined"
              />
            )}
            {product.attributes.category && (
              <Chip
                icon={<Category />}
                label={product.attributes.category}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>

          {/* Certifications */}
          {product.certifications.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {product.certifications.map((cert) => (
                <Chip
                  key={cert}
                  label={cert}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              ))}
            </Stack>
          )}

          <Collapse in={hovering}>
            <Box mt={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  onCompare();
                }}
                startIcon={<CompareArrows />}
              >
                Compare
              </Button>
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Similarity Filters
const SimilarityFilters: React.FC<{
  filters: {
    minSimilarity: number;
    priceRange: [number, number];
    includeAlternatives: boolean;
    onlyInStock: boolean;
    categories: string[];
  };
  onChange: (filters: any) => void;
}> = ({ filters, onChange }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Paper sx={{ ...glassmorphismStyle, p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2" fontWeight="bold">
          Filters
        </Typography>
        <IconButton size="small" onClick={() => setExpanded(!expanded)}>
          <FilterList />
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Stack spacing={3} mt={2}>
          <Box>
            <Typography variant="body2" gutterBottom>
              Minimum Similarity: {filters.minSimilarity}%
            </Typography>
            <Slider
              value={filters.minSimilarity}
              onChange={(_, value) => onChange({ ...filters, minSimilarity: value })}
              min={50}
              max={100}
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography variant="body2" gutterBottom>
              Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </Typography>
            <Slider
              value={filters.priceRange}
              onChange={(_, value) => onChange({ ...filters, priceRange: value })}
              min={0}
              max={1000}
              valueLabelDisplay="auto"
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={filters.includeAlternatives}
                onChange={(e) => onChange({ ...filters, includeAlternatives: e.target.checked })}
              />
            }
            label="Include alternatives"
          />

          <FormControlLabel
            control={
              <Switch
                checked={filters.onlyInStock}
                onChange={(e) => onChange({ ...filters, onlyInStock: e.target.checked })}
              />
            }
            label="Only in stock"
          />
        </Stack>
      </Collapse>
    </Paper>
  );
};

// Main Visual Similarity Matching Component
export const VisualSimilarityMatching: React.FC = () => {
  const theme = useTheme();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    minSimilarity: 70,
    priceRange: [0, 500] as [number, number],
    includeAlternatives: true,
    onlyInStock: false,
    categories: [],
  });

  // Mock similar products data
  const mockSimilarProducts = [
    {
      id: '1',
      name: 'Organic Red Bell Peppers',
      image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400',
      supplier: 'Fresh Valley Farms',
      price: 4.99,
      similarity: 0.95,
      availability: 'in_stock' as const,
      certifications: ['Organic', 'Non-GMO'],
      attributes: {
        color: 'Red',
        category: 'Vegetables',
        tags: ['Fresh', 'Premium'],
      },
    },
    {
      id: '2',
      name: 'Yellow Bell Peppers - Premium',
      image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400',
      supplier: 'Green Gardens Co',
      price: 5.49,
      similarity: 0.88,
      availability: 'low_stock' as const,
      certifications: ['Organic'],
      attributes: {
        color: 'Yellow',
        category: 'Vegetables',
        tags: ['Fresh', 'Colorful'],
      },
      alternativeFor: 'Red Bell Peppers',
    },
    {
      id: '3',
      name: 'Mixed Bell Pepper Pack',
      image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400',
      supplier: 'Harvest Direct',
      price: 12.99,
      similarity: 0.82,
      availability: 'in_stock' as const,
      certifications: ['Organic', 'Fair Trade'],
      attributes: {
        color: 'Mixed',
        category: 'Vegetables',
        tags: ['Variety Pack', 'Bulk'],
      },
    },
  ];

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      setUploadedImage(e.target?.result as string);
      setProcessing(true);

      try {
        // Simulate AI processing
        setTimeout(() => {
          setSimilarProducts(mockSimilarProducts);
          setProcessing(false);
        }, 2000);

        // In real implementation:
        // const analysis = await aiServiceManager.analyzeDocument(file, {
        //   type: 'visual_similarity',
        //   includeAlternatives: filters.includeAlternatives,
        // });
      } catch (error) {
        console.error('Error processing image:', error);
        setProcessing(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleProductSelect = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleCompare = (productId: string) => {
    if (!selectedProducts.includes(productId)) {
      setSelectedProducts([...selectedProducts, productId]);
    }
    setCompareDialogOpen(true);
  };

  const filteredProducts = similarProducts.filter(product => {
    if (product.similarity * 100 < filters.minSimilarity) return false;
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) return false;
    if (filters.onlyInStock && product.availability !== 'in_stock') return false;
    if (!filters.includeAlternatives && product.alternativeFor) return false;
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Visual Similarity Matching
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload a product image to find visually similar items and alternatives
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          {uploadedImage && (
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                setUploadedImage(null);
                setSimilarProducts([]);
                setSelectedProducts([]);
              }}
            >
              Reset
            </Button>
          )}
          <Badge badgeContent={selectedProducts.length} color="primary">
            <Button
              variant="contained"
              startIcon={<CompareArrows />}
              onClick={() => setCompareDialogOpen(true)}
              disabled={selectedProducts.length === 0}
            >
              Compare
            </Button>
          </Badge>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Upload Zone */}
            <Paper sx={glassmorphismStyle}>
              <Box p={3}>
                {uploadedImage ? (
                  <Box position="relative">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      sx={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: 8,
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                      }}
                      onClick={() => setUploadedImage(null)}
                    >
                      <Close />
                    </IconButton>
                  </Box>
                ) : (
                  <ImageUploadZone
                    onImageUpload={handleImageUpload}
                    processing={processing}
                  />
                )}
              </Box>
            </Paper>

            {/* Filters */}
            {similarProducts.length > 0 && (
              <SimilarityFilters
                filters={filters}
                onChange={setFilters}
              />
            )}

            {/* AI Analysis */}
            {uploadedImage && !processing && similarProducts.length > 0 && (
              <Paper sx={glassmorphismStyle}>
                <Box p={3}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    AI Analysis
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <ImageSearch color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Visual Features"
                        secondary="Red color, bell shape, fresh produce"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Category color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Category"
                        secondary="Vegetables > Peppers"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUp color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Market Trend"
                        secondary="High demand, stable pricing"
                      />
                    </ListItem>
                  </List>
                </Box>
              </Paper>
            )}
          </Stack>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={8}>
          {processing && (
            <Box textAlign="center" py={8}>
              <CircularProgress size={60} />
              <Typography variant="h6" mt={3}>
                Analyzing image with AI...
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Finding visually similar products and alternatives
              </Typography>
            </Box>
          )}

          {!processing && similarProducts.length === 0 && uploadedImage && (
            <Alert severity="info">
              <Typography variant="body2">
                No similar products found. Try adjusting the filters or uploading a different image.
              </Typography>
            </Alert>
          )}

          {!processing && filteredProducts.length > 0 && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Found {filteredProducts.length} similar products
                </Typography>
                <Chip
                  icon={<AutoAwesome />}
                  label="AI Powered"
                  color="primary"
                  size="small"
                />
              </Box>

              <Grid container spacing={2}>
                {filteredProducts.map((product) => (
                  <Grid item xs={12} sm={6} lg={4} key={product.id}>
                    <SimilarProductCard
                      product={product}
                      onSelect={() => handleProductSelect(product.id)}
                      onCompare={() => handleCompare(product.id)}
                      selected={selectedProducts.includes(product.id)}
                    />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {!uploadedImage && (
            <Box
              sx={{
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <Stack spacing={2} alignItems="center">
                <PhotoLibrary sx={{ fontSize: 64, color: theme.palette.action.disabled }} />
                <Typography variant="h6" color="text.secondary">
                  Upload an image to start
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Our AI will find visually similar products and suggest alternatives
                </Typography>
              </Stack>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Compare Dialog */}
      <Dialog
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Compare Products
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setCompareDialogOpen(false)}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>Product comparison view would go here</Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default VisualSimilarityMatching;