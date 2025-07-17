import React, { useState, useEffect, useCallback } from 'react';
import { useState, useCallback, useEffect } from 'react';
import { Booking, TimeSlot, BookingStatus } from '../types';
import { expertApi } from '../services/api';

interface UseBookingsOptions {
  expertId?: string;
  clientId?: string;
  status?: BookingStatus;
  autoLoad?: boolean;
}

export const useBookings = (options: UseBookingsOptions = {}) => {
  const { expertId, clientId, status, autoLoad = true } = options;
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await expertApi.getBookings({
        expertId,
        clientId,
        status,
      });
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [expertId, clientId, status]);

  const createBooking = useCallback(async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newBooking = await expertApi.createBooking(bookingData);
      setBookings(prev => [...prev, newBooking]);
      return newBooking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      throw err;
    }
  }, []);

  const updateBooking = useCallback(async (bookingId: string, updates: Partial<Booking>) => {
    try {
      const updated = await expertApi.updateBooking(bookingId, updates);
      setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
      throw err;
    }
  }, []);

  const cancelBooking = useCallback(async (bookingId: string, reason?: string) => {
    try {
      await expertApi.cancelBooking(bookingId, reason);
      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as BookingStatus } : b)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
      throw err;
    }
  }, []);

  const confirmBooking = useCallback(async (bookingId: string) => {
    try {
      const confirmed = await expertApi.confirmBooking(bookingId);
      setBookings(prev => prev.map(b => b.id === bookingId ? confirmed : b));
      return confirmed;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm booking');
      throw err;
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadBookings();
    }
  }, [autoLoad, loadBookings]);

  const upcomingBookings = bookings.filter(b =>
    new Date(b.scheduledDate) >= new Date() &&
    ['pending', 'confirmed'].includes(b.status)
  );

  const pastBookings = bookings.filter(b =>
    new Date(b.scheduledDate) < new Date() ||
    ['completed', 'cancelled', 'no_show'].includes(b.status)
  );

  return {
    bookings,
    upcomingBookings,
    pastBookings,
    loading,
    error,
    loadBookings,
    createBooking,
    updateBooking,
    cancelBooking,
    confirmBooking,
    refresh: loadBookings,
  };
};

// Hook for expert availability
export const useExpertAvailability = (expertId: string, date: string) => {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = useCallback(async () => {
    if (!expertId || !date) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const slots = await expertApi.getExpertAvailability(expertId, date);
      setAvailableSlots(slots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check availability');
    } finally {
      setLoading(false);
    }
  }, [expertId, date]);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  return {
    availableSlots,
    loading,
    error,
    refresh: checkAvailability,
  };
};