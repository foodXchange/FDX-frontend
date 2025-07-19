import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ExpertService from '../../services/experts/ExpertService';
import {
  Expert,
  Booking,
  ExpertSearchFilters,
  CreateBookingRequest,
  UpdateExpertProfileRequest,
  ExpertApplicationRequest
} from '../../types/expert';

// Hook for searching experts
export function useExpertSearch(
  filters: ExpertSearchFilters = {},
  page = 1,
  limit = 20
) {
  return useQuery({
    queryKey: ['expert-search', filters, page, limit],
    queryFn: () => ExpertService.searchExperts(filters, page, limit),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for fetching a single expert
export function useExpert(expertId: string) {
  return useQuery({
    queryKey: ['expert', expertId],
    queryFn: () => ExpertService.getExpert(expertId),
    enabled: !!expertId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for expert availability
export function useExpertAvailability(
  expertId: string,
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: ['expert-availability', expertId, startDate, endDate],
    queryFn: () => ExpertService.getExpertAvailability(expertId, startDate, endDate),
    enabled: !!expertId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for expert recommendations
export function useExpertRecommendations(requirements: any) {
  return useQuery({
    queryKey: ['expert-recommendations', requirements],
    queryFn: () => ExpertService.getExpertRecommendations(requirements),
    enabled: !!requirements,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for creating bookings
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateBookingRequest) => ExpertService.createBooking(request),
    onSuccess: (newBooking) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['expert', newBooking.expertId] });
      
      // Cache the new booking
      queryClient.setQueryData(['booking', newBooking.id], newBooking);
    },
    onError: (error) => {
      console.error('Failed to create booking:', error);
    }
  });
}

// Hook for fetching bookings
export function useBookings(
  filters: any = {},
  page = 1,
  limit = 20
) {
  return useQuery({
    queryKey: ['bookings', filters, page, limit],
    queryFn: () => ExpertService.getBookings(filters, page, limit),
    keepPreviousData: true,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Hook for a single booking
export function useBooking(bookingId: string) {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => ExpertService.getBooking(bookingId),
    enabled: !!bookingId,
    staleTime: 30 * 1000, // 30 seconds for real-time updates
  });
}

// Hook for updating booking status
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, status, reason }: any) =>
      ExpertService.updateBookingStatus(bookingId, status, reason),
    onSuccess: (updatedBooking) => {
      queryClient.setQueryData(['booking', updatedBooking.id], updatedBooking);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    }
  });
}

// Hook for expert profile management
export function useUpdateExpertProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ expertId, updates }: { expertId: string; updates: UpdateExpertProfileRequest }) =>
      ExpertService.updateExpertProfile(expertId, updates),
    onSuccess: (updatedExpert) => {
      queryClient.setQueryData(['expert', updatedExpert.id], updatedExpert);
      queryClient.invalidateQueries({ queryKey: ['expert-search'] });
    }
  });
}

// Hook for expert application
export function useExpertApplication() {
  return useMutation({
    mutationFn: (application: ExpertApplicationRequest) =>
      ExpertService.submitExpertApplication(application),
    onError: (error) => {
      console.error('Failed to submit expert application:', error);
    }
  });
}

// Hook for application status
export function useApplicationStatus(applicationId: string) {
  return useQuery({
    queryKey: ['application-status', applicationId],
    queryFn: () => ExpertService.getApplicationStatus(applicationId),
    enabled: !!applicationId,
    refetchInterval: 30 * 1000, // Check every 30 seconds
  });
}

// Hook for expert reviews
export function useExpertReviews(expertId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['expert-reviews', expertId, page, limit],
    queryFn: () => ExpertService.getExpertReviews(expertId, page, limit),
    enabled: !!expertId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for submitting reviews
export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, review }: any) =>
      ExpertService.submitReview(bookingId, review),
    onSuccess: (_, variables) => {
      // Invalidate expert reviews
      const booking = queryClient.getQueryData(['booking', variables.bookingId]) as Booking;
      if (booking) {
        queryClient.invalidateQueries({ queryKey: ['expert-reviews', booking.expertId] });
        queryClient.invalidateQueries({ queryKey: ['expert', booking.expertId] });
      }
    }
  });
}

// Hook for expert earnings
export function useExpertEarnings(expertId: string, period: string = 'month') {
  return useQuery({
    queryKey: ['expert-earnings', expertId, period],
    queryFn: () => ExpertService.getExpertEarnings(expertId, period as any),
    enabled: !!expertId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for collaboration workspace
export function useCollaborationWorkspace(bookingId: string) {
  return useQuery({
    queryKey: ['workspace', bookingId],
    queryFn: () => ExpertService.getCollaborationWorkspace(bookingId),
    enabled: !!bookingId,
    staleTime: 30 * 1000, // 30 seconds for real-time collaboration
  });
}

// Hook for marketplace analytics
export function useMarketplaceAnalytics() {
  return useQuery({
    queryKey: ['marketplace-analytics'],
    queryFn: () => ExpertService.getMarketplaceAnalytics(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Advanced search hook with filters and sorting
export function useAdvancedExpertSearch() {
  const [filters, setFilters] = useState<ExpertSearchFilters>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const searchQuery = useExpertSearch(filters, page, limit);

  const updateFilters = useCallback((newFilters: Partial<ExpertSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const sortedExperts = useMemo(() => {
    if (!searchQuery.data?.experts) return [];

    let experts = [...searchQuery.data.experts];

    if (sortBy === 'rating') {
      experts.sort((a, b) => {
        const ratingA = a.expert.statistics.averageRating;
        const ratingB = b.expert.statistics.averageRating;
        return sortOrder === 'asc' ? ratingA - ratingB : ratingB - ratingA;
      });
    } else if (sortBy === 'price') {
      experts.sort((a, b) => {
        const priceA = a.expert.pricing?.basePrice || 0;
        const priceB = b.expert.pricing?.basePrice || 0;
        return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
      });
    } else if (sortBy === 'experience') {
      experts.sort((a, b) => {
        const expA = a.expert.profile.yearsOfExperience;
        const expB = b.expert.profile.yearsOfExperience;
        return sortOrder === 'asc' ? expA - expB : expB - expA;
      });
    }

    return experts;
  }, [searchQuery.data?.experts, sortBy, sortOrder]);

  return {
    experts: sortedExperts,
    total: searchQuery.data?.total || 0,
    pages: searchQuery.data?.pages || 0,
    aggregations: searchQuery.data?.aggregations,
    currentPage: page,
    pageSize: limit,
    filters,
    sortBy,
    sortOrder,
    isLoading: searchQuery.isLoading,
    isError: searchQuery.isError,
    error: searchQuery.error,
    updateFilters,
    clearFilters,
    goToPage: setPage,
    changePageSize: setLimit,
    setSortBy,
    setSortOrder,
    refetch: searchQuery.refetch
  };
}

// Hook for real-time booking updates
export function useBookingRealTimeUpdates(bookingId: string) {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    if (!bookingId) return;

    setConnectionStatus('connecting');

    const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}/bookings/${bookingId}`);

    ws.onopen = () => {
      setConnectionStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        
        // Update booking in cache
        queryClient.setQueryData(['booking', bookingId], (oldData: Booking | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, ...update };
        });

        // If it's a workspace update, invalidate workspace queries
        if (update.workspace) {
          queryClient.invalidateQueries({ queryKey: ['workspace', bookingId] });
        }

      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('disconnected');
    };

    return () => {
      ws.close();
    };
  }, [bookingId, queryClient]);

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected'
  };
}

// Hook for expert dashboard data
export function useExpertDashboard(expertId: string) {
  const expert = useExpert(expertId);
  const bookings = useBookings({ expertId }, 1, 100);
  const earnings = useExpertEarnings(expertId);
  const reviews = useExpertReviews(expertId, 1, 5);

  const dashboardData = useMemo(() => {
    if (!expert.data || !bookings.data || !earnings.data) return null;

    const upcomingBookings = bookings.data.bookings.filter(b => 
      b.status === 'confirmed' && new Date(b.schedule.startDate) > new Date()
    );

    const pendingBookings = bookings.data.bookings.filter(b => 
      b.status === 'pending'
    );

    return {
      expert: expert.data,
      upcomingBookings,
      pendingBookings,
      earnings: earnings.data,
      recentReviews: reviews.data?.reviews || [],
      statistics: expert.data.statistics
    };
  }, [expert.data, bookings.data, earnings.data, reviews.data]);

  return {
    dashboardData,
    isLoading: expert.isLoading || bookings.isLoading || earnings.isLoading,
    isError: expert.isError || bookings.isError || earnings.isError,
    error: expert.error || bookings.error || earnings.error,
    refetch: () => {
      expert.refetch();
      bookings.refetch();
      earnings.refetch();
      reviews.refetch();
    }
  };
}