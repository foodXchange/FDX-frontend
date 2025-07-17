import React from 'react';
import { apiClient } from '@/services/api-client';
import {
  Expert,
  ExpertSearchFilters,
  ExpertSearchResult,
  Service,
  Collaboration,
  Booking,
  Message,
  Document,
  Rating,
  TimeSlot,
  CollaborationStatus,
  BookingStatus,
} from '../types';

const EXPERT_API_BASE = '/api/v1/experts';

export const expertApi = {
  // Expert endpoints
  async searchExperts(filters: ExpertSearchFilters): Promise<ExpertSearchResult> {
    const params = new URLSearchParams();
    
    if (filters?.query) params.append('q', filters.query);
    if (filters.categories?.length) params.append('categories', filters.categories.join(','));
    if (filters?.minRating) params.append('minRating', filters.minRating.toString());
    if (filters?.maxHourlyRate) params.append('maxRate', filters.maxHourlyRate.toString());
    if (filters.languages?.length) params.append('languages', filters.languages.join(','));
    if (filters.availability !== undefined) params.append('available', filters.availability.toString());
    if (filters.location?.country) params.append('country', filters.location.country);
    if (filters?.sortBy) params.append('sort', filters.sortBy);
    
    const response = await apiClient.get(`${EXPERT_API_BASE}/search?${params}`);
    return response.data;
  },

  async getExpertById(expertId: string): Promise<Expert> {
    const response = await apiClient.get(`${EXPERT_API_BASE}/${expertId}`);
    return response.data;
  },

  async getExpertProfile(expertId: string): Promise<Expert & { services: Service[]; ratings: Rating[] }> {
    const response = await apiClient.get(`${EXPERT_API_BASE}/${expertId}/profile`);
    return response.data;
  },

  async updateExpertProfile(expertId: string, updates: Partial<Expert>): Promise<Expert> {
    const response = await apiClient.patch(`${EXPERT_API_BASE}/${expertId}`, updates);
    return response.data;
  },

  async getExpertAvailability(expertId: string, date: string): Promise<TimeSlot[]> {
    const params = new URLSearchParams({ date });
    const response = await apiClient.get(`${EXPERT_API_BASE}/${expertId}/availability?${params}`);
    return response.data;
  },

  async getExpertSchedule(
    expertId: string,
    startDate: string,
    endDate: string
  ): Promise<{ date: string; slots: TimeSlot[] }[]> {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await apiClient.get(`${EXPERT_API_BASE}/${expertId}/schedule?${params}`);
    return response.data;
  },

  // Service endpoints
  async getExpertServices(expertId: string): Promise<Service[]> {
    const response = await apiClient.get(`${EXPERT_API_BASE}/${expertId}/services`);
    return response.data;
  },

  async getServiceById(serviceId: string): Promise<Service> {
    const response = await apiClient.get(`${EXPERT_API_BASE}/services/${serviceId}`);
    return response.data;
  },

  async createService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    const response = await apiClient.post(`${EXPERT_API_BASE}/services`, service);
    return response.data;
  },

  async updateService(serviceId: string, updates: Partial<Service>): Promise<Service> {
    const response = await apiClient.patch(`${EXPERT_API_BASE}/services/${serviceId}`, updates);
    return response.data;
  },

  async deleteService(serviceId: string): Promise<void> {
    await apiClient.delete(`${EXPERT_API_BASE}/services/${serviceId}`);
  },

  // Collaboration endpoints
  async getCollaborations(filters?: {
    status?: CollaborationStatus;
    expertId?: string;
    clientId?: string;
  }): Promise<Collaboration[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.expertId) params.append('expertId', filters.expertId);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    
    const response = await apiClient.get(`${EXPERT_API_BASE}/collaborations?${params}`);
    return response.data;
  },

  async getCollaborationById(collaborationId: string): Promise<Collaboration> {
    const response = await apiClient.get(`${EXPERT_API_BASE}/collaborations/${collaborationId}`);
    return response.data;
  },

  async createCollaboration(
    collaboration: Omit<Collaboration, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Collaboration> {
    const response = await apiClient.post(`${EXPERT_API_BASE}/collaborations`, collaboration);
    return response.data;
  },

  async updateCollaboration(
    collaborationId: string,
    updates: Partial<Collaboration>
  ): Promise<Collaboration> {
    const response = await apiClient.patch(
      `${EXPERT_API_BASE}/collaborations/${collaborationId}`,
      updates
    );
    return response.data;
  },

  // Messaging endpoints
  async getMessages(collaborationId: string, page = 1, limit = 50): Promise<{
    messages: Message[];
    total: number;
    hasMore: boolean;
  }> {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    
    const response = await apiClient.get(
      `${EXPERT_API_BASE}/collaborations/${collaborationId}/messages?${params}`
    );
    return response.data;
  },

  async sendMessage(
    collaborationId: string,
    content: string,
    attachments?: string[]
  ): Promise<Message> {
    const response = await apiClient.post(
      `${EXPERT_API_BASE}/collaborations/${collaborationId}/messages`,
      { content, attachments }
    );
    return response.data;
  },

  async markMessageAsRead(collaborationId: string, messageId: string): Promise<void> {
    await apiClient.patch(
      `${EXPERT_API_BASE}/collaborations/${collaborationId}/messages/${messageId}/read`
    );
  },

  // Document endpoints
  async uploadDocument(collaborationId: string, file: File): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(
      `${EXPERT_API_BASE}/collaborations/${collaborationId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async deleteDocument(collaborationId: string, documentId: string): Promise<void> {
    await apiClient.delete(
      `${EXPERT_API_BASE}/collaborations/${collaborationId}/documents/${documentId}`
    );
  },

  // Booking endpoints
  async getBookings(filters?: {
    status?: BookingStatus;
    expertId?: string;
    clientId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Booking[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.expertId) params.append('expertId', filters.expertId);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await apiClient.get(`${EXPERT_API_BASE}/bookings?${params}`);
    return response.data;
  },

  async getBookingById(bookingId: string): Promise<Booking> {
    const response = await apiClient.get(`${EXPERT_API_BASE}/bookings/${bookingId}`);
    return response.data;
  },

  async createBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    const response = await apiClient.post(`${EXPERT_API_BASE}/bookings`, booking);
    return response.data;
  },

  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<Booking> {
    const response = await apiClient.patch(`${EXPERT_API_BASE}/bookings/${bookingId}`, updates);
    return response.data;
  },

  async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    await apiClient.post(`${EXPERT_API_BASE}/bookings/${bookingId}/cancel`, { reason });
  },

  async confirmBooking(bookingId: string): Promise<Booking> {
    const response = await apiClient.post(`${EXPERT_API_BASE}/bookings/${bookingId}/confirm`);
    return response.data;
  },

  // Rating endpoints
  async getRatings(expertId: string): Promise<Rating[]> {
    const response = await apiClient.get(`${EXPERT_API_BASE}/${expertId}/ratings`);
    return response.data;
  },

  async createRating(rating: Omit<Rating, 'id' | 'createdAt'>): Promise<Rating> {
    const response = await apiClient.post(`${EXPERT_API_BASE}/ratings`, rating);
    return response.data;
  },

  async updateRating(ratingId: string, updates: Partial<Rating>): Promise<Rating> {
    const response = await apiClient.patch(`${EXPERT_API_BASE}/ratings/${ratingId}`, updates);
    return response.data;
  },

  // Analytics endpoints
  async getExpertAnalytics(expertId: string, period: 'week' | 'month' | 'year'): Promise<{
    earnings: { total: number; currency: string; breakdown: any[] };
    bookings: { total: number; completed: number; cancelled: number };
    ratings: { average: number; count: number; distribution: any };
    performance: { responseTime: number; completionRate: number };
  }> {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    
    const response = await apiClient.get(`${EXPERT_API_BASE}/${expertId}/analytics?${params}`);
    return response.data;
  },
};