import { apiClient } from '../security/apiSecurity';
import {
  Expert,
  Booking,
  BookingStatus,
  ExpertSearchFilters,
  ExpertSearchResult,
  CreateBookingRequest,
  UpdateExpertProfileRequest,
  ExpertApplicationRequest,
  CollaborationWorkspace,
  Review
} from '../types/expert';

export class ExpertService {
  private static baseUrl = '/api/experts';

  // Expert Discovery and Search
  static async searchExperts(
    filters: ExpertSearchFilters = {},
    page = 1,
    limit = 20
  ): Promise<{
    experts: ExpertSearchResult[];
    total: number;
    pages: number;
    aggregations: {
      skills: { name: string; count: number }[];
      industries: { name: string; count: number }[];
      priceRange: { min: number; max: number; avg: number };
      avgRating: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...this.buildSearchParams(filters)
      });

      return await apiClient.get(`${this.baseUrl}/search?${queryParams}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to search experts');
    }
  }

  // Get expert by ID with full profile
  static async getExpert(expertId: string): Promise<Expert> {
    try {
      const response = await apiClient.get<{ expert: Expert }>(`${this.baseUrl}/${expertId}`);
      return response.expert;
    } catch (error) {
      throw this.handleError(error, `Failed to fetch expert ${expertId}`);
    }
  }

  // Get expert availability for booking
  static async getExpertAvailability(
    expertId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    availableSlots: {
      date: string;
      slots: { start: string; end: string; duration: number }[];
    }[];
    blackoutDates: string[];
  }> {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate
      });

      return await apiClient.get(`${this.baseUrl}/${expertId}/availability?${params}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch expert availability');
    }
  }

  // Expert Application and Onboarding
  static async submitExpertApplication(application: ExpertApplicationRequest): Promise<{
    applicationId: string;
    status: string;
    estimatedReviewTime: string;
  }> {
    try {
      return await apiClient.post(`${this.baseUrl}/applications`, application);
    } catch (error) {
      throw this.handleError(error, 'Failed to submit expert application');
    }
  }

  static async getApplicationStatus(applicationId: string): Promise<{
    status: 'pending' | 'under_review' | 'approved' | 'rejected';
    feedback?: string;
    nextSteps?: string[];
    reviewedBy?: string;
    reviewedAt?: string;
  }> {
    try {
      return await apiClient.get(`${this.baseUrl}/applications/${applicationId}/status`);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch application status');
    }
  }

  // Expert Profile Management
  static async updateExpertProfile(
    expertId: string,
    updates: UpdateExpertProfileRequest
  ): Promise<Expert> {
    try {
      const response = await apiClient.put<{ expert: Expert }>(
        `${this.baseUrl}/${expertId}/profile`,
        updates
      );
      return response.expert;
    } catch (error) {
      throw this.handleError(error, 'Failed to update expert profile');
    }
  }

  static async uploadPortfolioItem(
    expertId: string,
    portfolioData: FormData
  ): Promise<{ portfolioItem: any }> {
    try {
      return await apiClient.post(
        `${this.baseUrl}/${expertId}/portfolio`,
        portfolioData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
    } catch (error) {
      throw this.handleError(error, 'Failed to upload portfolio item');
    }
  }

  // Booking Management
  static async createBooking(request: CreateBookingRequest): Promise<Booking> {
    try {
      const response = await apiClient.post<{ booking: Booking }>('/api/bookings', request);
      
      // Track booking creation event
      this.trackEvent('booking_created', {
        expertId: request.expertId,
        type: request.type,
        duration: request.duration
      });
      
      return response.booking;
    } catch (error) {
      throw this.handleError(error, 'Failed to create booking');
    }
  }

  static async getBooking(bookingId: string): Promise<Booking> {
    try {
      const response = await apiClient.get<{ booking: Booking }>(`/api/bookings/${bookingId}`);
      return response.booking;
    } catch (error) {
      throw this.handleError(error, `Failed to fetch booking ${bookingId}`);
    }
  }

  static async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    reason?: string
  ): Promise<Booking> {
    try {
      const response = await apiClient.put<{ booking: Booking }>(
        `/api/bookings/${bookingId}/status`,
        { status, reason }
      );
      
      this.trackEvent('booking_status_changed', {
        bookingId,
        status,
        reason
      });
      
      return response.booking;
    } catch (error) {
      throw this.handleError(error, 'Failed to update booking status');
    }
  }

  static async getBookings(
    filters: {
      expertId?: string;
      clientId?: string;
      status?: BookingStatus[];
      dateRange?: { start: string; end: string };
    } = {},
    page = 1,
    limit = 20
  ): Promise<{
    bookings: Booking[];
    total: number;
    pages: number;
  }> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...this.buildBookingParams(filters)
      });

      return await apiClient.get(`/api/bookings?${queryParams}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch bookings');
    }
  }

  // Payment and Billing
  static async processBookingPayment(
    bookingId: string,
    paymentMethod: {
      type: 'card' | 'bank_transfer' | 'escrow';
      details: any;
    }
  ): Promise<{
    transactionId: string;
    status: 'pending' | 'completed' | 'failed';
    receiptUrl?: string;
  }> {
    try {
      return await apiClient.post(`/api/bookings/${bookingId}/payment`, paymentMethod);
    } catch (error) {
      throw this.handleError(error, 'Failed to process payment');
    }
  }

  static async getExpertEarnings(
    expertId: string,
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Promise<{
    totalEarnings: number;
    pendingPayouts: number;
    completedBookings: number;
    averageRating: number;
    breakdown: {
      period: string;
      earnings: number;
      bookings: number;
    }[];
  }> {
    try {
      return await apiClient.get(`${this.baseUrl}/${expertId}/earnings?period=${period}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch expert earnings');
    }
  }

  // Reviews and Ratings
  static async submitReview(
    bookingId: string,
    review: {
      rating: number;
      title?: string;
      comment: string;
      categories: { name: string; rating: number }[];
    }
  ): Promise<Review> {
    try {
      const response = await apiClient.post<{ review: Review }>(
        `/api/bookings/${bookingId}/review`,
        review
      );
      
      this.trackEvent('review_submitted', {
        bookingId,
        rating: review.rating
      });
      
      return response.review;
    } catch (error) {
      throw this.handleError(error, 'Failed to submit review');
    }
  }

  static async getExpertReviews(
    expertId: string,
    page = 1,
    limit = 10
  ): Promise<{
    reviews: Review[];
    total: number;
    averageRating: number;
    ratingDistribution: { stars: number; count: number }[];
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      return await apiClient.get(`${this.baseUrl}/${expertId}/reviews?${params}`);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch expert reviews');
    }
  }

  // Collaboration Workspace
  static async getCollaborationWorkspace(bookingId: string): Promise<CollaborationWorkspace> {
    try {
      const response = await apiClient.get<{ workspace: CollaborationWorkspace }>(
        `/api/bookings/${bookingId}/workspace`
      );
      return response.workspace;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch collaboration workspace');
    }
  }

  static async sendWorkspaceMessage(
    workspaceId: string,
    message: string,
    attachments?: string[]
  ): Promise<any> {
    try {
      return await apiClient.post(`/api/workspaces/${workspaceId}/messages`, {
        message,
        attachments
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to send workspace message');
    }
  }

  static async uploadWorkspaceDocument(
    workspaceId: string,
    file: File
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('document', file);

      return await apiClient.post(`/api/workspaces/${workspaceId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to upload workspace document');
    }
  }

  // AI-Powered Matching
  static async getExpertRecommendations(
    requirements: {
      skills: string[];
      industry: string;
      projectType: string;
      budget?: number;
      timeline?: string;
      complexity: 'low' | 'medium' | 'high';
    }
  ): Promise<{
    recommendations: ExpertSearchResult[];
    matchingCriteria: {
      skillMatch: number;
      experienceMatch: number;
      availabilityMatch: number;
      budgetMatch: number;
      overallScore: number;
    }[];
  }> {
    try {
      return await apiClient.post(`${this.baseUrl}/recommendations`, requirements);
    } catch (error) {
      throw this.handleError(error, 'Failed to get expert recommendations');
    }
  }

  // Analytics and Insights
  static async getMarketplaceAnalytics(): Promise<{
    totalExperts: number;
    totalBookings: number;
    averageRating: number;
    topSkills: { skill: string; demand: number }[];
    topIndustries: { industry: string; bookings: number }[];
    priceRanges: { category: string; min: number; max: number; avg: number }[];
    growthMetrics: {
      period: string;
      newExperts: number;
      newBookings: number;
      revenue: number;
    }[];
  }> {
    try {
      return await apiClient.get(`${this.baseUrl}/analytics`);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch marketplace analytics');
    }
  }

  // Helper methods
  private static buildSearchParams(filters: ExpertSearchFilters): Record<string, string> {
    const params: Record<string, string> = {};

    if (filters.skills?.length) params.skills = filters.skills.join(',');
    if (filters.categories?.length) params.categories = filters.categories.join(',');
    if (filters.industries?.length) params.industries = filters.industries.join(',');
    if (filters.languages?.length) params.languages = filters.languages.join(',');
    if (filters.rating) params.rating = filters.rating.toString();
    if (filters.experience) params.experience = filters.experience.toString();
    if (filters.verified !== undefined) params.verified = filters.verified.toString();
    if (filters.searchTerm) params.search = filters.searchTerm;

    if (filters.location) {
      params.locationType = filters.location.type;
      if (filters.location.radius) params.radius = filters.location.radius.toString();
      if (filters.location.country) params.country = filters.location.country;
      if (filters.location.timezone) params.timezone = filters.location.timezone;
    }

    if (filters.pricing) {
      if (filters.pricing.min) params.minPrice = filters.pricing.min.toString();
      if (filters.pricing.max) params.maxPrice = filters.pricing.max.toString();
      if (filters.pricing.currency) params.currency = filters.pricing.currency;
      if (filters.pricing.model) params.pricingModel = filters.pricing.model;
    }

    if (filters.availability) {
      params.availableFrom = filters.availability.startDate;
      if (filters.availability.endDate) params.availableTo = filters.availability.endDate;
      if (filters.availability.duration) params.duration = filters.availability.duration.toString();
    }

    return params;
  }

  private static buildBookingParams(filters: any): Record<string, string> {
    const params: Record<string, string> = {};

    if (filters.expertId) params.expertId = filters.expertId;
    if (filters.clientId) params.clientId = filters.clientId;
    if (filters.status?.length) params.status = filters.status.join(',');
    if (filters.dateRange) {
      params.startDate = filters.dateRange.start;
      params.endDate = filters.dateRange.end;
    }

    return params;
  }

  private static handleError(error: any, defaultMessage: string): Error {
    console.error('Expert service error:', error);
    
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    return new Error(error.message || defaultMessage);
  }

  private static trackEvent(event: string, data: any): void {
    console.log(`Expert marketplace event: ${event}`, data);
    
    // Track with monitoring service
    if (window.rumMonitor) {
      window.rumMonitor.trackMetric('expert_marketplace_event', 1, {
        event,
        ...data
      });
    }
  }
}

export default ExpertService;