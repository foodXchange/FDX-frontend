import React, { useState } from 'react';
import { FC, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Badge,
  Drawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Chat,
  Folder,
  VideoCall,
  Assignment,
  Timeline,
  Settings,
  Menu as MenuIcon,
  Close,
} from '@mui/icons-material';
import { Collaboration } from '../../types';
import { ChatPanel } from '../molecules/ChatPanel';
import { DocumentsPanel } from '../molecules/DocumentsPanel';
import { DeliverablesPanel } from '../molecules/DeliverablesPanel';
import { TimelinePanel } from '../molecules/TimelinePanel';
import { VideoCallPanel } from '../molecules/VideoCallPanel';
import { CollaborationHeader } from '../molecules/CollaborationHeader';
import { useCollaborationWebSocket } from '../../hooks';

interface CollaborationWorkspaceProps {
  collaboration: Collaboration;
  onUpdateCollaboration: (updates: Partial<Collaboration>) => void;
  onClose?: () => void;
}

export const CollaborationWorkspace: FC<CollaborationWorkspaceProps> = ({
  collaboration,
  onUpdateCollaboration,
  onClose: _onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [activeCall, setActiveCall] = useState(false);
  
  const {
    isConnected: _isConnected,
    typingUsers,
    onlineUsers,
    sendTypingIndicator,
  } = useCollaborationWebSocket(collaboration.id);

  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
    if (newValue === 0) {
      setUnreadMessages(0);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const startVideoCall = () => {
    setActiveCall(true);
    setActiveTab(4); // Switch to video tab
  };

  const endVideoCall = () => {
    setActiveCall(false);
  };

  const sidebarContent = (
    <Box sx={{ width: isMobile ? 280 : 320, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CollaborationHeader
        collaboration={collaboration}
        onlineUsers={onlineUsers}
        onStartCall={startVideoCall}
        isCallActive={activeCall}
      />
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        orientation="vertical"
        sx={{ borderRight: 1, borderColor: 'divider', flex: 1 }}
      >
        <Tab
          icon={
            <Badge badgeContent={unreadMessages} color="error">
              <Chat />
            </Badge>
          }
          label="Chat"
          iconPosition="start"
          sx={{ justifyContent: 'flex-start' }}
        />
        <Tab
          icon={<Folder />}
          label="Documents"
          iconPosition="start"
          sx={{ justifyContent: 'flex-start' }}
        />
        <Tab
          icon={<Assignment />}
          label="Deliverables"
          iconPosition="start"
          sx={{ justifyContent: 'flex-start' }}
        />
        <Tab
          icon={<Timeline />}
          label="Timeline"
          iconPosition="start"
          sx={{ justifyContent: 'flex-start' }}
        />
        <Tab
          icon={
            <Badge variant="dot" invisible={!activeCall} color="success">
              <VideoCall />
            </Badge>
          }
          label="Video Call"
          iconPosition="start"
          sx={{ justifyContent: 'flex-start' }}
        />
        <Tab
          icon={<Settings />}
          label="Settings"
          iconPosition="start"
          sx={{ justifyContent: 'flex-start' }}
        />
      </Tabs>
      
      {isMobile && (
        <Box sx={{ p: 2 }}>
          <IconButton onClick={toggleDrawer} sx={{ ml: 'auto' }}>
            <Close />
          </IconButton>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Mobile Menu Button */}
      {isMobile && !drawerOpen && (
        <IconButton
          onClick={toggleDrawer}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1200,
            bgcolor: 'background.paper',
            boxShadow: 2,
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer}
          variant="temporary"
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Paper
          elevation={0}
          sx={{
            width: 320,
            height: '100%',
            borderRight: 1,
            borderColor: 'divider',
          }}
        >
          {sidebarContent}
        </Paper>
      )}

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Content Panels */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {activeTab === 0 && (
            <ChatPanel
              collaborationId={collaboration.id}
              typingUsers={typingUsers}
              onTyping={sendTypingIndicator}
              onNewMessage={() => setUnreadMessages(prev => prev + 1)}
            />
          )}
          
          {activeTab === 1 && (
            <DocumentsPanel
              documents={collaboration.documents}
              collaborationId={collaboration.id}
              onDocumentUpload={(doc) => {
                onUpdateCollaboration({
                  documents: [...collaboration.documents, doc],
                });
              }}
              onDocumentDelete={(docId) => {
                onUpdateCollaboration({
                  documents: collaboration.documents.filter(d => d.id !== docId),
                });
              }}
            />
          )}
          
          {activeTab === 2 && (
            <DeliverablesPanel
              deliverables={collaboration.deliverables}
              onUpdateDeliverable={(deliverableId, updates) => {
                const updated = collaboration.deliverables.map(d =>
                  d.id === deliverableId ? { ...d, ...updates } : d
                );
                onUpdateCollaboration({ deliverables: updated });
              }}
            />
          )}
          
          {activeTab === 3 && (
            <TimelinePanel
              collaboration={collaboration}
              milestones={collaboration.milestones}
            />
          )}
          
          {activeTab === 4 && (
            <VideoCallPanel
              collaborationId={collaboration.id}
              participants={[
                { id: collaboration.expertId, name: 'Expert', role: 'expert' },
                { id: collaboration.clientId, name: 'Client', role: 'client' },
              ]}
              isActive={activeCall}
              onEndCall={endVideoCall}
            />
          )}
          
          {activeTab === 5 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h5">Collaboration Settings</Typography>
              {/* Add settings content here */}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};