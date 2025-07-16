export interface Expert {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  title: string;
  bio: string;
  company?: string;
  location: {
    city: string;
    state?: string;
    country: string;
    timezone: string;
  };
  expertise: ExpertiseCategory[];
  languages: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  currency: string;
  availability: ExpertAvailability;
  portfolio: Portfolio[];
  certifications: Certification[];
  experience: number; // years
  responseTime: number; // hours
  completedProjects: number;
  isVerified: boolean;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface ExpertiseCategory {
  id: string;
  name: string;
  subcategories: string[];
  yearsOfExperience: number;
  description?: string;
}

export interface ExpertAvailability {
  isAvailable: boolean;
  nextAvailable?: string;
  schedule: WeeklySchedule;
  blockedDates: string[];
}

export interface WeeklySchedule {
  [key: string]: TimeSlot[]; // monday, tuesday, etc.
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string;
}

export interface Service {
  id: string;
  expertId: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  deliverables: string[];
  duration: ServiceDuration;
  pricing: ServicePricing;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceDuration {
  value: number;
  unit: 'hours' | 'days' | 'weeks' | 'months';
  isEstimate: boolean;
}

export interface ServicePricing {
  type: 'hourly' | 'fixed' | 'milestone' | 'subscription';
  amount: number;
  currency: string;
  milestones?: Milestone[];
  subscriptionPeriod?: 'monthly' | 'quarterly' | 'annual';
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  amount: number;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
}

export interface Collaboration {
  id: string;
  expertId: string;
  clientId: string;
  serviceId: string;
  projectName: string;
  description: string;
  status: CollaborationStatus;
  startDate: string;
  endDate?: string;
  deliverables: Deliverable[];
  messages: Message[];
  documents: Document[];
  milestones: Milestone[];
  totalAmount: number;
  paidAmount: number;
  currency: string;
  rating?: Rating;
  createdAt: string;
  updatedAt: string;
}

export type CollaborationStatus = 
  | 'draft'
  | 'pending_approval'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  dueDate: string;
  submittedDate?: string;
  files?: Document[];
  feedback?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  attachments?: Document[];
  timestamp: string;
  isRead: boolean;
  editedAt?: string;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  version?: number;
}

export interface Booking {
  id: string;
  expertId: string;
  clientId: string;
  serviceId: string;
  collaborationId?: string;
  scheduledDate: string;
  duration: number;
  timeSlot: TimeSlot;
  type: 'consultation' | 'service' | 'follow_up';
  status: BookingStatus;
  meetingUrl?: string;
  notes?: string;
  reminder: boolean;
  payment: PaymentInfo;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface PaymentInfo {
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
  method?: 'card' | 'bank_transfer' | 'invoice';
  transactionId?: string;
  paidAt?: string;
}

export interface Portfolio {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  client?: string;
  date: string;
  results?: string;
  testimonial?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface Rating {
  id: string;
  expertId: string;
  clientId: string;
  collaborationId: string;
  overall: number;
  communication: number;
  expertise: number;
  professionalism: number;
  value: number;
  comment: string;
  response?: string;
  createdAt: string;
}

export interface ExpertSearchFilters {
  query?: string;
  categories?: string[];
  minRating?: number;
  maxHourlyRate?: number;
  languages?: string[];
  availability?: boolean;
  location?: {
    country?: string;
    state?: string;
    city?: string;
  };
  sortBy?: 'rating' | 'price_low' | 'price_high' | 'experience' | 'projects';
}

export interface ExpertSearchResult {
  experts: Expert[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}