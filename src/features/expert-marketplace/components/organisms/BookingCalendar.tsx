import React, { useState } from 'react';
import { FC, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Alert,
  Divider,
  IconButton,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  AccessTime,
  Person,
  VideocamOutlined,
  LocationOn,
  Event,
  Cancel,
} from '@mui/icons-material';
import { Grid } from '@mui/material';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isPast,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { Expert, Service, TimeSlot, Booking } from '../../types';
import { useExpertAvailability, useBookings } from '../../hooks';

interface BookingCalendarProps {
  expert: Expert;
  service?: Service;
  onBookingComplete?: (booking: Booking) => void;
}

export const BookingCalendar: FC<BookingCalendarProps> = ({
  expert,
  service,
  onBookingComplete,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    type: 'consultation' as 'consultation' | 'service' | 'follow_up',
    duration: 60,
    notes: '',
    meetingType: 'video' as 'video' | 'phone' | 'in_person',
  });

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  
  const { availableSlots, loading: slotsLoading } = useExpertAvailability(
    expert.id,
    selectedDateStr
  );
  
  const { createBooking, loading: bookingLoading } = useBookings();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleDateSelect = (date: Date) => {
    if (isPast(date) && !isToday(date)) return;
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setBookingDialogOpen(true);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) return;

    try {
      const newBooking = await createBooking({
        expertId: expert.id,
        clientId: 'current-user', // TODO: Get from auth
        serviceId: service?.id || '',
        scheduledDate: format(selectedDate, 'yyyy-MM-dd'),
        duration: bookingDetails.duration,
        timeSlot: selectedSlot,
        type: bookingDetails.type,
        notes: bookingDetails.notes,
        status: 'pending',
        reminder: true,
        payment: {
          amount: service?.pricing.amount || expert.hourlyRate * (bookingDetails.duration / 60),
          currency: service?.pricing.currency || expert.currency,
          status: 'pending',
        },
      });

      setBookingDialogOpen(false);
      setSelectedDate(null);
      setSelectedSlot(null);
      onBookingComplete?.(newBooking);
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  const isDateAvailable = (date: Date) => {
    if (isPast(date) && !isToday(date)) return false;
    // TODO: Check expert's availability for this date
    return true;
  };

  return (
    <Box>
      {/* Calendar Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            {format(currentDate, 'MMMM yyyy')}
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={prevMonth}>
              <ChevronLeft />
            </IconButton>
            <Button
              variant="outlined"
              onClick={goToToday}
              startIcon={<Today />}
              size="small"
            >
              Today
            </Button>
            <IconButton onClick={nextMonth}>
              <ChevronRight />
            </IconButton>
          </Stack>
        </Box>

        {/* Calendar Grid */}
        <Grid container>
          {/* Week Headers */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <Grid size={{ xs: 12 }} key={day}>
              <Typography
                variant="body2"
                align="center"
                color="text.secondary"
                sx={{ py: 1, fontWeight: 'medium' }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
          
          {/* Calendar Days */}
          {calendarDays.map(date => {
            const available = isDateAvailable(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            
            return (
              <Grid size={{ xs: 12 }} key={date.toISOString()}>
                <Box
                  onClick={() => available && handleDateSelect(date)}
                  sx={{
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: available ? 'pointer' : 'not-allowed',
                    borderRadius: 1,
                    transition: 'all 0.2s',
                    bgcolor: isSelected ? 'primary.main' : 'transparent',
                    color: isSelected
                      ? 'primary.contrastText'
                      : !isSameMonth(date, currentDate)
                      ? 'text.disabled'
                      : !available
                      ? 'text.disabled'
                      : isToday(date)
                      ? 'primary.main'
                      : 'text.primary',
                    fontWeight: isToday(date) ? 'bold' : 'normal',
                    '&:hover': available
                      ? {
                          bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                        }
                      : {},
                  }}
                >
                  {format(date, 'd')}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Time Slots */}
      {selectedDate && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Available Times - {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </Typography>
          
          {slotsLoading ? (
            <Typography>Loading available times...</Typography>
          ) : availableSlots.length === 0 ? (
            <Alert severity="info">
              No available time slots for this date. Please select another date.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {availableSlots.map((slot, index) => (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleSlotSelect(slot)}
                    sx={{
                      py: 1.5,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                    }}
                  >
                    <AccessTime fontSize="small" />
                    <Typography variant="body2">
                      {slot.start} - {slot.end}
                    </Typography>
                  </Button>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      {/* Booking Confirmation Dialog */}
      <Dialog
        open={bookingDialogOpen}
        onClose={() => setBookingDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Event color="primary" />
            Book Consultation
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3}>
            {/* Booking Summary */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Booking Summary
                </Typography>
                <Stack spacing={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Person fontSize="small" />
                    <Typography variant="body2">
                      {expert.firstName} {expert.lastName}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Event fontSize="small" />
                    <Typography variant="body2">
                      {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTime fontSize="small" />
                    <Typography variant="body2">
                      {selectedSlot?.start} - {selectedSlot?.end}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <TextField
              select
              label="Consultation Type"
              value={bookingDetails.type}
              onChange={(e) => setBookingDetails(prev => ({
                ...prev,
                type: e.target.value as any
              }))}
              fullWidth
            >
              <MenuItem value="consultation">Initial Consultation</MenuItem>
              <MenuItem value="service">Service Session</MenuItem>
              <MenuItem value="follow_up">Follow-up Meeting</MenuItem>
            </TextField>

            <TextField
              select
              label="Duration"
              value={bookingDetails.duration}
              onChange={(e) => setBookingDetails(prev => ({
                ...prev,
                duration: Number(e.target.value)
              }))}
              fullWidth
            >
              <MenuItem value={30}>30 minutes</MenuItem>
              <MenuItem value={60}>1 hour</MenuItem>
              <MenuItem value={90}>1.5 hours</MenuItem>
              <MenuItem value={120}>2 hours</MenuItem>
            </TextField>

            <TextField
              select
              label="Meeting Type"
              value={bookingDetails.meetingType}
              onChange={(e) => setBookingDetails(prev => ({
                ...prev,
                meetingType: e.target.value as any
              }))}
              fullWidth
            >
              <MenuItem value="video">
                <Box display="flex" alignItems="center" gap={1}>
                  <VideocamOutlined fontSize="small" />
                  Video Call
                </Box>
              </MenuItem>
              <MenuItem value="phone">
                <Box display="flex" alignItems="center" gap={1}>
                  <AccessTime fontSize="small" />
                  Phone Call
                </Box>
              </MenuItem>
              <MenuItem value="in_person">
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationOn fontSize="small" />
                  In Person
                </Box>
              </MenuItem>
            </TextField>

            <TextField
              multiline
              rows={3}
              label="Notes (Optional)"
              placeholder="Add any specific topics or questions you'd like to discuss..."
              value={bookingDetails.notes}
              onChange={(e) => setBookingDetails(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              fullWidth
            />

            <Divider />

            {/* Pricing */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Pricing
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">
                  {bookingDetails.duration} minutes @ ${expert.hourlyRate}/hour
                </Typography>
                <Typography variant="h6">
                  ${((expert.hourlyRate * bookingDetails.duration) / 60).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setBookingDialogOpen(false)}
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBooking}
            variant="contained"
            disabled={bookingLoading}
            startIcon={<Event />}
          >
            {bookingLoading ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};