// Inventory Management Types

export enum StockStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  RESERVED = 'reserved',
  IN_TRANSIT = 'in_transit',
  DAMAGED = 'damaged',
  EXPIRED = 'expired',
  QUARANTINE = 'quarantine'
}

export enum MovementType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  RETURN = 'return',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
  PRODUCTION = 'production',
  DAMAGE = 'damage',
  EXPIRY = 'expiry',
  SAMPLE = 'sample'
}

export enum LocationType {
  WAREHOUSE = 'warehouse',
  STORE = 'store',
  DISTRIBUTION_CENTER = 'distribution_center',
  COLD_STORAGE = 'cold_storage',
  TRANSIT = 'transit',
  QUARANTINE_AREA = 'quarantine_area',
  PRODUCTION = 'production'
}

export enum TemperatureZone {
  AMBIENT = 'ambient',
  CHILLED = 'chilled', // 0-5°C
  FROZEN = 'frozen',   // Below -18°C
  CONTROLLED = 'controlled' // Custom range
}

export interface InventoryLocation {
  id: string;
  code: string;
  name: string;
  type: LocationType;
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  temperatureZones?: TemperatureZone[];
  capacity?: {
    total: number;
    unit: string;
    utilized: number;
  };
  manager?: {
    name: string;
    email: string;
    phone: string;
  };
  operatingHours?: {
    [key: string]: { open: string; close: string };
  };
  isActive: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  subCategory?: string;
  brand?: string;
  
  // Units and packaging
  baseUnit: string; // e.g., 'kg', 'piece', 'liter'
  packagingUnit?: string; // e.g., 'box', 'pallet', 'case'
  unitsPerPackage?: number;
  
  // Dimensions and weight
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  weight?: {
    gross: number;
    net: number;
    unit: string;
  };
  
  // Storage requirements
  temperatureRequirement?: {
    min: number;
    max: number;
    unit: 'C' | 'F';
  };
  shelfLife?: {
    duration: number;
    unit: 'days' | 'months' | 'years';
  };
  storageInstructions?: string;
  
  // Tracking
  batchTracking: boolean;
  serialTracking: boolean;
  expiryTracking: boolean;
  
  // Financial
  costPrice?: number;
  sellingPrice?: number;
  currency?: string;
  taxCategory?: string;
  
  // Compliance
  certifications?: string[];
  allergens?: string[];
  nutritionalInfo?: Record<string, any>;
  hsCode?: string; // Harmonized System code
  
  // Images and documents
  images?: string[];
  documents?: {
    type: string;
    name: string;
    url: string;
  }[];
  
  // Status
  isActive: boolean;
  isPerishable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BatchLot {
  id: string;
  batchNumber: string;
  lotNumber?: string;
  productId: string;
  
  // Dates
  manufactureDate?: string;
  expiryDate?: string;
  bestBeforeDate?: string;
  receivedDate: string;
  
  // Quantities
  initialQuantity: number;
  currentQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  unit: string;
  
  // Source
  supplierId?: string;
  supplierBatchNumber?: string;
  purchaseOrderId?: string;
  productionOrderId?: string;
  
  // Quality
  qualityStatus: 'pending' | 'passed' | 'failed' | 'conditional';
  qualityCheckDate?: string;
  qualityCheckBy?: string;
  qualityCertificates?: string[];
  
  // Cost
  unitCost?: number;
  totalCost?: number;
  currency?: string;
  
  // Storage
  locationId: string;
  zone?: string;
  bin?: string;
  
  // Tracking
  status: StockStatus;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface StockLevel {
  id: string;
  productId: string;
  product?: Product;
  locationId: string;
  location?: InventoryLocation;
  
  // Quantities
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  incomingQuantity: number;
  unit: string;
  
  // Reorder levels
  reorderPoint: number;
  reorderQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  safetyStock: number;
  
  // Batch information
  batches?: {
    batchId: string;
    batchNumber: string;
    quantity: number;
    expiryDate?: string;
    status: StockStatus;
  }[];
  
  // Valuation
  averageCost?: number;
  totalValue?: number;
  valuationMethod?: 'FIFO' | 'LIFO' | 'AVERAGE';
  
  // Status
  status: StockStatus;
  lastStockTake?: string;
  lastMovement?: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  movementNumber: string;
  type: MovementType;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  
  // Product and quantity
  productId: string;
  product?: Product;
  quantity: number;
  unit: string;
  batchId?: string;
  batch?: BatchLot;
  
  // Locations
  fromLocationId?: string;
  fromLocation?: InventoryLocation;
  toLocationId?: string;
  toLocation?: InventoryLocation;
  
  // Reference
  referenceType?: 'order' | 'purchase_order' | 'transfer_order' | 'production_order' | 'return';
  referenceId?: string;
  referenceNumber?: string;
  
  // Dates
  requestedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  
  // People
  requestedBy: string;
  approvedBy?: string;
  executedBy?: string;
  
  // Cost
  unitCost?: number;
  totalCost?: number;
  
  // Details
  reason?: string;
  notes?: string;
  documents?: string[];
  
  // Tracking
  trackingNumber?: string;
  carrier?: string;
  estimatedArrival?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  type: 'increase' | 'decrease' | 'recount';
  status: 'draft' | 'pending_approval' | 'approved' | 'completed' | 'rejected';
  
  // Items
  items: {
    productId: string;
    product?: Product;
    locationId: string;
    batchId?: string;
    currentQuantity: number;
    adjustedQuantity: number;
    difference: number;
    reason: string;
    cost?: number;
  }[];
  
  // Reason
  reason: string;
  category: 'damage' | 'expiry' | 'theft' | 'counting_error' | 'system_error' | 'other';
  
  // Approval
  requestedBy: string;
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  approvalNotes?: string;
  
  // Financial impact
  totalCostImpact?: number;
  accountingEntry?: string;
  
  // Documentation
  notes?: string;
  attachments?: string[];
  
  createdAt: string;
  updatedAt: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  status: 'draft' | 'pending' | 'in_transit' | 'delivered' | 'completed' | 'cancelled';
  
  // Locations
  fromLocationId: string;
  fromLocation?: InventoryLocation;
  toLocationId: string;
  toLocation?: InventoryLocation;
  
  // Items
  items: {
    productId: string;
    product?: Product;
    requestedQuantity: number;
    shippedQuantity: number;
    receivedQuantity: number;
    unit: string;
    batches?: {
      batchId: string;
      quantity: number;
    }[];
  }[];
  
  // Dates
  requestedDate: string;
  requiredDate?: string;
  shippedDate?: string;
  expectedDelivery?: string;
  deliveredDate?: string;
  
  // Shipping
  shippingMethod?: string;
  carrier?: string;
  trackingNumber?: string;
  shippingCost?: number;
  
  // People
  requestedBy: string;
  approvedBy?: string;
  shippedBy?: string;
  receivedBy?: string;
  
  // Notes
  transferReason?: string;
  shippingNotes?: string;
  receivingNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface InventoryCount {
  id: string;
  countNumber: string;
  type: 'full' | 'cycle' | 'spot';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  
  // Scope
  locationId: string;
  location?: InventoryLocation;
  zones?: string[];
  categories?: string[];
  products?: string[];
  
  // Schedule
  scheduledDate: string;
  startedDate?: string;
  completedDate?: string;
  
  // Results
  items: {
    productId: string;
    product?: Product;
    locationId: string;
    zone?: string;
    systemQuantity: number;
    countedQuantity: number;
    variance: number;
    variancePercentage: number;
    status: 'counted' | 'not_found' | 'pending';
    batchDetails?: {
      batchId: string;
      systemQuantity: number;
      countedQuantity: number;
    }[];
  }[];
  
  // Summary
  totalItems: number;
  countedItems: number;
  varianceItems: number;
  totalVarianceValue?: number;
  accuracy?: number;
  
  // People
  scheduledBy: string;
  countTeam?: string[];
  approvedBy?: string;
  
  // Notes
  instructions?: string;
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Request/Response types
export interface CreateProductRequest {
  sku: string;
  name: string;
  description: string;
  category: string;
  baseUnit: string;
  batchTracking?: boolean;
  expiryTracking?: boolean;
  temperatureRequirement?: {
    min: number;
    max: number;
    unit: 'C' | 'F';
  };
  reorderPoint?: number;
  reorderQuantity?: number;
}

export interface ReceiveStockRequest {
  productId: string;
  locationId: string;
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
  supplierId?: string;
  purchaseOrderId?: string;
  unitCost?: number;
}

export interface TransferStockRequest {
  fromLocationId: string;
  toLocationId: string;
  items: {
    productId: string;
    quantity: number;
    batchId?: string;
  }[];
  requiredDate?: string;
  reason?: string;
}

export interface AdjustStockRequest {
  items: {
    productId: string;
    locationId: string;
    adjustedQuantity: number;
    reason: string;
  }[];
  category: string;
  reason: string;
}

export interface InventorySearchParams {
  locationId?: string;
  category?: string;
  status?: StockStatus[];
  lowStock?: boolean;
  expiringSoon?: boolean;
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'sku' | 'quantity' | 'value' | 'lastMovement';
  sortOrder?: 'asc' | 'desc';
}

export interface InventoryAnalytics {
  totalProducts: number;
  totalValue: number;
  totalLocations: number;
  
  stockStatus: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
    reserved: number;
  };
  
  topProducts: {
    productId: string;
    productName: string;
    quantity: number;
    value: number;
    turnoverRate: number;
  }[];
  
  expiringProducts: {
    productId: string;
    productName: string;
    batchNumber: string;
    quantity: number;
    expiryDate: string;
    daysToExpiry: number;
  }[];
  
  warehouseUtilization: {
    locationId: string;
    locationName: string;
    utilizationPercentage: number;
    totalCapacity: number;
    usedCapacity: number;
  }[];
  
  reorderAlerts: {
    productId: string;
    productName: string;
    currentStock: number;
    reorderPoint: number;
    suggestedQuantity: number;
  }[];
  
  movementTrends: {
    date: string;
    inbound: number;
    outbound: number;
    adjustments: number;
  }[];
  
  categoryDistribution: {
    category: string;
    count: number;
    value: number;
    percentage: number;
  }[];
}

export interface StockForecast {
  productId: string;
  productName: string;
  currentStock: number;
  averageDailyUsage: number;
  daysOfStock: number;
  forecastedStockout?: string;
  recommendedOrderDate?: string;
  recommendedOrderQuantity?: number;
  seasonalFactors?: {
    month: string;
    factor: number;
  }[];
}