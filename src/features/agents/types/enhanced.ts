import React from 'react';
// Enhanced TypeScript types with branded types and strict validation

// Branded types for better type safety
export type LeadId = string & { readonly __brand: 'LeadId' };
export type AgentId = string & { readonly __brand: 'AgentId' };
export type UserId = string & { readonly __brand: 'UserId' };
export type SessionId = string & { readonly __brand: 'SessionId' };
export type EmailAddress = string & { readonly __brand: 'EmailAddress' };
export type PhoneNumber = string & { readonly __brand: 'PhoneNumber' };
export type CompanyName = string & { readonly __brand: 'CompanyName' };
export type Currency = number & { readonly __brand: 'Currency' };
export type Percentage = number & { readonly __brand: 'Percentage' };
export type Timestamp = number & { readonly __brand: 'Timestamp' };
export type URL = string & { readonly __brand: 'URL' };

// Status enums with strict typing
export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
  INACTIVE = 'inactive',
}

export enum LeadPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum AgentRole {
  JUNIOR = 'junior',
  SENIOR = 'senior',
  LEAD = 'lead',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

export enum ContactMethod {
  EMAIL = 'email',
  PHONE = 'phone',
  SMS = 'sms',
  SOCIAL_MEDIA = 'social_media',
  IN_PERSON = 'in_person',
  VIDEO_CALL = 'video_call',
}

// Utility types for validation
export type NonEmptyString<T extends string> = T extends '' ? never : T;
export type PositiveNumber<T extends number> = T extends 0 ? never : T extends `${infer N extends number}` ? N extends number ? (N extends 0 ? never : T) : never : T;
export type ValidEmail<T extends string> = T extends `${string}@${string}.${string}` ? T : never;

// Enhanced Lead interface with strict typing
export interface Lead {
  readonly id: LeadId;
  readonly companyName: CompanyName;
  readonly contactName: NonEmptyString<string>;
  readonly email: EmailAddress;
  readonly phone?: PhoneNumber;
  readonly status: LeadStatus;
  readonly priority: LeadPriority;
  readonly estimatedRevenue?: Currency;
  readonly source: LeadSource;
  readonly tags: readonly string[];
  readonly assignedAgent?: AgentId;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly lastContactAt?: Timestamp;
  readonly nextFollowUpAt?: Timestamp;
  readonly notes: readonly Note[];
  readonly activities: readonly Activity[];
  readonly customFields: Record<string, unknown>;
  readonly metadata: LeadMetadata;
}

export interface LeadMetadata {
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly referrer?: URL;
  readonly campaignId?: string;
  readonly conversionValue?: Currency;
  readonly leadScore?: number;
  readonly sourceDetails: Record<string, unknown>;
}

export interface LeadSource {
  readonly type: 'website' | 'referral' | 'advertising' | 'social_media' | 'email' | 'phone' | 'event' | 'other';
  readonly subtype?: string;
  readonly campaign?: string;
  readonly medium?: string;
  readonly content?: string;
  readonly term?: string;
}

// Enhanced Agent interface
export interface Agent {
  readonly id: AgentId;
  readonly userId: UserId;
  readonly name: NonEmptyString<string>;
  readonly email: EmailAddress;
  readonly phone?: PhoneNumber;
  readonly role: AgentRole;
  readonly department: NonEmptyString<string>;
  readonly avatar?: URL;
  readonly status: 'active' | 'inactive' | 'vacation' | 'training';
  readonly skills: readonly string[];
  readonly territories: readonly string[];
  readonly languages: readonly string[];
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly lastLoginAt?: Timestamp;
  readonly performance: AgentPerformance;
  readonly preferences: AgentPreferences;
  readonly permissions: readonly Permission[];
}

export interface AgentPerformance {
  readonly currentPeriod: PerformancePeriod;
  readonly previousPeriod: PerformancePeriod;
  readonly targets: PerformanceTargets;
  readonly trends: PerformanceTrends;
}

export interface PerformancePeriod {
  readonly leadsAssigned: number;
  readonly leadsContacted: number;
  readonly leadsConverted: number;
  readonly revenue: Currency;
  readonly averageResponseTime: number; // in minutes
  readonly averageDealSize: Currency;
  readonly conversionRate: Percentage;
  readonly customerSatisfaction: Percentage;
}

export interface PerformanceTargets {
  readonly monthlyLeads: number;
  readonly monthlyRevenue: Currency;
  readonly conversionRate: Percentage;
  readonly responseTime: number; // max minutes
}

export interface PerformanceTrends {
  readonly leadsGrowth: Percentage;
  readonly revenueGrowth: Percentage;
  readonly efficiencyImprovement: Percentage;
}

export interface AgentPreferences {
  readonly theme: 'light' | 'dark' | 'auto';
  readonly language: string;
  readonly timezone: string;
  readonly notifications: NotificationPreferences;
  readonly dashboard: DashboardPreferences;
  readonly autoAssignment: boolean;
  readonly workingHours: WorkingHours;
}

export interface NotificationPreferences {
  readonly email: boolean;
  readonly push: boolean;
  readonly sms: boolean;
  readonly inApp: boolean;
  readonly types: readonly NotificationType[];
}

export interface DashboardPreferences {
  readonly layout: 'compact' | 'detailed';
  readonly widgets: readonly DashboardWidget[];
  readonly defaultView: 'list' | 'kanban' | 'calendar';
  readonly refreshInterval: number; // in seconds
}

export interface WorkingHours {
  readonly monday: TimeRange;
  readonly tuesday: TimeRange;
  readonly wednesday: TimeRange;
  readonly thursday: TimeRange;
  readonly friday: TimeRange;
  readonly saturday?: TimeRange;
  readonly sunday?: TimeRange;
  readonly timezone: string;
}

export interface TimeRange {
  readonly start: string; // HH:mm format
  readonly end: string; // HH:mm format
  readonly breaks: readonly TimeRange[];
}

// Activity and Note interfaces
export interface Activity {
  readonly id: string;
  readonly leadId: LeadId;
  readonly agentId: AgentId;
  readonly type: ActivityType;
  readonly method: ContactMethod;
  readonly subject: NonEmptyString<string>;
  readonly description: string;
  readonly outcome: ActivityOutcome;
  readonly duration?: number; // in minutes
  readonly scheduledAt?: Timestamp;
  readonly completedAt?: Timestamp;
  readonly createdAt: Timestamp;
  readonly attachments: readonly Attachment[];
  readonly followUpRequired: boolean;
  readonly nextAction?: string;
}

export interface Note {
  readonly id: string;
  readonly leadId: LeadId;
  readonly agentId: AgentId;
  readonly content: NonEmptyString<string>;
  readonly type: 'general' | 'call_summary' | 'meeting_notes' | 'follow_up' | 'alert';
  readonly isPrivate: boolean;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly tags: readonly string[];
  readonly mentions: readonly AgentId[];
}

export interface Attachment {
  readonly id: string;
  readonly filename: NonEmptyString<string>;
  readonly url: URL;
  readonly mimeType: string;
  readonly size: number; // in bytes
  readonly uploadedBy: AgentId;
  readonly uploadedAt: Timestamp;
  readonly isPublic: boolean;
}

// Enum definitions
export enum ActivityType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  DEMO = 'demo',
  PROPOSAL = 'proposal',
  FOLLOW_UP = 'follow_up',
  DOCUMENT_SENT = 'document_sent',
  CONTRACT_SIGNED = 'contract_signed',
  PAYMENT_RECEIVED = 'payment_received',
}

export enum ActivityOutcome {
  SUCCESSFUL = 'successful',
  NO_ANSWER = 'no_answer',
  VOICEMAIL = 'voicemail',
  BUSY = 'busy',
  INTERESTED = 'interested',
  NOT_INTERESTED = 'not_interested',
  CALLBACK_REQUESTED = 'callback_requested',
  INFORMATION_SENT = 'information_sent',
  MEETING_SCHEDULED = 'meeting_scheduled',
}

export enum NotificationType {
  NEW_LEAD = 'new_lead',
  LEAD_UPDATE = 'lead_update',
  FOLLOW_UP_DUE = 'follow_up_due',
  MEETING_REMINDER = 'meeting_reminder',
  TARGET_ACHIEVED = 'target_achieved',
  SYSTEM_ALERT = 'system_alert',
  MESSAGE_RECEIVED = 'message_received',
}

export enum DashboardWidget {
  LEADS_OVERVIEW = 'leads_overview',
  PERFORMANCE_METRICS = 'performance_metrics',
  RECENT_ACTIVITIES = 'recent_activities',
  UPCOMING_TASKS = 'upcoming_tasks',
  REVENUE_CHART = 'revenue_chart',
  CONVERSION_FUNNEL = 'conversion_funnel',
  TEAM_LEADERBOARD = 'team_leaderboard',
  NOTIFICATIONS = 'notifications',
}

export enum Permission {
  // Lead permissions
  LEADS_VIEW = 'leads:view',
  LEADS_CREATE = 'leads:create',
  LEADS_EDIT = 'leads:edit',
  LEADS_DELETE = 'leads:delete',
  LEADS_ASSIGN = 'leads:assign',
  LEADS_EXPORT = 'leads:export',
  LEADS_IMPORT = 'leads:import',
  
  // Agent permissions
  AGENTS_VIEW = 'agents:view',
  AGENTS_CREATE = 'agents:create',
  AGENTS_EDIT = 'agents:edit',
  AGENTS_DELETE = 'agents:delete',
  
  // Analytics permissions
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_EXPORT = 'analytics:export',
  
  // System permissions
  SYSTEM_ADMIN = 'system:admin',
  SYSTEM_CONFIG = 'system:config',
  SYSTEM_AUDIT = 'system:audit',
}

// API Response types with strict validation
export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ApiError;
  readonly metadata?: ResponseMetadata;
}

export interface ApiError {
  readonly code: string;
  readonly message: NonEmptyString<string>;
  readonly details?: Record<string, unknown>;
  readonly timestamp: Timestamp;
  readonly requestId: string;
}

export interface ResponseMetadata {
  readonly pagination?: PaginationMetadata;
  readonly sorting?: SortingMetadata;
  readonly filtering?: FilteringMetadata;
  readonly timing?: TimingMetadata;
}

export interface PaginationMetadata {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
  readonly hasNext: boolean;
  readonly hasPrev: boolean;
}

export interface SortingMetadata {
  readonly field: string;
  readonly direction: 'asc' | 'desc';
}

export interface FilteringMetadata {
  readonly applied: Record<string, unknown>;
  readonly available: readonly string[];
}

export interface TimingMetadata {
  readonly requestTime: Timestamp;
  readonly responseTime: Timestamp;
  readonly duration: number; // in milliseconds
}

// Validation schemas and type guards
export interface ValidationResult<T> {
  readonly isValid: boolean;
  readonly data?: T;
  readonly errors: readonly ValidationError[];
}

export interface ValidationError {
  readonly field: string;
  readonly code: string;
  readonly message: NonEmptyString<string>;
  readonly value?: unknown;
}

// Type guard functions
export const isLeadId = (value: unknown): value is LeadId =>
  typeof value === 'string' && value.length > 0 && value.startsWith('lead_');

export const isAgentId = (value: unknown): value is AgentId =>
  typeof value === 'string' && value.length > 0 && value.startsWith('agent_');

export const isUserId = (value: unknown): value is UserId =>
  typeof value === 'string' && value.length > 0 && value.startsWith('user_');

export const isEmailAddress = (value: unknown): value is EmailAddress =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isPhoneNumber = (value: unknown): value is PhoneNumber =>
  typeof value === 'string' && /^\+?[\d\s\-\(\)]+$/.test(value);

export const isCurrency = (value: unknown): value is Currency =>
  typeof value === 'number' && value >= 0 && Number.isFinite(value);

export const isPercentage = (value: unknown): value is Percentage =>
  typeof value === 'number' && value >= 0 && value <= 100 && Number.isFinite(value);

export const isTimestamp = (value: unknown): value is Timestamp =>
  typeof value === 'number' && value > 0 && Number.isInteger(value);

export const isURL = (value: unknown): value is URL => {
  if (typeof value !== 'string') return false;
  try {
    new window.URL(value);
    return true;
  } catch {
    return false;
  }
};

// Factory functions for creating branded types
export const createLeadId = (value: string): LeadId | null =>
  isLeadId(value) ? value : null;

export const createAgentId = (value: string): AgentId | null =>
  isAgentId(value) ? value : null;

export const createUserId = (value: string): UserId | null =>
  isUserId(value) ? value : null;

export const createEmailAddress = (value: string): EmailAddress | null =>
  isEmailAddress(value) ? value : null;

export const createPhoneNumber = (value: string): PhoneNumber | null =>
  isPhoneNumber(value) ? value : null;

export const createCurrency = (value: number): Currency | null =>
  isCurrency(value) ? value : null;

export const createPercentage = (value: number): Percentage | null =>
  isPercentage(value) ? value : null;

export const createTimestamp = (value?: number): Timestamp =>
  (value && isTimestamp(value) ? value : Date.now()) as Timestamp;

export const createURL = (value: string): URL | null =>
  isURL(value) ? value : null;

// Utility types for form validation
export type FormFieldValue<T> = {
  readonly value: T;
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly touched: boolean;
};

export type FormState<T extends Record<string, unknown>> = {
  readonly [K in keyof T]: FormFieldValue<T[K]>;
} & {
  readonly isValid: boolean;
  readonly isSubmitting: boolean;
  readonly submitCount: number;
};

// Search and filter types
export interface SearchQuery {
  readonly query: NonEmptyString<string>;
  readonly fields: readonly string[];
  readonly fuzzy: boolean;
  readonly caseSensitive: boolean;
}

export interface FilterCriteria {
  readonly field: string;
  readonly operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  readonly value: unknown;
  readonly dataType: 'string' | 'number' | 'date' | 'boolean' | 'array';
}

export interface SortCriteria {
  readonly field: string;
  readonly direction: 'asc' | 'desc';
  readonly priority: number;
}

// Re-export everything from index to avoid duplicates
export * from './index';
