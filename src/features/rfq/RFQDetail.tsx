import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowBack as ArrowLeftIcon,
  Edit as PencilIcon,
  Delete as TrashIcon,
  Schedule as ClockIcon,
  CalendarToday as CalendarDaysIcon,
  LocationOn as MapPinIcon,
  Description as DocumentTextIcon,
  People as UserGroupIcon,
  CheckCircle as CheckCircleIcon,
  Warning as ExclamationTriangleIcon,
  Send as PaperAirplaneIcon,
  Visibility as EyeIcon,
  Download as ArrowDownTrayIcon,
  Close as XMarkIcon,
  Chat as ChatBubbleLeftEllipsisIcon,
  Add as PlusIcon,
} from '@mui/icons-material';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  Stack,
  Divider,
  TextField,
  Avatar,
  Alert,
  Tab,
  Tabs,
  Badge,
  IconButton
} from '@mui/material';
import { rfqService } from '../../services/rfqService';
import { RFQ, Proposal } from '../../shared/types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { formatDistanceToNow, format } from 'date-fns';

interface RFQDetailProps {
  userRole?: 'buyer' | 'supplier';
}

const proposalStatuses = {
  draft: { color: 'default', label: 'Draft' },
  submitted: { color: 'primary', label: 'Submitted' },
  under_review: { color: 'warning', label: 'Under Review' },
  accepted: { color: 'success', label: 'Accepted' },
  rejected: { color: 'error', label: 'Rejected' },
  withdrawn: { color: 'default', label: 'Withdrawn' },
};

// const timelineSteps = [
//   { id: 1, title: 'RFQ Published', description: 'Available for suppliers' },
//   { id: 2, title: 'Proposals Received', description: 'Suppliers submit proposals' },
//   { id: 3, title: 'Evaluation', description: 'Reviewing submissions' },
//   { id: 4, title: 'Award', description: 'Select winning proposal' },
//   { id: 5, title: 'Contract', description: 'Finalize agreement' },
// ];

export const RFQDetail: React.FC<RFQDetailProps> = ({ userRole = 'buyer' }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'messages'>('overview');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [, setShowProposalForm] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchRFQDetails();
    }
  }, [id]);

  const fetchRFQDetails = async () => {
    try {
      setLoading(true);
      const [rfqData, proposalsData, messagesData] = await Promise.all([
        rfqService.getRFQById(id!),
        rfqService.getProposals(id!),
        rfqService.getMessages(id!)
      ]);
      
      setRfq(rfqData);
      setProposals(proposalsData);
      setMessages(messagesData);
    } catch (err) {
      setError('Failed to load RFQ details');
      console.error('RFQ detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRFQ = async () => {
    if (window.confirm('Are you sure you want to delete this RFQ?')) {
      try {
        await rfqService.deleteRFQ(id!);
        navigate('/rfq');
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const handleProposalAction = async (proposalId: string, action: string) => {
    try {
      await rfqService.updateProposalStatus(proposalId, action);
      fetchRFQDetails(); // Refresh data
    } catch (err) {
      console.error('Proposal action error:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await rfqService.sendMessage(id!, {
        message: newMessage,
        recipient: typeof selectedProposal?.supplier === 'string' ? selectedProposal.supplier : selectedProposal?.supplier?.id || '',
      });
      setNewMessage('');
      fetchRFQDetails(); // Refresh messages
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  // const getTimelineCurrentStep = () => {
  //   if (!rfq) return 1;
  //   
  //   switch (rfq.status) {
  //     case 'active': return proposals.length > 0 ? 2 : 1;
  //     case 'closed': return 3;
  //     case 'awarded': return 4;
  //     default: return 1;
  //   }
  // };

  const getUrgencyLevel = () => {
    if (!rfq) return 'normal';
    
    const now = new Date();
    const deadline = new Date(rfq.submissionDeadline);
    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursLeft < 0) return 'expired';
    if (hoursLeft < 24) return 'urgent';
    if (hoursLeft < 72) return 'warning';
    return 'normal';
  };

  const getUrgencyDisplay = (urgency: string) => {
    switch (urgency) {
      case 'expired':
        return { text: 'Expired', color: 'error' };
      case 'urgent':
        return { text: 'Urgent', color: 'error' };
      case 'warning':
        return { text: 'Soon', color: 'warning' };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <SkeletonLoader width="100%" height="400px" />
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} lg={8}>
            <SkeletonLoader width="100%" height="300px" />
          </Grid>
          <Grid item xs={12} lg={4}>
            <SkeletonLoader width="100%" height="300px" />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !rfq) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error" icon={<ExclamationTriangleIcon />}>
          {error || 'RFQ not found'}
        </Alert>
      </Container>
    );
  }

  const urgency = getUrgencyLevel();
  const urgencyDisplay = getUrgencyDisplay(urgency);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => navigate('/rfq')}
            sx={{ bgcolor: 'grey.100', color: 'grey.600', mr: 2 }}
          >
            <ArrowLeftIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ color: 'grey.900', fontWeight: 'bold' }}>
              {rfq.title}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <StatusBadge status={rfq.status} type="rfq" />
              {urgencyDisplay && (
                <Chip
                  icon={<ClockIcon />}
                  label={urgencyDisplay.text}
                  color={urgencyDisplay.color as any}
                  variant="outlined"
                  size="small"
                />
              )}
            </Stack>
          </Box>
        </Box>
        
        {userRole === 'buyer' && (
          <Stack direction="row" spacing={1}>
            <Button
              onClick={() => navigate(`/rfq/${id}/edit`)}
              variant="outlined"
              startIcon={<PencilIcon />}
              sx={{ color: 'grey.700' }}
            >
              Edit
            </Button>
            <Button
              onClick={handleDeleteRFQ}
              variant="outlined"
              color="error"
              startIcon={<TrashIcon />}
            >
              Delete
            </Button>
          </Stack>
        )}
      </Box>

      {/* Timeline */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: 'grey.900', mb: 2 }}>
            RFQ Progress
          </Typography>
          {/* <ProgressTracker 
            steps={timelineSteps} 
            currentStep={getTimelineCurrentStep()} 
          /> */}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            value="overview" 
            label="Overview" 
            icon={<DocumentTextIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="proposals" 
            label={`Proposals (${proposals.length})`} 
            icon={<UserGroupIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="messages" 
            label={`Messages (${messages.length})`} 
            icon={<ChatBubbleLeftEllipsisIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'grey.900', mb: 3 }}>
                      RFQ Details
                    </Typography>
                    
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ color: 'grey.700', mb: 1 }}>
                          Description
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'grey.600' }}>
                          {rfq.description}
                        </Typography>
                      </Box>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" sx={{ color: 'grey.700', mb: 1 }}>
                            Quantity & Unit
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'grey.600' }}>
                            {rfq.quantity} {rfq.unit}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" sx={{ color: 'grey.700', mb: 1 }}>
                            Category
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'grey.600' }}>
                            {rfq.category}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" sx={{ color: 'grey.700', mb: 1 }}>
                            Delivery Date
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', color: 'grey.600' }}>
                            <CalendarDaysIcon sx={{ fontSize: 16, mr: 1 }} />
                            <Typography variant="body2">
                              {format(new Date(rfq.deliveryDate), 'PPP')}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" sx={{ color: 'grey.700', mb: 1 }}>
                            Submission Deadline
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', color: 'grey.600' }}>
                            <ClockIcon sx={{ fontSize: 16, mr: 1 }} />
                            <Typography variant="body2">
                              {format(new Date(rfq.submissionDeadline), 'PPP p')}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Box>
                        <Typography variant="subtitle1" sx={{ color: 'grey.700', mb: 1 }}>
                          Delivery Location
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'grey.600' }}>
                          <MapPinIcon sx={{ fontSize: 16, mr: 1 }} />
                          <Typography variant="body2">
                            {typeof rfq.deliveryLocation === 'string' 
                              ? rfq.deliveryLocation 
                              : `${rfq.deliveryLocation.street}, ${rfq.deliveryLocation.city}, ${rfq.deliveryLocation.country}`
                            }
                          </Typography>
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="subtitle1" sx={{ color: 'grey.700', mb: 2 }}>
                          Product Specifications
                        </Typography>
                        <Stack spacing={2}>
                          {rfq.lineItems.map((item, index) => (
                            <Paper key={index} sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                              <Typography variant="body2" sx={{ color: 'grey.900', fontWeight: 'medium' }}>
                                {item.productName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'grey.600' }}>
                                Quantity: {item.quantity} {item.unit}
                              </Typography>
                              {item.description && (
                                <Typography variant="caption" sx={{ color: 'grey.600', display: 'block' }}>
                                  {item.description}
                                </Typography>
                              )}
                            </Paper>
                          ))}
                        </Stack>
                      </Box>

                      {rfq.requirements?.certifications && rfq.requirements.certifications.length > 0 && (
                        <Box>
                          <Typography variant="subtitle1" sx={{ color: 'grey.700', mb: 2 }}>
                            Required Certifications
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                            {rfq.requirements.certifications?.map((cert) => (
                              <Chip key={cert} label={cert} variant="outlined" size="small" />
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {rfq.requirements?.additionalRequirements && (
                        <Box>
                          <Typography variant="subtitle1" sx={{ color: 'grey.700', mb: 1 }}>
                            Additional Requirements
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'grey.600' }}>
                            {rfq.requirements.additionalRequirements}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'proposals' && (
                <Stack spacing={3}>
                  {userRole === 'supplier' && rfq.status === 'active' && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            Submit Your Proposal
                          </Typography>
                          <Typography variant="caption">
                            Deadline: {format(new Date(rfq.submissionDeadline), 'PPP p')}
                          </Typography>
                        </Box>
                        <Button
                          onClick={() => setShowProposalForm(true)}
                          variant="contained"
                          startIcon={<PlusIcon />}
                          size="small"
                        >
                          Submit Proposal
                        </Button>
                      </Box>
                    </Alert>
                  )}

                  {proposals.length === 0 ? (
                    <Card>
                      <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <UserGroupIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: 'grey.900', mb: 1 }}>
                          No Proposals Yet
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'grey.500' }}>
                          {userRole === 'buyer' 
                            ? 'Suppliers will submit their proposals here'
                            : 'Be the first to submit a proposal for this RFQ'
                          }
                        </Typography>
                      </CardContent>
                    </Card>
                  ) : (
                    <Stack spacing={3}>
                      {proposals.map((proposal) => (
                        <motion.div
                          key={proposal.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Card>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar sx={{ bgcolor: 'grey.200', color: 'grey.600', mr: 2 }}>
                                    {typeof proposal.supplier === 'string' ? proposal.supplier.charAt(0) : proposal.supplier.name.charAt(0)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="subtitle1" sx={{ color: 'grey.900' }}>
                                      {typeof proposal.supplier === 'string' ? proposal.supplier : proposal.supplier.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'grey.500' }}>
                                      Submitted {formatDistanceToNow(new Date(proposal.createdAt))} ago
                                    </Typography>
                                  </Box>
                                </Box>
                                <Chip
                                  label={proposalStatuses[proposal.status].label}
                                  color={proposalStatuses[proposal.status].color as any}
                                  size="small"
                                />
                              </Box>

                              <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={12} md={4}>
                                  <Paper sx={{ bgcolor: 'grey.50', p: 2 }}>
                                    <Typography variant="caption" sx={{ color: 'grey.500' }}>
                                      Price
                                    </Typography>
                                    <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                      ${proposal.totalPrice}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'grey.500' }}>
                                      {proposal.currency}
                                    </Typography>
                                  </Paper>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Paper sx={{ bgcolor: 'grey.50', p: 2 }}>
                                    <Typography variant="caption" sx={{ color: 'grey.500' }}>
                                      Delivery
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'grey.900' }}>
                                      {proposal.deliveryTerms}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'grey.500' }}>
                                      Valid until {format(new Date(proposal.validUntil), 'MMM dd')}
                                    </Typography>
                                  </Paper>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Paper sx={{ bgcolor: 'grey.50', p: 2 }}>
                                    <Typography variant="caption" sx={{ color: 'grey.500' }}>
                                      Terms
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'grey.900' }}>
                                      {proposal.paymentTerms}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              </Grid>

                              {proposal.notes && (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" sx={{ color: 'grey.700', mb: 1 }}>
                                    Notes
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'grey.600' }}>
                                    {proposal.notes}
                                  </Typography>
                                </Box>
                              )}

                              {proposal.attachments && proposal.attachments.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" sx={{ color: 'grey.700', mb: 1 }}>
                                    Attachments
                                  </Typography>
                                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                                    {proposal.attachments.map((attachment, index) => (
                                      <Button
                                        key={index}
                                        variant="outlined"
                                        size="small"
                                        startIcon={<DocumentTextIcon />}
                                        endIcon={<ArrowDownTrayIcon />}
                                        sx={{ bgcolor: 'grey.50' }}
                                      >
                                        {attachment}
                                      </Button>
                                    ))}
                                  </Stack>
                                </Box>
                              )}

                              {userRole === 'buyer' && (
                                <>
                                  <Divider sx={{ my: 2 }} />
                                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                                  <Button
                                    onClick={() => setSelectedProposal(proposal)}
                                    variant="outlined"
                                    size="small"
                                    startIcon={<EyeIcon />}
                                  >
                                    View Details
                                  </Button>
                                  <Button
                                    onClick={() => setSelectedProposal(proposal)}
                                    variant="outlined"
                                    size="small"
                                    startIcon={<ChatBubbleLeftEllipsisIcon />}
                                  >
                                    Message
                                  </Button>
                                  {proposal.status === 'submitted' && (
                                    <>
                                      <Button
                                        onClick={() => handleProposalAction(proposal.id, 'shortlist')}
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        startIcon={<CheckCircleIcon />}
                                      >
                                        Shortlist
                                      </Button>
                                      <Button
                                        onClick={() => handleProposalAction(proposal.id, 'reject')}
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        startIcon={<XMarkIcon />}
                                      >
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                  {proposal.status === 'accepted' && (
                                    <Button
                                      onClick={() => handleProposalAction(proposal.id, 'award')}
                                      variant="contained"
                                      color="primary"
                                      size="small"
                                      startIcon={<CheckCircleIcon />}
                                    >
                                      Award
                                    </Button>
                                  )}
                                  </Stack>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </Stack>
                  )}
                </Stack>
              )}

              {activeTab === 'messages' && (
                <Card>
                  <CardContent>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: 2, mb: 3 }}>
                      <Typography variant="h6" sx={{ color: 'grey.900' }}>
                        Messages
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'grey.500' }}>
                        Communicate with {userRole === 'buyer' ? 'suppliers' : 'the buyer'}
                      </Typography>
                    </Box>

                    <Box sx={{ minHeight: 300, mb: 3 }}>
                      {messages.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <ChatBubbleLeftEllipsisIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                          <Typography variant="body2" sx={{ color: 'grey.500' }}>
                            No messages yet
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={2}>
                          {messages.map((message) => (
                            <Box
                              key={message.id}
                              sx={{
                                display: 'flex',
                                justifyContent: message.isFromCurrentUser ? 'flex-end' : 'flex-start'
                              }}
                            >
                              <Paper
                                sx={{
                                  maxWidth: { xs: '80%', md: '60%' },
                                  px: 2,
                                  py: 1,
                                  bgcolor: message.isFromCurrentUser ? 'primary.main' : 'grey.100',
                                  color: message.isFromCurrentUser ? 'white' : 'grey.900'
                                }}
                              >
                                {!message.isFromCurrentUser && (
                                  <Typography variant="caption" sx={{ fontWeight: 'medium', display: 'block', mb: 0.5 }}>
                                    {message.senderName}
                                  </Typography>
                                )}
                                <Typography variant="body2">
                                  {message.content}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: message.isFromCurrentUser ? 'primary.light' : 'grey.500',
                                    display: 'block',
                                    mt: 0.5
                                  }}
                                >
                                  {format(new Date(message.createdAt), 'MMM dd, HH:mm')}
                                </Typography>
                              </Paper>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Box>

                    <Box component="form" onSubmit={handleSendMessage} sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                      <Stack direction="row" spacing={1}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                        />
                        <IconButton
                          type="submit"
                          disabled={!newMessage.trim()}
                          color="primary"
                        >
                          <PaperAirplaneIcon />
                        </IconButton>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Quick Stats */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'grey.900', mb: 2 }}>
                  Quick Stats
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'grey.600' }}>
                      Total Proposals
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.900', fontWeight: 'medium' }}>
                      {proposals.length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'grey.600' }}>
                      Shortlisted
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                      {proposals.filter(p => p.status === 'accepted').length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'grey.600' }}>
                      Average Price
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.900', fontWeight: 'medium' }}>
                      ${proposals.length > 0 ? 
                        (proposals.reduce((sum, p) => sum + p.totalPrice, 0) / proposals.length).toFixed(2) : 
                        '0.00'
                      }
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'grey.600' }}>
                      Time Left
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: urgency === 'expired' ? 'error.main' : 'grey.900',
                        fontWeight: 'bold'
                      }}
                    >
                      {urgency === 'expired' ? 'Expired' : 
                       formatDistanceToNow(new Date(rfq.submissionDeadline))}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'grey.900', mb: 2 }}>
                  Recent Activity
                </Typography>
                <Stack spacing={2}>
                  {messages.slice(0, 3).map((message) => (
                    <Box key={message.id} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Avatar sx={{ bgcolor: 'grey.200', color: 'grey.600', width: 32, height: 32, mr: 2 }}>
                        {message.senderName.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ color: 'grey.900', fontWeight: 'medium' }}>
                          {message.senderName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', noWrap: true }}>
                          {message.content}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'grey.400' }}>
                          {formatDistanceToNow(new Date(message.createdAt))} ago
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  {messages.length === 0 && (
                    <Typography variant="body2" sx={{ color: 'grey.500', textAlign: 'center', py: 2 }}>
                      No recent activity
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};