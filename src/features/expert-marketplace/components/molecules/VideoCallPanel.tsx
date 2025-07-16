import { FC, useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Stack,
  Avatar,
  Badge,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  ScreenShare,
  StopScreenShare,
  CallEnd,
  Chat,
  People,
  Settings,
  Fullscreen,
  FullscreenExit,
  FiberManualRecord,
} from '@mui/icons-material';

interface VideoCallPanelProps {
  collaborationId: string;
  participants: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  isActive: boolean;
  onEndCall: () => void;
}

export const VideoCallPanel: FC<VideoCallPanelProps> = ({
  collaborationId,
  participants,
  isActive,
  onEndCall,
}) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleAudio = () => setIsAudioOn(!isAudioOn);
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleEndCall = () => {
    setCallDuration(0);
    onEndCall();
  };

  if (!isActive) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Videocam sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Video Call
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          Start a video call to collaborate in real-time with screen sharing and recording capabilities.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<Videocam />}
          sx={{ mt: 3 }}
          onClick={() => {/* Start call logic */}}
        >
          Start Video Call
        </Button>
      </Box>
    );
  }

  return (
    <Box ref={containerRef} sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'grey.900' }}>
      {/* Main Video Area */}
      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Grid container spacing={1} sx={{ height: '100%', p: 2 }}>
          {participants.map((participant, index) => (
            <Grid item xs={12} md={participants.length > 1 ? 6 : 12} key={participant.id}>
              <Paper
                sx={{
                  height: '100%',
                  position: 'relative',
                  bgcolor: 'grey.800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {index === 0 && isVideoOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <Avatar sx={{ width: 80, height: 80 }}>
                    {participant.name[0]}
                  </Avatar>
                )}
                
                {/* Participant Info */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)', px: 1, py: 0.5, borderRadius: 1 }}>
                    {participant.name} {index === 0 && '(You)'}
                  </Typography>
                  {index === 0 && !isAudioOn && (
                    <MicOff sx={{ color: 'error.main', fontSize: 20 }} />
                  )}
                </Box>

                {/* Screen Share Indicator */}
                {isScreenSharing && index === 0 && (
                  <Chip
                    label="Sharing Screen"
                    size="small"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                    }}
                  />
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Recording Indicator */}
        {isRecording && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'error.main',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 1,
            }}
          >
            <FiberManualRecord sx={{ fontSize: 16, animation: 'pulse 1.5s infinite' }} />
            <Typography variant="body2">Recording</Typography>
          </Box>
        )}

        {/* Call Duration */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(0,0,0,0.5)',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 1,
          }}
        >
          <Typography variant="body2">{formatDuration(callDuration)}</Typography>
        </Box>
      </Box>

      {/* Controls Bar */}
      <Paper
        sx={{
          p: 2,
          bgcolor: 'grey.800',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <Tooltip title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}>
            <IconButton
              onClick={toggleVideo}
              color={isVideoOn ? 'default' : 'error'}
              sx={{ bgcolor: 'grey.700' }}
            >
              {isVideoOn ? <Videocam /> : <VideocamOff />}
            </IconButton>
          </Tooltip>

          <Tooltip title={isAudioOn ? 'Mute' : 'Unmute'}>
            <IconButton
              onClick={toggleAudio}
              color={isAudioOn ? 'default' : 'error'}
              sx={{ bgcolor: 'grey.700' }}
            >
              {isAudioOn ? <Mic /> : <MicOff />}
            </IconButton>
          </Tooltip>

          <Tooltip title={isScreenSharing ? 'Stop sharing' : 'Share screen'}>
            <IconButton
              onClick={toggleScreenShare}
              color={isScreenSharing ? 'primary' : 'default'}
              sx={{ bgcolor: 'grey.700' }}
            >
              {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
            </IconButton>
          </Tooltip>

          <Box sx={{ mx: 2, height: 40, width: 1, bgcolor: 'divider' }} />

          <Tooltip title="End call">
            <IconButton
              onClick={handleEndCall}
              sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
            >
              <CallEnd />
            </IconButton>
          </Tooltip>

          <Box sx={{ mx: 2, height: 40, width: 1, bgcolor: 'divider' }} />

          <Tooltip title="Chat">
            <IconButton
              onClick={() => setShowChat(!showChat)}
              color={showChat ? 'primary' : 'default'}
              sx={{ bgcolor: 'grey.700' }}
            >
              <Badge badgeContent={2} color="error">
                <Chat />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Participants">
            <IconButton
              onClick={() => setShowParticipants(!showParticipants)}
              color={showParticipants ? 'primary' : 'default'}
              sx={{ bgcolor: 'grey.700' }}
            >
              <Badge badgeContent={participants.length} color="primary">
                <People />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title={isRecording ? 'Stop recording' : 'Start recording'}>
            <IconButton
              onClick={() => setIsRecording(!isRecording)}
              color={isRecording ? 'error' : 'default'}
              sx={{ bgcolor: 'grey.700' }}
            >
              <FiberManualRecord />
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton sx={{ bgcolor: 'grey.700' }}>
              <Settings />
            </IconButton>
          </Tooltip>

          <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            <IconButton onClick={toggleFullscreen} sx={{ bgcolor: 'grey.700' }}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>
    </Box>
  );
};