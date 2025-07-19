// Expert Marketplace Types
import { Location, ReviewCategory } from './common';

export interface Expert {
  id: string;
  userId: string;
  profile: ExpertProfile;
  skills: ExpertSkill[];
  services: ExpertService[];
  availability: Availability;
  reviews: Review[];
  portfolio: PortfolioItem[];
  pricing: PricingStructure;
  certifications: Certification[];
  experience: WorkExperience[];
  languages: Language[];
  timezone: string;
  status: ExpertStatus;
  verificationStatus: VerificationStatus;
  statistics: ExpertStatistics;
  metadata: ExpertMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface ExpertProfile {
  firstName: string;
  lastName: string;
  title: string;
  bio: string;
  avatar?: string;
  company?: string;
  location: Location;
  website?: string;
  linkedIn?: string;
  specializations: string[];
  industries: Industry[];
  yearsOfExperience: number;
  education: Education[];
  achievements: Achievement[];
}

export interface ExpertSkill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  endorsements: number;
  verified: boolean;
  certificationId?: string;
}

export enum SkillCategory {
  TECHNICAL = 'technical',
  BUSINESS = 'business',
  REGULATORY = 'regulatory',
  QUALITY = 'quality',
  SUPPLY_CHAIN = 'supply_chain',
  SUSTAINABILITY = 'sustainability',
  INNOVATION = 'innovation',
  MANAGEMENT = 'management'
}

export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export interface ExpertService {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  type: ServiceType;
  duration: ServiceDuration;
  pricing: ServicePricing;
  deliverables: Deliverable[];
  requirements: string[];
  tags: string[];
  isActive: boolean;
  maxConcurrent: number;
}

export enum ServiceCategory {
  CONSULTATION = 'consultation',
  AUDIT = 'audit',
  TRAINING = 'training',
  IMPLEMENTATION = 'implementation',
  ANALYSIS = 'analysis',
  STRATEGY = 'strategy',
  COMPLIANCE = 'compliance',
  RESEARCH = 'research'
}

export enum ServiceType {
  ONE_TIME = 'one_time',
  ONGOING = 'ongoing',
  PROJECT_BASED = 'project_based',
  RETAINER = 'retainer'
}

export interface ServiceDuration {
  type: 'hours' | 'days' | 'weeks' | 'months';
  min: number;
  max: number;
  typical: number;
}

export interface ServicePricing {
  model: PricingModel;
  currency: string;
  basePrice: number;
  hourlyRate?: number;
  fixedPrice?: number;
  minimumCommitment?: number;
  discounts?: Discount[];
}

export enum PricingModel {
  HOURLY = 'hourly',
  FIXED = 'fixed',
  DAILY = 'daily',
  PROJECT = 'project',
  RETAINER = 'retainer'
}

export interface Booking {
  id: string;
  expertId: string;
  clientId: string;
  serviceId: string;
  title: string;
  description: string;
  status: BookingStatus;
  type: BookingType;
  schedule: BookingSchedule;
  pricing: BookingPricing;
  requirements: BookingRequirement[];
  deliverables: BookingDeliverable[];
  communications: BookingCommunication[];
  payments: PaymentRecord[];
  reviews?: BookingReview[];
  metadata: BookingMetadata;
  createdAt: string;
  updatedAt: string;
}

export enum BookingStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
  REFUNDED = 'refunded'
}

export enum BookingType {
  CONSULTATION = 'consultation',
  WORKSHOP = 'workshop',
  AUDIT = 'audit',
  PROJECT = 'project',
  MENTORING = 'mentoring',
  TRAINING = 'training'
}

export interface BookingSchedule {
  startDate: string;
  endDate?: string;
  duration: number; // in minutes
  timezone: string;
  recurring?: RecurringSchedule;
  meetingType: MeetingType;
  meetingLink?: string;
  location?: string;
  agenda?: string[];
}

export enum MeetingType {
  VIDEO_CALL = 'video_call',
  PHONE_CALL = 'phone_call',
  IN_PERSON = 'in_person',
  HYBRID = 'hybrid',
  ASYNCHRONOUS = 'asynchronous'
}

export interface RecurringSchedule {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  endDate?: string;
  occurrences?: number;
}

export interface BookingPricing {
  baseAmount: number;
  additionalHours?: number;
  hourlyRate?: number;
  expenses?: number;
  discounts?: number;
  totalAmount: number;
  currency: string;
  paymentTerms: string;
}

export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  title?: string;
  comment: string;
  categories: ReviewCategory[];
  helpful: number;
  verified: boolean;
  response?: ExpertResponse;
  createdAt: string;
}

export interface ReviewCategory {
  name: string;
  rating: number;
}

export interface ExpertResponse {
  message: string;
  respondedAt: string;
}

export interface Availability {
  schedule: WeeklySchedule;
  timeZone: string;
  blackoutDates: string[];
  workingDays: number[];
  advanceBooking: {
    minimum: number; // hours
    maximum: number; // days
  };
  bufferTime: number; // minutes between bookings
  autoAccept: boolean;
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isWorking: boolean;
  slots: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;   // HH:mm format
  type: 'available' | 'busy' | 'break';
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  industry: string;
  tags: string[];
  images?: string[];
  documents?: string[];
  results?: string;
  testimonial?: string;
  clientName?: string;
  completedAt: string;
  featured: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  verificationUrl?: string;
  verified: boolean;
  category: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
  skills: string[];
}

export interface ExpertStatistics {
  totalBookings: number;
  completedBookings: number;
  averageRating: number;
  totalReviews: number;
  responseTime: number; // in hours
  completionRate: number; // percentage
  repeatClientRate: number; // percentage
  totalEarnings: number;
  hoursWorked: number;
  expertiseScore: number;
}

export enum ExpertStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  VACATION = 'vacation',
  BUSY = 'busy',
  SUSPENDED = 'suspended'
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  REQUIRES_UPDATE = 'requires_update'
}

// Search and Discovery Types
export interface ExpertSearchFilters {
  skills?: string[];
  categories?: ServiceCategory[];
  industries?: string[];
  languages?: string[];
  location?: LocationFilter;
  availability?: AvailabilityFilter;
  pricing?: PricingFilter;
  rating?: number;
  experience?: number;
  verified?: boolean;
  searchTerm?: string;
}

export interface LocationFilter {
  type: 'remote' | 'local' | 'hybrid';
  radius?: number;
  coordinates?: GeoLocation;
  country?: string;
  timezone?: string;
}

export interface AvailabilityFilter {
  startDate: string;
  endDate?: string;
  duration?: number;
  timePreference?: 'morning' | 'afternoon' | 'evening' | 'flexible';
}

export interface PricingFilter {
  min?: number;
  max?: number;
  currency?: string;
  model?: PricingModel;
}

export interface ExpertSearchResult {
  expert: Expert;
  matchScore: number;
  availableSlots: TimeSlot[];
  relevantServices: ExpertService[];
  distanceKm?: number;
}

// Collaboration Types
export interface CollaborationWorkspace {
  id: string;
  bookingId: string;
  name: string;
  description: string;
  participants: WorkspaceParticipant[];
  documents: WorkspaceDocument[];
  messages: WorkspaceMessage[];
  tasks: WorkspaceTask[];
  calendar: WorkspaceEvent[];
  settings: WorkspaceSettings;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceParticipant {
  userId: string;
  name: string;
  role: 'expert' | 'client' | 'observer';
  permissions: WorkspacePermission[];
  lastActivity: string;
  status: 'online' | 'offline' | 'away';
}

export interface WorkspaceDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  shared: boolean;
  comments: DocumentComment[];
}

export interface WorkspaceMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: string;
  edited: boolean;
  attachments?: string[];
  mentions?: string[];
  reactions?: MessageReaction[];
}

export interface WorkspaceTask {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: string;
}

// Request Types
export interface CreateBookingRequest {
  expertId: string;
  serviceId?: string;
  title: string;
  description: string;
  type: BookingType;
  preferredDate: string;
  duration: number;
  budget?: number;
  requirements: string[];
  urgency: 'low' | 'medium' | 'high';
}

export interface UpdateExpertProfileRequest {
  profile?: Partial<ExpertProfile>;
  skills?: ExpertSkill[];
  services?: ExpertService[];
  availability?: Availability;
  pricing?: PricingStructure;
}

export interface ExpertApplicationRequest {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: Location;
  };
  professionalInfo: {
    title: string;
    bio: string;
    yearsOfExperience: number;
    specializations: string[];
    industries: string[];
  };
  credentials: {
    education: Education[];
    certifications: Certification[];
    workExperience: WorkExperience[];
  };
  services: Omit<ExpertService, 'id'>[];
  portfolio: Omit<PortfolioItem, 'id'>[];
  references?: Reference[];
}

export interface Reference {
  name: string;
  company: string;
  position: string;
  email: string;
  phone?: string;
  relationship: string;
}