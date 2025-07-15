import { aiService } from '../aiService';
import { logger } from '../../logger';

interface RouteOptimization {
  routeId: string;
  waypoints: Array<{
    location: { lat: number; lng: number };
    deliveryWindow: { start: string; end: string };
    priority: 'low' | 'medium' | 'high';
    estimatedDuration: number;
  }>;
  optimizedOrder: number[];
  totalDistance: number;
  totalTime: number;
  fuelCost: number;
  carbonFootprint: number;
  efficiency: number;
}

interface InventoryOptimization {
  productId: string;
  currentStock: number;
  optimalStock: number;
  reorderPoint: number;
  economicOrderQuantity: number;
  safetStock: number;
  turnoverRate: number;
  carryingCost: number;
  orderingCost: number;
}

interface TemperatureRisk {
  shipmentId: string;
  riskLevel: 'low' | 'medium' | 'high';
  predictedExcursions: Array<{
    location: string;
    timeframe: string;
    probabilty: number;
    impact: string;
  }>;
  mitigationSuggestions: string[];
  alternativeRoutes: string[];
}

interface SupplyChainMetrics {
  onTimeDeliveryRate: number;
  orderAccuracy: number;
  inventoryTurnover: number;
  averageLeadTime: number;
  costPerDelivery: number;
  customerSatisfaction: number;
  wasteReduction: number;
  sustainabilityScore: number;
}

export class SupplyChainOptimizationService {
  private static instance: SupplyChainOptimizationService;

  private constructor() {}

  static getInstance(): SupplyChainOptimizationService {
    if (!SupplyChainOptimizationService.instance) {
      SupplyChainOptimizationService.instance = new SupplyChainOptimizationService();
    }
    return SupplyChainOptimizationService.instance;
  }

  async optimizeDeliveryRoutes(
    deliveries: Array<{
      id: string;
      location: { lat: number; lng: number };
      deliveryWindow: { start: string; end: string };
      priority: 'low' | 'medium' | 'high';
      products: Array<{ id: string; temperature: 'frozen' | 'chilled' | 'ambient' }>;
    }>,
    constraints: {
      vehicleCapacity: number;
      maxDeliveryTime: number;
      temperatureRequirements: boolean;
      fuelCostPerKm: number;
    }
  ): Promise<RouteOptimization[]> {
    try {
      // Group deliveries by temperature requirements
      const groupedDeliveries = this.groupDeliveriesByTemperature(deliveries);
      
      const optimizedRoutes: RouteOptimization[] = [];

      for (const [tempType, deliveriesGroup] of Object.entries(groupedDeliveries)) {
        const route = await this.optimizeSingleRoute(deliveriesGroup, constraints, tempType);
        optimizedRoutes.push(route);
      }

      return optimizedRoutes;
    } catch (error) {
      logger.error('Route optimization error:', error as Error);
      throw error;
    }
  }

  private groupDeliveriesByTemperature(deliveries: any[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {
      frozen: [],
      chilled: [],
      ambient: [],
    };

    deliveries.forEach(delivery => {
      const tempTypes = delivery.products.map((p: any) => p.temperature);
      
      if (tempTypes.includes('frozen')) {
        groups.frozen.push(delivery);
      } else if (tempTypes.includes('chilled')) {
        groups.chilled.push(delivery);
      } else {
        groups.ambient.push(delivery);
      }
    });

    return groups;
  }

  private async optimizeSingleRoute(
    deliveries: any[],
    constraints: any,
    temperatureType: string
  ): Promise<RouteOptimization> {
    const prompt = `
      Optimize delivery route for ${temperatureType} products:
      
      Deliveries: ${JSON.stringify(deliveries)}
      Constraints: ${JSON.stringify(constraints)}
      
      Consider:
      1. Shortest total distance
      2. Delivery time windows
      3. Priority levels
      4. Vehicle capacity
      5. Temperature maintenance
      6. Fuel efficiency
      
      Use traveling salesman problem optimization with time windows.
      Return optimized waypoint order, total metrics, and efficiency score.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      const optimization = JSON.parse(response);

      return {
        routeId: `route-${temperatureType}-${Date.now()}`,
        waypoints: deliveries.map(d => ({
          location: d.location,
          deliveryWindow: d.deliveryWindow,
          priority: d.priority,
          estimatedDuration: 30, // minutes
        })),
        optimizedOrder: optimization.optimizedOrder || deliveries.map((_, i) => i),
        totalDistance: optimization.totalDistance || this.calculateTotalDistance(deliveries),
        totalTime: optimization.totalTime || deliveries.length * 30,
        fuelCost: optimization.fuelCost || 50,
        carbonFootprint: optimization.carbonFootprint || 25,
        efficiency: optimization.efficiency || 0.85,
      };
    } catch (error) {
      logger.error('Single route optimization error:', error as Error);
      return this.getFallbackRoute(deliveries, temperatureType);
    }
  }

  private calculateTotalDistance(deliveries: any[]): number {
    // Simplified distance calculation
    let totalDistance = 0;
    for (let i = 0; i < deliveries.length - 1; i++) {
      const dist = this.haversineDistance(
        deliveries[i].location,
        deliveries[i + 1].location
      );
      totalDistance += dist;
    }
    return totalDistance;
  }

  private haversineDistance(loc1: any, loc2: any): number {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private getFallbackRoute(deliveries: any[], temperatureType: string): RouteOptimization {
    return {
      routeId: `fallback-${temperatureType}-${Date.now()}`,
      waypoints: deliveries.map(d => ({
        location: d.location,
        deliveryWindow: d.deliveryWindow,
        priority: d.priority,
        estimatedDuration: 30,
      })),
      optimizedOrder: deliveries.map((_, i) => i),
      totalDistance: this.calculateTotalDistance(deliveries),
      totalTime: deliveries.length * 30,
      fuelCost: 50,
      carbonFootprint: 25,
      efficiency: 0.7,
    };
  }

  async optimizeInventory(
    products: Array<{
      id: string;
      currentStock: number;
      dailyDemand: number;
      leadTime: number;
      unitCost: number;
      holdingCost: number;
      orderingCost: number;
      perishable: boolean;
      shelfLife?: number;
    }>
  ): Promise<InventoryOptimization[]> {
    try {
      const optimizations: InventoryOptimization[] = [];

      for (const product of products) {
        const optimization = await this.optimizeSingleProduct(product);
        optimizations.push(optimization);
      }

      return optimizations;
    } catch (error) {
      logger.error('Inventory optimization error:', error as Error);
      throw error;
    }
  }

  private async optimizeSingleProduct(product: any): Promise<InventoryOptimization> {
    /* const prompt = `
      Calculate optimal inventory levels for this product:
      
      Product: ${JSON.stringify(product)}
      
      Calculate:
      1. Economic Order Quantity (EOQ)
      2. Reorder Point
      3. Safety Stock
      4. Optimal Stock Level
      
      Consider:
      - Perishability and shelf life
      - Demand variability
      - Lead time uncertainty
      - Holding costs
      - Ordering costs
      - Service level (95%)
      
      Use standard inventory optimization formulas with adjustments for perishability.
    `; */

    try {
      // const response = await aiService.generateCompletion(prompt);
      // const calc = JSON.parse(response);

      // Calculate EOQ: sqrt(2 * D * S / H)
      const eoq = Math.sqrt(
        (2 * product.dailyDemand * 365 * product.orderingCost) / 
        (product.unitCost * product.holdingCost)
      );

      // Calculate safety stock
      const safetyStock = product.dailyDemand * Math.sqrt(product.leadTime) * 1.65; // 95% service level

      // Reorder point
      const reorderPoint = (product.dailyDemand * product.leadTime) + safetyStock;

      // Adjust for perishability
      const perishabilityFactor = product.perishable ? 0.8 : 1.0;
      const adjustedEOQ = eoq * perishabilityFactor;

      return {
        productId: product.id,
        currentStock: product.currentStock,
        optimalStock: Math.round(adjustedEOQ + safetyStock),
        reorderPoint: Math.round(reorderPoint),
        economicOrderQuantity: Math.round(adjustedEOQ),
        safetStock: Math.round(safetyStock),
        turnoverRate: (product.dailyDemand * 365) / (adjustedEOQ + safetyStock),
        carryingCost: (adjustedEOQ / 2) * product.unitCost * product.holdingCost,
        orderingCost: (product.dailyDemand * 365 / adjustedEOQ) * product.orderingCost,
      };
    } catch (error) {
      logger.error('Product inventory optimization error:', error as Error);
      return this.getFallbackInventoryOptimization(product);
    }
  }

  private getFallbackInventoryOptimization(product: any): InventoryOptimization {
    const eoq = Math.sqrt((2 * product.dailyDemand * 365 * 50) / (product.unitCost * 0.2));
    const safetyStock = product.dailyDemand * 7; // 1 week safety stock
    
    return {
      productId: product.id,
      currentStock: product.currentStock,
      optimalStock: Math.round(eoq + safetyStock),
      reorderPoint: Math.round(product.dailyDemand * product.leadTime + safetyStock),
      economicOrderQuantity: Math.round(eoq),
      safetStock: Math.round(safetyStock),
      turnoverRate: 12, // monthly turnover
      carryingCost: eoq * product.unitCost * 0.1,
      orderingCost: 50,
    };
  }

  async predictTemperatureRisks(
    shipments: Array<{
      id: string;
      route: Array<{ location: string; duration: number }>;
      products: Array<{ temperatureRange: { min: number; max: number } }>;
      vehicleType: 'refrigerated' | 'frozen' | 'ambient';
      weatherConditions: any;
    }>
  ): Promise<TemperatureRisk[]> {
    try {
      const risks: TemperatureRisk[] = [];

      for (const shipment of shipments) {
        const risk = await this.analyzeSingleShipmentRisk(shipment);
        risks.push(risk);
      }

      return risks;
    } catch (error) {
      logger.error('Temperature risk prediction error:', error as Error);
      throw error;
    }
  }

  private async analyzeSingleShipmentRisk(shipment: any): Promise<TemperatureRisk> {
    const prompt = `
      Analyze temperature excursion risk for this shipment:
      
      Shipment: ${JSON.stringify(shipment)}
      
      Consider:
      1. Route duration and conditions
      2. Weather forecast
      3. Vehicle capabilities
      4. Product temperature requirements
      5. Historical excursion data
      
      Predict:
      - Risk level (low/medium/high)
      - Specific excursion points
      - Mitigation strategies
      - Alternative routes if needed
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      const analysis = JSON.parse(response);

      return {
        shipmentId: shipment.id,
        riskLevel: analysis.riskLevel || 'medium',
        predictedExcursions: analysis.excursions || [],
        mitigationSuggestions: analysis.mitigations || [
          'Monitor temperature continuously',
          'Use backup cooling systems',
          'Optimize route timing',
        ],
        alternativeRoutes: analysis.alternatives || [],
      };
    } catch (error) {
      logger.error('Shipment risk analysis error:', error as Error);
      return {
        shipmentId: shipment.id,
        riskLevel: 'medium',
        predictedExcursions: [],
        mitigationSuggestions: ['Monitor temperature continuously'],
        alternativeRoutes: [],
      };
    }
  }

  async calculateSupplyChainMetrics(
    data: {
      deliveries: any[];
      orders: any[];
      inventory: any[];
      customerFeedback: any[];
    }
  ): Promise<SupplyChainMetrics> {
    try {
      const prompt = `
        Calculate comprehensive supply chain metrics:
        
        Data: ${JSON.stringify(data)}
        
        Calculate:
        1. On-time delivery rate
        2. Order accuracy
        3. Inventory turnover
        4. Average lead time
        5. Cost per delivery
        6. Customer satisfaction
        7. Waste reduction
        8. Sustainability score
        
        Provide specific calculations and benchmarks.
      `;

      const response = await aiService.generateCompletion(prompt);
      const metrics = JSON.parse(response);

      return {
        onTimeDeliveryRate: metrics.onTimeDelivery || 0.85,
        orderAccuracy: metrics.orderAccuracy || 0.95,
        inventoryTurnover: metrics.inventoryTurnover || 12,
        averageLeadTime: metrics.averageLeadTime || 2.5,
        costPerDelivery: metrics.costPerDelivery || 25,
        customerSatisfaction: metrics.customerSatisfaction || 4.2,
        wasteReduction: metrics.wasteReduction || 0.15,
        sustainabilityScore: metrics.sustainabilityScore || 0.78,
      };
    } catch (error) {
      logger.error('Metrics calculation error:', error as Error);
      return this.getDefaultMetrics();
    }
  }

  private getDefaultMetrics(): SupplyChainMetrics {
    return {
      onTimeDeliveryRate: 0.85,
      orderAccuracy: 0.95,
      inventoryTurnover: 12,
      averageLeadTime: 2.5,
      costPerDelivery: 25,
      customerSatisfaction: 4.2,
      wasteReduction: 0.15,
      sustainabilityScore: 0.78,
    };
  }

  async optimizeSustainability(
    operations: {
      transportation: any;
      packaging: any;
      energy: any;
      waste: any;
    }
  ): Promise<{
    carbonReduction: number;
    costSavings: number;
    recommendations: string[];
    sustainabilityScore: number;
  }> {
    const prompt = `
      Analyze and optimize sustainability across supply chain operations:
      
      Current Operations: ${JSON.stringify(operations)}
      
      Optimize:
      1. Carbon footprint reduction
      2. Packaging efficiency
      3. Energy consumption
      4. Waste minimization
      5. Local sourcing opportunities
      
      Provide specific recommendations with quantified impact.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error('Sustainability optimization error:', error as Error);
      return {
        carbonReduction: 0.15,
        costSavings: 10000,
        recommendations: [
          'Optimize delivery routes',
          'Use eco-friendly packaging',
          'Implement energy-efficient cooling',
        ],
        sustainabilityScore: 0.75,
      };
    }
  }
}

export const supplyChainOptimizationService = SupplyChainOptimizationService.getInstance();