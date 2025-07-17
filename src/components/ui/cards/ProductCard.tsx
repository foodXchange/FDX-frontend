import React from 'react';
import { Box, Card, CardContent, CardMedia, Typography, Button, Stack } from '@mui/material';
import { Badge } from '../Badge';
import { ShieldCheckIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ProductCardProps {
  id: string;
  name: string;
  supplier: string;
  image: string;
  price: string;
  moq: string;
  certifications: string[];
  leadTime: string;
  verified: boolean;
  onView: () => void;
  onRequestSample: () => void;
  onQuickRFQ: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  name,
  supplier,
  image,
  price,
  moq,
  certifications,
  leadTime,
  verified,
  onView,
  onRequestSample,
  onQuickRFQ
}) => {
  return (
    <Card
      sx={{
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          '& .MuiBox-root:last-child': {
            opacity: 1,
          }
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="192"
          image={image}
          alt={name}
          sx={{ objectFit: 'cover' }}
        />
        {verified && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: '#1E4C8A',
              color: 'white',
              p: 1,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box component={ShieldCheckIcon} sx={{ width: 20, height: 20 }} />
          </Box>
        )}
        <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 0.5 }}>
          {certifications.slice(0, 3).map((cert, i) => (
            <Badge key={i} variant="certification" size="sm">{cert}</Badge>
          ))}
        </Box>
      </Box>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          {supplier}
        </Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Price</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#B08D57' }}>{price}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>MOQ</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{moq}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem', color: 'text.secondary' }}>
            <Box component={ClockIcon} sx={{ width: 16, height: 16 }} />
            <Typography variant="body2">{leadTime}</Typography>
          </Box>
        </Stack>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            opacity: 0,
            transition: 'opacity 0.3s'
          }}
        >
          <Button
            size="small"
            onClick={onView}
            sx={{
              flex: 1,
              bgcolor: 'grey.100',
              color: 'text.primary',
              '&:hover': { bgcolor: 'grey.200' }
            }}
          >
            View
          </Button>
          <Button
            size="small"
            onClick={onRequestSample}
            sx={{
              flex: 1,
              bgcolor: '#52B788',
              color: 'white',
              '&:hover': { bgcolor: '#2D7A5F' }
            }}
          >
            Sample
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={onQuickRFQ}
            sx={{ flex: 1 }}
          >
            RFQ
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};