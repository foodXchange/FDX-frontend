import { FC, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Rating,
  Button,
  Stack,
  Divider,
  Chip,
  LinearProgress,
  Grid,
} from '@mui/material';
import { format } from 'date-fns';
import { Rating as RatingType } from '../../types';

interface ReviewListProps {
  ratings: RatingType[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

interface RatingBreakdown {
  category: string;
  value: number;
}

export const ReviewList: FC<ReviewListProps> = ({
  ratings,
  onLoadMore,
  hasMore = false,
  loading = false,
}) => {
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const toggleExpanded = (reviewId: string) => {
    setExpandedReviews(prev => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  // Calculate rating statistics
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.overall, 0) / ratings.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: ratings.filter(r => Math.floor(r.overall) === star).length,
    percentage: (ratings.filter(r => Math.floor(r.overall) === star).length / ratings.length) * 100,
  }));

  const breakdowns: RatingBreakdown[] = [
    {
      category: 'Communication',
      value: ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.communication, 0) / ratings.length
        : 0,
    },
    {
      category: 'Expertise',
      value: ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.expertise, 0) / ratings.length
        : 0,
    },
    {
      category: 'Professionalism',
      value: ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.professionalism, 0) / ratings.length
        : 0,
    },
    {
      category: 'Value',
      value: ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
        : 0,
    },
  ];

  if (ratings.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          No reviews yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Rating Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h2" fontWeight="bold">
                {avgRating.toFixed(1)}
              </Typography>
              <Rating value={avgRating} readOnly precision={0.1} size="large" />
              <Typography variant="body2" color="text.secondary">
                Based on {ratings.length} reviews
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              {ratingDistribution.map(({ star, count, percentage }) => (
                <Box key={star} display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" sx={{ minWidth: 20 }}>
                    {star}★
                  </Typography>
                  <Box flex={1}>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 30 }}>
                    {count}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              {breakdowns.map(({ category, value }) => (
                <Box key={category} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">{category}</Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Rating value={value} readOnly size="small" precision={0.1} />
                    <Typography variant="body2" color="text.secondary">
                      {value.toFixed(1)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Individual Reviews */}
      <Stack spacing={2}>
        {ratings.map((rating) => {
          const isExpanded = expandedReviews.has(rating.id);
          const needsExpansion = rating.comment.length > 200;

          return (
            <Paper key={rating.id} sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Box display="flex" gap={2}>
                  <Avatar>{rating.clientId.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Anonymous Client
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Rating value={rating.overall} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(rating.createdAt), 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Chip
                  label={`Project #${rating.collaborationId.slice(-4)}`}
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Typography variant="body2" paragraph>
                {needsExpansion && !isExpanded
                  ? `${rating.comment.slice(0, 200)}...`
                  : rating.comment}
              </Typography>

              {needsExpansion && (
                <Button
                  size="small"
                  onClick={() => toggleExpanded(rating.id)}
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </Button>
              )}

              {rating.response && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    borderLeft: 3,
                    borderColor: 'primary.main',
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Expert Response
                  </Typography>
                  <Typography variant="body2">{rating.response}</Typography>
                </Box>
              )}

              {isExpanded && (
                <Box mt={2}>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Communication
                      </Typography>
                      <Rating value={rating.communication} readOnly size="small" />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Expertise
                      </Typography>
                      <Rating value={rating.expertise} readOnly size="small" />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Professionalism
                      </Typography>
                      <Rating value={rating.professionalism} readOnly size="small" />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Value
                      </Typography>
                      <Rating value={rating.value} readOnly size="small" />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>
          );
        })}
      </Stack>

      {hasMore && (
        <Box textAlign="center" mt={3}>
          <Button
            variant="outlined"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Reviews'}
          </Button>
        </Box>
      )}
    </Box>
  );
};