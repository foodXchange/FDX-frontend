import React, { memo } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  Box,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { Lead } from '../../../types';

interface LeadsRequiringAttentionProps {
  leads: Lead[];
  onLeadSelect: (lead: Lead) => void;
}

const getDaysSinceContact = (lastContact: Date) => {
  const days = Math.floor((Date.now() - new Date(lastContact).getTime()) / (1000 * 60 * 60 * 24));
  return days;
};

const getPriorityColor = (days: number): 'error' | 'warning' => {
  return days > 14 ? 'error' : 'warning';
};

export const LeadsRequiringAttention = memo<LeadsRequiringAttentionProps>(({
  leads,
  onLeadSelect,
}) => {
  if (leads.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          All leads are up to date!
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <WarningIcon color="warning" />
        <Typography variant="h6">Leads Requiring Attention</Typography>
      </Box>
      <List>
        {leads.map((lead) => {
          const daysSinceContact = getDaysSinceContact(lead.lastContact);
          return (
            <ListItem 
              key={lead.id} 
              button 
              onClick={() => onLeadSelect(lead)}
              sx={{ 
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.dark' }}>
                  {lead.company[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={lead.company}
                secondary={
                  <React.Fragment>
                    <Typography component="span" variant="body2" color="text.primary">
                      {lead.contactPerson}
                    </Typography>
                    {' — '}No contact for {daysSinceContact} days
                  </React.Fragment>
                }
              />
              <ListItemSecondaryAction>
                <Chip 
                  label={`${daysSinceContact}d`} 
                  size="small" 
                  color={getPriorityColor(daysSinceContact)}
                />
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
});