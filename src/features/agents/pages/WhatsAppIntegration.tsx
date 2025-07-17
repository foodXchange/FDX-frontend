import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  TextField,
  InputAdornment,
  Alert,
  useTheme,
  Paper,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  WhatsApp,
  Search,
  Add,
  Message,
  Schedule,
  Settings,
  TrendingUp,
  Send,
  DoneAll,
  Error,
  Business,
} from '@mui/icons-material';
import { useAgentStore } from '../store';
import { Lead } from '../types';
import WhatsAppChat from '../components/organisms/WhatsAppChat';

const WhatsAppIntegration: React.FC = () => {
  const theme = useTheme();
  const { leads, whatsappMessages } = useAgentStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [metrics, setMetrics] = useState({
    totalMessages: 0,
    responseRate: 0,
    avgResponseTime: 0,
    activeChats: 0,
  });

  useEffect(() => {
    calculateMetrics();
  }, [whatsappMessages]);

  const calculateMetrics = () => {
    const totalMessages = whatsappMessages.length;
    const outboundMessages = whatsappMessages.filter(msg => msg.direction === 'outbound');
    const inboundMessages = whatsappMessages.filter(msg => msg.direction === 'inbound');
    const responseRate = outboundMessages.length > 0 ? (inboundMessages.length / outboundMessages.length) * 100 : 0;
    
    // Calculate average response time (mock calculation)
    const avgResponseTime = 15; // minutes
    
    // Count active chats (leads with recent messages)
    const activeChats = new Set(
      whatsappMessages
        .filter(msg => {
          const msgDate = new Date(msg.timestamp);
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return msgDate > dayAgo;
        })
        .map(msg => msg.leadId)
    ).size;

    setMetrics({
      totalMessages,
      responseRate,
      avgResponseTime,
      activeChats,
    });
  };

  const getLeadMessages = (leadId: string) => {
    return whatsappMessages.filter(msg => msg.leadId === leadId);
  };

  const getLastMessage = (leadId: string) => {
    const messages = getLeadMessages(leadId).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return messages[0];
  };

  const getUnreadCount = (leadId: string) => {
    return getLeadMessages(leadId).filter(msg => 
      msg.direction === 'inbound' && msg.status !== 'read'
    ).length;
  };

  const filteredLeads = leads.filter(lead =>
    lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const leadsWithMessages = filteredLeads.filter(lead => 
    getLeadMessages(lead.id).length > 0
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
  }> = ({ title, value, icon, color = theme.palette.primary.main }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ bgcolor: color, mr: 2, width: 40, height: 40 }}>
            {icon}
          </Avatar>
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: theme.palette.success.main, width: 48, height: 48 }}>
              <WhatsApp />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                WhatsApp Integration
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your WhatsApp conversations with leads
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Settings
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="small"
              sx={{ textTransform: 'none' }}
            >
              New Chat
            </Button>
          </Box>
        </Box>

        {/* Metrics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Total Messages"
              value={metrics.totalMessages}
              icon={<Message />}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Response Rate"
              value={`${metrics.responseRate.toFixed(1)}%`}
              icon={<TrendingUp />}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Avg Response Time"
              value={`${metrics.avgResponseTime}m`}
              icon={<Schedule />}
              color={theme.palette.warning.main}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard
              title="Active Chats"
              value={metrics.activeChats}
              icon={<WhatsApp />}
              color={theme.palette.info.main}
            />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {/* Chat List */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            {/* Search */}
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Chat List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {leadsWithMessages.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    p: 3,
                    color: 'text.secondary',
                  }}
                >
                  <WhatsApp sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    No conversations yet
                  </Typography>
                  <Typography variant="body2" textAlign="center">
                    Start chatting with your leads to see conversations here
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {leadsWithMessages.map((lead) => {
                    const lastMessage = getLastMessage(lead.id);
                    const unreadCount = getUnreadCount(lead.id);
                    const isSelected = selectedLead?.id === lead.id;

                    return (
                      <ListItem
                        key={lead.id}
                        className={isSelected ? "Mui-selected" : ""}
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowChat(true);
                        }}
                        sx={{
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          '&.Mui-selected': {
                            backgroundColor: theme.palette.primary.light + '20',
                          },
                          cursor: 'pointer',
                        }}
                      >
                        <ListItemAvatar>
                          <Badge badgeContent={unreadCount} color="error">
                            <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                              <Business />
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                {lead.companyName}
                              </Typography>
                              {lastMessage && (
                                <Typography variant="caption" color="text.secondary">
                                  {formatTime(lastMessage.timestamp)}
                                </Typography>
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {lead.contactPerson}
                              </Typography>
                              {lastMessage && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  {lastMessage.direction === 'outbound' && (
                                    <>
                                      {lastMessage.status === 'read' ? (
                                        <DoneAll sx={{ fontSize: 14, color: 'primary.main' }} />
                                      ) : lastMessage.status === 'delivered' ? (
                                        <DoneAll sx={{ fontSize: 14, color: 'grey.500' }} />
                                      ) : lastMessage.status === 'failed' ? (
                                        <Error sx={{ fontSize: 14, color: 'error.main' }} />
                                      ) : (
                                        <Send sx={{ fontSize: 14, color: 'grey.500' }} />
                                      )}
                                    </>
                                  )}
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    noWrap
                                    sx={{ maxWidth: 150 }}
                                  >
                                    {lastMessage.content}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Chat Window */}
        <Grid size={{ xs: 12, md: 8 }}>
          {showChat && selectedLead ? (
            <WhatsAppChat
              lead={selectedLead}
              onClose={() => {
                setShowChat(false);
                setSelectedLead(null);
              }}
            />
          ) : (
            <Paper
              sx={{
                height: '70vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
              }}
            >
              <WhatsApp sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 1 }}>
                WhatsApp Business
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', maxWidth: 400 }}>
                Select a conversation from the list to start chatting with your leads through WhatsApp
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{ textTransform: 'none' }}
              >
                Start New Conversation
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Status Alert */}
      <Alert
        severity="info"
        sx={{ mt: 3 }}
        action={
          <Button color="inherit" size="small">
            Learn More
          </Button>
        }
      >
        <Typography variant="body2">
          <strong>WhatsApp Business API:</strong> Ensure your WhatsApp Business account is connected and verified to send messages to leads.
        </Typography>
      </Alert>
    </Container>
  );
};

export default WhatsAppIntegration;