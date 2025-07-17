import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Divider,
  useTheme,
  Badge,
} from '@mui/material';
import {
  MoreVert,
  Phone,
  WhatsApp,
  Email,
  LocationOn,
  AttachMoney,
  Add,
  Edit,
  Delete,
  Schedule,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { Lead, LeadStatus, CreateLeadRequest } from '../../types';
import { useAgentStore } from '../../store';
import { agentApi } from '../../services';

interface LeadColumn {
  id: LeadStatus;
  title: string;
  color: string;
  leads: Lead[];
}

const LeadKanban: React.FC = () => {
  const theme = useTheme();
  const { leads, setLeads, updateLead, addLead } = useAgentStore();
  
  const [columns, setColumns] = useState<LeadColumn[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [createFormData, setCreateFormData] = useState<CreateLeadRequest>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    businessType: 'restaurant',
    estimatedRevenue: 0,
    priority: 'medium',
    source: 'website',
    location: {
      city: '',
      state: '',
      address: '',
    },
    notes: '',
  });

  const leadStatuses: { status: LeadStatus; title: string; color: string }[] = [
    { status: 'new', title: 'New Leads', color: theme.palette.info.main },
    { status: 'contacted', title: 'Contacted', color: theme.palette.warning.main },
    { status: 'qualified', title: 'Qualified', color: theme.palette.primary.main },
    { status: 'proposal', title: 'Proposal Sent', color: theme.palette.secondary.main },
    { status: 'negotiation', title: 'Negotiating', color: theme.palette.warning.dark },
    { status: 'closed_won', title: 'Won', color: theme.palette.success.main },
    { status: 'closed_lost', title: 'Lost', color: theme.palette.error.main },
    { status: 'nurturing', title: 'Nurturing', color: theme.palette.grey[600] },
  ];

  useEffect(() => {
    organizeLeadsIntoColumns();
  }, [leads]);

  const organizeLeadsIntoColumns = () => {
    const newColumns: LeadColumn[] = leadStatuses.map(({ status, title, color }) => ({
      id: status,
      title,
      color,
      leads: leads.filter(lead => lead.status === status),
    }));
    setColumns(newColumns);
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const leadId = draggableId;
    const newStatus = destination.droppableId as LeadStatus;
    
    try {
      // Optimistically update the UI
      updateLead(leadId, { status: newStatus });
      
      // Update on the server
      await agentApi.updateLead(leadId, { status: newStatus });
    } catch (error) {
      // Revert on error
      const originalLead = leads.find(lead => lead.id === leadId);
      if (originalLead) {
        updateLead(leadId, { status: originalLead.status });
      }
      console.error('Failed to update lead status:', error);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, leadId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedLeadId(leadId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLeadId(null);
  };

  const handleEditLead = () => {
    const lead = leads.find(l => l.id === selectedLeadId);
    if (lead) {
      // TODO: Implement edit lead functionality
      console.log('Edit lead:', lead);
    }
    handleMenuClose();
  };

  const handleDeleteLead = async () => {
    if (selectedLeadId) {
      try {
        await agentApi.deleteLead(selectedLeadId);
        setLeads(leads.filter(lead => lead.id !== selectedLeadId));
      } catch (error) {
        console.error('Failed to delete lead:', error);
      }
    }
    handleMenuClose();
  };

  const handleCreateLead = async () => {
    try {
      setIsLoading(true);
      const newLead = await agentApi.createLead(createFormData);
      addLead(newLead);
      setIsCreateDialogOpen(false);
      setCreateFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        businessType: 'restaurant',
        estimatedRevenue: 0,
        priority: 'medium',
        source: 'website',
        location: {
          city: '',
          state: '',
          address: '',
        },
        notes: '',
      });
    } catch (error) {
      console.error('Failed to create lead:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const LeadCard: React.FC<{ lead: Lead; index: number }> = ({ lead, index }) => (
    <Draggable draggableId={lead.id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{
            mb: 2,
            cursor: 'grab',
            opacity: snapshot.isDragging ? 0.8 : 1,
            transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
            '&:hover': {
              boxShadow: theme.shadows[4],
            },
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                {lead.companyName}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuOpen(e, lead.id);
                }}
              >
                <MoreVert />
              </IconButton>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {lead.contactPerson}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 0.5 }}>
              <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {lead.location.city}, {lead.location.state}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 0.5 }}>
              <AttachMoney sx={{ fontSize: 14, color: 'success.main' }} />
              <Typography variant="body2" color="success.main">
                {formatCurrency(lead.estimatedRevenue)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Chip
                label={lead.priority}
                size="small"
                color={getPriorityColor(lead.priority) as any}
              />
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton size="small" color="primary">
                  <Phone sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton size="small" color="success">
                  <WhatsApp sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton size="small" color="info">
                  <Email sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          Lead Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsCreateDialogOpen(true)}
          sx={{ textTransform: 'none' }}
        >
          Add Lead
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 2 }}>
          {columns.map((column) => (
            <Box key={column.id} sx={{ minWidth: 300, flex: '0 0 300px' }}>
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 1,
                  backgroundColor: column.color,
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {column.title}
                </Typography>
                <Badge badgeContent={column.leads.length} color="secondary" />
              </Box>
              
              <Droppable droppableId={column.id}>
                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      minHeight: 500,
                      backgroundColor: snapshot.isDraggingOver ? theme.palette.grey[100] : 'transparent',
                      borderRadius: 1,
                      p: 1,
                    }}
                  >
                    {column.leads.map((lead, index) => (
                      <LeadCard key={lead.id} lead={lead} index={index} />
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Box>
          ))}
        </Box>
      </DragDropContext>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditLead}>
          <Edit sx={{ mr: 1 }} />
          Edit Lead
        </MenuItem>
        <MenuItem onClick={() => console.log('Schedule follow-up')}>
          <Schedule sx={{ mr: 1 }} />
          Schedule Follow-up
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteLead} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete Lead
        </MenuItem>
      </Menu>

      {/* Create Lead Dialog */}
      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Lead</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Company Name"
              value={createFormData.companyName}
              onChange={(e) => setCreateFormData({ ...createFormData, companyName: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Contact Person"
              value={createFormData.contactPerson}
              onChange={(e) => setCreateFormData({ ...createFormData, contactPerson: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={createFormData.email}
              onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Phone"
              value={createFormData.phone}
              onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Business Type</InputLabel>
              <Select
                value={createFormData.businessType}
                onChange={(e) => setCreateFormData({ ...createFormData, businessType: e.target.value as any })}
                label="Business Type"
              >
                <MenuItem value="restaurant">Restaurant</MenuItem>
                <MenuItem value="grocery">Grocery Store</MenuItem>
                <MenuItem value="catering">Catering</MenuItem>
                <MenuItem value="food_truck">Food Truck</MenuItem>
                <MenuItem value="bakery">Bakery</MenuItem>
                <MenuItem value="farm">Farm</MenuItem>
                <MenuItem value="distributor">Distributor</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Estimated Revenue"
              type="number"
              value={createFormData.estimatedRevenue}
              onChange={(e) => setCreateFormData({ ...createFormData, estimatedRevenue: Number(e.target.value) })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="City"
                value={createFormData.location.city}
                onChange={(e) => setCreateFormData({ 
                  ...createFormData, 
                  location: { ...createFormData.location, city: e.target.value }
                })}
                required
              />
              <TextField
                fullWidth
                label="State"
                value={createFormData.location.state}
                onChange={(e) => setCreateFormData({ 
                  ...createFormData, 
                  location: { ...createFormData.location, state: e.target.value }
                })}
                required
              />
            </Box>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={createFormData.notes}
              onChange={(e) => setCreateFormData({ ...createFormData, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateLead}
            variant="contained"
            disabled={isLoading || !createFormData.companyName || !createFormData.contactPerson}
          >
            Create Lead
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeadKanban;