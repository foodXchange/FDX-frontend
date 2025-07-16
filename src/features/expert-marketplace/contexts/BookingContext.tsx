import { createContext, useContext, useState, useCallback, ReactNode, FC } from 'react';
import { Booking, BookingStatus, Service, TimeSlot } from '../types';

interface BookingContextValue {
  // State
  bookings: Booking[];
  upcomingBookings: Booking[];
  pastBookings: Booking[];
  selectedBooking: Booking | null;
  availableSlots: TimeSlot[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadBookings: () => Promise<void>;
  createBooking: (booking: Partial<Booking>) => Promise<Booking | null>;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => Promise<void>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<void>;
  confirmBooking: (bookingId: string) => Promise<void>;
  
  // Availability
  checkAvailability: (expertId: string, date: string) => Promise<TimeSlot[]>;
  getExpertSchedule: (expertId: string, startDate: string, endDate: string) => Promise<TimeSlot[]>;
  
  // Selection
  selectBooking: (booking: Booking | null) => void;
  clearSelection: () => void;
}

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
};

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: FC<BookingProviderProps> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const upcomingBookings = bookings.filter(b => 
    new Date(b.scheduledDate) >= new Date() && 
    ['pending', 'confirmed'].includes(b.status)
  );
  
  const pastBookings = bookings.filter(b => 
    new Date(b.scheduledDate) < new Date() || 
    ['completed', 'cancelled', 'no_show'].includes(b.status)
  );

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      setBookings([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (bookingData: Partial<Booking>): Promise<Booking | null> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      const newBooking: Booking = {
        id: Date.now().toString(),
        expertId: bookingData.expertId || '',
        clientId: bookingData.clientId || '',
        serviceId: bookingData.serviceId || '',
        scheduledDate: bookingData.scheduledDate || new Date().toISOString(),
        duration: bookingData.duration || 60,
        timeSlot: bookingData.timeSlot || { start: '09:00', end: '10:00' },
        type: bookingData.type || 'consultation',
        status: 'pending',
        reminder: true,
        payment: {
          amount: 0,
          currency: 'USD',
          status: 'pending',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...bookingData,
      };
      
      setBookings(prev => [...prev, newBooking]);
      return newBooking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBooking = useCallback(async (bookingId: string, updates: Partial<Booking>) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      setBookings(prev => 
        prev.map(b => b.id === bookingId 
          ? { ...b, ...updates, updatedAt: new Date().toISOString() } 
          : b
        )
      );
      
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  }, [selectedBooking]);

  const cancelBooking = useCallback(async (bookingId: string, reason?: string) => {
    await updateBooking(bookingId, { 
      status: 'cancelled',
      notes: reason ? `Cancellation reason: ${reason}` : undefined,
    });
  }, [updateBooking]);

  const confirmBooking = useCallback(async (bookingId: string) => {
    await updateBooking(bookingId, { 
      status: 'confirmed',
      payment: { 
        amount: 0, // TODO: Calculate from service
        currency: 'USD',
        status: 'processing',
      },
    });
  }, [updateBooking]);

  const checkAvailability = useCallback(async (expertId: string, date: string): Promise<TimeSlot[]> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      const mockSlots: TimeSlot[] = [
        { start: '09:00', end: '10:00' },
        { start: '10:00', end: '11:00' },
        { start: '14:00', end: '15:00' },
        { start: '15:00', end: '16:00' },
      ];
      setAvailableSlots(mockSlots);
      return mockSlots;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check availability');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getExpertSchedule = useCallback(async (
    expertId: string, 
    startDate: string, 
    endDate: string
  ): Promise<TimeSlot[]> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      return [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get expert schedule');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const selectBooking = useCallback((booking: Booking | null) => {
    setSelectedBooking(booking);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedBooking(null);
    setAvailableSlots([]);
  }, []);

  const value: BookingContextValue = {
    bookings,
    upcomingBookings,
    pastBookings,
    selectedBooking,
    availableSlots,
    loading,
    error,
    loadBookings,
    createBooking,
    updateBooking,
    cancelBooking,
    confirmBooking,
    checkAvailability,
    getExpertSchedule,
    selectBooking,
    clearSelection,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};