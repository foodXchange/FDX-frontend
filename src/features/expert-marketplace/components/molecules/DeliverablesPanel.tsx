import { FC, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  IconButton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Schedule,
  Warning,
  AttachFile,
  ExpandMore,
  ExpandLess,
  Upload,
  Comment,
  Edit,
} from '@mui/icons-material';
import { format, isPast, addDays } from 'date-fns';
import { Deliverable } from '../../types';

interface DeliverablesPanelProps {
  deliverables: Deliverable[];
  onUpdateDeliverable: (deliverableId: string, updates: Partial<Deliverable>) => void;
}

export const DeliverablesPanel: FC<DeliverablesPanelProps> = ({
  deliverables,
  onUpdateDeliverable,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [submissionNote, setSubmissionNote] = useState('');
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  const toggleExpanded = (deliverableId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(deliverableId)) {
        next.delete(deliverableId);
      } else {
        next.add(deliverableId);
      }
      return next;
    });
  };

  const getStatusColor = (status: Deliverable['status']) => {
    switch (status) {
      case 'pending': return 'default';
      case 'in_progress': return 'primary';
      case 'submitted': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: Deliverable['status']) => {
    switch (status) {
      case 'pending': return <Schedule />;
      case 'in_progress': return <Edit />;
      case 'submitted': return <Upload />;
      case 'approved': return <CheckCircle />;
      case 'rejected': return <Warning />;
      default: return <Assignment />;
    }
  };

  const handleSubmitDeliverable = () => {
    if (!selectedDeliverable) return;

    onUpdateDeliverable(selectedDeliverable.id, {
      status: 'submitted',
      submittedDate: new Date().toISOString(),
      feedback: submissionNote,
    });

    setSubmitDialogOpen(false);
    setSelectedDeliverable(null);
    setSubmissionNote('');
  };

  const handleProvideFeedback = () => {
    if (!selectedDeliverable) return;

    onUpdateDeliverable(selectedDeliverable.id, {
      feedback: feedback,
    });

    setFeedbackDialogOpen(false);
    setSelectedDeliverable(null);
    setFeedback('');
  };

  const getProgress = () => {
    const completed = deliverables.filter(d => d.status === 'approved').length;
    return (completed / deliverables.length) * 100;
  };

  const upcomingDeadlines = deliverables
    .filter(d => d.status !== 'approved' && !isPast(new Date(d.dueDate)))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Deliverables ({deliverables.length})
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Overall Progress
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {Math.round(getProgress())}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={getProgress()}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>

        {upcomingDeadlines.length > 0 && (
          <Alert severity="info" variant="outlined">
            <Typography variant="subtitle2" gutterBottom>
              Upcoming Deadlines:
            </Typography>
            {upcomingDeadlines.map(d => (
              <Typography key={d.id} variant="body2">
                • {d.name} - {format(new Date(d.dueDate), 'MMM d, yyyy')}
              </Typography>
            ))}
          </Alert>
        )}
      </Paper>

      {/* Deliverables List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List>
          {deliverables.map((deliverable, index) => {
            const isExpanded = expandedItems.has(deliverable.id);
            const isOverdue = isPast(new Date(deliverable.dueDate)) && 
              !['approved', 'submitted'].includes(deliverable.status);

            return (
              <Box key={deliverable.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    py: 2,
                  }}
                >
                  <Box display="flex" alignItems="center" width="100%">
                    <ListItemIcon>
                      {getStatusIcon(deliverable.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1">
                            {deliverable.name}
                          </Typography>
                          <Chip
                            label={deliverable.status.replace('_', ' ')}
                            size="small"
                            color={getStatusColor(deliverable.status)}
                          />
                          {isOverdue && (
                            <Chip
                              label="Overdue"
                              size="small"
                              color="error"
                              icon={<Warning />}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Due: {format(new Date(deliverable.dueDate), 'MMMM d, yyyy')}
                            {deliverable.submittedDate && (
                              <> • Submitted: {format(new Date(deliverable.submittedDate), 'MMMM d, yyyy')}</>
                            )}
                          </Typography>
                        </Box>
                      }
                    />
                    <IconButton
                      onClick={() => toggleExpanded(deliverable.id)}
                      size="small"
                    >
                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>

                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box sx={{ pl: 7, pr: 2, pt: 2 }}>
                      <Typography variant="body2" paragraph>
                        {deliverable.description}
                      </Typography>

                      {deliverable.files && deliverable.files.length > 0 && (
                        <Box mb={2}>
                          <Typography variant="subtitle2" gutterBottom>
                            Attached Files:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {deliverable.files.map(file => (
                              <Chip
                                key={file.id}
                                label={file.name}
                                size="small"
                                icon={<AttachFile />}
                                onClick={() => window.open(file.url)}
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {deliverable.feedback && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Feedback:
                          </Typography>
                          <Typography variant="body2">
                            {deliverable.feedback}
                          </Typography>
                        </Alert>
                      )}

                      <Stack direction="row" spacing={1}>
                        {deliverable.status === 'pending' && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => onUpdateDeliverable(deliverable.id, { status: 'in_progress' })}
                          >
                            Start Working
                          </Button>
                        )}
                        
                        {['pending', 'in_progress', 'rejected'].includes(deliverable.status) && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Upload />}
                            onClick={() => {
                              setSelectedDeliverable(deliverable);
                              setSubmitDialogOpen(true);
                            }}
                          >
                            Submit
                          </Button>
                        )}

                        {deliverable.status === 'submitted' && (
                          <>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => onUpdateDeliverable(deliverable.id, { status: 'approved' })}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => {
                                setSelectedDeliverable(deliverable);
                                setFeedbackDialogOpen(true);
                              }}
                            >
                              Request Changes
                            </Button>
                          </>
                        )}

                        <Button
                          size="small"
                          startIcon={<Comment />}
                        >
                          Discuss
                        </Button>
                      </Stack>
                    </Box>
                  </Collapse>
                </ListItem>
              </Box>
            );
          })}
        </List>
      </Box>

      {/* Submit Dialog */}
      <Dialog
        open={submitDialogOpen}
        onClose={() => setSubmitDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Submit Deliverable</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            You are about to submit "{selectedDeliverable?.name}". Add any notes or comments for the reviewer.
          </Typography>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            label="Submission Notes (Optional)"
            value={submissionNote}
            onChange={(e) => setSubmissionNote(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitDeliverable} variant="contained">
            Submit Deliverable
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Request Changes</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Provide feedback for "{selectedDeliverable?.name}" to help improve the submission.
          </Typography>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            label="Feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            variant="outlined"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleProvideFeedback}
            variant="contained"
            color="error"
            disabled={!feedback.trim()}
          >
            Request Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};