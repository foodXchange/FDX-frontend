import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, Chip, Rating } from '@mui/material';
import { Expert } from '../../types';
import { useNavigate } from 'react-router-dom';

interface ExpertCardProps {
  expert: Expert;
  onClick?: () => void;
}

export const ExpertCard: React.FC<ExpertCardProps> = ({ expert, onClick }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/experts/${expert.id}`);
    }
  };

  return (
    <Card 
      onClick={handleClick} 
      sx={{ 
        cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar src={expert.avatar} sx={{ mr: 2, width: 56, height: 56 }}>
            {(expert.firstName || expert.lastName || 'E').charAt(0)}
          </Avatar>
          <Box flexGrow={1}>
            <Typography variant="h6">{expert.firstName} {expert.lastName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {expert.title}
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" alignItems="center" mb={2}>
          <Rating value={expert.rating} readOnly size="small" />
          <Typography variant="body2" color="text.secondary" ml={1}>
            ({expert.reviewCount} reviews)
          </Typography>
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          mb={2}
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {expert.bio}
        </Typography>
        
        <Box display="flex" gap={1} flexWrap="wrap">
          {expert.expertise.slice(0, 3).map((skill, index) => (
            <Chip key={`${expert.id}-skill-${index}`} label={String(skill)} size="small" />
          ))}
          {expert.expertise.length > 3 && (
            <Chip label={`+${expert.expertise.length - 3}`} size="small" variant="outlined" />
          )}
        </Box>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Typography variant="h6" color="primary">
            ${expert.hourlyRate}/hr
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {expert.availability ? 'Available' : 'Busy'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
