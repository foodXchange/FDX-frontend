import React, { useState, useEffect, useRef } from 'react';
import { FC, useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  InputAdornment,
  CircularProgress,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Send,
  AttachFile,
  EmojiEmotions,
  MoreVert,
  Edit,
  Delete,
  Reply,
} from '@mui/icons-material';
import { format, isToday, isYesterday } from 'date-fns';
import { useCollaboration } from '../../hooks';
import { Message } from '../../types';

interface ChatPanelProps {
  collaborationId: string;
  typingUsers: string[];
  onTyping: () => void;
  onNewMessage?: () => void;
}

export const ChatPanel: FC<ChatPanelProps> = ({
  collaborationId,
  typingUsers,
  onTyping,
  onNewMessage,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  const {
    messages,
    loading,
    hasMoreMessages,
    sendMessage,
    loadMessages,
    markMessageAsRead,
  } = useCollaboration(collaborationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      await sendMessage(message.trim());
      setMessage('');
      setReplyTo(null);
      onNewMessage?.();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      onTyping();
    }
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMessageMenu = (event: React.MouseEvent<HTMLElement>, message: Message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return `Yesterday ${format(date, 'HH:mm')}`;
    return format(date, 'MMM d, HH:mm');
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(msg => {
      const date = format(new Date(msg.timestamp), 'yyyy-MM-dd');
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Messages Container */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {loading && messages.length === 0 ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {hasMoreMessages && (
              <Box textAlign="center" mb={2}>
                <Chip
                  label="Load earlier messages"
                  onClick={() => loadMessages()}
                  clickable
                  size="small"
                />
              </Box>
            )}
            
            {Object.entries(messageGroups).map(([date, msgs]) => (
              <Box key={date}>
                <Box display="flex" justifyContent="center" my={2}>
                  <Chip
                    label={
                      isToday(new Date(date))
                        ? 'Today'
                        : isYesterday(new Date(date))
                        ? 'Yesterday'
                        : format(new Date(date), 'MMMM d, yyyy')
                    }
                    size="small"
                    variant="outlined"
                  />
                </Box>
                
                {msgs.map((msg) => {
                  const isOwnMessage = msg.senderId === 'current-user'; // TODO: Get from auth
                  
                  return (
                    <Box
                      key={msg.id}
                      display="flex"
                      justifyContent={isOwnMessage ? 'flex-end' : 'flex-start'}
                      mb={2}
                      onMouseEnter={() => !msg.isRead && markMessageAsRead(msg.id)}
                    >
                      <Box
                        display="flex"
                        gap={1}
                        maxWidth="70%"
                        flexDirection={isOwnMessage ? 'row-reverse' : 'row'}
                      >
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {msg.senderId[0].toUpperCase()}
                        </Avatar>
                        
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: isOwnMessage ? 'primary.main' : 'grey.100',
                            color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
                            position: 'relative',
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="start" gap={2}>
                            <Box flex={1}>
                              <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                                {msg.content}
                              </Typography>
                              
                              {msg.attachments && msg.attachments.length > 0 && (
                                <Box mt={1}>
                                  {msg.attachments.map((attachment, index) => (
                                    <Chip
                                      key={index}
                                      label={attachment.name}
                                      size="small"
                                      icon={<AttachFile />}
                                      onClick={() => window.open(attachment.url)}
                                      sx={{ mr: 0.5, mb: 0.5 }}
                                    />
                                  ))}
                                </Box>
                              )}
                              
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'block',
                                  mt: 0.5,
                                  opacity: 0.7,
                                }}
                              >
                                {formatMessageDate(msg.timestamp)}
                                {msg.editedAt && ' (edited)'}
                              </Typography>
                            </Box>
                            
                            <IconButton
                              size="small"
                              onClick={(e) => handleMessageMenu(e, msg)}
                              sx={{
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                '.MuiPaper-root:hover &': {
                                  opacity: 1,
                                },
                              }}
                            >
                              <MoreVert fontSize="small" />
                            </IconButton>
                          </Box>
                        </Paper>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ))}
            
            {typingUsers.length > 0 && (
              <Box display="flex" alignItems="center" gap={1} p={2}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </Typography>
              </Box>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Reply Preview */}
      {replyTo && (
        <Paper sx={{ p: 2, mx: 2, mb: 1 }} variant="outlined">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="caption" color="text.secondary">
                Replying to
              </Typography>
              <Typography variant="body2" noWrap>
                {replyTo.content}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setReplyTo(null)}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}

      {/* Message Input */}
      <Paper sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          variant="outlined"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small">
                  <AttachFile />
                </IconButton>
                <IconButton size="small">
                  <EmojiEmotions />
                </IconButton>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                >
                  <Send />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Message Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            setReplyTo(selectedMessage);
            handleMenuClose();
          }}
        >
          <Reply fontSize="small" sx={{ mr: 1 }} />
          Reply
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};