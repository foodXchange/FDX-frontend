// Real-time Sample Tracking System Types
export interface Sample {
  id: string;
  sampleNumber: string;
  rfqId?: string;
  productId?: string;
  supplierId: string;
  requestedBy: string;
  status: SampleStatus;
  type: SampleType;
  priority: SamplePriority;
  product: SampleProduct;
  quantity: SampleQuantity;
  packaging: SamplePackaging;
  labeling: SampleLabeling;
  qualityRequirements: QualityRequirement[];
  tracking: TrackingInfo;
  chainOfCustody: CustodyRecord[];
  temperatureLog: TemperatureReading[];
  locationHistory: LocationUpdate[];
  events: SampleEvent[];
  testing: TestingInfo;
  results: TestResult[];
  feedback: SampleFeedback[];
  documents: SampleDocument[];
  metadata: SampleMetadata;
  createdAt: string;
  updatedAt: string;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  version: number;
}

export enum SampleStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  RECEIVED = 'received',
  TESTING_IN_PROGRESS = 'testing_in_progress',
  TESTING_COMPLETE = 'testing_complete',
  RESULTS_AVAILABLE = 'results_available',
  APPROVED_FOR_USE = 'approved_for_use',
  REJECTED = 'rejected',
  RETURNED = 'returned',
  DISPOSED = 'disposed'
}

export enum SampleType {
  INITIAL = 'initial',
  VALIDATION = 'validation',
  PRODUCTION = 'production',
  QUALITY_CHECK = 'quality_check',
  REGULATORY = 'regulatory',
  CUSTOMER_APPROVAL = 'customer_approval',
  TRIAL_BATCH = 'trial_batch',
  REFERENCE = 'reference'
}

export enum SamplePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export interface SampleProduct {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  brand?: string;
  grade?: string;
  origin?: string;
  batchNumber?: string;
  lotNumber?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  specifications: ProductSpecification[];
  ingredients?: Ingredient[];
  nutritionalInfo?: NutritionalInfo;
  allergenInfo?: AllergenInfo;
  certifications: string[];
}

export interface SampleQuantity {
  amount: number;
  unit: string;
  volume?: number;
  weight?: number;
  pieces?: number;
  packagingUnits?: number;
  minimumRequired: number;
  requested: number;
  received?: number;
}

export interface SamplePackaging {
  type: string;
  material: string;
  size: string;
  weight: number;
  dimensions: Dimensions;
  temperatureRange?: TemperatureRange;
  humidityRange?: HumidityRange;
  lightProtection?: boolean;
  gasFlush?: boolean;
  vacuum?: boolean;
  specialInstructions?: string[];
}

export interface SampleLabeling {
  productLabel: string;
  batchLabel?: string;
  expiryLabel?: string;
  allergenLabel?: string;
  certificationLabels?: string[];
  handlingInstructions?: string[];
  storageInstructions?: string[];
  customLabels?: LabelRequirement[];
}

export interface TrackingInfo {
  trackingNumber: string;
  qrCode?: string;
  barcode?: string;
  rfidTag?: string;
  carrier?: string;
  currentLocation: Location;
  destination: Location;
  estimatedArrival?: string;
  actualArrival?: string;
  lastUpdate: string;
  deliverySignature?: string;
  proofOfDelivery?: string;
  transportationMode: TransportationMode;
  route?: RouteInfo[];
}

export interface CustodyRecord {
  id: string;
  timestamp: string;
  from: CustodyParty;
  to: CustodyParty;
  location: Location;
  purpose: string;
  conditions: HandlingConditions;
  witnessedBy?: string;
  signature?: string;
  photos?: string[];
  notes?: string;
  temperature?: number;
  humidity?: number;
  integrity: IntegrityCheck;
}

export interface CustodyParty {
  type: 'supplier' | 'carrier' | 'laboratory' | 'customer' | 'storage' | 'inspector';
  organizationId: string;
  organizationName: string;
  contactPerson: string;
  contactDetails: ContactInfo;
  authorization: AuthorizationInfo;
}

export interface TemperatureReading {
  id: string;
  timestamp: string;
  temperature: number;
  humidity?: number;
  location: Location;
  device: MonitoringDevice;
  withinRange: boolean;
  alertTriggered?: boolean;
  correctionAction?: string;
  verifiedBy?: string;
}

export interface LocationUpdate {
  id: string;
  timestamp: string;
  location: Location;
  coordinates: GeoCoordinates;
  accuracy: number;
  speed?: number;
  heading?: number;
  method: 'gps' | 'wifi' | 'cellular' | 'manual' | 'rfid' | 'barcode';
  device?: string;
  updatedBy?: string;
  verified: boolean;
}

export interface SampleEvent {
  id: string;
  timestamp: string;
  type: SampleEventType;
  description: string;
  location?: Location;
  performedBy: string;
  relatedDocuments?: string[];
  impact: EventImpact;
  automaticEvent: boolean;
  requiresAction?: boolean;
  actionRequired?: string;
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export enum SampleEventType {
  CREATED = 'created',
  APPROVED = 'approved',
  PREPARED = 'prepared',
  PACKAGED = 'packaged',
  LABELED = 'labeled',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  RECEIVED = 'received',
  CONDITION_CHECK = 'condition_check',
  TEMPERATURE_ALERT = 'temperature_alert',
  DAMAGE_REPORTED = 'damage_reported',
  TESTING_STARTED = 'testing_started',
  TESTING_COMPLETED = 'testing_completed',
  RESULTS_RECEIVED = 'results_received',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISPOSED = 'disposed',
  RETURNED = 'returned'
}

export enum EventImpact {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface TestingInfo {
  laboratoryId?: string;
  laboratoryName?: string;
  testPlan: TestPlan;
  estimatedDuration: number;
  actualDuration?: number;
  cost?: number;
  certifications: string[];
  accreditations: string[];
  equipment: EquipmentInfo[];
  personnel: PersonnelInfo[];
  protocols: TestProtocol[];
}

export interface TestPlan {
  id: string;
  name: string;
  description: string;
  tests: TestSpecification[];
  sequence: TestSequence[];
  samplePreparation: PreparationStep[];
  requiredEquipment: string[];
  estimatedTime: number;
  cost: number;
  accreditationRequired: boolean;
}

export interface TestSpecification {
  id: string;
  name: string;
  type: TestType;
  method: string;
  standard: string;
  parameters: TestParameter[];
  acceptanceCriteria: AcceptanceCriteria[];
  reportingRequirements: ReportingRequirement[];
  priority: TestPriority;
  cost: number;
  duration: number;
}

export enum TestType {
  PHYSICAL = 'physical',
  CHEMICAL = 'chemical',
  MICROBIOLOGICAL = 'microbiological',
  NUTRITIONAL = 'nutritional',
  SENSORY = 'sensory',
  ALLERGEN = 'allergen',
  CONTAMINANT = 'contaminant',
  PACKAGING = 'packaging',
  LABEL = 'label',
  STABILITY = 'stability',
  SHELF_LIFE = 'shelf_life'
}

export enum TestPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  OPTIONAL = 'optional'
}

export interface TestResult {
  id: string;
  testId: string;
  sampleId: string;
  testName: string;
  performedBy: string;
  laboratoryId?: string;
  completedAt: string;
  status: TestResultStatus;
  overallResult: 'pass' | 'fail' | 'conditional' | 'pending';
  parameters: ParameterResult[];
  observations: string[];
  recommendations: string[];
  certificate?: string;
  reportUrl?: string;
  validatedBy?: string;
  validatedAt?: string;
  expiresAt?: string;
}

export enum TestResultStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export interface ParameterResult {
  parameter: string;
  value: string | number;
  unit?: string;
  specification: string;
  result: 'pass' | 'fail' | 'conditional';
  confidence?: number;
  method: string;
  uncertainty?: number;
  comments?: string;
}

export interface SampleFeedback {
  id: string;
  providedBy: string;
  role: 'buyer' | 'supplier' | 'laboratory' | 'inspector' | 'customer';
  timestamp: string;
  category: FeedbackCategory;
  rating: number;
  comments: string;
  recommendations?: string[];
  photos?: string[];
  approvalStatus?: 'approved' | 'conditional' | 'rejected';
  nextSteps?: string[];
  followUpRequired?: boolean;
  followUpDate?: string;
}

export enum FeedbackCategory {
  QUALITY = 'quality',
  PACKAGING = 'packaging',
  LABELING = 'labeling',
  CONDITION = 'condition',
  SPECIFICATION = 'specification',
  DELIVERY = 'delivery',
  DOCUMENTATION = 'documentation',
  OVERALL = 'overall'
}

export interface SampleDocument {
  id: string;
  type: SampleDocumentType;
  name: string;
  description?: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  size: number;
  mimeType: string;
  category: string;
  accessLevel: 'public' | 'restricted' | 'confidential';
  expiresAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export enum SampleDocumentType {
  SAMPLE_REQUEST = 'sample_request',
  PREPARATION_SHEET = 'preparation_sheet',
  PACKING_LIST = 'packing_list',
  SHIPPING_LABEL = 'shipping_label',
  DELIVERY_RECEIPT = 'delivery_receipt',
  TEST_REPORT = 'test_report',
  CERTIFICATE = 'certificate',
  PHOTO = 'photo',
  FEEDBACK_FORM = 'feedback_form',
  APPROVAL_DOCUMENT = 'approval_document'
}

export interface SampleMetadata {
  source: 'manual' | 'api' | 'import' | 'rfq' | 'automated';
  tags: string[];
  customFields: Record<string, any>;
  internalNotes?: string;
  customerReference?: string;
  supplierReference?: string;
  projectCode?: string;
  costCenter?: string;
  approvalWorkflow?: string;
  complianceFlags?: string[];
}

// Sample Operations
export interface CreateSampleRequest {
  rfqId?: string;
  productId?: string;
  supplierId: string;
  type: SampleType;
  priority: SamplePriority;
  product: Omit<SampleProduct, 'specifications'> & { specifications?: ProductSpecification[] };
  quantity: SampleQuantity;
  packaging: SamplePackaging;
  labeling: SampleLabeling;
  qualityRequirements: QualityRequirement[];
  testingRequirements?: Omit<TestingInfo, 'laboratoryId' | 'laboratoryName'>;
  deliveryLocation: Location;
  requestedDeliveryDate: string;
  specialInstructions?: string[];
  budget?: number;
}

export interface UpdateSampleRequest {
  status?: SampleStatus;
  priority?: SamplePriority;
  quantity?: Partial<SampleQuantity>;
  packaging?: Partial<SamplePackaging>;
  tracking?: Partial<TrackingInfo>;
  testingInfo?: Partial<TestingInfo>;
  estimatedCompletionDate?: string;
}

export interface SampleSearchFilters {
  status?: SampleStatus[];
  type?: SampleType[];
  priority?: SamplePriority[];
  supplierId?: string;
  requestedBy?: string;
  dateRange?: DateRange;
  location?: string;
  testingRequired?: boolean;
  hasResults?: boolean;
  searchTerm?: string;
}

export interface SampleAnalytics {
  totalSamples: number;
  byStatus: Record<SampleStatus, number>;
  byType: Record<SampleType, number>;
  byPriority: Record<SamplePriority, number>;
  averageProcessingTime: number;
  averageTestingTime: number;
  approvalRate: number;
  onTimeDeliveryRate: number;
  qualityPassRate: number;
  costAnalysis: CostAnalysis;
  trendData: TrendData[];
}

// Real-time tracking interfaces
export interface RealTimeTrackingData {
  sampleId: string;
  timestamp: string;
  location: Location;
  temperature?: number;
  humidity?: number;
  status: SampleStatus;
  alerts: TrackingAlert[];
  nextCheckpoint?: Location;
  estimatedArrival?: string;
}

export interface TrackingAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedAt?: string;
  actions: AlertAction[];
}

export enum AlertType {
  TEMPERATURE_DEVIATION = 'temperature_deviation',
  HUMIDITY_DEVIATION = 'humidity_deviation',
  LOCATION_DEVIATION = 'location_deviation',
  DELAY = 'delay',
  DAMAGE = 'damage',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  EQUIPMENT_FAILURE = 'equipment_failure'
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface AlertAction {
  type: 'notify' | 'escalate' | 'correct' | 'investigate' | 'document';
  description: string;
  assignedTo?: string;
  deadline?: string;
  completed?: boolean;
  completedAt?: string;
}

// IoT and monitoring interfaces
export interface MonitoringDevice {
  id: string;
  type: DeviceType;
  model: string;
  serialNumber: string;
  location?: Location;
  status: DeviceStatus;
  lastReading?: string;
  batteryLevel?: number;
  signalStrength?: number;
  calibrationDate?: string;
  nextCalibrationDate?: string;
  accuracy: number;
  range: SensorRange;
}

export enum DeviceType {
  TEMPERATURE_SENSOR = 'temperature_sensor',
  HUMIDITY_SENSOR = 'humidity_sensor',
  GPS_TRACKER = 'gps_tracker',
  RFID_READER = 'rfid_reader',
  BARCODE_SCANNER = 'barcode_scanner',
  CAMERA = 'camera',
  ACCELEROMETER = 'accelerometer',
  PRESSURE_SENSOR = 'pressure_sensor'
}

export enum DeviceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
  CALIBRATION = 'calibration'
}

export interface SensorReading {
  deviceId: string;
  timestamp: string;
  type: SensorType;
  value: number;
  unit: string;
  location?: Location;
  quality: ReadingQuality;
  validated: boolean;
}

export enum SensorType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  PRESSURE = 'pressure',
  ACCELERATION = 'acceleration',
  LIGHT = 'light',
  SHOCK = 'shock'
}

export enum ReadingQuality {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  INVALID = 'invalid'
}