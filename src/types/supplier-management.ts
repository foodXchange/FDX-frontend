// Comprehensive Supplier Management Types
import { GeoCoordinates, ProductSpecification, EquipmentInfo, CorrectiveAction, AuditRecommendation, AuditFinding, AuditTeamMember, SpendAnalysis, DiversityMetrics, SustainabilityMetrics, ReviewPeriod, ReviewCategory, ActionItem, ReviewParticipant, CommunicationParticipant, CapacityConstraint, SeasonalVariation } from './common';
import { OperatingHours, ScalabilityInfo, StorageRequirement, CustomizationOption } from './supplier-common';

export interface Supplier {
  id: string;
  supplierCode: string;
  basicInfo: SupplierBasicInfo;
  contactInfo: SupplierContactInfo;
  businessInfo: BusinessInfo;
  capabilities: SupplierCapability[];
  certifications: SupplierCertification[];
  qualityInfo: QualityInfo;
  compliance: ComplianceInfo;
  financial: FinancialInfo;
  logistics: LogisticsInfo;
  products: SupplierProduct[];
  performance: PerformanceMetrics;
  riskProfile: RiskProfile;
  verification: VerificationStatus;
  relationships: BusinessRelationship[];
  contracts: ContractInfo[];
  documents: SupplierDocument[];
  communications: CommunicationRecord[];
  auditHistory: AuditRecord[];
  reviews: SupplierReview[];
  metadata: SupplierMetadata;
  status: SupplierStatus;
  tier: SupplierTier;
  createdAt: string;
  updatedAt: string;
  lastVerified?: string;
  nextReviewDate?: string;
  version: number;
}

export interface SupplierBasicInfo {
  legalName: string;
  tradeName?: string;
  brandName?: string;
  website?: string;
  description?: string;
  foundedYear?: number;
  employeeCount?: number;
  annualRevenue?: number;
  businessType: BusinessType;
  ownershipType: OwnershipType;
  industryCode?: string;
  subIndustries?: string[];
  languages: string[];
  timeZone?: string;
  operatingHours?: OperatingHours;
}

export enum BusinessType {
  MANUFACTURER = 'manufacturer',
  DISTRIBUTOR = 'distributor',
  WHOLESALER = 'wholesaler',
  RETAILER = 'retailer',
  TRADER = 'trader',
  BROKER = 'broker',
  AGENT = 'agent',
  SERVICE_PROVIDER = 'service_provider',
  COOPERATIVE = 'cooperative',
  FARM = 'farm'
}

export enum OwnershipType {
  PRIVATE = 'private',
  PUBLIC = 'public',
  GOVERNMENT = 'government',
  COOPERATIVE = 'cooperative',
  FAMILY_OWNED = 'family_owned',
  PARTNERSHIP = 'partnership',
  SOLE_PROPRIETORSHIP = 'sole_proprietorship'
}

export interface SupplierContactInfo {
  primaryContact: ContactPerson;
  alternateContacts: ContactPerson[];
  addresses: SupplierAddress[];
  emergencyContact?: ContactPerson;
  customerServiceContact?: ContactPerson;
  technicalContact?: ContactPerson;
  financialContact?: ContactPerson;
  qualityContact?: ContactPerson;
}

export interface ContactPerson {
  id?: string;
  name: string;
  title?: string;
  department?: string;
  phone: string;
  email: string;
  mobile?: string;
  fax?: string;
  languages?: string[];
  isPrimary?: boolean;
  role: ContactRole;
  availability?: AvailabilityInfo;
}

export enum ContactRole {
  PRIMARY = 'primary',
  SALES = 'sales',
  TECHNICAL = 'technical',
  QUALITY = 'quality',
  LOGISTICS = 'logistics',
  FINANCE = 'finance',
  CUSTOMER_SERVICE = 'customer_service',
  EMERGENCY = 'emergency',
  MANAGEMENT = 'management'
}

export interface SupplierAddress {
  id?: string;
  type: AddressType;
  name?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: GeoCoordinates;
  isPrimary?: boolean;
  isActive?: boolean;
  validatedAt?: string;
  facilityType?: FacilityType;
  capacity?: FacilityCapacity;
}

export enum AddressType {
  HEADQUARTERS = 'headquarters',
  MANUFACTURING = 'manufacturing',
  WAREHOUSE = 'warehouse',
  OFFICE = 'office',
  FARM = 'farm',
  PROCESSING = 'processing',
  DISTRIBUTION = 'distribution',
  LABORATORY = 'laboratory',
  RETAIL = 'retail'
}

export enum FacilityType {
  PRODUCTION = 'production',
  STORAGE = 'storage',
  PROCESSING = 'processing',
  PACKAGING = 'packaging',
  QUALITY_CONTROL = 'quality_control',
  RESEARCH = 'research',
  ADMINISTRATIVE = 'administrative'
}

export interface BusinessInfo {
  registrationNumber: string;
  taxId: string;
  vatNumber?: string;
  dunsNumber?: string;
  legalStructure: LegalStructure;
  incorporationDate?: string;
  incorporationCountry: string;
  parentCompany?: string;
  subsidiaries?: SubsidiaryInfo[];
  boardMembers?: BoardMember[];
  keyPersonnel: KeyPersonnel[];
  businessLicenses: BusinessLicense[];
  bankingInfo?: BankingInfo;
  insuranceInfo?: InsuranceInfo;
}

export enum LegalStructure {
  CORPORATION = 'corporation',
  LLC = 'llc',
  PARTNERSHIP = 'partnership',
  SOLE_PROPRIETORSHIP = 'sole_proprietorship',
  COOPERATIVE = 'cooperative',
  NON_PROFIT = 'non_profit',
  GOVERNMENT = 'government'
}

export interface SupplierCapability {
  id: string;
  category: CapabilityCategory;
  subcategory?: string;
  name: string;
  description?: string;
  level: CapabilityLevel;
  capacity?: CapacityInfo;
  certifications?: string[];
  equipment?: EquipmentInfo[];
  processes?: ProcessInfo[];
  qualityStandards?: string[];
  verifiedAt?: string;
  verifiedBy?: string;
  nextReviewDate?: string;
  supportingDocuments?: string[];
}

export enum CapabilityCategory {
  MANUFACTURING = 'manufacturing',
  PROCESSING = 'processing',
  PACKAGING = 'packaging',
  STORAGE = 'storage',
  LOGISTICS = 'logistics',
  QUALITY_CONTROL = 'quality_control',
  RESEARCH = 'research',
  TESTING = 'testing',
  DESIGN = 'design',
  ENGINEERING = 'engineering',
  CONSULTING = 'consulting'
}

export enum CapabilityLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
  SPECIALIZED = 'specialized'
}

export interface SupplierCertification {
  id: string;
  type: CertificationType;
  name: string;
  issuingBody: string;
  certificateNumber: string;
  issuedDate: string;
  expiryDate?: string;
  status: CertificationStatus;
  scope?: string;
  applicableProducts?: string[];
  applicableLocations?: string[];
  documentUrl?: string;
  verificationStatus: VerificationLevel;
  verifiedAt?: string;
  verifiedBy?: string;
  renewalRequired?: boolean;
  renewalNotificationDate?: string;
  cost?: number;
  nextAuditDate?: string;
}

export enum CertificationType {
  QUALITY = 'quality',
  FOOD_SAFETY = 'food_safety',
  ENVIRONMENTAL = 'environmental',
  SOCIAL = 'social',
  ORGANIC = 'organic',
  HALAL = 'halal',
  KOSHER = 'kosher',
  FAIR_TRADE = 'fair_trade',
  SUSTAINABILITY = 'sustainability',
  TECHNICAL = 'technical',
  REGULATORY = 'regulatory'
}

export enum CertificationStatus {
  VALID = 'valid',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  WITHDRAWN = 'withdrawn',
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review'
}

export enum VerificationLevel {
  UNVERIFIED = 'unverified',
  SELF_DECLARED = 'self_declared',
  DOCUMENT_VERIFIED = 'document_verified',
  THIRD_PARTY_VERIFIED = 'third_party_verified',
  ON_SITE_VERIFIED = 'on_site_verified'
}

export interface QualityInfo {
  qualityPolicy?: string;
  qualityManager?: string;
  qualityStandards: QualityStandard[];
  testingCapabilities: TestingCapability[];
  qualityControlProcesses: QualityProcess[];
  nonConformanceHandling?: NonConformanceProcess;
  continuousImprovement?: ImprovementProgram;
  supplierQualityAgreement?: string;
  qualityManuals?: string[];
  calibrationProgram?: CalibrationProgram;
}

export interface TestingCapability {
  testType: string;
  parameters: string[];
  methods: string[];
  equipment: string[];
  accreditation?: string;
  capacity: TestingCapacity;
  turnaroundTime: number;
  cost?: number;
}

export interface PerformanceMetrics {
  overallRating: number;
  onTimeDelivery: PerformanceMetric;
  qualityRating: PerformanceMetric;
  responsiveness: PerformanceMetric;
  costCompetitiveness: PerformanceMetric;
  innovation: PerformanceMetric;
  sustainability: PerformanceMetric;
  compliance: PerformanceMetric;
  financialStability: PerformanceMetric;
  communicationEffectiveness: PerformanceMetric;
  lastEvaluationDate: string;
  evaluationFrequency: EvaluationFrequency;
  improvementAreas: string[];
  strengthAreas: string[];
  actionPlans: ActionPlan[];
}

export interface PerformanceMetric {
  score: number;
  target: number;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: string;
  dataPoints: DataPoint[];
  notes?: string;
}

export enum EvaluationFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUALLY = 'semi_annually',
  ANNUALLY = 'annually',
  ON_DEMAND = 'on_demand'
}

export interface RiskProfile {
  overallRisk: RiskLevel;
  lastAssessmentDate: string;
  nextAssessmentDate: string;
  riskCategories: RiskCategory[];
  mitigationStrategies: MitigationStrategy[];
  contingencyPlans: ContingencyPlan[];
  monitoringFrequency: MonitoringFrequency;
  riskTolerance: RiskTolerance;
  escalationProcedures: EscalationProcedure[];
}

export enum RiskLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
  CRITICAL = 'critical'
}

export interface RiskCategory {
  category: RiskType;
  level: RiskLevel;
  probability: number;
  impact: number;
  description: string;
  indicators: RiskIndicator[];
  mitigationActions: string[];
  lastReviewed: string;
}

export enum RiskType {
  FINANCIAL = 'financial',
  OPERATIONAL = 'operational',
  QUALITY = 'quality',
  DELIVERY = 'delivery',
  COMPLIANCE = 'compliance',
  GEOPOLITICAL = 'geopolitical',
  ENVIRONMENTAL = 'environmental',
  CYBERSECURITY = 'cybersecurity',
  REPUTATION = 'reputation',
  CONCENTRATION = 'concentration'
}

export interface VerificationStatus {
  overallStatus: VerificationLevel;
  lastVerificationDate?: string;
  nextVerificationDate?: string;
  verificationScore: number;
  verificationChecklist: VerificationItem[];
  verifiedBy?: string;
  verificationMethod: VerificationMethod;
  documentationComplete: boolean;
  onSiteVisitRequired: boolean;
  onSiteVisitCompleted?: boolean;
  onSiteVisitDate?: string;
  verificationReport?: string;
  issuesIdentified: VerificationIssue[];
  correctiveActions: CorrectiveAction[];
}

export enum VerificationMethod {
  DOCUMENT_REVIEW = 'document_review',
  VIRTUAL_AUDIT = 'virtual_audit',
  ON_SITE_AUDIT = 'on_site_audit',
  THIRD_PARTY_VERIFICATION = 'third_party_verification',
  CONTINUOUS_MONITORING = 'continuous_monitoring'
}

export interface VerificationItem {
  id: string;
  category: string;
  item: string;
  required: boolean;
  status: ItemStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  evidence?: string[];
  notes?: string;
  nextReviewDate?: string;
}

export enum ItemStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  VERIFIED = 'verified',
  ISSUES_FOUND = 'issues_found',
  NOT_APPLICABLE = 'not_applicable'
}

export interface SupplierProduct {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  specifications: ProductSpecification[];
  certifications: string[];
  capacity: ProductionCapacity;
  leadTime: LeadTimeInfo;
  pricing: PricingInfo;
  qualityGrades: string[];
  packaging: PackagingOption[];
  availability: AvailabilityInfo;
  seasonality?: SeasonalityInfo;
  origin: OriginInfo;
  sustainability?: SustainabilityInfo;
  customizationOptions?: CustomizationOption[];
  minimumOrderQuantity: number;
  maximumOrderQuantity?: number;
  shelfLife?: number;
  storageRequirements?: StorageRequirement[];
}

export interface ProductionCapacity {
  current: number;
  maximum: number;
  unit: string;
  utilization: number;
  scalability: ScalabilityInfo;
  seasonalVariation?: SeasonalVariation[];
  constraints?: CapacityConstraint[];
}

export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BLOCKED = 'blocked',
  UNDER_REVIEW = 'under_review',
  PENDING_APPROVAL = 'pending_approval',
  REJECTED = 'rejected',
  TERMINATED = 'terminated'
}

export enum SupplierTier {
  STRATEGIC = 'strategic',
  PREFERRED = 'preferred',
  APPROVED = 'approved',
  CONDITIONAL = 'conditional',
  TRIAL = 'trial',
  DEVELOPMENT = 'development'
}

// Supplier Operations
export interface CreateSupplierRequest {
  basicInfo: SupplierBasicInfo;
  contactInfo: SupplierContactInfo;
  businessInfo: Partial<BusinessInfo>;
  capabilities?: Omit<SupplierCapability, 'id'>[];
  certifications?: Omit<SupplierCertification, 'id'>[];
  products?: Omit<SupplierProduct, 'id'>[];
  initialVerificationLevel?: VerificationLevel;
}

export interface UpdateSupplierRequest {
  basicInfo?: Partial<SupplierBasicInfo>;
  contactInfo?: Partial<SupplierContactInfo>;
  businessInfo?: Partial<BusinessInfo>;
  status?: SupplierStatus;
  tier?: SupplierTier;
  capabilities?: Partial<SupplierCapability>[];
  certifications?: Partial<SupplierCertification>[];
  products?: Partial<SupplierProduct>[];
}

export interface SupplierSearchFilters {
  status?: SupplierStatus[];
  tier?: SupplierTier[];
  businessType?: BusinessType[];
  capabilities?: string[];
  certifications?: string[];
  countries?: string[];
  regions?: string[];
  products?: string[];
  verificationLevel?: VerificationLevel[];
  riskLevel?: RiskLevel[];
  performanceRating?: { min: number; max: number };
  searchTerm?: string;
  hasCapacity?: boolean;
  sustainabilityFocused?: boolean;
}

export interface SupplierVerificationRequest {
  supplierId: string;
  verificationMethod: VerificationMethod;
  requiredChecks: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: string;
  assignedTo?: string;
  notes?: string;
}

export interface SupplierAnalytics {
  totalSuppliers: number;
  byStatus: Record<SupplierStatus, number>;
  byTier: Record<SupplierTier, number>;
  byRegion: Record<string, number>;
  byCapability: Record<string, number>;
  verificationStatus: {
    verified: number;
    pending: number;
    unverified: number;
  };
  performanceDistribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
  riskDistribution: Record<RiskLevel, number>;
  spendAnalysis: SpendAnalysis;
  diversityMetrics: DiversityMetrics;
  sustainabilityMetrics: SustainabilityMetrics;
}

// Audit and Review interfaces
export interface AuditRecord {
  id: string;
  type: AuditType;
  status: AuditStatus;
  plannedDate: string;
  actualDate?: string;
  duration?: number;
  auditTeam: AuditTeamMember[];
  scope: string[];
  findings: AuditFinding[];
  recommendations: AuditRecommendation[];
  correctionActions: CorrectiveAction[];
  followUpRequired: boolean;
  followUpDate?: string;
  reportUrl?: string;
  nextAuditDate?: string;
  cost?: number;
}

export enum AuditType {
  INITIAL = 'initial',
  SURVEILLANCE = 'surveillance',
  RECERTIFICATION = 'recertification',
  COMPLAINT = 'complaint',
  SPECIAL = 'special',
  REMOTE = 'remote',
  DOCUMENT = 'document'
}

export enum AuditStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REPORT_PENDING = 'report_pending',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

export interface SupplierReview {
  id: string;
  reviewedBy: string;
  reviewDate: string;
  period: ReviewPeriod;
  overallRating: number;
  categories: ReviewCategory[];
  strengths: string[];
  areasForImprovement: string[];
  actionItems: ActionItem[];
  nextReviewDate: string;
  reviewType: ReviewType;
  participants: ReviewParticipant[];
  documentUrl?: string;
}

export enum ReviewType {
  ANNUAL = 'annual',
  QUARTERLY = 'quarterly',
  PROJECT_BASED = 'project_based',
  ISSUE_DRIVEN = 'issue_driven',
  STRATEGIC = 'strategic'
}

// Communication and relationship management
export interface CommunicationRecord {
  id: string;
  timestamp: string;
  type: CommunicationType;
  channel: CommunicationChannel;
  subject: string;
  participants: CommunicationParticipant[];
  summary: string;
  outcome?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  priority: CommunicationPriority;
  tags: string[];
  attachments?: string[];
  relatedToIssue?: string;
  satisfaction?: number;
}

export enum CommunicationType {
  MEETING = 'meeting',
  CALL = 'call',
  EMAIL = 'email',
  VIDEO_CONFERENCE = 'video_conference',
  SITE_VISIT = 'site_visit',
  TRAINING = 'training',
  NEGOTIATION = 'negotiation',
  REVIEW = 'review',
  ISSUE_RESOLUTION = 'issue_resolution'
}

export enum CommunicationChannel {
  IN_PERSON = 'in_person',
  PHONE = 'phone',
  EMAIL = 'email',
  VIDEO_CALL = 'video_call',
  INSTANT_MESSAGE = 'instant_message',
  PORTAL = 'portal',
  DOCUMENT = 'document'
}

export enum CommunicationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}