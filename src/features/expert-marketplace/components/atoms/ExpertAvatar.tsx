import { FC } from 'react';
import { Avatar, Badge, AvatarProps, Box } from '@mui/material';
import { Verified } from '@mui/icons-material';

interface ExpertAvatarProps extends AvatarProps {
  name: string;
  imageUrl?: string;
  isVerified?: boolean;
  isOnline?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const sizeMap = {
  small: { width: 40, height: 40, badge: 12 },
  medium: { width: 56, height: 56, badge: 16 },
  large: { width: 80, height: 80, badge: 20 },
};

export const ExpertAvatar: FC<ExpertAvatarProps> = ({
  name,
  imageUrl,
  isVerified = false,
  isOnline = false,
  size = 'medium',
  ...avatarProps
}) => {
  const dimensions = sizeMap[size];
  
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Box position="relative" display="inline-flex">
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
        invisible={!isOnline}
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: '#44b700',
            color: '#44b700',
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}`,
            '&::after': {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              animation: isOnline ? 'ripple 1.2s infinite ease-in-out' : 'none',
              border: '1px solid currentColor',
              content: '""',
            },
          },
          '@keyframes ripple': {
            '0%': {
              transform: 'scale(.8)',
              opacity: 1,
            },
            '100%': {
              transform: 'scale(2.4)',
              opacity: 0,
            },
          },
        }}
      >
        <Avatar
          src={imageUrl}
          alt={name}
          sx={{ ...dimensions }}
          {...avatarProps}
        >
          {!imageUrl && getInitials(name)}
        </Avatar>
      </Badge>
      {isVerified && (
        <Box
          position="absolute"
          bottom={-4}
          right={-4}
          bgcolor="background.paper"
          borderRadius="50%"
          display="flex"
        >
          <Verified
            sx={{
              fontSize: dimensions.badge,
              color: 'primary.main',
            }}
          />
        </Box>
      )}
    </Box>
  );
};