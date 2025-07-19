import {
  Product,
  StockLevel,
  StockMovement,
  BatchLot,
  InventoryLocation,
  StockTransfer,
  StockAdjustment,
  InventoryCount,
  CreateProductRequest,
  ReceiveStockRequest,
  TransferStockRequest,
  AdjustStockRequest,
  InventorySearchParams,
  InventoryAnalytics,
  StockForecast,
  StockStatus,
  MovementType,
  LocationType
} from '../../types/inventory';
import { ApiIntegration } from '../ApiIntegration';
import { notificationService } from '../NotificationService';

export class InventoryService {
  private static products: Map<string, Product> = new Map();
  private static stockLevels: Map<string, StockLevel> = new Map();
  private static batches: Map<string, BatchLot> = new Map();
  private static locations: Map<string, InventoryLocation> = new Map();
  private static movements: Map<string, StockMovement> = new Map();
  private static productCounter = 0;
  private static movementCounter = 0;

  // Initialize with sample data
  static initialize() {
    // Sample warehouse locations
    const warehouse1: InventoryLocation = {
      id: 'loc-1',
      code: 'WH-001',
      name: 'Main Warehouse',
      type: LocationType.WAREHOUSE,
      address: {
        street: '123 Storage Lane',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        postalCode: '60601'
      },
      temperatureZones: ['ambient', 'chilled', 'frozen'],
      capacity: {
        total: 10000,
        unit: 'pallets',
        utilized: 6500
      },
      isActive: true
    };

    const coldStorage: InventoryLocation = {
      id: 'loc-2',
      code: 'CS-001',
      name: 'Cold Storage Facility',
      type: LocationType.COLD_STORAGE,
      address: {
        street: '456 Freeze Road',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        postalCode: '60602'
      },
      temperatureZones: ['chilled', 'frozen'],
      capacity: {
        total: 5000,
        unit: 'pallets',
        utilized: 3200
      },
      isActive: true
    };

    this.locations.set(warehouse1.id, warehouse1);
    this.locations.set(coldStorage.id, coldStorage);

    // Sample products
    const products = [
      {
        id: 'prod-1',
        sku: 'ORG-APPL-001',
        name: 'Organic Apples',
        category: 'Fruits',
        baseUnit: 'kg',
        isPerishable: true,
        temperatureRequirement: { min: 0, max: 4, unit: 'C' as const }
      },
      {
        id: 'prod-2',
        sku: 'FRZ-BROC-001',
        name: 'Frozen Broccoli',
        category: 'Vegetables',
        baseUnit: 'kg',
        isPerishable: true,
        temperatureRequirement: { min: -18, max: -15, unit: 'C' as const }
      },
      {
        id: 'prod-3',
        sku: 'DRY-RICE-001',
        name: 'Basmati Rice',
        category: 'Grains',
        baseUnit: 'kg',
        isPerishable: false
      }
    ];

    products.forEach(p => {
      const product: Product = {
        ...p,
        description: `Premium quality ${p.name}`,
        batchTracking: true,
        expiryTracking: p.isPerishable,
        serialTracking: false,
        shelfLife: p.isPerishable ? { duration: 30, unit: 'days' } : undefined,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.products.set(product.id, product);

      // Create initial stock levels
      const stockLevel: StockLevel = {
        id: `stock-${product.id}`,
        productId: product.id,
        locationId: p.temperatureRequirement ? 'loc-2' : 'loc-1',
        quantity: Math.floor(Math.random() * 1000) + 500,
        reservedQuantity: Math.floor(Math.random() * 100),
        availableQuantity: 0,
        incomingQuantity: Math.floor(Math.random() * 200),
        unit: p.baseUnit,
        reorderPoint: 200,
        reorderQuantity: 500,
        minStockLevel: 100,
        maxStockLevel: 2000,
        safetyStock: 150,
        status: StockStatus.IN_STOCK,
        updatedAt: new Date().toISOString()
      };
      stockLevel.availableQuantity = stockLevel.quantity - stockLevel.reservedQuantity;
      this.stockLevels.set(stockLevel.id, stockLevel);
    });
  }

  // Product Management
  static async createProduct(request: CreateProductRequest): Promise<Product> {
    try {
      this.productCounter++;
      const product: Product = {
        id: `prod-${Date.now()}`,
        sku: request.sku,
        name: request.name,
        description: request.description,
        category: request.category,
        baseUnit: request.baseUnit,
        batchTracking: request.batchTracking || false,
        expiryTracking: request.expiryTracking || false,
        serialTracking: false,
        temperatureRequirement: request.temperatureRequirement,
        isActive: true,
        isPerishable: request.expiryTracking || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.products.set(product.id, product);

      // Create initial stock level for each location
      this.locations.forEach((location) => {
        const stockLevel: StockLevel = {
          id: `stock-${product.id}-${location.id}`,
          productId: product.id,
          locationId: location.id,
          quantity: 0,
          reservedQuantity: 0,
          availableQuantity: 0,
          incomingQuantity: 0,
          unit: product.baseUnit,
          reorderPoint: request.reorderPoint || 100,
          reorderQuantity: request.reorderQuantity || 500,
          minStockLevel: 50,
          maxStockLevel: 2000,
          safetyStock: 100,
          status: StockStatus.OUT_OF_STOCK,
          updatedAt: new Date().toISOString()
        };
        this.stockLevels.set(stockLevel.id, stockLevel);
      });

      // Notify
      notificationService.createNotification({
        type: 'success',
        category: 'system',
        title: 'Product Created',
        message: `Product ${product.name} (${product.sku}) has been created`,
        metadata: { productId: product.id, sku: product.sku }
      });

      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Receive Stock
  static async receiveStock(request: ReceiveStockRequest): Promise<StockMovement> {
    try {
      const product = this.products.get(request.productId);
      if (!product) throw new Error('Product not found');

      const location = this.locations.get(request.locationId);
      if (!location) throw new Error('Location not found');

      // Create batch if tracking is enabled
      let batchId: string | undefined;
      if (product.batchTracking) {
        const batch: BatchLot = {
          id: `batch-${Date.now()}`,
          batchNumber: request.batchNumber || `BATCH-${Date.now()}`,
          productId: request.productId,
          manufactureDate: new Date().toISOString(),
          expiryDate: request.expiryDate,
          receivedDate: new Date().toISOString(),
          initialQuantity: request.quantity,
          currentQuantity: request.quantity,
          reservedQuantity: 0,
          availableQuantity: request.quantity,
          unit: product.baseUnit,
          supplierId: request.supplierId,
          purchaseOrderId: request.purchaseOrderId,
          qualityStatus: 'pending',
          unitCost: request.unitCost,
          totalCost: request.unitCost ? request.unitCost * request.quantity : undefined,
          locationId: request.locationId,
          status: StockStatus.IN_STOCK
        };
        this.batches.set(batch.id, batch);
        batchId = batch.id;
      }

      // Update stock level
      const stockLevelId = `stock-${request.productId}-${request.locationId}`;
      let stockLevel = this.stockLevels.get(stockLevelId);
      
      if (!stockLevel) {
        stockLevel = {
          id: stockLevelId,
          productId: request.productId,
          locationId: request.locationId,
          quantity: 0,
          reservedQuantity: 0,
          availableQuantity: 0,
          incomingQuantity: 0,
          unit: product.baseUnit,
          reorderPoint: 100,
          reorderQuantity: 500,
          minStockLevel: 50,
          maxStockLevel: 2000,
          safetyStock: 100,
          status: StockStatus.OUT_OF_STOCK,
          updatedAt: new Date().toISOString()
        };
        this.stockLevels.set(stockLevelId, stockLevel);
      }

      stockLevel.quantity += request.quantity;
      stockLevel.availableQuantity = stockLevel.quantity - stockLevel.reservedQuantity;
      stockLevel.status = this.calculateStockStatus(stockLevel);
      stockLevel.lastMovement = new Date().toISOString();
      stockLevel.updatedAt = new Date().toISOString();

      if (batchId) {
        if (!stockLevel.batches) stockLevel.batches = [];
        stockLevel.batches.push({
          batchId,
          batchNumber: request.batchNumber || `BATCH-${Date.now()}`,
          quantity: request.quantity,
          expiryDate: request.expiryDate,
          status: StockStatus.IN_STOCK
        });
      }

      // Create movement record
      this.movementCounter++;
      const movement: StockMovement = {
        id: `mov-${Date.now()}`,
        movementNumber: `MOV-${String(this.movementCounter).padStart(6, '0')}`,
        type: MovementType.PURCHASE,
        status: 'completed',
        productId: request.productId,
        product,
        quantity: request.quantity,
        unit: product.baseUnit,
        batchId,
        toLocationId: request.locationId,
        toLocation: location,
        referenceType: request.purchaseOrderId ? 'purchase_order' : undefined,
        referenceId: request.purchaseOrderId,
        requestedDate: new Date().toISOString(),
        completedDate: new Date().toISOString(),
        requestedBy: 'system',
        executedBy: 'system',
        unitCost: request.unitCost,
        totalCost: request.unitCost ? request.unitCost * request.quantity : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.movements.set(movement.id, movement);

      // Check if restocking notification needed
      if (stockLevel.status === StockStatus.IN_STOCK && 
          stockLevel.quantity - request.quantity <= stockLevel.reorderPoint) {
        notificationService.createNotification({
          type: 'success',
          category: 'system',
          title: 'Stock Replenished',
          message: `${product.name} has been restocked with ${request.quantity} ${product.baseUnit}`,
          metadata: { productId: product.id, locationId: location.id }
        });
      }

      return movement;
    } catch (error) {
      console.error('Error receiving stock:', error);
      throw error;
    }
  }

  // Transfer Stock
  static async createTransfer(request: TransferStockRequest): Promise<StockTransfer> {
    try {
      const fromLocation = this.locations.get(request.fromLocationId);
      const toLocation = this.locations.get(request.toLocationId);
      
      if (!fromLocation || !toLocation) {
        throw new Error('Invalid location(s)');
      }

      // Validate stock availability
      const transferItems = [];
      for (const item of request.items) {
        const product = this.products.get(item.productId);
        if (!product) throw new Error(`Product ${item.productId} not found`);

        const stockLevelId = `stock-${item.productId}-${request.fromLocationId}`;
        const stockLevel = this.stockLevels.get(stockLevelId);
        
        if (!stockLevel || stockLevel.availableQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        transferItems.push({
          productId: item.productId,
          product,
          requestedQuantity: item.quantity,
          shippedQuantity: item.quantity,
          receivedQuantity: 0,
          unit: product.baseUnit,
          batches: item.batchId ? [{ batchId: item.batchId, quantity: item.quantity }] : undefined
        });
      }

      const transfer: StockTransfer = {
        id: `transfer-${Date.now()}`,
        transferNumber: `TRF-${Date.now()}`,
        status: 'pending',
        fromLocationId: request.fromLocationId,
        fromLocation,
        toLocationId: request.toLocationId,
        toLocation,
        items: transferItems,
        requestedDate: new Date().toISOString(),
        requiredDate: request.requiredDate,
        requestedBy: 'current-user',
        transferReason: request.reason,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Reserve stock
      for (const item of transfer.items) {
        const stockLevelId = `stock-${item.productId}-${request.fromLocationId}`;
        const stockLevel = this.stockLevels.get(stockLevelId);
        if (stockLevel) {
          stockLevel.reservedQuantity += item.requestedQuantity;
          stockLevel.availableQuantity = stockLevel.quantity - stockLevel.reservedQuantity;
          stockLevel.status = this.calculateStockStatus(stockLevel);
        }
      }

      notificationService.createNotification({
        type: 'info',
        category: 'system',
        title: 'Transfer Created',
        message: `Stock transfer ${transfer.transferNumber} has been created`,
        metadata: { transferId: transfer.id }
      });

      return transfer;
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw error;
    }
  }

  // Stock Adjustment
  static async createAdjustment(request: AdjustStockRequest): Promise<StockAdjustment> {
    try {
      const adjustmentItems = [];
      let totalCostImpact = 0;

      for (const item of request.items) {
        const product = this.products.get(item.productId);
        if (!product) throw new Error(`Product ${item.productId} not found`);

        const stockLevelId = `stock-${item.productId}-${item.locationId}`;
        const stockLevel = this.stockLevels.get(stockLevelId);
        if (!stockLevel) throw new Error(`Stock level not found for ${product.name}`);

        const difference = item.adjustedQuantity - stockLevel.quantity;
        const costImpact = stockLevel.averageCost ? difference * stockLevel.averageCost : 0;
        totalCostImpact += costImpact;

        adjustmentItems.push({
          productId: item.productId,
          product,
          locationId: item.locationId,
          currentQuantity: stockLevel.quantity,
          adjustedQuantity: item.adjustedQuantity,
          difference,
          reason: item.reason,
          cost: costImpact
        });
      }

      const adjustment: StockAdjustment = {
        id: `adj-${Date.now()}`,
        adjustmentNumber: `ADJ-${Date.now()}`,
        type: totalCostImpact > 0 ? 'increase' : 'decrease',
        status: 'pending_approval',
        items: adjustmentItems,
        reason: request.reason,
        category: request.category as any,
        requestedBy: 'current-user',
        requestedDate: new Date().toISOString(),
        totalCostImpact,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      notificationService.createNotification({
        type: 'warning',
        category: 'system',
        title: 'Stock Adjustment Pending',
        message: `Stock adjustment ${adjustment.adjustmentNumber} requires approval`,
        metadata: { adjustmentId: adjustment.id }
      });

      return adjustment;
    } catch (error) {
      console.error('Error creating adjustment:', error);
      throw error;
    }
  }

  // Search Inventory
  static async searchInventory(params: InventorySearchParams): Promise<{
    products: Array<{ product: Product; stockLevels: StockLevel[] }>;
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      let results: Array<{ product: Product; stockLevels: StockLevel[] }> = [];

      // Filter products
      this.products.forEach((product) => {
        // Apply filters
        if (params.category && product.category !== params.category) return;
        if (params.searchTerm && 
            !product.name.toLowerCase().includes(params.searchTerm.toLowerCase()) &&
            !product.sku.toLowerCase().includes(params.searchTerm.toLowerCase())) return;

        // Get stock levels for this product
        const productStockLevels: StockLevel[] = [];
        this.stockLevels.forEach((stockLevel) => {
          if (stockLevel.productId === product.id) {
            if (params.locationId && stockLevel.locationId !== params.locationId) return;
            if (params.status && !params.status.includes(stockLevel.status)) return;
            if (params.lowStock && stockLevel.quantity > stockLevel.reorderPoint) return;
            
            productStockLevels.push(stockLevel);
          }
        });

        if (productStockLevels.length > 0) {
          results.push({ product, stockLevels: productStockLevels });
        }
      });

      // Check expiring soon
      if (params.expiringSoon) {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        results = results.filter(({ stockLevels }) => {
          return stockLevels.some(sl => 
            sl.batches?.some(batch => {
              if (!batch.expiryDate) return false;
              const expiryDate = new Date(batch.expiryDate);
              return expiryDate <= thirtyDaysFromNow;
            })
          );
        });
      }

      // Sort
      if (params.sortBy) {
        results.sort((a, b) => {
          let aVal: any, bVal: any;
          switch (params.sortBy) {
            case 'name':
              aVal = a.product.name;
              bVal = b.product.name;
              break;
            case 'sku':
              aVal = a.product.sku;
              bVal = b.product.sku;
              break;
            case 'quantity':
              aVal = a.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0);
              bVal = b.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0);
              break;
            case 'value':
              aVal = a.stockLevels.reduce((sum, sl) => sum + (sl.totalValue || 0), 0);
              bVal = b.stockLevels.reduce((sum, sl) => sum + (sl.totalValue || 0), 0);
              break;
            default:
              aVal = a.product.name;
              bVal = b.product.name;
          }

          if (params.sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
      }

      // Paginate
      const page = params.page || 1;
      const limit = params.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = results.slice(startIndex, endIndex);

      return {
        products: paginatedResults,
        total: results.length,
        page,
        totalPages: Math.ceil(results.length / limit)
      };
    } catch (error) {
      console.error('Error searching inventory:', error);
      throw error;
    }
  }

  // Get Analytics
  static async getAnalytics(): Promise<InventoryAnalytics> {
    try {
      const analytics: InventoryAnalytics = {
        totalProducts: this.products.size,
        totalValue: 0,
        totalLocations: this.locations.size,
        stockStatus: {
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
          reserved: 0
        },
        topProducts: [],
        expiringProducts: [],
        warehouseUtilization: [],
        reorderAlerts: [],
        movementTrends: [],
        categoryDistribution: []
      };

      // Calculate stock status and value
      const productQuantities = new Map<string, number>();
      const productValues = new Map<string, number>();
      const categoryStats = new Map<string, { count: number; value: number }>();

      this.stockLevels.forEach((stockLevel) => {
        // Stock status
        switch (stockLevel.status) {
          case StockStatus.IN_STOCK:
            analytics.stockStatus.inStock++;
            break;
          case StockStatus.LOW_STOCK:
            analytics.stockStatus.lowStock++;
            break;
          case StockStatus.OUT_OF_STOCK:
            analytics.stockStatus.outOfStock++;
            break;
        }

        if (stockLevel.reservedQuantity > 0) {
          analytics.stockStatus.reserved++;
        }

        // Total value
        analytics.totalValue += stockLevel.totalValue || 0;

        // Product quantities
        const currentQty = productQuantities.get(stockLevel.productId) || 0;
        productQuantities.set(stockLevel.productId, currentQty + stockLevel.quantity);

        const currentVal = productValues.get(stockLevel.productId) || 0;
        productValues.set(stockLevel.productId, currentVal + (stockLevel.totalValue || 0));

        // Reorder alerts
        if (stockLevel.quantity <= stockLevel.reorderPoint) {
          const product = this.products.get(stockLevel.productId);
          if (product) {
            analytics.reorderAlerts.push({
              productId: stockLevel.productId,
              productName: product.name,
              currentStock: stockLevel.quantity,
              reorderPoint: stockLevel.reorderPoint,
              suggestedQuantity: stockLevel.reorderQuantity
            });
          }
        }

        // Check expiring batches
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        stockLevel.batches?.forEach(batch => {
          if (batch.expiryDate) {
            const expiryDate = new Date(batch.expiryDate);
            if (expiryDate <= thirtyDaysFromNow) {
              const product = this.products.get(stockLevel.productId);
              if (product) {
                const daysToExpiry = Math.floor((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                analytics.expiringProducts.push({
                  productId: stockLevel.productId,
                  productName: product.name,
                  batchNumber: batch.batchNumber,
                  quantity: batch.quantity,
                  expiryDate: batch.expiryDate,
                  daysToExpiry
                });
              }
            }
          }
        });

        // Category distribution
        const product = this.products.get(stockLevel.productId);
        if (product) {
          const stats = categoryStats.get(product.category) || { count: 0, value: 0 };
          stats.count++;
          stats.value += stockLevel.totalValue || 0;
          categoryStats.set(product.category, stats);
        }
      });

      // Top products by quantity
      const sortedProducts = Array.from(productQuantities.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      analytics.topProducts = sortedProducts.map(([productId, quantity]) => {
        const product = this.products.get(productId);
        return {
          productId,
          productName: product?.name || 'Unknown',
          quantity,
          value: productValues.get(productId) || 0,
          turnoverRate: Math.random() * 10 + 5 // Mock turnover rate
        };
      });

      // Warehouse utilization
      this.locations.forEach((location) => {
        if (location.capacity) {
          analytics.warehouseUtilization.push({
            locationId: location.id,
            locationName: location.name,
            utilizationPercentage: (location.capacity.utilized / location.capacity.total) * 100,
            totalCapacity: location.capacity.total,
            usedCapacity: location.capacity.utilized
          });
        }
      });

      // Category distribution
      const totalValue = Array.from(categoryStats.values()).reduce((sum, stats) => sum + stats.value, 0);
      analytics.categoryDistribution = Array.from(categoryStats.entries()).map(([category, stats]) => ({
        category,
        count: stats.count,
        value: stats.value,
        percentage: totalValue > 0 ? (stats.value / totalValue) * 100 : 0
      }));

      // Movement trends (last 7 days mock data)
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        analytics.movementTrends.push({
          date: date.toISOString().split('T')[0],
          inbound: Math.floor(Math.random() * 500) + 100,
          outbound: Math.floor(Math.random() * 400) + 50,
          adjustments: Math.floor(Math.random() * 50)
        });
      }

      return analytics;
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }

  // Stock Forecast
  static async getStockForecast(productId: string): Promise<StockForecast> {
    const product = this.products.get(productId);
    if (!product) throw new Error('Product not found');

    // Calculate total current stock
    let totalStock = 0;
    this.stockLevels.forEach((stockLevel) => {
      if (stockLevel.productId === productId) {
        totalStock += stockLevel.quantity;
      }
    });

    // Mock historical data analysis
    const averageDailyUsage = Math.floor(Math.random() * 50) + 10;
    const daysOfStock = Math.floor(totalStock / averageDailyUsage);
    
    const forecastedStockout = new Date();
    forecastedStockout.setDate(forecastedStockout.getDate() + daysOfStock);

    const recommendedOrderDate = new Date();
    recommendedOrderDate.setDate(recommendedOrderDate.getDate() + (daysOfStock - 7)); // Order 7 days before stockout

    return {
      productId,
      productName: product.name,
      currentStock: totalStock,
      averageDailyUsage,
      daysOfStock,
      forecastedStockout: daysOfStock > 0 ? forecastedStockout.toISOString() : undefined,
      recommendedOrderDate: daysOfStock > 7 ? recommendedOrderDate.toISOString() : new Date().toISOString(),
      recommendedOrderQuantity: averageDailyUsage * 30, // 30 days supply
      seasonalFactors: [
        { month: 'January', factor: 0.8 },
        { month: 'February', factor: 0.9 },
        { month: 'March', factor: 1.0 },
        { month: 'April', factor: 1.1 },
        { month: 'May', factor: 1.2 },
        { month: 'June', factor: 1.3 },
        { month: 'July', factor: 1.4 },
        { month: 'August', factor: 1.3 },
        { month: 'September', factor: 1.2 },
        { month: 'October', factor: 1.1 },
        { month: 'November', factor: 1.0 },
        { month: 'December', factor: 1.2 }
      ]
    };
  }

  // Helper methods
  private static calculateStockStatus(stockLevel: StockLevel): StockStatus {
    if (stockLevel.quantity === 0) {
      return StockStatus.OUT_OF_STOCK;
    } else if (stockLevel.quantity <= stockLevel.reorderPoint) {
      return StockStatus.LOW_STOCK;
    } else if (stockLevel.availableQuantity === 0 && stockLevel.reservedQuantity > 0) {
      return StockStatus.RESERVED;
    } else {
      return StockStatus.IN_STOCK;
    }
  }

  // Get all locations
  static async getLocations(): Promise<InventoryLocation[]> {
    return Array.from(this.locations.values());
  }

  // Get products
  static async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  // Perform stock count
  static async performStockCount(locationId: string, items: Array<{
    productId: string;
    countedQuantity: number;
  }>): Promise<InventoryCount> {
    const location = this.locations.get(locationId);
    if (!location) throw new Error('Location not found');

    const countItems = [];
    let totalVarianceValue = 0;

    for (const item of items) {
      const product = this.products.get(item.productId);
      if (!product) continue;

      const stockLevelId = `stock-${item.productId}-${locationId}`;
      const stockLevel = this.stockLevels.get(stockLevelId);
      if (!stockLevel) continue;

      const variance = item.countedQuantity - stockLevel.quantity;
      const variancePercentage = stockLevel.quantity > 0 ? (variance / stockLevel.quantity) * 100 : 0;
      const varianceValue = stockLevel.averageCost ? Math.abs(variance * stockLevel.averageCost) : 0;
      totalVarianceValue += varianceValue;

      countItems.push({
        productId: item.productId,
        product,
        locationId,
        systemQuantity: stockLevel.quantity,
        countedQuantity: item.countedQuantity,
        variance,
        variancePercentage,
        status: 'counted' as const
      });
    }

    const count: InventoryCount = {
      id: `count-${Date.now()}`,
      countNumber: `CNT-${Date.now()}`,
      type: 'spot',
      status: 'completed',
      locationId,
      location,
      scheduledDate: new Date().toISOString(),
      completedDate: new Date().toISOString(),
      items: countItems,
      totalItems: countItems.length,
      countedItems: countItems.length,
      varianceItems: countItems.filter(i => i.variance !== 0).length,
      totalVarianceValue,
      accuracy: countItems.length > 0 ? 
        (countItems.filter(i => i.variance === 0).length / countItems.length) * 100 : 100,
      scheduledBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return count;
  }
}

// Initialize service with sample data
InventoryService.initialize();

export default InventoryService;