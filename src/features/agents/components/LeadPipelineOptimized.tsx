import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
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
import { Add as AddIcon, Email as EmailIcon,  } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { format, differenceInDays } from 'date-fns';
import { FixedSizeList } from 'react-window';
import { throttle } from 'lodash';
import { Lead, LeadStatus } from '../types';
import { formatCurrency } from '@/utils/format';

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

// Memoized Lead Card Component
const LeadCard = memo<{
  lead: Lead;
  index: number;
  onMenuClick: (event: React.MouseEvent<HTMLElement>, lead: Lead) => void;
}>(({ lead, index, onMenuClick }) => {
  const age = useMemo(() => differenceInDays(new Date(), new Date(lead.createdAt)), [lead.createdAt]);
  
  const health = useMemo(() => {
    const hasRecentActivity = lead.activities.some(
      a => differenceInDays(new Date(), new Date(a.createdAt)) < 7
    );
    const hasFollowUp = lead.followUpDate && new Date(lead.followUpDate) > new Date();
    
    if (age > 30 && !hasRecentActivity) return 'poor';
    if (age > 14 && !hasRecentActivity) return 'fair';
    if (hasFollowUp && hasRecentActivity) return 'excellent';
    return 'good';
  }, [age, lead.activities, lead.followUpDate]);

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            mb: 2,
            cursor: 'grab',
            opacity: snapshot.isDragging ? 0.8 : 1,
            transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
              <Box {...provided.dragHandleProps} sx={{ mr: 1 }}>
                <DragIcon fontSize="small" color="action" />
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" noWrap>
                  {lead.companyName}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {lead.contactPerson}
                </Typography>
              </Box>
              <IconButton size="small" onClick={(e) => onMenuClick(e, lead)}>
                <MoreIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
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
});

LeadCard.displayName = 'LeadCard';

// Memoized Pipeline Metrics Component
const PipelineMetrics = memo<{
  metrics: {
    totalValue: number;
    avgDealSize: number;
    conversionRate: number;
    avgCycleTime: number;
  };
}>(({ metrics }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
    <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
      <Card>
        <CardContent>
          <Typography color="text.secondary" gutterBottom>
            Total Pipeline Value
          </Typography>
          <Typography variant="h5">
            {formatCurrency(metrics.totalValue)}
          </Typography>
        </CardContent>
      </Card>
    </Box>
    <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
      <Card>
        <CardContent>
          <Typography color="text.secondary" gutterBottom>
            Average Deal Size
          </Typography>
          <Typography variant="h5">
            {formatCurrency(metrics.avgDealSize)}
          </Typography>
        </CardContent>
      </Card>
    </Box>
    <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
      <Card>
        <CardContent>
          <Typography color="text.secondary" gutterBottom>
            Conversion Rate
          </Typography>
          <Typography variant="h5">
            {metrics.conversionRate.toFixed(1)}%
          </Typography>
        </CardContent>
      </Card>
    </Box>
    <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
      <Card>
        <CardContent>
          <Typography color="text.secondary" gutterBottom>
            Avg. Sales Cycle
          </Typography>
          <Typography variant="h5">
            {Math.round(metrics.avgCycleTime)} days
          </Typography>
        </CardContent>
      </Card>
    </Box>
  </Box>
));

PipelineMetrics.displayName = 'PipelineMetrics';

// Virtualized Stage Column for many leads
const VirtualizedStageColumn: React.FC<{
  leads: Lead[];
  stage: PipelineStage;
  onMenuClick: (event: React.MouseEvent<HTMLElement>, lead: Lead) => void;
}> = ({ leads, onMenuClick }) => {
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const lead = leads[index];
    return (
      <div style={style}>
        <LeadCard lead={lead} index={index} onMenuClick={onMenuClick} />
      </div>
    );
  }, [leads, onMenuClick]);

  if (leads.length > 10) {
    return (
      <FixedSizeList
        height={400}
        itemCount={leads.length}
        itemSize={200}
        width="100%"
      >
        {Row}
      </FixedSizeList>
    );
  }

  return (
    <>
      {leads.map((lead, index) => (
        <LeadCard key={lead.id} lead={lead} index={index} onMenuClick={onMenuClick} />
      ))}
    </>
  );
};

export const LeadPipelineOptimized: React.FC<LeadPipelineProps> = ({
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
  const [isDragging, setIsDragging] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Group and sort leads by status with memoization
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
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityWeight[a.priority] || 0;
        const bPriority = priorityWeight[b.priority] || 0;
        
        if (aPriority !== bPriority) return bPriority - aPriority;
        return (b.estimatedRevenue || 0) - (a.estimatedRevenue || 0);
      });
    });

    return grouped;
  }, [leads]);

  // Calculate pipeline metrics with memoization
  const pipelineMetrics = useMemo(() => {
    const totalValue = leads.reduce((sum, lead) => sum + (lead.estimatedRevenue || 0), 0);
    const avgDealSize = totalValue / (leads.length || 1);
    const wonLeads = leads.filter(l => l.status === 'closed_won');
    const conversionRate = (wonLeads.length / (leads.length || 1)) * 100;
    
    const avgCycleTime = wonLeads.length > 0
      ? wonLeads.reduce((sum, lead) => {
          const days = differenceInDays(new Date(lead.updatedAt), new Date(lead.createdAt));
          return sum + days;
        }, 0) / wonLeads.length
      : 0;

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

  // Throttled drag handler for better performance
  const handleDragEnd = useCallback(
    throttle(async (result: DropResult) => {
      setIsDragging(false);
      if (!result.destination) return;

      const { draggableId, destination } = result;
      const newStatus = destination.droppableId as LeadStatus;
      
      await onLeadStatusChange(draggableId, newStatus);
    }, 100),
    [onLeadStatusChange]
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMenuClick = useCallback((event: React.MouseEvent<HTMLElement>, lead: Lead) => {
    setAnchorEl(event.currentTarget);
    setSelectedLead(lead);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleViewDetails = useCallback(() => {
    setDetailDialogOpen(true);
    handleMenuClose();
  }, [handleMenuClose]);

  const handleAddActivity = useCallback(() => {
    setActivityDialogOpen(true);
    handleMenuClose();
  }, [handleMenuClose]);

  const handleActivitySubmit = useCallback(() => {
    if (selectedLead && activityText) {
      onAddActivity(selectedLead.id, activityText);
      if (followUpDate) {
        onLeadUpdate(selectedLead.id, { followUpDate });
      }
      setActivityText('');
      setFollowUpDate('');
      setActivityDialogOpen(false);
    }
  }, [selectedLead, activityText, followUpDate, onAddActivity, onLeadUpdate]);

  // Horizontal scroll with arrow keys
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        container.scrollLeft -= 300;
      } else if (e.key === 'ArrowRight') {
        container.scrollLeft += 300;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Box>
      {/* Pipeline Metrics */}
      <PipelineMetrics metrics={pipelineMetrics} />

      {/* Pipeline Stages */}
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <Box 
          ref={scrollContainerRef}
          sx={{ 
            display: 'flex', 
            gap: 2, 
            overflowX: 'auto', 
            pb: 2,
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'grey.200',
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'grey.400',
              borderRadius: 4,
              '&:hover': {
                bgcolor: 'grey.500',
              },
            },
          }}
        >
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
                  opacity: isDragging ? 0.95 : 1,
                  transition: 'opacity 0.2s',
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
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
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
                        maxHeight: 600,
                        overflowY: 'auto',
                        p: 2,
                        bgcolor: snapshot.isDraggingOver ? 'action.hover' : 'transparent',
                      }}
                    >
                      {stageLeads.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No leads in this stage
                          </Typography>
                        </Box>
                      ) : (
                        <VirtualizedStageColumn
                          leads={stageLeads}
                          stage={stage}
                          onMenuClick={handleMenuClick}
                        />
                      )}
                      {provided.placeholder}

                      {/* Add Lead Button */}
                      {stage.id === 'new' && (
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<AddIcon />}
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
            <AddIcon fontSize="small" />
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
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%', minWidth: 0 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Contact Person
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedLead.contactPerson}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%', minWidth: 0 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estimated Value
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatCurrency(selectedLead.estimatedRevenue || 0)}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 45%', minWidth: 0 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Priority
                  </Typography>
                  <Chip label={selectedLead.priority} color="primary" size="small" />
                </Box>
                <Box sx={{ flex: '1 1 45%', minWidth: 0 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Lead Age
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {differenceInDays(new Date(), new Date(selectedLead.createdAt))} days
                  </Typography>
                </Box>
              </Box>

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