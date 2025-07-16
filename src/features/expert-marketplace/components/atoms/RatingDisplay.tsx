import { FC } from 'react';
import { Box, Rating, Typography } from '@mui/material';

interface RatingDisplayProps {
  rating: number;
  reviewCount?: number;
  showCount?: boolean;
  size?: 'small' | 'medium' | 'large';
  precision?: number;
}

export const RatingDisplay: FC<RatingDisplayProps> = ({
  rating,
  reviewCount = 0,
  showCount = true,
  size = 'medium',
  precision = 0.1,
}) => {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Rating
        value={rating}
        readOnly
        precision={precision}
        size={size}
        sx={{
          color: 'primary.main',
        }}
      />
      <Typography variant="body2" color="text.secondary">
        {rating.toFixed(1)}
      </Typography>
      {showCount && reviewCount > 0 && (
        <Typography variant="body2" color="text.secondary">
          ({reviewCount})
        </Typography>
      )}
    </Box>
  );
};