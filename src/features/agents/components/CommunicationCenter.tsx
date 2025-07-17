import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Badge,
  Divider,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Sms as SmsIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Schedule as ScheduleIcon,
  Description as TemplateIcon,
  History as HistoryIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Lead, WhatsAppMessage, WhatsAppTemplate } from '../types';

interface CommunicationCenterProps {
  lead: Lead;
  messages: WhatsAppMessage[];
  templates: WhatsAppTemplate[];
  onSendMessage: (channel: 'email' | 'whatsapp' | 'sms', content: string, templateId?: string) => Promise<void>;
  onScheduleMessage: (channel: string, content: string, scheduledAt: Date) => Promise<void>;
  onCallInitiated: (phoneNumber: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`communication-tabpanel-${index}`}
      aria-labelledby={`communication-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const CommunicationCenter: React.FC<CommunicationCenterProps> = ({
  lead,
  messages,
  templates,
  onSendMessage,
  onScheduleMessage,
  onCallInitiated,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [messageContent, setMessageContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;

    const channel = activeTab === 0 ? 'email' : activeTab === 1 ? 'whatsapp' : 'sms';
    await onSendMessage(channel, messageContent, selectedTemplate || undefined);
    setMessageContent('');
    setSelectedTemplate('');
  };

  const handleSchedule = async () => {
    if (!messageContent.trim() || !scheduleDate || !scheduleTime) return;

    const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`);
    const channel = activeTab === 0 ? 'email' : activeTab === 1 ? 'whatsapp' : 'sms';
    await onScheduleMessage(channel, messageContent, scheduledAt);
    
    setScheduleDialogOpen(false);
    setMessageContent('');
    setScheduleDate('');
    setScheduleTime('');
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const bodyComponent = template.components.find(c => c.type === 'body');
      if (bodyComponent?.text) {
        setMessageContent(bodyComponent.text);
      }
    }
    setTemplateDialogOpen(false);
  };

  const toggleFavoriteTemplate = (templateId: string) => {
    setFavoriteTemplates(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const getMessageStats = () => {
    const emailCount = messages.filter(m => m.type === 'text').length;
    const whatsappCount = messages.filter(m => m.direction === 'outbound').length;
    const lastMessage = messages[0];
    
    return {
      totalMessages: messages.length,
      emailCount,
      whatsappCount,
      lastMessageDate: lastMessage ? new Date(lastMessage.timestamp) : null,
    };
  };

  const stats = getMessageStats();

  return (
    <Paper sx={{ width: '100%' }}>
      {/* Header with Stats */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Communication Center
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<HistoryIcon />}
            label={`${stats.totalMessages} total messages`}
            size="small"
            variant="outlined"
          />
          {stats.lastMessageDate && (
            <Chip
              label={`Last contact: ${format(stats.lastMessageDate, 'PPp')}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="communication channels">
          <Tab 
            icon={<EmailIcon />} 
            label="Email" 
            iconPosition="start"
          />
          <Tab 
            icon={
              <Badge badgeContent={stats.whatsappCount} color="primary">
                <WhatsAppIcon />
              </Badge>
            } 
            label="WhatsApp" 
            iconPosition="start"
          />
          <Tab 
            icon={<SmsIcon />} 
            label="SMS" 
            iconPosition="start"
          />
          <Tab 
            icon={<PhoneIcon />} 
            label="Call" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Email Tab */}
      <TabPanel value={activeTab} index={0}>
        <Box>
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder="Type your email message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <IconButton size="small">
                <AttachFileIcon />
              </IconButton>
              <Tooltip title="Use template">
                <IconButton size="small" onClick={() => setTemplateDialogOpen(true)}>
                  <TemplateIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<ScheduleIcon />}
                onClick={() => setScheduleDialogOpen(true)}
              >
                Schedule
              </Button>
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                onClick={handleSendMessage}
                disabled={!messageContent.trim()}
              >
                Send Email
              </Button>
            </Box>
          </Box>
        </Box>
      </TabPanel>

      {/* WhatsApp Tab */}
      <TabPanel value={activeTab} index={1}>
        <Box>
          {/* Recent Messages */}
          <Box sx={{ mb: 3, maxHeight: 300, overflow: 'auto' }}>
            <Typography variant="subtitle2" gutterBottom>
              Recent Messages
            </Typography>
            <List>
              {messages.slice(0, 5).map((message) => (
                <ListItem key={message.id} alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>
                      {message.direction === 'outbound' ? 'You' : lead.contactPerson[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={message.content}
                    secondary={
                      <>
                        {format(new Date(message.timestamp), 'PPp')}
                        {message.status && (
                          <Chip
                            label={message.status}
                            size="small"
                            sx={{ ml: 1 }}
                            color={message.status === 'delivered' ? 'success' : 'default'}
                          />
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Message Input */}
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Type your WhatsApp message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          {/* Quick Templates */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Quick Templates
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {templates
                .filter(t => t.status === 'approved' && favoriteTemplates.includes(t.id))
                .slice(0, 3)
                .map((template) => (
                  <Chip
                    key={template.id}
                    label={template.name}
                    onClick={() => handleTemplateSelect(template.id)}
                    onDelete={() => toggleFavoriteTemplate(template.id)}
                    deleteIcon={<StarIcon />}
                    variant="outlined"
                  />
                ))}
              <Chip
                label="View all templates"
                onClick={() => setTemplateDialogOpen(true)}
                variant="outlined"
                color="primary"
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ScheduleIcon />}
              onClick={() => setScheduleDialogOpen(true)}
            >
              Schedule
            </Button>
            <Button
              variant="contained"
              color="success"
              endIcon={<WhatsAppIcon />}
              onClick={handleSendMessage}
              disabled={!messageContent.trim()}
            >
              Send WhatsApp
            </Button>
          </Box>
        </Box>
      </TabPanel>

      {/* SMS Tab */}
      <TabPanel value={activeTab} index={2}>
        <Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Type your SMS message (160 characters)..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            inputProps={{ maxLength: 160 }}
            sx={{ mb: 2 }}
            helperText={`${messageContent.length}/160 characters`}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ScheduleIcon />}
              onClick={() => setScheduleDialogOpen(true)}
            >
              Schedule
            </Button>
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSendMessage}
              disabled={!messageContent.trim()}
            >
              Send SMS
            </Button>
          </Box>
        </Box>
      </TabPanel>

      {/* Call Tab */}
      <TabPanel value={activeTab} index={3}>
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Primary Phone
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {lead.phone}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Best Time to Call
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    9:00 AM - 5:00 PM (Local Time)
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={<PhoneIcon />}
                onClick={() => onCallInitiated(lead.phone)}
                fullWidth
              >
                Initiate Call
              </Button>
            </CardActions>
          </Card>

          {/* Call Script Suggestions */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Call Script Suggestions
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Introduction"
                  secondary={`Hi ${lead.contactPerson}, this is [Your Name] from FDX. I'm reaching out regarding...`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Value Proposition"
                  secondary="I noticed your business could benefit from our streamlined food distribution platform..."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Next Steps"
                  secondary="Would you be available for a 15-minute demo this week to see how FDX can help your business?"
                />
              </ListItem>
            </List>
          </Box>
        </Box>
      </TabPanel>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)}>
        <DialogTitle>Schedule Message</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="date"
              label="Date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="time"
              label="Time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSchedule} variant="contained">
            Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Dialog */}
      <Dialog 
        open={templateDialogOpen} 
        onClose={() => setTemplateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Select Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            {templates.map((template) => (
              <Grid size={{ xs: 12, md: 6 }} key={template.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {template.name}
                      </Typography>
                      <IconButton 
                        size="small"
                        onClick={() => toggleFavoriteTemplate(template.id)}
                      >
                        {favoriteTemplates.includes(template.id) ? <StarIcon /> : <StarBorderIcon />}
                      </IconButton>
                    </Box>
                    <Chip 
                      label={template.category} 
                      size="small" 
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {template.components.find(c => c.type === 'body')?.text || 'No preview available'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      Use Template
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};