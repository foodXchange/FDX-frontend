import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Tooltip,
  Card,
  CardContent,
  Divider,
  Button,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import { Email as EmailIcon, WhatsApp as WhatsAppIcon, Description as DescriptionIcon, Note as NoteIcon, Search as SearchIcon,  } from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { debounce } from 'lodash';
import { Lead, LeadActivity, LeadNote, ActivityType } from '../types';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface RelationshipTimelineProps {
  lead: Lead;
  activities: LeadActivity[];
  notes: LeadNote[];
  onAddNote?: (note: string, type: LeadNote['type']) => void;
}

interface TimelineItemData {
  type: 'activity' | 'note';
  data: LeadActivity | LeadNote;
  timestamp: string;
}

const activityIcons: Record<ActivityType, React.ReactElement> = {
  call: <PhoneIcon />,
  email: <EmailIcon />,
  whatsapp: <WhatsAppIcon />,
  meeting: <EventIcon />,
  proposal_sent: <DescriptionIcon />,
  contract_signed: <CheckCircleIcon />,
  follow_up: <EventIcon />,
  note_added: <NoteIcon />,
};

const activityColors: Record<ActivityType, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  call: 'primary',
  email: 'secondary',
  whatsapp: 'success',
  meeting: 'warning',
  proposal_sent: 'info',
  contract_signed: 'success',
  follow_up: 'warning',
  note_added: 'primary',
};

// Memoized Timeline Item Component
const TimelineItemComponent = memo<{
  item: TimelineItemData;
  index: number;
}>(({ item, index }) => {
  const isActivity = item.type === 'activity';
  const activity = isActivity ? item.data as LeadActivity : null;
  const note = !isActivity ? item.data as LeadNote : null;

  return (
    <TimelineItem>
      <TimelineOppositeContent
        sx={{ m: 'auto 0' }}
        align={index % 2 === 0 ? 'right' : 'left'}
        variant="body2"
        color="text.secondary"
      >
        <Typography variant="caption" display="block">
          {format(new Date(item.timestamp), 'PPp')}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
        </Typography>
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineConnector sx={{ bgcolor: 'grey.300' }} />
        <TimelineDot
          color={
            isActivity 
              ? activityColors[activity!.type] 
              : 'primary'
          }
          variant={isActivity ? 'filled' : 'outlined'}
        >
          {isActivity 
            ? activityIcons[activity!.type]
            : <NoteIcon />
          }
        </TimelineDot>
        <TimelineConnector sx={{ bgcolor: 'grey.300' }} />
      </TimelineSeparator>
      <TimelineContent sx={{ py: '12px', px: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" component="span">
              {isActivity 
                ? activity!.type.replace('_', ' ').charAt(0).toUpperCase() + 
                  activity!.type.replace('_', ' ').slice(1)
                : `${note!.type.charAt(0).toUpperCase() + note!.type.slice(1)} Note`
              }
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {isActivity ? activity!.description : note!.content}
            </Typography>
            {activity?.metadata && (
              <Box sx={{ mt: 1 }}>
                {Object.entries(activity.metadata).map(([key, value]) => (
                  <Chip
                    key={key}
                    label={`${key}: ${value}`}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </TimelineContent>
    </TimelineItem>
  );
});

TimelineItemComponent.displayName = 'TimelineItemComponent';

// Memoized Insights Component
const RelationshipInsights = memo<{
  insights: {
    totalInteractions: number;
    daysSinceLastInteraction: number | null;
    interactionTypes: Record<ActivityType, number>;
    mostFrequentType: string | undefined;
  };
}>(({ insights }) => (
  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
    <Chip
      icon={<TrendingUpIcon />}
      label={`${insights.totalInteractions} interactions`}
      color="primary"
      variant="outlined"
    />
    {insights.daysSinceLastInteraction !== null && (
      <Chip
        icon={insights.daysSinceLastInteraction > 7 ? <WarningIcon /> : <CheckCircleIcon />}
        label={`Last contact: ${insights.daysSinceLastInteraction} days ago`}
        color={insights.daysSinceLastInteraction > 7 ? 'warning' : 'success'}
        variant="outlined"
      />
    )}
    {insights.mostFrequentType && (
      <Chip
        icon={activityIcons[insights.mostFrequentType as ActivityType]}
        label={`Most used: ${insights.mostFrequentType.replace('_', ' ')}`}
        variant="outlined"
      />
    )}
  </Box>
));

RelationshipInsights.displayName = 'RelationshipInsights';

export const RelationshipTimelineOptimized: React.FC<RelationshipTimelineProps> = ({
  lead,
  activities,
  notes,
  onAddNote,
}) => {
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [noteInput, setNoteInput] = useState('');
  const [noteType, setNoteType] = useState<LeadNote['type']>('general');
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchQuery(value);
    }, 300),
    []
  );

  // Memoized timeline items with optimized filtering
  const timelineItems = useMemo(() => {
    const items: TimelineItemData[] = [
      ...activities.map(activity => ({
        type: 'activity' as const,
        data: activity,
        timestamp: activity.createdAt,
      })),
      ...notes.map(note => ({
        type: 'note' as const,
        data: note,
        timestamp: note.createdAt,
      })),
    ];

    // Filter by type
    let filtered = filterType === 'all' 
      ? items 
      : items.filter(item => {
          if (item.type === 'activity') {
            return (item.data as LeadActivity).type === filterType;
          }
          return false;
        });

    // Filter by search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        if (item.type === 'activity') {
          const activity = item.data as LeadActivity;
          return activity.description.toLowerCase().includes(searchLower);
        } else {
          const note = item.data as LeadNote;
          return note.content.toLowerCase().includes(searchLower);
        }
      });
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [activities, notes, filterType, searchQuery]);

  // Memoized relationship insights
  const insights = useMemo(() => {
    const totalInteractions = timelineItems.length;
    const lastInteraction = timelineItems[0]?.timestamp;
    const daysSinceLastInteraction = lastInteraction
      ? Math.floor((Date.now() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const interactionTypes = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<ActivityType, number>);

    return {
      totalInteractions,
      daysSinceLastInteraction,
      interactionTypes,
      mostFrequentType: Object.entries(interactionTypes).sort(([, a], [, b]) => b - a)[0]?.[0],
    };
  }, [timelineItems, activities]);

  // Callbacks
  const handleFilterClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleFilterClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleFilterSelect = useCallback((filter: ActivityType | 'all') => {
    setFilterType(filter);
    handleFilterClose();
  }, [handleFilterClose]);

  const handleAddNote = useCallback(() => {
    if (noteInput.trim() && onAddNote) {
      setIsLoading(true);
      onAddNote(noteInput.trim(), noteType);
      setNoteInput('');
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [noteInput, noteType, onAddNote]);

  const exportTimeline = useCallback(() => {
    const data = timelineItems.map(item => {
      if (item.type === 'activity') {
        const activity = item.data as LeadActivity;
        return {
          type: 'Activity',
          subtype: activity.type,
          description: activity.description,
          timestamp: format(new Date(activity.createdAt), 'PPpp'),
        };
      } else {
        const note = item.data as LeadNote;
        return {
          type: 'Note',
          subtype: note.type,
          content: note.content,
          timestamp: format(new Date(note.createdAt), 'PPpp'),
        };
      }
    });

    const csv = [
      ['Type', 'Subtype', 'Description/Content', 'Timestamp'].join(','),
      ...data.map(row => 
        [row.type, row.subtype, `"${row.description || row.content}"`, row.timestamp].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lead.companyName}-timeline-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [timelineItems, lead.companyName]);

  // Virtualized Row Renderer for large lists
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = timelineItems[index];
    return (
      <div style={style}>
        <TimelineItemComponent item={item} index={index} />
      </div>
    );
  }, [timelineItems]);

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Relationship Timeline
        </Typography>
        
        {/* Relationship Insights */}
        <RelationshipInsights insights={insights} />

        {/* Controls */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search timeline..."
            onChange={(e) => debouncedSearch(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          <Tooltip title="Filter activities">
            <IconButton onClick={handleFilterClick}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export timeline">
            <IconButton onClick={exportTimeline}>
              <ArrowDownTrayIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Filter Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleFilterClose}
        >
          <MenuItem onClick={() => handleFilterSelect('all')}>All Activities</MenuItem>
          <Divider />
          {Object.keys(activityIcons).map((type) => (
            <MenuItem key={type} onClick={() => handleFilterSelect(type as ActivityType)}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {activityIcons[type as ActivityType]}
                {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Add Note Section */}
      {onAddNote && (
        <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Add a note
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Type your note here..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                variant="outlined"
                size="small"
                disabled={isLoading}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField
                  select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as LeadNote['type'])}
                  size="small"
                  sx={{ minWidth: 120 }}
                  disabled={isLoading}
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="call">Call</MenuItem>
                  <MenuItem value="meeting">Meeting</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="whatsapp">WhatsApp</MenuItem>
                </TextField>
                <Button
                  variant="contained"
                  onClick={handleAddNote}
                  disabled={!noteInput.trim() || isLoading}
                  size="small"
                >
                  {isLoading ? 'Adding...' : 'Add Note'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Timeline with virtualization for large lists */}
      {timelineItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No activities recorded yet
          </Typography>
        </Box>
      ) : timelineItems.length > 20 ? (
        // Use virtualization for large lists
        <List
          height={600}
          itemCount={timelineItems.length}
          itemSize={150}
          width="100%"
        >
          {Row}
        </List>
      ) : (
        // Regular timeline for small lists
        <Timeline position="alternate">
          {timelineItems.map((item, index) => (
            <TimelineItemComponent 
              key={`${item.type}-${item.data.id}`} 
              item={item} 
              index={index} 
            />
          ))}
        </Timeline>
      )}
    </Paper>
  );
};