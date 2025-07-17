import React from 'react';
import { FC } from 'react';
import {
  Box,
  Typography,
  Avatar,
  AvatarGroup,
  Chip,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  VideoCall,
  Phone,
  Info,
  Circle,
} from '@mui/icons-material';
import { Collaboration } from '../../types';

interface CollaborationHeaderProps {
  collaboration: Collaboration;
  onlineUsers: string[];
  onStartCall: () => void;
  isCallActive: boolean;
}

export const CollaborationHeader: FC<CollaborationHeaderProps> = ({
  collaboration,
  onlineUsers,
  onStartCall,
  isCallActive,
}) => {
  const getStatusColor = (status: Collaboration['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending_approval': return 'warning';
      case 'completed': return 'info';
      case 'on_hold': return 'error';
      default: return 'default';
    }
  };

  const participants = [
    { id: collaboration.expertId, name: 'Expert', role: 'expert' },
    { id: collaboration.clientId, name: 'Client', role: 'client' },
  ];

  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
        <Box flex={1}>
          <Typography variant="h6" noWrap>
            {collaboration.projectName}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
            <Chip
              label={collaboration.status.replace('_', ' ')}
              size="small"
              color={getStatusColor(collaboration.status)}
            />
            <Typography variant="body2" color="text.secondary">
              ID: #{collaboration.id.slice(-6)}
            </Typography>
          </Stack>
        </Box>
        
        <Stack direction="row" spacing={1}>
          <Tooltip title="Start video call">
            <IconButton
              onClick={onStartCall}
              color={isCallActive ? 'primary' : 'default'}
            >
              <VideoCall />
            </IconButton>
          </Tooltip>
          <Tooltip title="Voice call">
            <IconButton>
              <Phone />
            </IconButton>
          </Tooltip>
          <Tooltip title="Collaboration info">
            <IconButton>
              <Info />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Box display="flex" alignItems="center" gap={2}>
        <AvatarGroup max={3} sx={{ flexDirection: 'row' }}>
          {participants.map((participant) => (
            <Tooltip key={participant.id} title={participant.name}>
              <Avatar sx={{ width: 32, height: 32 }}>
                {participant.name[0]}
              </Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>
        
        <Box display="flex" alignItems="center" gap={0.5}>
          {onlineUsers.length > 0 ? (
            <>
              <Circle sx={{ fontSize: 8, color: 'success.main' }} />
              <Typography variant="caption" color="success.main">
                {onlineUsers.length} online
              </Typography>
            </>
          ) : (
            <>
              <Circle sx={{ fontSize: 8, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.disabled">
                Offline
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};