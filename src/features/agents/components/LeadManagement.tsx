import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Container,
  Stack,
  Divider,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import { Refresh as ArrowPathIcon, Email as EnvelopeIcon } from '@mui/icons-material';
import { useAgentStore } from '../store/useAgentStore';
import { Lead } from '../types';
import { LeadCard } from './LeadCard';
import { AgentRFQList } from './AgentRFQList';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

type ViewMode = 'kanban' | 'list';
type LeadStatus = Lead['status'];

const statusColumns: { status: LeadStatus; label: string; color: 'primary' | 'warning' | 'secondary' | 'success' | 'error' }[] = [
  { status: 'claimed', label: 'New', color: 'primary' },
  { status: 'contacted', label: 'Contacted', color: 'warning' },
  { status: 'negotiating', label: 'Negotiating', color: 'secondary' },
  { status: 'won', label: 'Won', color: 'success' },
  { status: 'lost', label: 'Lost', color: 'error' }
];

export const LeadManagement: React.FC = () => {
  const { leads, updateLead } = useAgentStore();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [activeTab, setActiveTab] = useState<'available' | 'active'>('available');
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  // Mock data - replace with actual store properties
  const availableLeads = leads.filter((lead: any) => lead.status === 'new' || lead.status === 'available');
  const myLeads = leads.filter((lead: any) => lead.status !== 'new' && lead.status !== 'available');

  // Filter leads by status for Kanban columns
  const getLeadsByStatus = (status: LeadStatus) => {
    return myLeads.filter((lead: any) => lead.status === status);
  };

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault();
    if (draggedLead && draggedLead.status !== newStatus) {
      updateLead(draggedLead.id, { status: newStatus });
    }
    setDraggedLead(null);
  };

  const handleQuickAction = (leadId: string, action: 'whatsapp' | 'call' | 'email') => {
    // Handle quick actions
    console.log(`${action} action for lead ${leadId}`);
    // In real implementation, this would open WhatsApp, initiate call, or compose email
  };

  const renderKanbanView = () => (
    <Grid container spacing={2}>
      {statusColumns.map(column => (
        <Grid item xs={12} md={2.4} key={column.status}>
          <Card sx={{ height: '100%', minHeight: 600 }}>
            <CardContent sx={{ pb: 1 }}>
              {/* Column Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h3" sx={{ color: 'grey.900' }}>
                  {column.label}
                </Typography>
                <Chip
                  label={getLeadsByStatus(column.status).length}
                  color={column.color}
                  size="small"
                />
              </Box>
              
              <Divider sx={{ mb: 2 }} />

              {/* Column Content */}
              <Box
                sx={{ 
                  bgcolor: 'grey.50', 
                  borderRadius: 1, 
                  minHeight: 400,
                  p: 1
                }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.status)}
              >
                <Stack spacing={2}>
                  <AnimatePresence>
                    {getLeadsByStatus(column.status).map((lead: any) => (
                      <motion.div
                        key={lead.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <Card 
                          sx={{ 
                            cursor: 'grab',
                            '&:hover': { boxShadow: 3 },
                            '&:active': { cursor: 'grabbing' }
                          }}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead)}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Typography variant="subtitle2" sx={{ color: 'grey.900', mb: 1 }}>
                              {lead.rfqTitle}
                            </Typography>
                            <Typography variant="body2" color="grey.600" sx={{ mb: 1 }}>
                              {lead.buyerName}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="caption" color="grey.500">
                                {lead.buyerLocation}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                ${lead.estimatedCommission}
                              </Typography>
                            </Box>

                            {/* Quick Actions */}
                            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mb: 1 }}>
                              <Tooltip title="WhatsApp">
                                <IconButton
                                  size="small"
                                  onClick={() => handleQuickAction(lead.id, 'whatsapp')}
                                  sx={{ color: 'success.main' }}
                                >
                                  <ChatBubbleLeftRightIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Call">
                                <IconButton
                                  size="small"
                                  onClick={() => handleQuickAction(lead.id, 'call')}
                                  sx={{ color: 'primary.main' }}
                                >
                                  <PhoneIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Email">
                                <IconButton
                                  size="small"
                                  onClick={() => handleQuickAction(lead.id, 'email')}
                                  sx={{ color: 'grey.600' }}
                                >
                                  <EnvelopeIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>

                            {/* Progress indicator */}
                            {column.status === 'negotiating' && (
                              <Box sx={{ mt: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="caption" color="grey.600">
                                    Progress
                                  </Typography>
                                  <Typography variant="caption" color="grey.600">
                                    60%
                                  </Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={60} sx={{ borderRadius: 1 }} />
                              </Box>
                            )}

                            {/* Notes preview */}
                            {lead.notes && lead.notes.length > 0 && (
                              <Typography 
                                variant="caption" 
                                color="grey.500" 
                                sx={{ 
                                  mt: 1, 
                                  fontStyle: 'italic',
                                  display: '-webkit-box',
                                  overflow: 'hidden',
                                  WebkitBoxOrient: 'vertical',
                                  WebkitLineClamp: 2,
                                }}
                              >
                                "{lead.notes[0].content}"
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Empty state */}
                  {getLeadsByStatus(column.status).length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="grey.400">
                        No leads in {column.label.toLowerCase()}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderListView = () => (
    <Stack spacing={2}>
      {myLeads.map((lead: any) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          variant="claimed"
          onView={(id) => console.log('View lead:', id)}
        />
      ))}
    </Stack>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ color: 'grey.900', fontWeight: 'bold' }}>
            Lead Management
          </Typography>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title="Refresh">
              <IconButton
                onClick={() => window.location.reload()}
                sx={{ color: 'grey.600' }}
              >
                <ArrowPathIcon />
              </IconButton>
            </Tooltip>
            
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              sx={{ minWidth: 400 }}
            >
              <Tab 
                label={`Available Leads (${availableLeads.length})`} 
                value="available" 
              />
              <Tab 
                label={`My Active Leads (${myLeads.length})`} 
                value="active" 
              />
            </Tabs>
          </Stack>
        </Box>

        {/* Content */}
        {activeTab === 'available' ? (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="body1" color="grey.600">
                Browse and claim leads that match your expertise
              </Typography>
              <Button 
                variant="text" 
                color="primary"
                endIcon={<SettingsIcon />}
              >
                Set Preferences
              </Button>
            </Box>
            
            {/* Mock RFQ data for available leads */}
            <AgentRFQList
              rfqs={availableLeads.map((lead: any) => ({
                id: lead.id,
                title: lead.rfqTitle,
                description: `Looking for suppliers of ${lead.category} products`,
                category: lead.category,
                buyerName: lead.buyerName,
                buyerLocation: lead.buyerLocation,
                estimatedValue: lead.estimatedValue,
                createdAt: new Date(),
                expiresAt: new Date(lead.expiresAt),
                status: 'open'
              }))}
            />
          </Box>
        ) : (
          <Box>
            {/* View Mode Toggle */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="body1" color="grey.600">
                Manage your active leads through the sales pipeline
              </Typography>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" color="grey.600">
                  View:
                </Typography>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setViewMode(newMode)}
                  size="small"
                >
                  <ToggleButton value="kanban" aria-label="kanban view">
                    <ViewKanbanIcon fontSize="small" sx={{ mr: 1 }} />
                    Kanban
                  </ToggleButton>
                  <ToggleButton value="list" aria-label="list view">
                    <ViewListIcon fontSize="small" sx={{ mr: 1 }} />
                    List
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Box>

            {/* Active Leads View */}
            {viewMode === 'kanban' ? renderKanbanView() : renderListView()}
          </Box>
        )}
      </Stack>
    </Container>
  );
};