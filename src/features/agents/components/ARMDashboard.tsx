import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tab,
  Tabs,
  Card,
  CardContent,
  IconButton,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon,
  Phone as PhoneIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  Event as EventIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAgentStore } from '../store/useAgentStore';
import { LeadActivity, LeadNote, WhatsAppMessage, WhatsAppTemplate, LeadStatus } from '../types';
import { LeadPipeline } from './LeadPipeline';
import { RelationshipTimeline } from './RelationshipTimeline';
import { CommunicationCenter } from './CommunicationCenter';
import { formatCurrency } from '../../../utils/format';

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
      id={`arm-tabpanel-${index}`}
      aria-labelledby={`arm-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const ARMDashboard: React.FC = () => {
  const {
    currentAgent: agent,
    leads,
    selectedLead,
    setSelectedLead,
    updateLead,
    addNotification,
  } = useAgentStore();

  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration - replace with actual API calls
  const [activities] = useState<LeadActivity[]>([
    {
      id: '1',
      leadId: '1',
      agentId: agent?.id || '1',
      type: 'call',
      description: 'Initial discovery call - discussed their monthly dairy needs',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      leadId: '1',
      agentId: agent?.id || '1',
      type: 'email',
      description: 'Sent product catalog and pricing information',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      leadId: '1',
      agentId: agent?.id || '1',
      type: 'proposal_sent',
      description: 'Submitted customized proposal for monthly supply contract',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const [notes] = useState<LeadNote[]>([
    {
      id: '1',
      leadId: '1',
      agentId: agent?.id || '1',
      content: 'Key decision maker is the procurement manager. Prefers email communication.',
      type: 'general',
      isPrivate: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      leadId: '1',
      agentId: agent?.id || '1',
      content: 'They have a strong preference for organic products. Price is secondary to quality.',
      type: 'meeting',
      isPrivate: false,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const [messages] = useState<WhatsAppMessage[]>([
    {
      id: '1',
      leadId: '1',
      agentId: agent?.id || '1',
      direction: 'outbound',
      type: 'text',
      content: 'Hi! I wanted to follow up on the proposal we sent yesterday. Do you have any questions?',
      status: 'delivered',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      leadId: '1',
      agentId: agent?.id || '1',
      direction: 'inbound',
      type: 'text',
      content: 'Thanks for the proposal. We are reviewing it and will get back to you by tomorrow.',
      status: 'read',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const [templates] = useState<WhatsAppTemplate[]>([
    {
      id: '1',
      name: 'Initial Contact',
      category: 'marketing',
      language: 'en',
      status: 'approved',
      components: [
        {
          type: 'body',
          text: 'Hi {{1}}, I\'m {{2}} from FDX. I noticed your business could benefit from our wholesale food distribution services. Would you be interested in learning more?',
        },
      ],
      createdAt: new Date().toISOString(),
    },
  ]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleLeadStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    setIsLoading(true);
    try {
      // API call would go here
      updateLead(leadId, { status: newStatus });
      addNotification({
        id: Date.now().toString(),
        agentId: agent?.id || '',
        type: 'lead_update',
        title: 'Lead Updated',
        message: `Lead status changed to ${newStatus}`,
        isRead: false,
        priority: 'medium',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddActivity = (leadId: string, activity: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      const newActivity: LeadActivity = {
        id: Date.now().toString(),
        leadId,
        agentId: agent?.id || '',
        type: 'note_added',
        description: activity,
        createdAt: new Date().toISOString(),
      };
      updateLead(leadId, {
        activities: [...lead.activities, newActivity],
      });
    }
  };

  const handleSendMessage = async (
    channel: 'email' | 'whatsapp' | 'sms',
    content: string,
    templateId?: string
  ) => {
    console.log('Sending message:', { channel, content, templateId });
    // API call would go here
  };

  const handleScheduleMessage = async (
    channel: string,
    content: string,
    scheduledAt: Date
  ) => {
    console.log('Scheduling message:', { channel, content, scheduledAt });
    // API call would go here
  };

  const handleCallInitiated = (phoneNumber: string) => {
    console.log('Initiating call to:', phoneNumber);
    // Integration with calling system would go here
  };

  const handleAddNote = (note: string, type: LeadNote['type']) => {
    if (selectedLead) {
      const newNote: LeadNote = {
        id: Date.now().toString(),
        leadId: selectedLead.id,
        agentId: agent?.id || '',
        content: note,
        type,
        isPrivate: false,
        createdAt: new Date().toISOString(),
      };
      // Add note to the lead
      console.log('Adding note:', newNote);
    }
  };

  const handleRefreshData = () => {
    setIsLoading(true);
    // Refresh data from API
    setTimeout(() => setIsLoading(false), 1000);
  };

  // Calculate relationship metrics
  const relationshipMetrics = {
    totalRelationships: leads.length,
    activeRelationships: leads.filter(l => 
      ['contacted', 'qualified', 'proposal', 'negotiation'].includes(l.status)
    ).length,
    newThisWeek: leads.filter(l => 
      new Date(l.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    needsAttention: leads.filter(l => {
      const lastActivity = l.activities[l.activities.length - 1];
      if (!lastActivity) return true;
      const daysSinceLastActivity = 
        (Date.now() - new Date(lastActivity.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLastActivity > 7;
    }).length,
  };

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Agent Relationship Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefreshData} disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {/* Open add lead dialog */}}
            >
              Add New Lead
            </Button>
          </Box>
        </Box>

        {/* Metrics Cards */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Relationships
                    </Typography>
                    <Typography variant="h4">
                      {relationshipMetrics.totalRelationships}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <PeopleIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Active Deals
                    </Typography>
                    <Typography variant="h4">
                      {relationshipMetrics.activeRelationships}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <TrendingUpIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      New This Week
                    </Typography>
                    <Typography variant="h4">
                      {relationshipMetrics.newThisWeek}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <EventIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Needs Attention
                    </Typography>
                    <Typography variant="h4">
                      {relationshipMetrics.needsAttention}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <WarningIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Main Content Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="ARM dashboard tabs">
            <Tab 
              icon={<DashboardIcon />} 
              label="Pipeline View" 
              iconPosition="start"
            />
            <Tab 
              icon={<TimelineIcon />} 
              label="Relationship Timeline" 
              iconPosition="start"
              disabled={!selectedLead}
            />
            <Tab 
              icon={<PhoneIcon />} 
              label="Communication" 
              iconPosition="start"
              disabled={!selectedLead}
            />
          </Tabs>
        </Box>

        {/* Pipeline View */}
        <TabPanel value={activeTab} index={0}>
          <LeadPipeline
            leads={leads}
            onLeadStatusChange={handleLeadStatusChange}
            onLeadUpdate={updateLead}
            onAddActivity={handleAddActivity}
          />
        </TabPanel>

        {/* Relationship Timeline */}
        <TabPanel value={activeTab} index={1}>
          {selectedLead ? (
            <Box>
              {/* Lead Header */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Typography variant="h5" gutterBottom>
                      {selectedLead.companyName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {selectedLead.contactPerson} • {selectedLead.email} • {selectedLead.phone}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Chip
                        label={selectedLead.status}
                        color="primary"
                        size="small"
                      />
                      <Chip
                        label={selectedLead.priority}
                        color={selectedLead.priority === 'urgent' ? 'error' : 'default'}
                        size="small"
                      />
                      <Chip
                        icon={<MoneyIcon />}
                        label={formatCurrency(selectedLead.estimatedRevenue || 0)}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary">
                        Lead Score
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 1 }}>
                        <Typography variant="h4" sx={{ mr: 1 }}>
                          {selectedLead.matchScore}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={selectedLead.matchScore}
                          sx={{ width: 100, height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              <RelationshipTimeline
                lead={selectedLead}
                activities={activities}
                notes={notes}
                onAddNote={handleAddNote}
              />
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                Select a lead from the pipeline to view relationship timeline
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Communication Center */}
        <TabPanel value={activeTab} index={2}>
          {selectedLead ? (
            <CommunicationCenter
              lead={selectedLead}
              messages={messages}
              templates={templates}
              onSendMessage={handleSendMessage}
              onScheduleMessage={handleScheduleMessage}
              onCallInitiated={handleCallInitiated}
            />
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                Select a lead from the pipeline to access communication tools
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Paper>

      {/* Leads Requiring Attention */}
      {relationshipMetrics.needsAttention > 0 && (
        <Paper sx={{ mt: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Leads Requiring Attention
          </Typography>
          <List>
            {leads
              .filter(lead => {
                const lastActivity = lead.activities[lead.activities.length - 1];
                if (!lastActivity) return true;
                const daysSinceLastActivity = 
                  (Date.now() - new Date(lastActivity.createdAt).getTime()) / (1000 * 60 * 60 * 24);
                return daysSinceLastActivity > 7;
              })
              .slice(0, 5)
              .map((lead) => (
                <ListItem
                  key={lead.id}
                  onClick={() => {
                    setSelectedLead(lead);
                    setActiveTab(1);
                  }}
                  sx={{ cursor: 'pointer' }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <WarningIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={lead.companyName}
                    secondary={`No activity for ${Math.floor(
                      (Date.now() - new Date(lead.activities[lead.activities.length - 1]?.createdAt || lead.createdAt).getTime()) / 
                      (1000 * 60 * 60 * 24)
                    )} days`}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={lead.status}
                      size="small"
                      variant="outlined"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
          </List>
        </Paper>
      )}
    </Container>
  );
};