export const EXPERT_MARKETPLACE_ROUTES = {
  HOME: '/experts',
  DISCOVER: '/experts/discover',
  PROFILE: '/experts/profile/:expertId',
  DASHBOARD: '/experts/dashboard',
  SERVICES: '/experts/services/:serviceId?',
  COLLABORATIONS: '/experts/collaborations/:collaborationId',
  BOOKINGS: '/experts/bookings',
} as const;

export const EXPERTISE_CATEGORIES = [
  'Supply Chain Optimization',
  'Quality Assurance',
  'Regulatory Compliance',
  'Food Safety',
  'Procurement Strategy',
  'Sustainability',
  'Technology Integration',
  'Market Analysis',
  'Cost Management',
  'Risk Assessment',
  'Process Improvement',
  'Vendor Management',
] as const;

export const SUPPORTED_LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Mandarin',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
  'Russian',
] as const;

export const SUPPORTED_COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Italy',
  'Spain',
  'Netherlands',
  'Belgium',
  'Switzerland',
  'Australia',
  'New Zealand',
  'Japan',
  'Singapore',
  'China',
  'India',
  'Brazil',
  'Mexico',
] as const;

export const SERVICE_TYPES = [
  'consultation',
  'service',
  'follow_up',
] as const;

export const COLLABORATION_STATUSES = [
  'draft',
  'pending_approval',
  'active',
  'on_hold',
  'completed',
  'cancelled',
] as const;

export const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
] as const;

export const PAYMENT_STATUSES = [
  'pending',
  'processing',
  'paid',
  'failed',
  'refunded',
] as const;

export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
  MAX_PORTFOLIO_IMAGES: 10,
} as const;

export const RATING_CRITERIA = [
  { key: 'communication', label: 'Communication' },
  { key: 'expertise', label: 'Expertise' },
  { key: 'professionalism', label: 'Professionalism' },
  { key: 'value', label: 'Value for Money' },
] as const;

export const TIME_ZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
] as const;

export const BUSINESS_HOURS_TEMPLATE = {
  monday: [{ start: '09:00', end: '17:00' }],
  tuesday: [{ start: '09:00', end: '17:00' }],
  wednesday: [{ start: '09:00', end: '17:00' }],
  thursday: [{ start: '09:00', end: '17:00' }],
  friday: [{ start: '09:00', end: '17:00' }],
  saturday: [],
  sunday: [],
} as const;

export const PRICE_RANGES = [
  { min: 0, max: 50, label: 'Under $50/hr' },
  { min: 50, max: 100, label: '$50 - $100/hr' },
  { min: 100, max: 200, label: '$100 - $200/hr' },
  { min: 200, max: 500, label: '$200 - $500/hr' },
  { min: 500, max: Infinity, label: '$500+/hr' },
] as const;

export const SORT_OPTIONS = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'experience', label: 'Most Experienced' },
  { value: 'projects', label: 'Most Projects' },
  { value: 'recent', label: 'Recently Active' },
] as const;

export const WEBSOCKET_EVENTS = {
  USER_TYPING: 'user_typing',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  NEW_MESSAGE: 'new_message',
  MESSAGE_READ: 'message_read',
  DOCUMENT_UPLOADED: 'document_uploaded',
  DELIVERABLE_UPDATED: 'deliverable_updated',
  COLLABORATION_STATUS_CHANGED: 'collaboration_status_changed',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
} as const;

export const LOCAL_STORAGE_KEYS = {
  SEARCH_FILTERS: 'expert_marketplace_search_filters',
  RECENT_SEARCHES: 'expert_marketplace_recent_searches',
  BOOKMARKED_EXPERTS: 'expert_marketplace_bookmarked_experts',
  USER_PREFERENCES: 'expert_marketplace_user_preferences',
} as const;