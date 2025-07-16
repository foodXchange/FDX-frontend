import { FC } from 'react';
import {
  Box,
  Paper,
  Typography,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Button,
} from '@mui/material';
import {
  CheckCircle,
  RadioButtonUnchecked,
  Flag,
  AttachMoney,
  Assignment,
  Message,
  InsertDriveFile,
  VideoCall,
  Star,
} from '@mui/icons-material';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { Collaboration, Milestone } from '../../types';

interface TimelinePanelProps {
  collaboration: Collaboration;
  milestones: Milestone[];
}

interface TimelineEvent {
  id: string;
  type: 'milestone' | 'message' | 'document' | 'payment' | 'meeting' | 'review';
  title: string;
  description?: string;
  date: string;
  status?: 'completed' | 'pending' | 'upcoming';
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'grey';
}

export const TimelinePanel: FC<TimelinePanelProps> = ({
  collaboration,
  milestones,
}) => {
  // Generate timeline events from various sources
  const generateTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // Add start event
    events.push({
      id: 'start',
      type: 'milestone',
      title: 'Collaboration Started',
      description: collaboration.description,
      date: collaboration.startDate,
      status: 'completed',
      icon: <Flag />,
      color: 'success',
    });

    // Add milestones
    milestones.forEach(milestone => {
      events.push({
        id: `milestone-${milestone.id}`,
        type: 'milestone',
        title: milestone.name,
        description: milestone.description,
        date: milestone.dueDate || collaboration.startDate,
        status: milestone.status === 'completed' ? 'completed' : 
                isPast(new Date(milestone.dueDate || '')) ? 'pending' : 'upcoming',
        icon: milestone.status === 'completed' ? <CheckCircle /> : <RadioButtonUnchecked />,
        color: milestone.status === 'completed' ? 'success' : 'primary',
      });
    });

    // Add sample events (in real app, these would come from actual data)
    events.push({
      id: 'doc1',
      type: 'document',
      title: 'Requirements Document Uploaded',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      icon: <InsertDriveFile />,
      color: 'info',
    });

    events.push({
      id: 'meeting1',
      type: 'meeting',
      title: 'Initial Consultation Call',
      description: '1 hour discussion about project requirements',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      icon: <VideoCall />,
      color: 'secondary',
    });

    // Sort events by date
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const events = generateTimelineEvents();
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const progress = (completedMilestones / milestones.length) * 100;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Project Timeline
        </Typography>

        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Milestone Progress
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {completedMilestones} of {milestones.length} completed
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body2">
                    {format(new Date(collaboration.startDate), 'MMM d, yyyy')}
                  </Typography>
                </Box>
                {collaboration.endDate && (
                  <Box textAlign="right">
                    <Typography variant="caption" color="text.secondary">
                      End Date
                    </Typography>
                    <Typography variant="body2">
                      {format(new Date(collaboration.endDate), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" size="small">
            Add Milestone
          </Button>
          <Button variant="outlined" size="small">
            Export Timeline
          </Button>
        </Stack>
      </Paper>

      {/* Timeline */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Timeline position="alternate">
          {events.map((event, index) => (
            <TimelineItem key={event.id}>
              <TimelineOppositeContent
                sx={{ m: 'auto 0' }}
                variant="body2"
                color="text.secondary"
              >
                <Typography variant="caption" display="block">
                  {format(new Date(event.date), 'MMM d, yyyy')}
                </Typography>
                <Typography variant="caption">
                  {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                </Typography>
              </TimelineOppositeContent>
              
              <TimelineSeparator>
                <TimelineConnector sx={{ bgcolor: index === 0 ? 'transparent' : 'grey.300' }} />
                <TimelineDot color={event.color} variant={event.status === 'completed' ? 'filled' : 'outlined'}>
                  {event.icon}
                </TimelineDot>
                <TimelineConnector sx={{ bgcolor: index === events.length - 1 ? 'transparent' : 'grey.300' }} />
              </TimelineSeparator>
              
              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="subtitle2">
                        {event.title}
                      </Typography>
                      {event.type === 'milestone' && event.status && (
                        <Chip
                          label={event.status}
                          size="small"
                          color={event.status === 'completed' ? 'success' : 
                                 event.status === 'pending' ? 'warning' : 'default'}
                        />
                      )}
                    </Box>
                    {event.description && (
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>
    </Box>
  );
};