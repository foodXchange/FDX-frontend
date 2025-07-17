import React, { useState } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import {
  PhotoCamera as CameraIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { FileUpload } from '../ui/FileUpload';
import { useAgentStore } from '../../features/agents/store/useAgentStore';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  agentName: string;
  agentId: string;
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImageUrl,
  agentName,
}) => {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const updateAgent = useAgentStore((state) => state.updateAgent);

  const handleUploadSuccess = (file: any) => {
    const newImageUrl = `http://localhost:3002${file.url}`;
    setImageUrl(newImageUrl);
    
    // Update agent profile with new image
    updateAgent({ profileImage: newImageUrl });
    
    // Close dialog after successful upload
    setTimeout(() => setOpen(false), 1500);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Box position="relative" display="inline-block">
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <IconButton
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                width: 40,
                height: 40,
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
              onClick={() => setOpen(true)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          }
        >
          <Avatar
            src={imageUrl}
            sx={{
              width: 120,
              height: 120,
              fontSize: '2rem',
              bgcolor: 'primary.main',
            }}
          >
            {!imageUrl && getInitials(agentName)}
          </Avatar>
        </Badge>
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CameraIcon />
            <Typography variant="h6">Update Profile Picture</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box py={2}>
            <FileUpload
              accept="image/*"
              maxSize={5}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={(error) => console.error('Upload error:', error)}
            />
          </Box>
          
          <Typography variant="caption" color="text.secondary" display="block" mt={2}>
            Recommended: Square image, at least 200x200 pixels, JPG or PNG format
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};