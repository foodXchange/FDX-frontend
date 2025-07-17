import React, { useState } from 'react';
import { FC, useState } from 'react';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Close,
  CalendarMonth,
  Business,
  EmojiEvents,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Portfolio } from '../../types';

interface PortfolioGalleryProps {
  portfolio: Portfolio[];
}

export const PortfolioGallery: FC<PortfolioGalleryProps> = ({ portfolio }) => {
  const [selectedItem, setSelectedItem] = useState<Portfolio | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleItemClick = (item: Portfolio) => {
    setSelectedItem(item);
    setCurrentImageIndex(0);
  };

  const handleClose = () => {
    setSelectedItem(null);
    setCurrentImageIndex(0);
  };

  const handlePrevImage = () => {
    if (selectedItem && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleNextImage = () => {
    if (selectedItem && currentImageIndex < selectedItem.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  if (portfolio.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          No portfolio items yet.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {portfolio.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => handleItemClick(item)}
            >
              <CardMedia
                component="img"
                height="200"
                image={item.images[0] || '/placeholder-portfolio.jpg'}
                alt={item.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom noWrap>
                  {item.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    mb: 2,
                  }}
                >
                  {item.description}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Chip
                    label={item.category}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(item.date), 'MMM yyyy')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Portfolio Item Dialog */}
      <Dialog
        open={Boolean(selectedItem)}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        {selectedItem && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">{selectedItem.title}</Typography>
                <IconButton onClick={handleClose}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box>
                {/* Image Gallery */}
                {selectedItem.images.length > 0 && (
                  <Box position="relative" mb={3}>
                    <CardMedia
                      component="img"
                      image={selectedItem.images[currentImageIndex]}
                      alt={`${selectedItem.title} - Image ${currentImageIndex + 1}`}
                      sx={{
                        width: '100%',
                        height: 400,
                        objectFit: 'contain',
                        bgcolor: 'grey.100',
                        borderRadius: 1,
                      }}
                    />
                    {selectedItem.images.length > 1 && (
                      <>
                        <IconButton
                          sx={{
                            position: 'absolute',
                            left: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'background.paper',
                            '&:hover': { bgcolor: 'background.paper' },
                          }}
                          onClick={handlePrevImage}
                          disabled={currentImageIndex === 0}
                        >
                          <ArrowBack />
                        </IconButton>
                        <IconButton
                          sx={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'background.paper',
                            '&:hover': { bgcolor: 'background.paper' },
                          }}
                          onClick={handleNextImage}
                          disabled={currentImageIndex === selectedItem.images.length - 1}
                        >
                          <ArrowForward />
                        </IconButton>
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            bgcolor: 'rgba(0, 0, 0, 0.6)',
                            color: 'white',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                          }}
                        >
                          {currentImageIndex + 1} / {selectedItem.images.length}
                        </Box>
                      </>
                    )}
                  </Box>
                )}

                {/* Thumbnail Strip */}
                {selectedItem.images.length > 1 && (
                  <Box display="flex" gap={1} mb={3} overflow="auto">
                    {selectedItem.images.map((image, index) => (
                      <Box
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        sx={{
                          width: 80,
                          height: 80,
                          cursor: 'pointer',
                          opacity: currentImageIndex === index ? 1 : 0.6,
                          border: currentImageIndex === index ? 2 : 0,
                          borderColor: 'primary.main',
                          borderRadius: 1,
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Project Details */}
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Project Description
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {selectedItem.description}
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarMonth color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Project Date
                          </Typography>
                          <Typography variant="body2">
                            {format(new Date(selectedItem.date), 'MMMM yyyy')}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    {selectedItem.client && (
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Business color="action" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Client
                            </Typography>
                            <Typography variant="body2">
                              {selectedItem.client}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmojiEvents color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Category
                          </Typography>
                          <Typography variant="body2">
                            {selectedItem.category}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  {selectedItem.results && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Results & Impact
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {selectedItem.results}
                      </Typography>
                    </Box>
                  )}

                  {selectedItem.testimonial && (
                    <Box
                      sx={{
                        p: 3,
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                        borderLeft: 3,
                        borderColor: 'primary.main',
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Client Testimonial
                      </Typography>
                      <Typography variant="body1" fontStyle="italic">
                        "{selectedItem.testimonial}"
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
};