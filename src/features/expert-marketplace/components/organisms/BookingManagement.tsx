import { FC, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Button,
  Stack,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  Divider,
} from '@mui/material';
import {
  MoreVert,
  VideoCall,
  Phone,
  LocationOn,
  AccessTime,
  Event,
  Cancel,
  CheckCircle,
  Edit,
  PersonAdd,
  AttachMoney,
} from '@mui/icons-material';
import { format, isPast, isToday, addHours } from 'date-fns';
import { Booking, BookingStatus } from '../../types';
import { useBookings } from '../../hooks';

interface BookingManagementProps {
  userRole?: 'expert' | 'client';
}

export const BookingManagement: FC<BookingManagementProps> = ({
  userRole = 'client',
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const {
    upcomingBookings,
    pastBookings,
    loading,
    cancelBooking,
    updateBooking,
  } = useBookings({
    clientId: userRole === 'client' ? 'current-user' : undefined,
    expertId: userRole === 'expert' ? 'current-user' : undefined,
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, booking: Booking) => {
    setAnchorEl(event.currentTarget);
    setSelectedBooking(booking);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBooking(null);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      await cancelBooking(selectedBooking.id, cancelReason);
      setCancelDialogOpen(false);
      setCancelReason('');
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
    handleMenuClose();
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await updateBooking(bookingId, { status: 'confirmed' });
    } catch (error) {
      console.error('Failed to confirm booking:', error);
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'in_progress': return 'primary';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      case 'no_show': return 'error';
      default: return 'default';
    }
  };

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoCall />;
      case 'phone': return <Phone />;
      case 'in_person': return <LocationOn />;
      default: return <Event />;
    }
  };

  const BookingCard: FC<{ booking: Booking; showActions?: boolean }> = ({
    booking,
    showActions = true,
  }) => {
    const bookingDate = new Date(booking.scheduledDate);
    const isUpcoming = !isPast(bookingDate);
    const canCancel = isUpcoming && ['pending', 'confirmed'].includes(booking.status);
    const canReschedule = isUpcoming && booking.status === 'pending';

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="start">
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar>
                  {userRole === 'expert' ? 'C' : 'E'}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {booking.type === 'consultation' ? 'Consultation' : 
                     booking.type === 'service' ? 'Service Session' : 'Follow-up'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userRole === 'expert' ? 'Client' : 'Expert'} • 
                    Booking #{booking.id.slice(-6)}
                  </Typography>
                </Box>
                <Chip
                  label={booking.status.replace('_', ' ')}
                  color={getStatusColor(booking.status)}
                  size="small"
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Event fontSize="small" color="action" />
                    <Typography variant="body2">
                      {format(bookingDate, 'EEEE, MMMM d, yyyy')}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="body2">
                      {booking.timeSlot.start} - {booking.timeSlot.end}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getMeetingIcon(booking.type)}
                    <Typography variant="body2">
                      {booking.type === 'video' ? 'Video Call' : 
                       booking.type === 'phone' ? 'Phone Call' : 'In Person'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <AttachMoney fontSize="small" color="action" />
                    <Typography variant="body2">
                      {booking.payment.amount} {booking.payment.currency}
                    </Typography>
                    <Chip
                      label={booking.payment.status}
                      size="small"
                      color={booking.payment.status === 'paid' ? 'success' : 'warning'}
                    />
                  </Box>
                  {booking.duration && (
                    <Typography variant="body2" color="text.secondary">
                      Duration: {booking.duration} minutes
                    </Typography>
                  )}
                </Grid>
              </Grid>

              {booking.notes && (
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Notes: {booking.notes}
                  </Typography>
                </Box>
              )}
            </Box>

            {showActions && (
              <IconButton onClick={(e) => handleMenuClick(e, booking)}>
                <MoreVert />
              </IconButton>
            )}
          </Box>
        </CardContent>

        {showActions && (
          <CardActions>
            {booking.status === 'pending' && userRole === 'expert' && (
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => handleConfirmBooking(booking.id)}
              >
                Confirm
              </Button>
            )}
            
            {booking.status === 'confirmed' && isUpcoming && isToday(bookingDate) && (
              <Button
                size="small"
                variant="contained"
                startIcon={<VideoCall />}
                onClick={() => {/* Join call */}}
              >
                Join Call
              </Button>
            )}

            {canReschedule && (
              <Button
                size="small"
                startIcon={<Edit />}
                onClick={() => setRescheduleDialogOpen(true)}
              >
                Reschedule
              </Button>
            )}

            {canCancel && (
              <Button
                size="small"
                color="error"
                startIcon={<Cancel />}
                onClick={() => setCancelDialogOpen(true)}
              >
                Cancel
              </Button>
            )}
          </CardActions>
        )}
      </Card>
    );
  };

  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Box p={3} borderBottom={1} borderColor="divider">
          <Typography variant="h5" gutterBottom>
            My Bookings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your {userRole === 'expert' ? 'client consultations' : 'expert consultations'}
          </Typography>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label={`Upcoming (${upcomingBookings.length})`} />
          <Tab label={`Past (${pastBookings.length})`} />
        </Tabs>
      </Paper>

      <Box>
        {activeTab === 0 && (
          <Box>
            {upcomingBookings.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <Event sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No upcoming bookings
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  {userRole === 'client' 
                    ? 'Book a consultation with an expert to get started'
                    : 'No upcoming consultations scheduled'
                  }
                </Typography>
                {userRole === 'client' && (
                  <Button variant="contained" startIcon={<PersonAdd />}>
                    Find Experts
                  </Button>
                )}
              </Paper>
            ) : (
              upcomingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            {pastBookings.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  No past bookings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your completed bookings will appear here
                </Typography>
              </Paper>
            ) : (
              pastBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} showActions={false} />
              ))
            )}
          </Box>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => setRescheduleDialogOpen(true)}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Reschedule
        </MenuItem>
        <MenuItem onClick={() => setCancelDialogOpen(true)}>
          <Cancel sx={{ mr: 1 }} fontSize="small" />
          Cancel
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <Event sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
      </Menu>

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </Alert>
          <TextField
            autoFocus
            multiline
            rows={3}
            fullWidth
            label="Reason for cancellation (optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Keep Booking
          </Button>
          <Button onClick={handleCancelBooking} color="error" variant="contained">
            Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog
        open={rescheduleDialogOpen}
        onClose={() => setRescheduleDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Reschedule Booking</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Select a new date and time for your booking.
          </Typography>
          {/* Add calendar component here for rescheduling */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescheduleDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            Reschedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};