// Contract Management Types

export enum ContractStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  UNDER_NEGOTIATION = 'under_negotiation',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  RENEWED = 'renewed',
  SUSPENDED = 'suspended'
}

export enum ContractType {
  PURCHASE = 'purchase',
  SALES = 'sales',
  SERVICE = 'service',
  FRAMEWORK = 'framework',
  NDA = 'nda',
  MASTER_AGREEMENT = 'master_agreement',
  SUPPLY = 'supply',
  DISTRIBUTION = 'distribution',
  LICENSING = 'licensing',
  PARTNERSHIP = 'partnership'
}

export enum ContractPaymentTerms {
  NET_30 = 'net_30',
  NET_60 = 'net_60',
  NET_90 = 'net_90',
  IMMEDIATE = 'immediate',
  MILESTONE_BASED = 'milestone_based',
  PERFORMANCE_BASED = 'performance_based',
  SUBSCRIPTION = 'subscription',
  CUSTOM = 'custom'
}

export enum DeliveryTerms {
  EXW = 'exw', // Ex Works
  FCA = 'fca', // Free Carrier
  CPT = 'cpt', // Carriage Paid To
  CIP = 'cip', // Carriage and Insurance Paid To
  DAT = 'dat', // Delivered at Terminal
  DAP = 'dap', // Delivered at Place
  DDP = 'ddp', // Delivered Duty Paid
  FAS = 'fas', // Free Alongside Ship
  FOB = 'fob', // Free on Board
  CFR = 'cfr', // Cost and Freight
  CIF = 'cif'  // Cost, Insurance and Freight
}

export interface ContractParty {
  id: string;
  type: 'buyer' | 'supplier' | 'service_provider' | 'partner';
  organizationId: string;
  organizationName: string;
  representativeName: string;
  representativeTitle: string;
  representativeEmail: string;
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
  };
  signatureDate?: string;
  signatureMethod?: 'electronic' | 'manual' | 'docusign';
  signatureId?: string;
}

export interface ContractTerm {
  id: string;
  category: string;
  title: string;
  content: string;
  isMandatory: boolean;
  isNegotiable: boolean;
  version: number;
  lastModified: string;
  modifiedBy: string;
}

export interface ContractMilestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  completionCriteria: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  completedDate?: string;
  attachments?: string[];
  linkedPaymentPercentage?: number;
  dependencies?: string[]; // Other milestone IDs
}

export interface ContractObligation {
  id: string;
  type: 'delivery' | 'payment' | 'quality' | 'compliance' | 'reporting' | 'other';
  party: 'buyer' | 'supplier' | 'both';
  description: string;
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  dueDate?: string;
  completionStatus: 'pending' | 'in_progress' | 'completed' | 'overdue';
  lastCompletedDate?: string;
  nextDueDate?: string;
  reminderSettings?: {
    enabled: boolean;
    daysBefore: number;
    recipients: string[];
  };
}

export interface PriceSchedule {
  id: string;
  productId?: string;
  productName: string;
  sku?: string;
  unitPrice: number;
  currency: string;
  minimumQuantity?: number;
  maximumQuantity?: number;
  validFrom: string;
  validTo: string;
  discountTiers?: {
    quantity: number;
    discountPercentage: number;
  }[];
  priceAdjustmentFormula?: string; // e.g., "BASE_PRICE * (1 + COMMODITY_INDEX_CHANGE)"
}

export interface ContractAmendment {
  id: string;
  amendmentNumber: string;
  effectiveDate: string;
  description: string;
  changes: {
    field: string;
    previousValue: any;
    newValue: any;
  }[];
  reason: string;
  approvedBy: string;
  approvedDate: string;
  attachments?: string[];
}

export interface Contract {
  id: string;
  contractNumber: string;
  version: number;
  type: ContractType;
  title: string;
  description: string;
  status: ContractStatus;
  
  // Parties
  parties: ContractParty[];
  primaryBuyerId?: string;
  primarySupplierId?: string;
  
  // Dates
  effectiveDate: string;
  expirationDate: string;
  executionDate?: string;
  renewalDate?: string;
  terminationDate?: string;
  
  // Terms and Conditions
  terms: ContractTerm[];
  specialConditions?: string[];
  
  // Financial
  totalValue: number;
  currency: string;
  paymentTerms: ContractPaymentTerms;
  paymentSchedule?: {
    installmentNumber: number;
    amount: number;
    dueDate: string;
    description: string;
    status: 'pending' | 'paid' | 'overdue';
  }[];
  
  // Delivery
  deliveryTerms: DeliveryTerms;
  deliveryLocation?: string;
  deliverySchedule?: {
    deliveryNumber: number;
    items: string[];
    quantity: number;
    expectedDate: string;
    actualDate?: string;
    status: 'pending' | 'delivered' | 'delayed';
  }[];
  
  // Products/Services
  priceSchedule: PriceSchedule[];
  scopeOfWork?: string;
  deliverables?: string[];
  
  // Milestones and Obligations
  milestones: ContractMilestone[];
  obligations: ContractObligation[];
  
  // Performance
  performanceMetrics?: {
    metric: string;
    target: number;
    unit: string;
    measurementFrequency: string;
    penalties?: string;
  }[];
  slaTerms?: {
    metric: string;
    target: string;
    measurement: string;
    remedy: string;
  }[];
  
  // Risk and Compliance
  liabilityLimit?: number;
  insuranceRequirements?: {
    type: string;
    minimumCoverage: number;
    provider?: string;
    policyNumber?: string;
    expirationDate?: string;
  }[];
  disputeResolution?: string;
  governingLaw?: string;
  
  // Documents
  documents: {
    id: string;
    type: 'main_contract' | 'annex' | 'amendment' | 'certificate' | 'other';
    name: string;
    url: string;
    uploadedDate: string;
    uploadedBy: string;
    version?: number;
  }[];
  templateId?: string;
  parentContractId?: string; // For renewals or related contracts
  
  // Amendments and History
  amendments: ContractAmendment[];
  renewalHistory?: {
    previousContractId: string;
    renewalDate: string;
    changes: string;
  }[];
  
  // Metadata
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
  approvers?: {
    userId: string;
    role: string;
    approvedAt?: string;
    comments?: string;
    status: 'pending' | 'approved' | 'rejected';
  }[];
  
  // Notifications and Alerts
  alerts?: {
    type: 'expiration' | 'renewal' | 'milestone' | 'obligation' | 'payment';
    triggerDate: string;
    message: string;
    recipients: string[];
    sent: boolean;
  }[];
  
  // Integration
  erpIntegrationId?: string;
  relatedOrderIds?: string[];
  relatedInvoiceIds?: string[];
  
  // Custom fields
  customFields?: Record<string, any>;
  tags?: string[];
  notes?: string;
}

// Request/Response types
export interface CreateContractRequest {
  type: ContractType;
  title: string;
  description: string;
  parties: Omit<ContractParty, 'id'>[];
  effectiveDate: string;
  expirationDate: string;
  totalValue: number;
  currency: string;
  paymentTerms: ContractPaymentTerms;
  deliveryTerms: DeliveryTerms;
  templateId?: string;
  terms?: Omit<ContractTerm, 'id' | 'version' | 'lastModified' | 'modifiedBy'>[];
  priceSchedule?: Omit<PriceSchedule, 'id'>[];
  milestones?: Omit<ContractMilestone, 'id'>[];
  obligations?: Omit<ContractObligation, 'id'>[];
}

export interface UpdateContractRequest {
  status?: ContractStatus;
  parties?: ContractParty[];
  terms?: ContractTerm[];
  priceSchedule?: PriceSchedule[];
  milestones?: ContractMilestone[];
  obligations?: ContractObligation[];
  amendments?: Omit<ContractAmendment, 'id'>[];
  customFields?: Record<string, any>;
}

export interface ContractSearchParams {
  status?: ContractStatus[];
  type?: ContractType[];
  partyId?: string;
  dateRange?: {
    start: string;
    end: string;
    dateType: 'effective' | 'expiration' | 'created';
  };
  valueRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  searchTerm?: string;
  includeExpired?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'contractNumber' | 'effectiveDate' | 'expirationDate' | 'value' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface ContractAnalytics {
  totalContracts: number;
  activeContracts: number;
  totalValue: number;
  averageValue: number;
  byStatus: Record<ContractStatus, number>;
  byType: Record<ContractType, number>;
  expiringInDays: {
    days: number;
    count: number;
    contracts: {
      id: string;
      contractNumber: string;
      title: string;
      expirationDate: string;
      value: number;
    }[];
  }[];
  upcomingMilestones: {
    contractId: string;
    contractNumber: string;
    milestone: ContractMilestone;
  }[];
  overdueObligations: {
    contractId: string;
    contractNumber: string;
    obligation: ContractObligation;
  }[];
  renewalOpportunities: {
    contractId: string;
    contractNumber: string;
    title: string;
    expirationDate: string;
    value: number;
    performanceScore?: number;
  }[];
}

export interface ContractTemplate {
  id: string;
  name: string;
  type: ContractType;
  description: string;
  standardTerms: Omit<ContractTerm, 'id' | 'version' | 'lastModified' | 'modifiedBy'>[];
  requiredFields: string[];
  optionalFields: string[];
  defaultValues: Partial<Contract>;
  approvalWorkflow?: {
    step: number;
    role: string;
    minApprovers: number;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContractApprovalRequest {
  contractId: string;
  approverId: string;
  comments?: string;
  conditionalApproval?: boolean;
  conditions?: string[];
}

export interface ContractPerformanceReport {
  contractId: string;
  reportingPeriod: {
    start: string;
    end: string;
  };
  milestoneCompletion: {
    total: number;
    completed: number;
    onTime: number;
    delayed: number;
  };
  obligationCompliance: {
    total: number;
    completed: number;
    overdue: number;
    complianceRate: number;
  };
  financialPerformance: {
    plannedValue: number;
    actualValue: number;
    variance: number;
    paymentCompliance: number;
  };
  qualityMetrics?: {
    metric: string;
    target: number;
    actual: number;
    compliance: boolean;
  }[];
  issues?: {
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    dateReported: string;
    status: 'open' | 'resolved';
  }[];
  overallScore: number; // 0-100
  recommendations?: string[];
}