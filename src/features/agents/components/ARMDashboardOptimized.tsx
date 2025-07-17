import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense, memo } from 'react';
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
  Skeleton,
  Alert,
  Snackbar,
} from '@mui/material';
import { Timeline as TimelineIcon, Refresh as RefreshIcon, Add as AddIcon,  } from '@mui/icons-material';
import { useAgentStore } from '../store/useAgentStore';
import { Lead, LeadActivity, LeadNote, WhatsAppMessage, WhatsAppTemplate, LeadStatus } from '../types';
import { formatCurrency } from '@/utils/format';
import { usePerformanceMonitor, useOperationMonitor } from '../hooks/usePerformanceMonitor';

// Lazy load heavy components
const LeadPipelineOptimized = lazy(() => 
  import('./LeadPipelineOptimized').then(module => ({ 
    default: module.LeadPipelineOptimized 
  }))
);

const RelationshipTimelineOptimized = lazy(() => 
  import('./RelationshipTimelineOptimized').then(module => ({ 
    default: module.RelationshipTimelineOptimized 
  }))
);

const CommunicationCenter = lazy(() => 
  import('./CommunicationCenter').then(module => ({ 
    default: module.CommunicationCenter 
  }))
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = memo<TabPanelProps>(({ children, value, index, ...other }) => {
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
});

TabPanel.displayName = 'TabPanel';

// Memoized metric card component
const MetricCard = memo<{
  title: string;
  value: number | string;
  icon: React.ReactElement;
  color: string;
}>(({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4">
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: `${color}.main` }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
));

MetricCard.displayName = 'MetricCard';

// Memoized attention lead item
const AttentionLeadItem = memo<{
  lead: Lead;
  daysSinceActivity: number;
  onClick: () => void;
}>(({ lead, daysSinceActivity, onClick }) => (
  <ListItem onClick={onClick} sx={{ cursor: 'pointer' }}>
    <ListItemAvatar>
      <Avatar>
        <WarningIcon />
      </Avatar>
    </ListItemAvatar>
    <ListItemText
      primary={lead.companyName}
      secondary={`No activity for ${daysSinceActivity} days`}
    />
    <ListItemSecondaryAction>
      <Chip
        label={lead.status}
        size="small"
        variant="outlined"
      />
    </ListItemSecondaryAction>
  </ListItem>
));

AttentionLeadItem.displayName = 'AttentionLeadItem';

export const ARMDashboardOptimized: React.FC = () => {
  const {
    currentAgent,
    leads,
    selectedLead,
    setSelectedLead,
    updateLead,
    addNotification,
  } = useAgentStore();

  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Performance monitoring
  const { getPerformanceSummary } = usePerformanceMonitor('ARMDashboard');
  const { startOperation, endOperation } = useOperationMonitor();

  // Mock data - in production, these would be fetched from API
  const [activities] = useState<LeadActivity[]>([]);
  const [notes] = useState<LeadNote[]>([]);
  const [messages] = useState<WhatsAppMessage[]>([]);
  const [templates] = useState<WhatsAppTemplate[]>([]);

  // Memoized calculations
  const relationshipMetrics = useMemo(() => {
    const totalRelationships = leads.length;
    const activeRelationships = leads.filter(l => 
      ['contacted', 'qualified', 'proposal', 'negotiation'].includes(l.status)
    ).length;
    const newThisWeek = leads.filter(l => 
      new Date(l.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    const needsAttention = leads.filter(l => {
      const lastActivity = l.activities[l.activities.length - 1];
      if (!lastActivity) return true;
      const daysSinceLastActivity = 
        (Date.now() - new Date(lastActivity.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLastActivity > 7;
    });

    return {
      totalRelationships,
      activeRelationships,
      newThisWeek,
      needsAttention: needsAttention.length,
      attentionLeads: needsAttention.slice(0, 5),
    };
  }, [leads]);

  // Callbacks
  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    startOperation('tab-change');
    setActiveTab(newValue);
    endOperation('tab-change');
  }, [startOperation, endOperation]);

  const handleLeadStatusChange = useCallback(async (leadId: string, newStatus: LeadStatus) => {
    setIsLoading(true);
    startOperation('lead-status-update');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateLead(leadId, { status: newStatus });
      addNotification({
        id: Date.now().toString(),
        agentId: currentAgent?.id || '',
        type: 'lead_update',
        title: 'Lead Updated',
        message: `Lead status changed to ${newStatus}`,
        isRead: false,
        priority: 'medium',
        createdAt: new Date().toISOString(),
      });
      
      setSnackbarOpen(true);
    } catch (err) {
      setError('Failed to update lead status');
    } finally {
      setIsLoading(false);
      endOperation('lead-status-update');
    }
  }, [currentAgent, updateLead, addNotification, startOperation, endOperation]);

  const handleAddActivity = useCallback((leadId: string, activity: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      const newActivity: LeadActivity = {
        id: Date.now().toString(),
        leadId,
        agentId: currentAgent?.id || '',
        type: 'note_added',
        description: activity,
        createdAt: new Date().toISOString(),
      };
      updateLead(leadId, {
        activities: [...lead.activities, newActivity],
      });
    }
  }, [leads, currentAgent, updateLead]);

  const handleSendMessage = useCallback(async (
    channel: 'email' | 'whatsapp' | 'sms',
    content: string,
    templateId?: string
  ) => {
    startOperation('send-message');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Message sent:', { channel, content, templateId });
      setSnackbarOpen(true);
    } catch (err) {
      setError('Failed to send message');
    } finally {
      endOperation('send-message');
    }
  }, [startOperation, endOperation]);

  const handleScheduleMessage = useCallback(async (
    channel: string,
    content: string,
    scheduledAt: Date
  ) => {
    console.log('Scheduling message:', { channel, content, scheduledAt });
    // API call would go here
  }, []);

  const handleCallInitiated = useCallback((phoneNumber: string) => {
    console.log('Initiating call to:', phoneNumber);
    // Integration with calling system would go here
  }, []);

  const handleAddNote = useCallback((note: string, type: LeadNote['type']) => {
    if (selectedLead) {
      const newNote: LeadNote = {
        id: Date.now().toString(),
        leadId: selectedLead.id,
        agentId: currentAgent?.id || '',
        content: note,
        type,
        isPrivate: false,
        createdAt: new Date().toISOString(),
      };
      console.log('Adding note:', newNote);
    }
  }, [selectedLead, currentAgent]);

  const handleRefreshData = useCallback(async () => {
    setIsLoading(true);
    startOperation('refresh-data');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSnackbarOpen(true);
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
      endOperation('refresh-data');
    }
  }, [startOperation, endOperation]);

  const handleSelectLead = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setActiveTab(1);
  }, [setSelectedLead]);

  // Log performance on unmount
  useEffect(() => {
    return () => {
      const summary = getPerformanceSummary();
      if (summary) {
        console.log('[Performance Summary]', summary);
      }
    };
  }, [getPerformanceSummary]);

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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <MetricCard
              title="Total Relationships"
              value={relationshipMetrics.totalRelationships}
              icon={<PeopleIcon />}
              color="primary"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <MetricCard
              title="Active Deals"
              value={relationshipMetrics.activeRelationships}
              icon={<TrendingUpIcon />}
              color="success"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <MetricCard
              title="New This Week"
              value={relationshipMetrics.newThisWeek}
              icon={<EventIcon />}
              color="info"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <MetricCard
              title="Needs Attention"
              value={relationshipMetrics.needsAttention}
              icon={<WarningIcon />}
              color="warning"
            />
          </Box>
        </Box>
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
          <Suspense fallback={
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress />
              <Typography sx={{ mt: 2 }}>Loading pipeline...</Typography>
            </Box>
          }>
            <LeadPipelineOptimized
              leads={leads}
              onLeadStatusChange={handleLeadStatusChange}
              onLeadUpdate={updateLead}
              onAddActivity={handleAddActivity}
            />
          </Suspense>
        </TabPanel>

        {/* Relationship Timeline */}
        <TabPanel value={activeTab} index={1}>
          {selectedLead ? (
            <Box>
              {/* Lead Header */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 60%', minWidth: 0 }}>
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
                  </Box>
                  <Box sx={{ flex: '1 1 30%', minWidth: 0 }}>
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
                  </Box>
                </Box>
              </Paper>

              <Suspense fallback={
                <Box sx={{ p: 4 }}>
                  <Skeleton variant="rectangular" height={400} />
                </Box>
              }>
                <RelationshipTimelineOptimized
                  lead={selectedLead}
                  activities={activities}
                  notes={notes}
                  onAddNote={handleAddNote}
                />
              </Suspense>
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
            <Suspense fallback={
              <Box sx={{ p: 4 }}>
                <Skeleton variant="rectangular" height={400} />
              </Box>
            }>
              <CommunicationCenter
                lead={selectedLead}
                messages={messages}
                templates={templates}
                onSendMessage={handleSendMessage}
                onScheduleMessage={handleScheduleMessage}
                onCallInitiated={handleCallInitiated}
              />
            </Suspense>
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
            {relationshipMetrics.attentionLeads.map((lead) => {
              const lastActivity = lead.activities[lead.activities.length - 1];
              const daysSinceActivity = Math.floor(
                (Date.now() - new Date(lastActivity?.createdAt || lead.createdAt).getTime()) / 
                (1000 * 60 * 60 * 24)
              );
              
              return (
                <AttentionLeadItem
                  key={lead.id}
                  lead={lead}
                  daysSinceActivity={daysSinceActivity}
                  onClick={() => handleSelectLead(lead)}
                />
              );
            })}
          </List>
        </Paper>
      )}

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          Operation completed successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};