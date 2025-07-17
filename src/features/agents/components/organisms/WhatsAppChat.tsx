import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  Chip,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  useTheme,
  Badge,
  Paper,
  InputAdornment,
} from '@mui/material';
import { Send, AttachFile, MoreVert, Phone, VideoCall, Info, Check, DoneAll, Schedule, WhatsApp, Close,  } from '@mui/icons-material';
import { useAgentStore } from '../../store';
import { agentApi } from '../../services';
import { WhatsAppMessage, WhatsAppTemplate, Lead } from '../../types';

interface WhatsAppChatProps {
  lead: Lead;
  onClose?: () => void;
}

const WhatsAppChat: React.FC<WhatsAppChatProps> = ({ lead, onClose }) => {
  const theme = useTheme();
  const { whatsappMessages, addWhatsAppMessage } = useAgentStore();
  
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [templateParams, setTemplateParams] = useState<Record<string, string>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessages = whatsappMessages.filter(msg => msg.leadId === lead.id);

  useEffect(() => {
    loadMessages();
    loadTemplates();
  }, [lead.id]);

  useEffect(() => {
    setMessages(chatMessages);
    scrollToBottom();
  }, [chatMessages]);

  const loadMessages = async () => {
    try {
      const leadMessages = await agentApi.getWhatsAppMessages(lead.id);
      setMessages(leadMessages);
    } catch (error) {
      console.error('Failed to load WhatsApp messages:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const availableTemplates = await agentApi.getWhatsAppTemplates();
      setTemplates(availableTemplates);
    } catch (error) {
      console.error('Failed to load WhatsApp templates:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setIsLoading(true);
      const message = await agentApi.sendWhatsAppMessage({
        leadId: lead.id,
        message: newMessage,
      });
      
      addWhatsAppMessage(message);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setIsLoading(true);
      const message = await agentApi.sendWhatsAppMessage({
        leadId: lead.id,
        message: '', // Will be populated from template
        templateId: selectedTemplate.id,
        parameters: templateParams,
      });
      
      addWhatsAppMessage(message);
      setShowTemplates(false);
      setSelectedTemplate(null);
      setTemplateParams({});
    } catch (error) {
      console.error('Failed to send WhatsApp template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const getMessageStatus = (message: WhatsAppMessage) => {
    switch (message.status) {
      case 'sent':
        return <Check sx={{ fontSize: 16, color: 'grey.500' }} />;
      case 'delivered':
        return <DoneAll sx={{ fontSize: 16, color: 'grey.500' }} />;
      case 'read':
        return <DoneAll sx={{ fontSize: 16, color: 'primary.main' }} />;
      case 'failed':
        return <Schedule sx={{ fontSize: 16, color: 'error.main' }} />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const MessageBubble: React.FC<{ message: WhatsAppMessage }> = ({ message }) => {
    const isOutbound = message.direction === 'outbound';
    
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: isOutbound ? 'flex-end' : 'flex-start',
          mb: 1,
        }}
      >
        <Paper
          sx={{
            p: 1.5,
            maxWidth: '70%',
            backgroundColor: isOutbound ? theme.palette.primary.main : theme.palette.grey[100],
            color: isOutbound ? 'white' : 'text.primary',
            borderRadius: 2,
            borderTopLeftRadius: !isOutbound ? 0.5 : 2,
            borderTopRightRadius: isOutbound ? 0.5 : 2,
          }}
        >
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            {message.content}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: isOutbound ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                fontSize: '0.7rem',
              }}
            >
              {formatTime(message.timestamp)}
            </Typography>
            {isOutbound && getMessageStatus(message)}
          </Box>
        </Paper>
      </Box>
    );
  };

  const TemplateDialog: React.FC = () => (
    <Dialog
      open={showTemplates}
      onClose={() => setShowTemplates(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          WhatsApp Templates
          <IconButton onClick={() => setShowTemplates(false)}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {selectedTemplate ? (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {selectedTemplate.name}
            </Typography>
            <Box sx={{ mb: 2 }}>
              {selectedTemplate.components.map((component, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  {component.type === 'body' && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {component.text}
                    </Typography>
                  )}
                  {component.parameters?.map((_, paramIndex) => (
                    <TextField
                      key={paramIndex}
                      fullWidth
                      size="small"
                      label={`Parameter ${paramIndex + 1}`}
                      value={templateParams[`param_${paramIndex}`] || ''}
                      onChange={(e) =>
                        setTemplateParams({
                          ...templateParams,
                          [`param_${paramIndex}`]: e.target.value,
                        })
                      }
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={() => setSelectedTemplate(null)}>Back</Button>
              <Button variant="contained" onClick={sendTemplate} disabled={isLoading}>
                Send Template
              </Button>
            </Box>
          </Box>
        ) : (
          <List>
            {templates.map((template) => (
              <ListItem
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemText
                  primary={template.name}
                  secondary={`${template.category} • ${template.language}`}
                />
                <Chip
                  label={template.status}
                  size="small"
                  color={template.status === 'approved' ? 'success' : 'warning'}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <Card sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: theme.palette.success.main }}>
              <WhatsApp />
            </Avatar>
            <Box>
              <Typography variant="h6">{lead.companyName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {lead.contactPerson}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton>
              <Phone />
            </IconButton>
            <IconButton>
              <VideoCall />
            </IconButton>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>
      </CardContent>

      <Divider />

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          backgroundColor: theme.palette.grey[50],
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary',
            }}
          >
            <WhatsApp sx={{ fontSize: 48, mb: 2 }} />
            <Typography>No messages yet</Typography>
            <Typography variant="body2">Start a conversation with your lead</Typography>
          </Box>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      <Divider />

      {/* Input */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <IconButton
            onClick={() => setShowTemplates(true)}
            color="primary"
          >
            <Template />
          </IconButton>
          <IconButton>
            <AttachFile />
          </IconButton>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    <Emoji />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <IconButton
            onClick={sendMessage}
            disabled={!newMessage.trim() || isLoading}
            color="primary"
            size="large"
          >
            <Send />
          </IconButton>
        </Box>
      </Box>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem>
          <Info sx={{ mr: 1 }} />
          Contact Info
        </MenuItem>
        <MenuItem>
          <Badge badgeContent={5} color="error">
            <Schedule sx={{ mr: 1 }} />
          </Badge>
          Schedule Message
        </MenuItem>
        <Divider />
        <MenuItem onClick={onClose}>
          <Close sx={{ mr: 1 }} />
          Close Chat
        </MenuItem>
      </Menu>

      <TemplateDialog />
    </Card>
  );
};

export default WhatsAppChat;