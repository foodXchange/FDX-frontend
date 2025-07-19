// Comprehensive Compliance Management Types
import { DateRange, ReportingRequirement, AuditRecommendation, AuditFinding } from './common';

export interface ComplianceRecord {
  id: string;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  complianceFramework: ComplianceFramework;
  status: ComplianceStatus;
  overallScore: number;
  lastAssessmentDate: string;
  nextAssessmentDate: string;
  requirements: ComplianceRequirement[];
  certifications: ComplianceCertification[];
  audits: ComplianceAudit[];
  violations: ComplianceViolation[];
  correctionActions: CorrectionAction[];
  documents: ComplianceDocument[];
  riskLevel: ComplianceRiskLevel;
  approvals: ComplianceApproval[];
  exemptions: ComplianceExemption[];
  monitoring: ComplianceMonitoring;
  reporting: ComplianceReporting;
  training: ComplianceTraining[];
  metadata: ComplianceMetadata;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export enum EntityType {
  SUPPLIER = 'supplier',
  PRODUCT = 'product',
  FACILITY = 'facility',
  PROCESS = 'process',
  ORDER = 'order',
  SHIPMENT = 'shipment',
  EMPLOYEE = 'employee',
  ORGANIZATION = 'organization'
}

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  category: FrameworkCategory;
  applicableRegions: string[];
  applicableIndustries: string[];
  requirements: FrameworkRequirement[];
  effectiveDate: string;
  expiryDate?: string;
  mandatoryCompliance: boolean;
  description?: string;
  issuingAuthority: string;
  updateFrequency: UpdateFrequency;
  penaltyStructure?: PenaltyStructure;
}

export enum FrameworkCategory {
  FOOD_SAFETY = 'food_safety',
  QUALITY = 'quality',
  ENVIRONMENTAL = 'environmental',
  SOCIAL = 'social',
  FINANCIAL = 'financial',
  DATA_PROTECTION = 'data_protection',
  LABOR = 'labor',
  HEALTH_SAFETY = 'health_safety',
  TRADE = 'trade',
  CUSTOMS = 'customs',
  ORGANIC = 'organic',
  HALAL = 'halal',
  KOSHER = 'kosher',
  FAIR_TRADE = 'fair_trade',
  SUSTAINABILITY = 'sustainability'
}

export enum UpdateFrequency {
  REAL_TIME = 'real_time',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  AS_NEEDED = 'as_needed'
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PARTIALLY_COMPLIANT = 'partially_compliant',
  UNDER_REVIEW = 'under_review',
  PENDING_VERIFICATION = 'pending_verification',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  NOT_APPLICABLE = 'not_applicable',
  EXEMPTED = 'exempted'
}

export enum ComplianceRiskLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
  CRITICAL = 'critical'
}

export interface ComplianceRequirement {
  id: string;
  frameworkId: string;
  requirementCode: string;
  title: string;
  description: string;
  category: RequirementCategory;
  type: RequirementType;
  severity: RequirementSeverity;
  applicability: RequirementApplicability;
  verificationMethod: VerificationMethod;
  evidence: EvidenceRequirement[];
  frequency: ComplianceFrequency;
  deadlines: RequirementDeadline[];
  status: RequirementStatus;
  lastVerified?: string;
  nextDueDate?: string;
  responsibleParty: string;
  dependencies: string[];
  exceptions?: RequirementException[];
  guidance?: string;
  references?: Reference[];
  cost?: ComplianceCost;
  automation?: AutomationInfo;
}

export enum RequirementCategory {
  DOCUMENTATION = 'documentation',
  TESTING = 'testing',
  TRAINING = 'training',
  INSPECTION = 'inspection',
  CERTIFICATION = 'certification',
  REPORTING = 'reporting',
  MONITORING = 'monitoring',
  PROCESS = 'process',
  FACILITY = 'facility',
  PERSONNEL = 'personnel',
  EQUIPMENT = 'equipment',
  RECORD_KEEPING = 'record_keeping'
}

export enum RequirementType {
  MANDATORY = 'mandatory',
  RECOMMENDED = 'recommended',
  CONDITIONAL = 'conditional',
  OPTIONAL = 'optional'
}

export enum RequirementSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFORMATIONAL = 'informational'
}

export enum VerificationMethod {
  DOCUMENT_REVIEW = 'document_review',
  ON_SITE_INSPECTION = 'on_site_inspection',
  THIRD_PARTY_AUDIT = 'third_party_audit',
  SELF_ASSESSMENT = 'self_assessment',
  CONTINUOUS_MONITORING = 'continuous_monitoring',
  SAMPLE_TESTING = 'sample_testing',
  INTERVIEW = 'interview',
  OBSERVATION = 'observation',
  DATA_ANALYSIS = 'data_analysis'
}

export enum ComplianceFrequency {
  ONE_TIME = 'one_time',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUALLY = 'semi_annually',
  ANNUALLY = 'annually',
  BI_ANNUALLY = 'bi_annually',
  ON_EVENT = 'on_event',
  CONTINUOUS = 'continuous'
}

export enum RequirementStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  VERIFIED = 'verified',
  NON_COMPLIANT = 'non_compliant',
  OVERDUE = 'overdue',
  WAIVED = 'waived',
  NOT_APPLICABLE = 'not_applicable'
}

export interface ComplianceCertification {
  id: string;
  certificationType: CertificationType;
  certificateName: string;
  issuingAuthority: string;
  certificateNumber: string;
  issuedDate: string;
  expiryDate?: string;
  status: CertificationStatus;
  scope: CertificationScope;
  applicableProducts?: string[];
  applicableFacilities?: string[];
  applicableProcesses?: string[];
  verificationStatus: CertificationVerificationStatus;
  documentUrl?: string;
  renewalRequired: boolean;
  renewalProcess?: RenewalProcess;
  cost?: ComplianceCost;
  relatedRequirements: string[];
  surveillanceSchedule?: SurveillanceSchedule;
  restrictions?: CertificationRestriction[];
  benefits?: CertificationBenefit[];
}

export enum CertificationType {
  ISO = 'iso',
  HACCP = 'haccp',
  BRC = 'brc',
  SQF = 'sqf',
  IFS = 'ifs',
  GFSI = 'gfsi',
  ORGANIC = 'organic',
  FAIR_TRADE = 'fair_trade',
  RAINFOREST_ALLIANCE = 'rainforest_alliance',
  UTZ = 'utz',
  HALAL = 'halal',
  KOSHER = 'kosher',
  NON_GMO = 'non_gmo',
  GLUTEN_FREE = 'gluten_free',
  VEGAN = 'vegan',
  CARBON_NEUTRAL = 'carbon_neutral',
  ENERGY_STAR = 'energy_star'
}

export enum CertificationStatus {
  VALID = 'valid',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  WITHDRAWN = 'withdrawn',
  PENDING = 'pending',
  UNDER_SURVEILLANCE = 'under_surveillance'
}

export enum CertificationVerificationStatus {
  VERIFIED = 'verified',
  PENDING_VERIFICATION = 'pending_verification',
  VERIFICATION_FAILED = 'verification_failed',
  NOT_VERIFIED = 'not_verified'
}

export interface ComplianceAudit {
  id: string;
  auditType: AuditType;
  auditScope: AuditScope;
  auditStandard: string;
  plannedDate: string;
  actualDate?: string;
  duration?: number;
  auditorTeam: AuditorInfo[];
  auditCriteria: AuditCriteria[];
  findings: AuditFinding[];
  nonConformities: NonConformity[];
  observations: AuditObservation[];
  recommendations: AuditRecommendation[];
  auditScore?: number;
  auditResult: AuditResult;
  reportUrl?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  correctionActions: CorrectionAction[];
  status: AuditStatus;
  cost?: ComplianceCost;
  nextAuditDate?: string;
}

export enum AuditType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  THIRD_PARTY = 'third_party',
  REGULATORY = 'regulatory',
  CUSTOMER = 'customer',
  CERTIFICATION = 'certification',
  SURVEILLANCE = 'surveillance',
  FOLLOW_UP = 'follow_up',
  SPECIAL = 'special'
}

export enum AuditResult {
  PASS = 'pass',
  PASS_WITH_MINOR_FINDINGS = 'pass_with_minor_findings',
  PASS_WITH_MAJOR_FINDINGS = 'pass_with_major_findings',
  CONDITIONAL_PASS = 'conditional_pass',
  FAIL = 'fail',
  INCOMPLETE = 'incomplete'
}

export enum AuditStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REPORT_PENDING = 'report_pending',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

export interface ComplianceViolation {
  id: string;
  violationType: ViolationType;
  severity: ViolationSeverity;
  description: string;
  detectedDate: string;
  detectionMethod: DetectionMethod;
  detectedBy: string;
  affectedRequirements: string[];
  rootCause?: RootCauseAnalysis;
  impact: ViolationImpact;
  correctionActions: CorrectionAction[];
  preventiveActions: PreventiveAction[];
  status: ViolationStatus;
  resolvedDate?: string;
  resolvedBy?: string;
  verificationRequired: boolean;
  verificationDate?: string;
  recurrence: RecurrenceInfo;
  reportedToAuthorities: boolean;
  regulatoryResponse?: RegulatoryResponse;
  cost?: ViolationCost;
  lessonsLearned?: string[];
}

export enum ViolationType {
  DOCUMENTATION = 'documentation',
  PROCESS = 'process',
  PRODUCT = 'product',
  FACILITY = 'facility',
  PERSONNEL = 'personnel',
  RECORD_KEEPING = 'record_keeping',
  REPORTING = 'reporting',
  TRAINING = 'training',
  MONITORING = 'monitoring',
  TESTING = 'testing'
}

export enum ViolationSeverity {
  CRITICAL = 'critical',
  MAJOR = 'major',
  MINOR = 'minor',
  ADMINISTRATIVE = 'administrative'
}

export enum DetectionMethod {
  INTERNAL_AUDIT = 'internal_audit',
  EXTERNAL_AUDIT = 'external_audit',
  SELF_MONITORING = 'self_monitoring',
  CUSTOMER_COMPLAINT = 'customer_complaint',
  REGULATORY_INSPECTION = 'regulatory_inspection',
  THIRD_PARTY_REPORT = 'third_party_report',
  AUTOMATED_SYSTEM = 'automated_system',
  WHISTLEBLOWER = 'whistleblower'
}

export enum ViolationStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  VERIFIED = 'verified',
  CLOSED = 'closed',
  ESCALATED = 'escalated'
}

export interface CorrectionAction {
  id: string;
  actionType: ActionType;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: ActionPriority;
  status: ActionStatus;
  completedDate?: string;
  verificationRequired: boolean;
  verificationDate?: string;
  verifiedBy?: string;
  effectiveness: ActionEffectiveness;
  cost?: ComplianceCost;
  resources: ActionResource[];
  dependencies: string[];
  progress: ActionProgress[];
  attachments: ActionAttachment[];
}

export enum ActionType {
  IMMEDIATE = 'immediate',
  CORRECTIVE = 'corrective',
  PREVENTIVE = 'preventive',
  CONTAINMENT = 'containment',
  INVESTIGATION = 'investigation',
  TRAINING = 'training',
  PROCESS_CHANGE = 'process_change',
  SYSTEM_UPDATE = 'system_update',
  POLICY_CHANGE = 'policy_change'
}

export enum ActionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum ActionStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  VERIFIED = 'verified',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  DEFERRED = 'deferred'
}

export enum ActionEffectiveness {
  NOT_ASSESSED = 'not_assessed',
  EFFECTIVE = 'effective',
  PARTIALLY_EFFECTIVE = 'partially_effective',
  INEFFECTIVE = 'ineffective',
  UNDER_REVIEW = 'under_review'
}

export interface ComplianceDocument {
  id: string;
  documentType: ComplianceDocumentType;
  title: string;
  description?: string;
  documentNumber?: string;
  version: string;
  category: DocumentCategory;
  classification: DocumentClassification;
  relatedRequirements: string[];
  relatedCertifications: string[];
  createdBy: string;
  createdDate: string;
  lastModified: string;
  approvedBy?: string;
  approvedDate?: string;
  effectiveDate: string;
  expiryDate?: string;
  reviewDate?: string;
  status: DocumentStatus;
  accessLevel: AccessLevel;
  retentionPeriod: number;
  language: string;
  fileUrl: string;
  fileSize: number;
  checksum?: string;
  digitalSignature?: DigitalSignature;
  distributionList: string[];
  changeHistory: DocumentChange[];
  tags: string[];
}

export enum ComplianceDocumentType {
  POLICY = 'policy',
  PROCEDURE = 'procedure',
  WORK_INSTRUCTION = 'work_instruction',
  RECORD = 'record',
  CERTIFICATE = 'certificate',
  REPORT = 'report',
  PLAN = 'plan',
  MANUAL = 'manual',
  SPECIFICATION = 'specification',
  DRAWING = 'drawing',
  FORM = 'form',
  CHECKLIST = 'checklist',
  EVIDENCE = 'evidence'
}

export enum DocumentCategory {
  QUALITY = 'quality',
  SAFETY = 'safety',
  ENVIRONMENTAL = 'environmental',
  REGULATORY = 'regulatory',
  OPERATIONAL = 'operational',
  TRAINING = 'training',
  AUDIT = 'audit',
  RISK = 'risk',
  EMERGENCY = 'emergency'
}

export enum DocumentClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  SECRET = 'secret'
}

export enum DocumentStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  EFFECTIVE = 'effective',
  OBSOLETE = 'obsolete',
  ARCHIVED = 'archived',
  WITHDRAWN = 'withdrawn'
}

export enum AccessLevel {
  PUBLIC = 'public',
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  EXECUTIVE = 'executive',
  COMPLIANCE_TEAM = 'compliance_team',
  AUDITOR = 'auditor',
  REGULATOR = 'regulator'
}

export interface ComplianceApproval {
  id: string;
  approvalType: ApprovalType;
  requiredFor: string;
  requestedBy: string;
  requestDate: string;
  approver: string;
  approvalDate?: string;
  status: ApprovalStatus;
  conditions?: ApprovalCondition[];
  validityPeriod?: number;
  expiryDate?: string;
  reviewRequired: boolean;
  reviewDate?: string;
  comments?: string;
  attachments: string[];
  workflow: ApprovalWorkflow;
  escalation?: ApprovalEscalation;
}

export enum ApprovalType {
  PRODUCT_LAUNCH = 'product_launch',
  PROCESS_CHANGE = 'process_change',
  FACILITY_MODIFICATION = 'facility_modification',
  SUPPLIER_APPROVAL = 'supplier_approval',
  DEVIATION = 'deviation',
  CORRECTIVE_ACTION = 'corrective_action',
  DOCUMENT_APPROVAL = 'document_approval',
  TRAINING_PROGRAM = 'training_program',
  EXEMPTION = 'exemption'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  CONDITIONALLY_APPROVED = 'conditionally_approved',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired'
}

export interface ComplianceExemption {
  id: string;
  exemptionType: ExemptionType;
  requestedFor: string;
  justification: string;
  requestedBy: string;
  requestDate: string;
  approvedBy?: string;
  approvalDate?: string;
  status: ExemptionStatus;
  validityPeriod: number;
  expiryDate: string;
  conditions: ExemptionCondition[];
  riskAssessment: ExemptionRiskAssessment;
  monitoring: ExemptionMonitoring;
  reviewRequired: boolean;
  reviewDate?: string;
}

export enum ExemptionType {
  TEMPORARY = 'temporary',
  PERMANENT = 'permanent',
  CONDITIONAL = 'conditional',
  EMERGENCY = 'emergency'
}

export enum ExemptionStatus {
  REQUESTED = 'requested',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  REVOKED = 'revoked'
}

export interface ComplianceMonitoring {
  monitoringPlan: MonitoringPlan;
  kpis: ComplianceKPI[];
  alerts: ComplianceAlert[];
  dashboards: ComplianceDashboard[];
  reports: MonitoringReport[];
  automation: MonitoringAutomation;
  thresholds: ComplianceThreshold[];
  escalationMatrix: EscalationMatrix;
}

export interface ComplianceKPI {
  id: string;
  name: string;
  description: string;
  category: KPICategory;
  calculation: KPICalculation;
  target: number;
  currentValue?: number;
  trend: KPITrend;
  frequency: UpdateFrequency;
  dataSource: string;
  owner: string;
  lastUpdated?: string;
  alertThresholds: AlertThreshold[];
  visualizationType: VisualizationType;
}

export enum KPICategory {
  COMPLIANCE_RATE = 'compliance_rate',
  VIOLATION_COUNT = 'violation_count',
  AUDIT_PERFORMANCE = 'audit_performance',
  CERTIFICATION_STATUS = 'certification_status',
  TRAINING_COMPLETION = 'training_completion',
  COST_OF_COMPLIANCE = 'cost_of_compliance',
  TIME_TO_RESOLUTION = 'time_to_resolution',
  REGULATORY_CHANGES = 'regulatory_changes'
}

export enum KPITrend {
  IMPROVING = 'improving',
  STABLE = 'stable',
  DECLINING = 'declining',
  VOLATILE = 'volatile'
}

export enum VisualizationType {
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  GAUGE = 'gauge',
  SCORECARD = 'scorecard',
  HEATMAP = 'heatmap',
  TREND = 'trend'
}

export interface ComplianceReporting {
  reportingRequirements: ReportingRequirement[];
  scheduledReports: ScheduledReport[];
  adhocReports: AdhocReport[];
  regulatorySubmissions: RegulatorySubmission[];
  internalReports: InternalReport[];
  externalReports: ExternalReport[];
  automation: ReportingAutomation;
  templates: ReportTemplate[];
}

export interface ReportingRequirement {
  id: string;
  requirementName: string;
  regulatoryBody: string;
  frequency: ReportingFrequency;
  dueDate: string;
  format: ReportFormat;
  submissionMethod: SubmissionMethod;
  dataRequirements: DataRequirement[];
  template?: string;
  lastSubmission?: string;
  nextDueDate?: string;
  status: ReportingStatus;
  penalties?: ReportingPenalty[];
}

export enum ReportingFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUALLY = 'semi_annually',
  ANNUALLY = 'annually',
  ON_DEMAND = 'on_demand',
  EVENT_DRIVEN = 'event_driven'
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  XML = 'xml',
  JSON = 'json',
  EDI = 'edi',
  CUSTOM = 'custom'
}

export enum SubmissionMethod {
  ONLINE_PORTAL = 'online_portal',
  EMAIL = 'email',
  API = 'api',
  MAIL = 'mail',
  IN_PERSON = 'in_person',
  FTP = 'ftp'
}

export enum ReportingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SUBMITTED = 'submitted',
  ACKNOWLEDGED = 'acknowledged',
  REJECTED = 'rejected',
  OVERDUE = 'overdue'
}

export interface ComplianceTraining {
  id: string;
  trainingType: TrainingType;
  title: string;
  description: string;
  objectives: string[];
  audience: TrainingAudience;
  mandatory: boolean;
  frequency: TrainingFrequency;
  duration: number;
  format: TrainingFormat;
  deliveryMethod: DeliveryMethod;
  content: TrainingContent[];
  assessments: TrainingAssessment[];
  certificationRequired: boolean;
  certificationValidity?: number;
  prerequisites?: string[];
  recordKeeping: TrainingRecordKeeping;
  effectiveness: TrainingEffectiveness;
  cost?: TrainingCost;
  schedule: TrainingSchedule[];
}

export enum TrainingType {
  INDUCTION = 'induction',
  REFRESHER = 'refresher',
  SPECIALIZED = 'specialized',
  REGULATORY = 'regulatory',
  COMPETENCY = 'competency',
  AWARENESS = 'awareness',
  TECHNICAL = 'technical',
  SOFT_SKILLS = 'soft_skills'
}

export enum TrainingFrequency {
  ONE_TIME = 'one_time',
  ANNUAL = 'annual',
  BI_ANNUAL = 'bi_annual',
  QUARTERLY = 'quarterly',
  MONTHLY = 'monthly',
  AS_NEEDED = 'as_needed',
  ON_HIRE = 'on_hire',
  ROLE_CHANGE = 'role_change'
}

export enum TrainingFormat {
  CLASSROOM = 'classroom',
  ONLINE = 'online',
  BLENDED = 'blended',
  ON_JOB = 'on_job',
  WORKSHOP = 'workshop',
  SEMINAR = 'seminar',
  WEBINAR = 'webinar',
  SELF_STUDY = 'self_study'
}

export enum DeliveryMethod {
  INSTRUCTOR_LED = 'instructor_led',
  SELF_PACED = 'self_paced',
  VIRTUAL_CLASSROOM = 'virtual_classroom',
  MENTORING = 'mentoring',
  COACHING = 'coaching',
  SIMULATION = 'simulation',
  HANDS_ON = 'hands_on'
}

// Operations and management interfaces
export interface ComplianceAssessmentRequest {
  entityType: EntityType;
  entityId: string;
  frameworks: string[];
  assessmentType: AssessmentType;
  scope?: AssessmentScope;
  priority: AssessmentPriority;
  deadline?: string;
  assignedTo?: string;
  requirements?: string[];
}

export enum AssessmentType {
  INITIAL = 'initial',
  PERIODIC = 'periodic',
  TRIGGERED = 'triggered',
  COMPREHENSIVE = 'comprehensive',
  FOCUSED = 'focused',
  SELF = 'self',
  THIRD_PARTY = 'third_party'
}

export enum AssessmentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export interface ComplianceSearchFilters {
  entityType?: EntityType[];
  status?: ComplianceStatus[];
  riskLevel?: ComplianceRiskLevel[];
  frameworks?: string[];
  dateRange?: DateRange;
  searchTerm?: string;
  requirementTypes?: RequirementType[];
  violationSeverity?: ViolationSeverity[];
  auditResults?: AuditResult[];
  certificationStatus?: CertificationStatus[];
  hasViolations?: boolean;
  overdueItems?: boolean;
  expiringCertifications?: boolean;
}

export interface ComplianceAnalytics {
  overallComplianceRate: number;
  complianceByFramework: Record<string, number>;
  complianceByEntity: Record<EntityType, number>;
  riskDistribution: Record<ComplianceRiskLevel, number>;
  violationTrends: ViolationTrend[];
  auditPerformance: AuditPerformance;
  certificationStatus: CertificationStatusSummary;
  trainingEffectiveness: TrainingEffectivenessSummary;
  costAnalysis: ComplianceCostAnalysis;
  benchmarking: ComplianceBenchmarking;
  predictions: CompliancePredictions;
}

export interface ComplianceMetadata {
  source: 'manual' | 'automated' | 'import' | 'api';
  tags: string[];
  customFields: Record<string, any>;
  workflowStage?: string;
  priority?: string;
  businessImpact?: string;
  stakeholders?: string[];
  communicationPreferences?: CommunicationPreference[];
  integrations?: IntegrationInfo[];
}