// Common types used across multiple modules

export interface DateRange {
  start: string;
  end: string;
}

export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  title?: string;
  department?: string;
}

export interface Location {
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates?: GeoCoordinates;
  type?: 'origin' | 'destination' | 'current' | 'warehouse' | 'office';
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'mm' | 'cm' | 'm' | 'in' | 'ft';
}

export interface TemperatureRange {
  min: number;
  max: number;
  unit: 'C' | 'F' | 'K';
}

export interface HumidityRange {
  min: number;
  max: number;
  unit: '%RH';
}

export interface CostAnalysis {
  totalCost: number;
  averageCostPerSample?: number;
  costByType?: Record<string, number>;
  costByCategory?: Record<string, number>;
  currency?: string;
}

export interface TrendData {
  timestamp: string;
  value: number;
  label?: string;
  category?: string;
}

export interface AuthorizationInfo {
  authorized: boolean;
  authorizedBy?: string;
  authorizedAt?: string;
  expiresAt?: string;
  level?: string;
  valid?: boolean;
}

export interface ScheduleRequirement {
  minDuration?: number;
  maxDuration?: number;
  preferredTimes?: string[];
  blackoutDates?: string[];
  timezone?: string;
}

export interface ProductSpecification {
  parameter: string;
  value: string | number;
  unit?: string;
  min?: number;
  max?: number;
  tolerance?: number;
}

export interface Ingredient {
  name: string;
  percentage?: number;
  origin?: string;
  certification?: string;
}

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  [key: string]: number | undefined;
}

export interface AllergenInfo {
  contains: string[];
  mayContain: string[];
  freeFrom: string[];
}

export interface LabelRequirement {
  type: string;
  content: string;
  position?: string;
  size?: string;
  language?: string;
}

export interface TransportationMode {
  type: 'air' | 'sea' | 'road' | 'rail' | 'courier' | 'hand-carry';
  carrier?: string;
  service?: string;
}

export interface RouteInfo {
  location: Location;
  estimatedArrival: string;
  actualArrival?: string;
  status: string;
}

export interface HandlingConditions {
  temperature?: TemperatureRange;
  humidity?: HumidityRange;
  lightProtection?: boolean;
  orientation?: string;
  specialInstructions?: string[];
}

export interface IntegrityCheck {
  intact: boolean;
  verified: boolean;
  issues: string[];
  checkedBy?: string;
  checkedAt?: string;
}

export interface MonitoringDevice {
  id: string;
  type: string;
  model?: string;
  status: string;
  lastReading?: string;
  accuracy?: number;
}

export interface SensorRange {
  min: number;
  max: number;
  unit: string;
}

export interface EquipmentInfo {
  id: string;
  name: string;
  type: string;
  calibrationDate?: string;
  nextCalibrationDate?: string;
}

export interface PersonnelInfo {
  id: string;
  name: string;
  role: string;
  qualification?: string;
  certifications?: string[];
}

export interface TestProtocol {
  id: string;
  name: string;
  version: string;
  standard?: string;
  steps: string[];
}

export interface TestSequence {
  order: number;
  testId: string;
  dependsOn?: string[];
  parallel?: boolean;
}

export interface PreparationStep {
  step: number;
  description: string;
  duration: number;
  equipment?: string[];
  reagents?: string[];
}

export interface TestParameter {
  name: string;
  type: string;
  unit?: string;
  range?: { min: number; max: number };
}

export interface AcceptanceCriteria {
  parameter: string;
  condition: string;
  value: string | number;
  critical: boolean;
}

export interface ReportingRequirement {
  type: string;
  format: string;
  frequency?: string;
  recipients?: string[];
}

// Performance and Analytics types
export interface PerformanceData {
  metric: string;
  value: number;
  timestamp: string;
  unit?: string;
  target?: number;
  status?: 'good' | 'warning' | 'critical';
}

export interface AnalyticsData {
  period: DateRange;
  metrics: Record<string, number>;
  trends: TrendData[];
  insights?: string[];
}

// Blockchain and IoT types
export interface BlockchainRecord {
  transactionId: string;
  blockNumber: number;
  timestamp: string;
  data: any;
  verified: boolean;
}

export interface IoTDeviceData {
  deviceId: string;
  timestamp: string;
  readings: Record<string, number>;
  location?: GeoCoordinates;
  batteryLevel?: number;
  signalStrength?: number;
}

// Audit types
export interface CorrectiveAction {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedAt?: string;
  evidence?: string[];
}

export interface AuditRecommendation {
  id: string;
  type: 'improvement' | 'corrective' | 'preventive';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'accepted' | 'rejected' | 'implemented';
}

export interface AuditFinding {
  id: string;
  category: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  evidence: string[];
  recommendations: AuditRecommendation[];
  correctiveActions: CorrectiveAction[];
}

export interface AuditTeamMember {
  userId: string;
  name: string;
  role: 'lead' | 'member' | 'observer' | 'specialist';
  expertise: string[];
}

// Supplier specific types
export interface SpendAnalysis {
  totalSpend: number;
  byCategory: Record<string, number>;
  byProduct: Record<string, number>;
  trend: TrendData[];
  savingsOpportunities?: number;
}

export interface DiversityMetrics {
  minorityOwned: boolean;
  womenOwned: boolean;
  veteranOwned: boolean;
  smallBusiness: boolean;
  certifications: string[];
  spendPercentage?: number;
}

export interface SustainabilityMetrics {
  carbonFootprint?: number;
  renewableEnergyUsage?: number;
  wasteReduction?: number;
  sustainabilityCertifications: string[];
  esgScore?: number;
}

export interface ReviewPeriod {
  start: string;
  end: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'ad-hoc';
}

export interface ReviewCategory {
  name: string;
  weight: number;
  score: number;
  comments?: string;
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'cancelled';
  completedAt?: string;
}

export interface ReviewParticipant {
  userId: string;
  name: string;
  role: string;
  department: string;
  feedback?: string;
}

export interface CommunicationParticipant {
  userId: string;
  name: string;
  email: string;
  role: string;
  organization?: string;
}

// Integration types
export interface IntegrationConfig {
  type: 'erp' | 'crm' | 'wms' | 'tms' | 'custom';
  endpoint: string;
  authentication: {
    type: 'basic' | 'oauth2' | 'apikey' | 'jwt';
    credentials?: any;
  };
  mapping?: Record<string, string>;
  syncFrequency?: string;
  enabled: boolean;
}

export interface WebhookConfig {
  url: string;
  events: string[];
  secret?: string;
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
  };
  enabled: boolean;
}

// AI and ML types
export interface ModelPrediction {
  confidence: number;
  value: any;
  alternatives?: Array<{
    value: any;
    confidence: number;
  }>;
  explanation?: string;
}

export interface TrainingData {
  inputFeatures: Record<string, any>;
  outputLabel: any;
  weight?: number;
  metadata?: Record<string, any>;
}

// Capacity and constraints
export interface CapacityConstraint {
  type: 'volume' | 'weight' | 'units' | 'custom';
  current: number;
  maximum: number;
  unit: string;
  utilizationPercentage: number;
}

export interface SeasonalVariation {
  period: string;
  demandMultiplier: number;
  capacityAdjustment?: number;
  notes?: string;
}