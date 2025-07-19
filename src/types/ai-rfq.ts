// AI-Powered RFQ Management Types
import { DateRange, TrendData, TransportationMode } from './common';

export interface EnhancedRFQ {
  id: string;
  title: string;
  description: string;
  status: RFQStatus;
  type: RFQType;
  priority: RFQPriority;
  requirements: ProductRequirement[];
  specifications: TechnicalSpecification[];
  compliance: ComplianceRequirement[];
  logistics: LogisticsRequirement;
  commercialTerms: CommercialTerms;
  timeline: RFQTimeline;
  budgetRange?: BudgetRange;
  targetMarkets: string[];
  qualityStandards: QualityStandard[];
  sustainability?: SustainabilityRequirement;
  aiAnalysis?: AIAnalysisResult;
  aiRecommendations?: AIRecommendation[];
  matchingResults?: SupplierMatch[];
  documents: RFQDocument[];
  communications: RFQCommunication[];
  proposals: ProposalSummary[];
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  deadlineAt: string;
  version: number;
}

export enum RFQStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  PUBLISHED = 'published',
  AI_ANALYZING = 'ai_analyzing',
  COLLECTING_PROPOSALS = 'collecting_proposals',
  EVALUATING_PROPOSALS = 'evaluating_proposals',
  NEGOTIATING = 'negotiating',
  AWARDED = 'awarded',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum RFQType {
  STANDARD = 'standard',
  URGENT = 'urgent',
  STRATEGIC = 'strategic',
  INNOVATION = 'innovation',
  SUSTAINABILITY = 'sustainability',
  COMPLIANCE_FOCUSED = 'compliance_focused'
}

export enum RFQPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ProductRequirement {
  id: string;
  category: string;
  subcategory?: string;
  productName: string;
  description: string;
  quantity: QuantityRequirement;
  qualityGrade?: string;
  origin?: string[];
  seasonality?: SeasonalityInfo;
  shelfLife?: ShelfLifeRequirement;
  packaging: PackagingRequirement;
  labeling: LabelingRequirement;
  certifications: string[];
  allergenInfo?: AllergenRequirement;
  nutritionalRequirements?: NutritionalSpecification[];
  physicalProperties?: PhysicalProperty[];
  chemicalProperties?: ChemicalProperty[];
  microbiologicalLimits?: MicrobiologicalLimit[];
  customAttributes?: Record<string, any>;
}

export interface QuantityRequirement {
  minimum: number;
  maximum?: number;
  optimal?: number;
  unit: string;
  frequency?: 'one-time' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  flexibilityPercentage?: number;
}

export interface TechnicalSpecification {
  id: string;
  category: string;
  parameter: string;
  value: string | number;
  unit?: string;
  tolerance?: number;
  mandatory: boolean;
  testMethod?: string;
  frequency?: string;
  acceptanceCriteria?: string;
  alternativeOptions?: string[];
}

export interface ComplianceRequirement {
  id: string;
  type: 'certification' | 'standard' | 'regulation' | 'audit';
  name: string;
  description: string;
  mandatory: boolean;
  targetMarkets: string[];
  validityPeriod?: number;
  renewalRequired?: boolean;
  documentRequired?: boolean;
  verificationLevel: 'self-declaration' | 'third-party' | 'government';
  cost?: number;
  timeline?: number;
}

export interface LogisticsRequirement {
  incoterms: string;
  deliveryLocation: DeliveryLocation;
  deliveryWindow: TimeWindow;
  packagingRequirements: PackagingRequirement;
  transportationMode: TransportationMode[];
  temperatureControl?: TemperatureRequirement;
  handlingInstructions?: string[];
  insuranceRequirements?: InsuranceRequirement;
  customsRequirements?: CustomsRequirement;
  trackingRequirements?: TrackingRequirement;
}

export interface CommercialTerms {
  paymentTerms: string;
  currency: string;
  priceValidity: number;
  priceIncludes: string[];
  priceExcludes?: string[];
  discountStructure?: DiscountStructure;
  penaltyClause?: PenaltyClause;
  bonusClause?: BonusClause;
  contractDuration?: number;
  renewalOptions?: RenewalOption;
  terminationClause?: TerminationClause;
  forceMapjeure?: boolean;
  warrantyTerms?: WarrantyTerms;
}

export interface AIAnalysisResult {
  id: string;
  analysisType: 'requirements' | 'market' | 'risk' | 'optimization' | 'compliance';
  confidence: number;
  processedAt: string;
  insights: AIInsight[];
  recommendations: AIRecommendation[];
  riskAssessment: RiskAssessment;
  marketAnalysis: MarketAnalysis;
  complianceAnalysis: ComplianceAnalysis;
  optimizations: OptimizationSuggestion[];
  predictedOutcomes: PredictedOutcome[];
}

export interface AIInsight {
  type: 'warning' | 'opportunity' | 'optimization' | 'risk' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  actionable: boolean;
  actions?: RecommendedAction[];
  confidence: number;
  dataSource: string[];
}

export interface AIRecommendation {
  id: string;
  type: 'supplier' | 'specification' | 'commercial' | 'logistics' | 'compliance';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  rationale: string;
  expectedBenefit: string;
  implementationComplexity: 'low' | 'medium' | 'high';
  estimatedImpact: {
    cost?: number;
    time?: number;
    quality?: number;
    risk?: number;
  };
  alternatives?: Alternative[];
  confidence: number;
  applicableConditions?: string[];
}

export interface SupplierMatch {
  supplierId: string;
  supplierName: string;
  matchScore: number;
  matchReasons: MatchReason[];
  capabilities: SupplierCapability[];
  pricing: PricingEstimate;
  delivery: DeliveryEstimate;
  quality: QualityAssessment;
  compliance: ComplianceStatus;
  risk: RiskProfile;
  pastPerformance: PerformanceHistory;
  recommendations: string[];
  concerns?: string[];
  confidence: number;
}

export interface MatchReason {
  factor: string;
  weight: number;
  score: number;
  explanation: string;
}

export interface RFQDocument {
  id: string;
  type: DocumentType;
  name: string;
  description?: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  size: number;
  mimeType: string;
  checksum?: string;
  accessLevel: 'public' | 'restricted' | 'confidential';
  downloadCount: number;
  lastAccessed?: string;
}

export interface RFQTimeline {
  publishDate: string;
  clarificationDeadline?: string;
  proposalDeadline: string;
  evaluationPeriod: number;
  awardDate?: string;
  contractStartDate?: string;
  milestones?: TimelineMilestone[];
}

export interface AIMatchingOptions {
  includeNewSuppliers: boolean;
  geographicPreference?: string[];
  supplierSizePreference?: 'small' | 'medium' | 'large' | 'any';
  certificationWeight: number;
  priceWeight: number;
  qualityWeight: number;
  deliveryWeight: number;
  sustainabilityWeight: number;
  riskTolerance: 'low' | 'medium' | 'high';
  innovationFocus: boolean;
  diversityGoals?: DiversityGoal[];
  maxSuppliersToMatch: number;
  confidenceThreshold: number;
}

export interface MarketAnalysis {
  marketSize: number;
  marketGrowth: number;
  competitiveness: 'low' | 'medium' | 'high';
  seasonality: SeasonalityPattern[];
  priceVolatility: number;
  supplyRisk: 'low' | 'medium' | 'high';
  demandTrends: DemandTrend[];
  alternativeProducts: Alternative[];
  geographicAnalysis: GeographicMarketData[];
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  mitigationStrategies: MitigationStrategy[];
  contingencyPlans: ContingencyPlan[];
  monitoringRequirements: MonitoringRequirement[];
}

export interface OptimizationSuggestion {
  type: 'cost' | 'time' | 'quality' | 'sustainability' | 'risk';
  suggestion: string;
  expectedBenefit: number;
  implementationEffort: 'low' | 'medium' | 'high';
  prerequisites?: string[];
  tradeoffs?: string[];
}

// RFQ Operations
export interface CreateRFQRequest {
  title: string;
  description: string;
  type: RFQType;
  priority: RFQPriority;
  requirements: Omit<ProductRequirement, 'id'>[];
  specifications?: Omit<TechnicalSpecification, 'id'>[];
  compliance?: Omit<ComplianceRequirement, 'id'>[];
  logistics: LogisticsRequirement;
  commercialTerms: CommercialTerms;
  timeline: RFQTimeline;
  targetMarkets: string[];
  qualityStandards: QualityStandard[];
  budgetRange?: BudgetRange;
  aiMatchingOptions?: AIMatchingOptions;
  templateId?: string;
}

export interface UpdateRFQRequest {
  title?: string;
  description?: string;
  priority?: RFQPriority;
  requirements?: Partial<ProductRequirement>[];
  specifications?: Partial<TechnicalSpecification>[];
  compliance?: Partial<ComplianceRequirement>[];
  logistics?: Partial<LogisticsRequirement>;
  commercialTerms?: Partial<CommercialTerms>;
  timeline?: Partial<RFQTimeline>;
  targetMarkets?: string[];
  qualityStandards?: QualityStandard[];
  budgetRange?: BudgetRange;
}

export interface RFQSearchFilters {
  status?: RFQStatus[];
  type?: RFQType[];
  priority?: RFQPriority[];
  createdBy?: string;
  assignedTo?: string;
  dateRange?: DateRange;
  targetMarkets?: string[];
  categories?: string[];
  budgetRange?: BudgetRange;
  searchTerm?: string;
  hasAIAnalysis?: boolean;
  complianceRequired?: boolean;
}

export interface RFQAnalytics {
  totalRFQs: number;
  byStatus: Record<RFQStatus, number>;
  byType: Record<RFQType, number>;
  byPriority: Record<RFQPriority, number>;
  averageResponseTime: number;
  successRate: number;
  aiUsageRate: number;
  costSavings: number;
  qualityImprovements: number;
  supplierParticipation: number;
  trendsAnalysis: TrendData[];
}

// AI-specific interfaces
export interface AIRFQOptimization {
  original: EnhancedRFQ;
  optimized: EnhancedRFQ;
  changes: OptimizationChange[];
  benefits: OptimizationBenefit[];
  implementation: ImplementationPlan;
  confidence: number;
}

export interface AISpecificationGenerator {
  productType: string;
  targetMarkets: string[];
  qualityLevel: 'basic' | 'premium' | 'organic' | 'specialty';
  regulations: string[];
  generatedSpecs: TechnicalSpecification[];
  confidence: number;
  alternatives: AlternativeSpecification[];
}

export interface AIPricingPrediction {
  rfqId: string;
  predictions: PricePrediction[];
  factors: PricingFactor[];
  confidence: number;
  marketConditions: MarketCondition[];
  recommendations: PricingRecommendation[];
  volatilityAssessment: VolatilityAssessment;
}

export interface AIComplianceValidator {
  rfqId: string;
  targetMarkets: string[];
  validationResults: ComplianceValidationResult[];
  gaps: ComplianceGap[];
  recommendations: ComplianceRecommendation[];
  timeline: ComplianceTimeline;
  costs: ComplianceCost[];
}