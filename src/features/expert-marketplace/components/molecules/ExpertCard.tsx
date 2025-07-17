import React from 'react';
import { FC } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Bookmark,
  BookmarkBorder,
  Message,
  Schedule,
  Verified,
  WorkHistory,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Expert } from '../../types';
import {
  ExpertAvatar,
  RatingDisplay,
  PriceDisplay,
  AvailabilityBadge,
  ExpertiseBadge,
} from '../atoms';

interface ExpertCardProps {
  expert: Expert;
  onBookmark?: (expertId: string) => void;
  onMessage?: (expertId: string) => void;
  onBook?: (expertId: string) => void;
  isBookmarked?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export const ExpertCard: FC<ExpertCardProps> = ({
  expert,
  onBookmark,
  onMessage,
  onBook,
  isBookmarked = false,
  variant = 'default',
}) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/experts/profile/${expert.id}`);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark?.(expert.id);
  };

  if (variant === 'compact') {
    return (
      <Card
        sx={{
          cursor: 'pointer',
          transition: 'all 0.3s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3,
          },
        }}
        onClick={handleViewProfile}
      >
        <CardContent sx={{ pb: 1 }}>
          <Box display="flex" gap={2}>
            <ExpertAvatar
              name={`${expert.firstName} ${expert.lastName}`}
              imageUrl={expert.avatar}
              isVerified={expert.isVerified}
              isOnline={expert.availability.isAvailable}
              size="small"
            />
            <Box flex={1} minWidth={0}>
              <Box display="flex" justifyContent="space-between" alignItems="start">
                <Box>
                  <Typography variant="body1" fontWeight="medium" noWrap>
                    {expert.firstName} {expert.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {expert.title}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={handleBookmark}>
                  {isBookmarked ? <Bookmark fontSize="small" /> : <BookmarkBorder fontSize="small" />}
                </IconButton>
              </Box>
              <Box display="flex" alignItems="center" gap={2} mt={1}>
                <RatingDisplay rating={expert.rating} reviewCount={expert.reviewCount} size="small" />
                <PriceDisplay amount={expert.hourlyRate} currency={expert.currency} variant="compact" />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={handleViewProfile}
    >
      <CardContent sx={{ flex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Box display="flex" gap={2}>
            <ExpertAvatar
              name={`${expert.firstName} ${expert.lastName}`}
              imageUrl={expert.avatar}
              isVerified={expert.isVerified}
              isOnline={expert.availability.isAvailable}
            />
            <Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h6" component="h3">
                  {expert.firstName} {expert.lastName}
                </Typography>
                {expert.isVerified && (
                  <Tooltip title="Verified Expert">
                    <Verified fontSize="small" color="primary" />
                  </Tooltip>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {expert.title}
              </Typography>
              {expert.company && (
                <Typography variant="body2" color="text.secondary">
                  {expert.company}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={handleBookmark}>
            {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {expert.bio}
        </Typography>

        <Stack spacing={1.5}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <RatingDisplay rating={expert.rating} reviewCount={expert.reviewCount} />
            <PriceDisplay amount={expert.hourlyRate} currency={expert.currency} />
          </Box>

          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <AvailabilityBadge
              isAvailable={expert.availability.isAvailable}
              nextAvailable={expert.availability.nextAvailable}
            />
            <Chip
              icon={<WorkHistory />}
              label={`${expert.completedProjects} projects`}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<Schedule />}
              label={`${expert.responseTime}h response`}
              size="small"
              variant="outlined"
            />
          </Box>

          <Box display="flex" gap={0.5} flexWrap="wrap">
            {expert.expertise.slice(0, 3).map((exp) => (
              <ExpertiseBadge
                key={exp.id}
                category={exp.name}
                variant="outlined"
              />
            ))}
            {expert.expertise.length > 3 && (
              <Chip
                label={`+${expert.expertise.length - 3} more`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            onBook?.(expert.id);
          }}
          disabled={!expert.availability.isAvailable}
        >
          Book Consultation
        </Button>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onMessage?.(expert.id);
          }}
        >
          <Message />
        </IconButton>
      </CardActions>
    </Card>
  );
};