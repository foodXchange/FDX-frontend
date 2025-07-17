import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Button,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  useTheme,
  Tooltip,
  AvatarGroup,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
} from '@mui/material';
import { Groups, Chat, Videocam, MoreVert, Add, Edit, VideoCall, ScreenShare, Stop, PersonAdd, Assignment, Timeline,  } from '@mui/icons-material';
import { useAgentStore } from '../../store';
import { Agent } from '../../types';

interface CollaborationSession {
  id: string;
  type: 'lead_review' | 'strategy_session' | 'training' | 'team_meeting';
  title: string;
  description: string;
  leadId?: string;
  participants: Agent[];
  createdBy: string;
  status: 'active' | 'scheduled' | 'ended';
  startTime: string;
  endTime?: string;
  isRecording: boolean;
  sharedScreen?: string;
  chatMessages: ChatMessage[];
  collaborativeNotes: string;
  tasks: CollaborativeTask[];
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'lead_share' | 'system';
  metadata?: any;
}

interface CollaborativeTask {
  id: string;
  title: string;
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  createdAt: string;
}

interface OnlineAgent {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  currentActivity?: string;
  lastSeen: string;
}

const CollaborationHub: React.FC = () => {
  const theme = useTheme();
  const { currentAgent, leads } = useAgentStore();
  
  const [activeTab, setActiveTab] = useState(0);
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [onlineAgents, setOnlineAgents] = useState<OnlineAgent[]>([]);
  const [selectedSession, setSelectedSession] = useState<CollaborationSession | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [newSessionData, setNewSessionData] = useState({
    type: 'lead_review' as CollaborationSession['type'],
    title: '',
    description: '',
    leadId: '',
    participants: [] as string[],
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load collaboration data
    loadCollaborationData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      updateOnlineStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedSession?.chatMessages]);

  const loadCollaborationData = () => {
    // Mock data - would come from API
    const mockSessions: CollaborationSession[] = [
      {
        id: '1',
        type: 'lead_review',
        title: 'ABC Restaurant Lead Review',
        description: 'Discussing strategy for high-value restaurant lead',
        leadId: 'lead-1',
        participants: [
          { id: '1', firstName: 'John', lastName: 'Doe' } as Agent,
          { id: '2', firstName: 'Jane', lastName: 'Smith' } as Agent,
        ],
        createdBy: '1',
        status: 'active',
        startTime: new Date().toISOString(),
        isRecording: false,
        chatMessages: [
          {
            id: '1',
            senderId: '1',
            senderName: 'John Doe',
            content: 'Hey team, I wanted to discuss the ABC Restaurant lead. They seem very interested.',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            type: 'text',
          },
          {
            id: '2',
            senderId: '2',
            senderName: 'Jane Smith',
            content: 'Great! I reviewed their requirements. They need a comprehensive solution.',
            timestamp: new Date(Date.now() - 240000).toISOString(),
            type: 'text',
          },
        ],
        collaborativeNotes: '• Lead shows strong interest\n• Budget: $50K annually\n• Decision maker: Owner\n• Next steps: Send proposal',
        tasks: [
          {
            id: '1',
            title: 'Prepare detailed proposal',
            assignedTo: '1',
            status: 'in_progress',
            dueDate: new Date(Date.now() + 86400000).toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
      },
    ];

    const mockOnlineAgents: OnlineAgent[] = [
      {
        id: '1',
        name: 'John Doe',
        status: 'online',
        currentActivity: 'Reviewing leads',
        lastSeen: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Jane Smith',
        status: 'busy',
        currentActivity: 'In a call',
        lastSeen: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Mike Johnson',
        status: 'away',
        lastSeen: new Date(Date.now() - 600000).toISOString(),
      },
    ];

    setSessions(mockSessions);
    setOnlineAgents(mockOnlineAgents);
    if (mockSessions.length > 0) {
      setSelectedSession(mockSessions[0]);
    }
  };

  const updateOnlineStatus = () => {
    // Update online agents status
    setOnlineAgents(prev => prev.map(agent => ({
      ...agent,
      lastSeen: agent.status === 'online' ? new Date().toISOString() : agent.lastSeen,
    })));
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedSession) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentAgent?.id || '',
      senderName: `${currentAgent?.firstName} ${currentAgent?.lastName}`,
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    setSessions(prev => prev.map(session => 
      session.id === selectedSession.id 
        ? { ...session, chatMessages: [...session.chatMessages, message] }
        : session
    ));

    setSelectedSession(prev => prev ? {
      ...prev,
      chatMessages: [...prev.chatMessages, message]
    } : null);

    setNewMessage('');
  };

  const createSession = () => {
    const newSession: CollaborationSession = {
      id: Date.now().toString(),
      ...newSessionData,
      participants: [],
      createdBy: currentAgent?.id || '',
      status: 'active',
      startTime: new Date().toISOString(),
      isRecording: false,
      chatMessages: [],
      collaborativeNotes: '',
      tasks: [],
    };

    setSessions(prev => [...prev, newSession]);
    setSelectedSession(newSession);
    setIsCreatingSession(false);
    setNewSessionData({
      type: 'lead_review',
      title: '',
      description: '',
      leadId: '',
      participants: [],
    });
  };

  const getStatusColor = (status: OnlineAgent['status']) => {
    switch (status) {
      case 'online': return theme.palette.success.main;
      case 'away': return theme.palette.warning.main;
      case 'busy': return theme.palette.error.main;
      case 'offline': return theme.palette.grey[400];
      default: return theme.palette.grey[400];
    }
  };

  const getSessionTypeIcon = (type: CollaborationSession['type']) => {
    switch (type) {
      case 'lead_review': return <Assignment />;
      case 'strategy_session': return <Timeline />;
      case 'training': return <Groups />;
      case 'team_meeting': return <Groups />;
      default: return <Chat />;
    }
  };

  const SessionsList = () => (
    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
      {sessions.map((session) => (
        <ListItemButton
          key={session.id}
          selected={selectedSession?.id === session.id}
          onClick={() => setSelectedSession(session)}
          sx={{
            borderRadius: 1,
            mb: 1,
          }}
        >
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              {getSessionTypeIcon(session.type)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2">{session.title}</Typography>
                <Chip 
                  label={session.status} 
                  size="small" 
                  color={session.status === 'active' ? 'success' : 'default'} 
                />
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {session.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 20, height: 20, fontSize: '0.75rem' } }}>
                    {session.participants.map((participant) => (
                      <Avatar key={participant.id}>
                        {participant.firstName[0]}{participant.lastName[0]}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                  <Typography variant="caption" color="text.secondary">
                    {session.participants.length} participants
                  </Typography>
                </Box>
              </Box>
            }
          />
          <ListItemSecondaryAction>
            <IconButton size="small">
              <MoreVert />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItemButton>
      ))}
    </List>
  );

  const OnlineAgentsList = () => (
    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
      {onlineAgents.map((agent) => (
        <ListItem key={agent.id}>
          <ListItemAvatar>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: getStatusColor(agent.status),
                    border: `2px solid ${theme.palette.background.paper}`,
                  }}
                />
              }
            >
              <Avatar>{agent.name.split(' ').map(n => n[0]).join('')}</Avatar>
            </Badge>
          </ListItemAvatar>
          <ListItemText
            primary={agent.name}
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {agent.status === 'online' ? agent.currentActivity : `Last seen: ${new Date(agent.lastSeen).toLocaleTimeString()}`}
                </Typography>
              </Box>
            }
          />
          <ListItemSecondaryAction>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton size="small" disabled={agent.status === 'offline'}>
                <Chat />
              </IconButton>
              <IconButton size="small" disabled={agent.status !== 'online'}>
                <VideoCall />
              </IconButton>
            </Box>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );

  const ChatArea = () => (
    <Box sx={{ height: 400, display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6">{selectedSession?.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedSession?.participants.length} participants
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Start Video Call">
            <IconButton color="primary">
              <Videocam />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share Screen">
            <IconButton>
              <ScreenShare />
            </IconButton>
          </Tooltip>
          <Tooltip title={selectedSession?.isRecording ? 'Stop Recording' : 'Start Recording'}>
            <IconButton color={selectedSession?.isRecording ? 'error' : 'default'}>
              {selectedSession?.isRecording ? <Stop /> : <Record />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Participant">
            <IconButton>
              <PersonAdd />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Chat Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        {selectedSession?.chatMessages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              mb: 2,
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {message.senderName.split(' ').map(n => n[0]).join('')}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="subtitle2">{message.senderName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
              </Box>
              <Typography variant="body2">{message.content}</Typography>
            </Box>
          </Box>
        ))}
        <div ref={chatEndRef} />
      </Box>

      {/* Message Input */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button variant="contained" onClick={sendMessage} disabled={!newMessage.trim()}>
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <Groups />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              Collaboration Hub
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time collaboration with your team
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsCreatingSession(true)}
          sx={{ textTransform: 'none' }}
        >
          New Session
        </Button>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 200px)' }}>
        {/* Left Sidebar */}
        <Card sx={{ width: 350, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab label="Sessions" />
              <Tab label="Team" />
            </Tabs>
          </Box>
          <CardContent sx={{ flex: 1, overflow: 'hidden', p: 1 }}>
            {activeTab === 0 ? <SessionsList /> : <OnlineAgentsList />}
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedSession ? (
            <>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={0} onChange={() => {}}>
                  <Tab label="Chat" icon={<Chat />} iconPosition="start" />
                  <Tab label="Notes" icon={<Edit />} iconPosition="start" />
                  <Tab label="Tasks" icon={<Assignment />} iconPosition="start" />
                </Tabs>
              </Box>
              <Box sx={{ flex: 1 }}>
                <ChatArea />
              </Box>
            </>
          ) : (
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'text.secondary' 
            }}>
              <Groups sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No Session Selected
              </Typography>
              <Typography variant="body2" textAlign="center">
                Select a collaboration session from the sidebar or create a new one
              </Typography>
            </Box>
          )}
        </Card>
      </Box>

      {/* Create Session Dialog */}
      <Dialog open={isCreatingSession} onClose={() => setIsCreatingSession(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Collaboration Session</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Session Title"
              value={newSessionData.title}
              onChange={(e) => setNewSessionData({ ...newSessionData, title: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={newSessionData.description}
              onChange={(e) => setNewSessionData({ ...newSessionData, description: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Session Type</InputLabel>
              <Select
                value={newSessionData.type}
                onChange={(e) => setNewSessionData({ ...newSessionData, type: e.target.value as any })}
                label="Session Type"
              >
                <MenuItem value="lead_review">Lead Review</MenuItem>
                <MenuItem value="strategy_session">Strategy Session</MenuItem>
                <MenuItem value="training">Training</MenuItem>
                <MenuItem value="team_meeting">Team Meeting</MenuItem>
              </Select>
            </FormControl>
            {newSessionData.type === 'lead_review' && (
              <FormControl fullWidth>
                <InputLabel>Related Lead</InputLabel>
                <Select
                  value={newSessionData.leadId}
                  onChange={(e) => setNewSessionData({ ...newSessionData, leadId: e.target.value })}
                  label="Related Lead"
                >
                  {leads.slice(0, 5).map((lead) => (
                    <MenuItem key={lead.id} value={lead.id}>
                      {lead.companyName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreatingSession(false)}>Cancel</Button>
          <Button 
            onClick={createSession} 
            variant="contained"
            disabled={!newSessionData.title.trim()}
          >
            Create Session
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollaborationHub;