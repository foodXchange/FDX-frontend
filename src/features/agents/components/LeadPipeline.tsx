import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { Grid } from '@mui/material';
import { Add as PlusIcon, Email as EmailIcon,  } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { format, differenceInDays } from 'date-fns';
import { Lead, LeadStatus } from '../types';
import { formatCurrency } from '@/utils/format';
import { PlusIcon } from '@heroicons/react/24/outline';

interface LeadPipelineProps {
  leads: Lead[];
  onLeadStatusChange: (leadId: string, newStatus: LeadStatus) => Promise<void>;
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => void;
  onAddActivity: (leadId: string, activity: string) => void;
}

interface PipelineStage {
  id: LeadStatus;
  title: string;
  color: string;
  description: string;
  actions: string[];
}

const pipelineStages: PipelineStage[] = [
  {
    id: 'new',
    title: 'New Leads',
    color: '#2196f3',
    description: 'Fresh opportunities',
    actions: ['Make first contact', 'Research business'],
  },
  {
    id: 'contacted',
    title: 'Contacted',
    color: '#ff9800',
    description: 'Initial outreach made',
    actions: ['Schedule follow-up', 'Send information'],
  },
  {
    id: 'qualified',
    title: 'Qualified',
    color: '#9c27b0',
    description: 'Verified interest',
    actions: ['Schedule demo', 'Prepare proposal'],
  },
  {
    id: 'proposal',
    title: 'Proposal',
    color: '#3f51b5',
    description: 'Proposal submitted',
    actions: ['Follow up on proposal', 'Address concerns'],
  },
  {
    id: 'negotiation',
    title: 'Negotiation',
    color: '#00bcd4',
    description: 'Terms discussion',
    actions: ['Finalize terms', 'Get approvals'],
  },
  {
    id: 'closed_won',
    title: 'Closed Won',
    color: '#4caf50',
    description: 'Deal closed successfully',
    actions: ['Process paperwork', 'Schedule onboarding'],
  },
];

export const LeadPipeline: React.FC<LeadPipelineProps> = ({
  leads,
  onLeadStatusChange,
  onLeadUpdate,
  onAddActivity,
}) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [activityText, setActivityText] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Group leads by status
  const leadsByStatus = useMemo(() => {
    const grouped = leads.reduce((acc, lead) => {
      const status = lead.status as LeadStatus;
      if (!acc[status]) acc[status] = [];
      acc[status].push(lead);
      return acc;
    }, {} as Record<LeadStatus, Lead[]>);

    // Sort leads within each status by priority and value
    Object.keys(grouped).forEach(status => {
      grouped[status as LeadStatus].sort((a, b) => {
        // Priority weight
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityWeight[a.priority] || 0;
        const bPriority = priorityWeight[b.priority] || 0;
        
        if (aPriority !== bPriority) return bPriority - aPriority;
        
        // Then by estimated revenue
        return (b.estimatedRevenue || 0) - (a.estimatedRevenue || 0);
      });
    });

    return grouped;
  }, [leads]);

  // Calculate pipeline metrics
  const pipelineMetrics = useMemo(() => {
    const totalValue = leads.reduce((sum, lead) => sum + (lead.estimatedRevenue || 0), 0);
    const avgDealSize = totalValue / (leads.length || 1);
    const conversionRate = leads.filter(l => l.status === 'closed_won').length / (leads.length || 1) * 100;
    const avgCycleTime = leads
      .filter(l => l.status === 'closed_won')
      .reduce((sum, lead) => {
        const days = differenceInDays(new Date(lead.updatedAt), new Date(lead.createdAt));
        return sum + days;
      }, 0) / (leads.filter(l => l.status === 'closed_won').length || 1);

    return {
      totalValue,
      avgDealSize,
      conversionRate,
      avgCycleTime,
      stageMetrics: pipelineStages.map(stage => ({
        stage: stage.id,
        count: leadsByStatus[stage.id]?.length || 0,
        value: leadsByStatus[stage.id]?.reduce((sum, lead) => sum + (lead.estimatedRevenue || 0), 0) || 0,
      })),
    };
  }, [leads, leadsByStatus]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as LeadStatus;
    
    await onLeadStatusChange(draggableId, newStatus);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, lead: Lead) => {
    setAnchorEl(event.currentTarget);
    setSelectedLead(lead);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetails = () => {
    setDetailDialogOpen(true);
    handleMenuClose();
  };

  const handleAddActivity = () => {
    setActivityDialogOpen(true);
    handleMenuClose();
  };

  const handleActivitySubmit = () => {
    if (selectedLead && activityText) {
      onAddActivity(selectedLead.id, activityText);
      if (followUpDate) {
        onLeadUpdate(selectedLead.id, { followUpDate });
      }
      setActivityText('');
      setFollowUpDate('');
      setActivityDialogOpen(false);
    }
  };

  const getLeadAge = (lead: Lead) => {
    return differenceInDays(new Date(), new Date(lead.createdAt));
  };

  const getLeadHealthScore = (lead: Lead) => {
    const age = getLeadAge(lead);
    const hasRecentActivity = lead.activities.some(
      a => differenceInDays(new Date(), new Date(a.createdAt)) < 7
    );
    const hasFollowUp = lead.followUpDate && new Date(lead.followUpDate) > new Date();
    
    if (age > 30 && !hasRecentActivity) return 'poor';
    if (age > 14 && !hasRecentActivity) return 'fair';
    if (hasFollowUp && hasRecentActivity) return 'excellent';
    return 'good';
  };

  return (
    <Box>
      {/* Pipeline Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Pipeline Value
              </Typography>
              <Typography variant="h5">
                {formatCurrency(pipelineMetrics.totalValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Average Deal Size
              </Typography>
              <Typography variant="h5">
                {formatCurrency(pipelineMetrics.avgDealSize)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Conversion Rate
              </Typography>
              <Typography variant="h5">
                {pipelineMetrics.conversionRate.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Avg. Sales Cycle
              </Typography>
              <Typography variant="h5">
                {Math.round(pipelineMetrics.avgCycleTime)} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pipeline Stages */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
          {pipelineStages.map((stage) => {
            const stageLeads = leadsByStatus[stage.id] || [];
            const stageMetric = pipelineMetrics.stageMetrics.find(m => m.stage === stage.id);

            return (
              <Paper
                key={stage.id}
                sx={{
                  minWidth: 300,
                  flex: '0 0 auto',
                  bgcolor: 'grey.50',
                }}
              >
                {/* Stage Header */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: stage.color,
                    color: 'white',
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {stage.title}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={`${stageMetric?.count || 0} leads`}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    />
                    <Typography variant="body2">
                      {formatCurrency(stageMetric?.value || 0)}
                    </Typography>
                  </Box>
                </Box>

                {/* Stage Content */}
                <Droppable droppableId={stage.id}>
                  {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        minHeight: 400,
                        p: 2,
                        bgcolor: snapshot.isDraggingOver ? 'action.hover' : 'transparent',
                      }}
                    >
                      {stageLeads.map((lead, index) => {
                        const age = getLeadAge(lead);
                        const health = getLeadHealthScore(lead);

                        return (
                          <Draggable key={lead.id} draggableId={lead.id} index={index}>
                            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                sx={{
                                  mb: 2,
                                  cursor: 'grab',
                                  opacity: snapshot.isDragging ? 0.8 : 1,
                                  transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                                }}
                              >
                                <CardContent>
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                    <Box {...provided.dragHandleProps} sx={{ mr: 1 }}>
                                      <DragIcon fontSize="small" color="action" />
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }}>
                                      <Typography variant="subtitle1" noWrap>
                                        {lead.companyName}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" noWrap>
                                        {lead.contactPerson}
                                      </Typography>
                                    </Box>
                                    <IconButton size="small" onClick={(e) => handleMenuClick(e, lead)}>
                                      <MoreIcon fontSize="small" />
                                    </IconButton>
                                  </Box>

                                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <Chip
                                      size="small"
                                      icon={<MoneyIcon />}
                                      label={formatCurrency(lead.estimatedRevenue || 0)}
                                      variant="outlined"
                                    />
                                    <Chip
                                      size="small"
                                      icon={<FlagIcon />}
                                      label={lead.priority}
                                      color={lead.priority === 'urgent' ? 'error' : lead.priority === 'high' ? 'warning' : 'default'}
                                    />
                                  </Box>

                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                      {health === 'poor' && (
                                        <Tooltip title="Lead needs attention">
                                          <WarningIcon color="error" fontSize="small" />
                                        </Tooltip>
                                      )}
                                      {health === 'excellent' && (
                                        <Tooltip title="Healthy lead">
                                          <CheckIcon color="success" fontSize="small" />
                                        </Tooltip>
                                      )}
                                      {lead.followUpDate && (
                                        <Tooltip title={`Follow up: ${format(new Date(lead.followUpDate), 'PP')}`}>
                                          <EventIcon color="primary" fontSize="small" />
                                        </Tooltip>
                                      )}
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                      {age} days old
                                    </Typography>
                                  </Box>

                                  {/* Progress Indicator */}
                                  <Box sx={{ mt: 2 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={lead.matchScore || 0}
                                      sx={{ height: 4, borderRadius: 2 }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                      {lead.matchScore || 0}% match score
                                    </Typography>
                                  </Box>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}

                      {/* Add Lead Button */}
                      {stage.id === 'new' && (
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<PlusIcon />}
                          sx={{ mt: 1 }}
                        >
                          Add New Lead
                        </Button>
                      )}
                    </Box>
                  )}
                </Droppable>
              </Paper>
            );
          })}
        </Box>
      </DragDropContext>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <TimeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAddActivity}>
          <ListItemIcon>
            <PlusIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Activity</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => selectedLead && onAddActivity(selectedLead.id, 'Call scheduled')}>
          <ListItemIcon>
            <PhoneIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Schedule Call</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedLead && onAddActivity(selectedLead.id, 'Email sent')}>
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Send Email</ListItemText>
        </MenuItem>
      </Menu>

      {/* Lead Details Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedLead?.companyName} - Lead Details
        </DialogTitle>
        <DialogContent>
          {selectedLead && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Contact Person
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedLead.contactPerson}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estimated Value
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatCurrency(selectedLead.estimatedRevenue || 0)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Priority
                  </Typography>
                  <Chip label={selectedLead.priority} color="primary" size="small" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Lead Age
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {getLeadAge(selectedLead)} days
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <List>
                {selectedLead.activities.slice(0, 5).map((activity) => (
                  <ListItem key={activity.id}>
                    <ListItemIcon>
                      {activity.type === 'call' && <PhoneIcon />}
                      {activity.type === 'email' && <EmailIcon />}
                      {activity.type === 'meeting' && <EventIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={format(new Date(activity.createdAt), 'PPp')}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Activity Dialog */}
      <Dialog
        open={activityDialogOpen}
        onClose={() => setActivityDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Activity</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Activity Description"
              value={activityText}
              onChange={(e) => setActivityText(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="date"
              label="Follow-up Date (optional)"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivityDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleActivitySubmit} variant="contained">
            Add Activity
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};