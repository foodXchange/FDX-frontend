import React, { useState, useCallback, memo } from 'react';
import { Container, Paper, Tabs, Tab, Box, LinearProgress } from '@mui/material';
import { useAgentStore } from '../../store/useAgentStore';
import { Lead } from '../../types';
import { formatCurrency } from '../../../../utils/format';

// Components
import { TabPanel } from './components/TabPanel';
import { ARMDashboardHeader } from './components/ARMDashboardHeader';
import { RelationshipMetricsCards } from './components/RelationshipMetricsCards';
import { LeadDetailsHeader } from './components/LeadDetailsHeader';
import { LeadsRequiringAttention } from './components/LeadsRequiringAttention';
import { LeadPipeline } from '../LeadPipeline';
import { RelationshipTimeline } from '../RelationshipTimeline';
import { CommunicationCenter } from '../CommunicationCenter';

// Hooks
import { useRelationshipMetrics } from './hooks/useRelationshipMetrics';

const ATTENTION_THRESHOLD_DAYS = 7;

const ARMDashboardComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  const {
    leads,
    activities,
    notes,
    messages,
    templates,
    isLoading,
    addActivity,
    addNote,
    sendWhatsAppMessage,
    refreshData,
  } = useAgentStore();

  // Calculate metrics
  const metrics = useRelationshipMetrics(leads, activities);

  // Get leads requiring attention
  const leadsRequiringAttention = leads.filter(lead => {
    const daysSinceContact = Math.floor(
      (Date.now() - new Date(lead.lastContact).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceContact > ATTENTION_THRESHOLD_DAYS && 
           lead.status !== 'converted' && 
           lead.status !== 'lost';
  });

  // Handlers
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const handleAddLead = useCallback(() => {
    // TODO: Implement add lead modal
    console.log('Add lead');
  }, []);

  const handleLeadSelect = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setActiveTab(0); // Switch to pipeline view
  }, []);

  const handleActivityAdd = useCallback((leadId: string, activity: Partial<any>) => {
    addActivity(leadId, activity);
  }, [addActivity]);

  const handleNoteAdd = useCallback((leadId: string, note: string) => {
    addNote(leadId, note);
  }, [addNote]);

  const handleMessageSend = useCallback((leadId: string, message: string, templateId?: string) => {
    sendWhatsAppMessage(leadId, message, templateId);
  }, [sendWhatsAppMessage]);

  // Filter data for selected lead
  const selectedLeadActivities = selectedLead 
    ? activities.filter(a => a.leadId === selectedLead.id)
    : activities;
  
  const selectedLeadNotes = selectedLead
    ? notes.filter(n => n.leadId === selectedLead.id)
    : notes;
  
  const selectedLeadMessages = selectedLead
    ? messages.filter(m => m.leadId === selectedLead.id)
    : messages;

  return (
    <Container maxWidth="xl">
      {isLoading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}
      
      <ARMDashboardHeader
        isLoading={isLoading}
        onRefresh={handleRefresh}
        onAddLead={handleAddLead}
      />
      
      <RelationshipMetricsCards metrics={metrics} />
      
      {selectedLead && (
        <LeadDetailsHeader 
          lead={selectedLead} 
          formatCurrency={formatCurrency}
        />
      )}
      
      <Paper sx={{ mt: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Lead Pipeline" />
          <Tab label="Relationship Timeline" />
          <Tab label="Communication Center" />
          <Tab label="Needs Attention" />
        </Tabs>
        
        <TabPanel value={activeTab} index={0}>
          <LeadPipeline 
            leads={selectedLead ? [selectedLead] : leads}
            onLeadSelect={handleLeadSelect}
            onStatusChange={(leadId, status) => {
              // TODO: Implement status change
              console.log('Status change:', leadId, status);
            }}
          />
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <RelationshipTimeline
            activities={selectedLeadActivities}
            notes={selectedLeadNotes}
            onActivityAdd={selectedLead ? (activity) => handleActivityAdd(selectedLead.id, activity) : undefined}
            onNoteAdd={selectedLead ? (note) => handleNoteAdd(selectedLead.id, note) : undefined}
          />
        </TabPanel>
        
        <TabPanel value={activeTab} index={2}>
          <CommunicationCenter
            messages={selectedLeadMessages}
            templates={templates}
            onSendMessage={selectedLead ? (message, templateId) => handleMessageSend(selectedLead.id, message, templateId) : undefined}
            selectedLead={selectedLead}
          />
        </TabPanel>
        
        <TabPanel value={activeTab} index={3}>
          <LeadsRequiringAttention
            leads={leadsRequiringAttention}
            onLeadSelect={handleLeadSelect}
          />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export const ARMDashboard = memo(ARMDashboardComponent);