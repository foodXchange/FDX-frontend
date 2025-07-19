// Main AI Services Export
// Unified AI Service Manager
import { aiService } from './aiService';
import { 
  DeliveryOptimization, 
  InventoryOptimization, 
  TemperatureRisk, 
  MarketExpansion, 
  CompetitorAnalysis 
} from './types';
import { demandForecastingService } from './predictions/demandForecastingService';
import { priceOptimizationService } from './predictions/priceOptimizationService';
import { supplierMatchingService } from './analytics/supplierMatchingService';
import { recommendationEngine } from './analytics/recommendationEngine';
import { supplyChainOptimizationService } from './analytics/supplyChainOptimizationService';
import { marketIntelligenceService } from './analytics/marketIntelligenceService';
import { searchService } from './nlp/searchService';
import { documentIntelligenceService } from './nlp/documentIntelligenceService';
import { naturalLanguageInterface } from './nlp/naturalLanguageInterface';
import { AI_CONFIG } from '../../config/ai.config';
import { logger } from '../logger';

export { aiService } from './aiService';

// Prediction Services
export { demandForecastingService } from './predictions/demandForecastingService';
export { priceOptimizationService } from './predictions/priceOptimizationService';

// Analytics Services
export { supplierMatchingService } from './analytics/supplierMatchingService';
export { recommendationEngine } from './analytics/recommendationEngine';
export { supplyChainOptimizationService } from './analytics/supplyChainOptimizationService';
export { marketIntelligenceService } from './analytics/marketIntelligenceService';

// NLP Services
export { searchService } from './nlp/searchService';
export { documentIntelligenceService } from './nlp/documentIntelligenceService';
export { naturalLanguageInterface } from './nlp/naturalLanguageInterface';

// Types
export * from './types';

// Configuration
export { AI_CONFIG, AI_ENDPOINTS } from '../../config/ai.config';

export class AIServiceManager {
  private static instance: AIServiceManager;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): AIServiceManager {
    if (!AIServiceManager.instance) {
      AIServiceManager.instance = new AIServiceManager();
    }
    return AIServiceManager.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      logger.info('Initializing AI services...');

      // Check configuration
      if (!this.validateConfiguration()) {
        logger.warn('AI configuration incomplete - some features may be limited');
      }

      // Initialize services (they're already singletons, just verify they're ready)
      const services = [
        { name: 'Core AI Service', service: aiService },
        { name: 'Search Service', service: searchService },
        { name: 'Demand Forecasting', service: demandForecastingService },
        { name: 'Price Optimization', service: priceOptimizationService },
        { name: 'Supplier Matching', service: supplierMatchingService },
        { name: 'Recommendation Engine', service: recommendationEngine },
        { name: 'Supply Chain Optimization', service: supplyChainOptimizationService },
        { name: 'Market Intelligence', service: marketIntelligenceService },
        { name: 'Document Intelligence', service: documentIntelligenceService },
        { name: 'Natural Language Interface', service: naturalLanguageInterface },
      ];

      for (const { name, service } of services) {
        if (service) {
          logger.info(`✓ ${name} initialized`);
        } else {
          logger.error(`✗ ${name} failed to initialize`);
        }
      }

      this.initialized = true;
      logger.info('AI services initialization complete');
      return true;
    } catch (error) {
      logger.error('AI services initialization failed:', error as Error);
      return false;
    }
  }

  private validateConfiguration(): boolean {
    const hasOpenAI = !!AI_CONFIG.openai.apiKey;
    const hasClaude = !!AI_CONFIG.claude.apiKey;
    
    if (!hasOpenAI && !hasClaude) {
      logger.warn('No AI provider API keys configured');
      return false;
    }

    return true;
  }

  getServiceStatus(): Record<string, boolean> {
    return {
      initialized: this.initialized,
      coreAI: !!aiService,
      search: !!searchService,
      demandForecasting: !!demandForecastingService,
      priceOptimization: !!priceOptimizationService,
      supplierMatching: !!supplierMatchingService,
      recommendations: !!recommendationEngine,
      documentIntelligence: !!documentIntelligenceService,
      naturalLanguage: !!naturalLanguageInterface,
      openAIConfigured: !!AI_CONFIG.openai.apiKey,
      claudeConfigured: !!AI_CONFIG.claude.apiKey,
    };
  }

  async getHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, 'ok' | 'error' | 'warning'>;
    timestamp: string;
  }> {
    const services: Record<string, 'ok' | 'error' | 'warning'> = {};

    try {
      // Test core AI service
      try {
        await aiService.generateCompletion('test', 'openai', { maxTokens: 10 });
        services.coreAI = 'ok';
      } catch (error) {
        services.coreAI = 'error';
      }

      // Test search service
      try {
        await searchService.search('test');
        services.search = 'ok';
      } catch (error) {
        services.search = 'warning';
      }

      // Other services don't need external calls for health check
      services.demandForecasting = 'ok';
      services.priceOptimization = 'ok';
      services.supplierMatching = 'ok';
      services.recommendations = 'ok';
      services.documentIntelligence = 'ok';
      services.naturalLanguage = 'ok';

      const errorCount = Object.values(services).filter(s => s === 'error').length;
      const warningCount = Object.values(services).filter(s => s === 'warning').length;

      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (errorCount === 0 && warningCount === 0) {
        status = 'healthy';
      } else if (errorCount === 0) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }

      return {
        status,
        services,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        services: {},
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Convenience methods for common AI operations
  async smartSearch(query: string, filters?: Record<string, unknown>) {
    return await searchService.search(query, filters);
  }

  async getForecast(productId: string, historicalData: unknown[]) {
    return await demandForecastingService.forecastDemand(productId, historicalData);
  }

  async optimizePrice(productId: string, currentPrice: number, data: { salesHistory: any[]; competitorPrices: number[]; marketConditions: any; }) {
    return await priceOptimizationService.optimizePrice(productId, currentPrice, data);
  }

  async findSuppliers(requirements: { productCategories: string[]; location: { lat: number; lng: number; radius: number; }; certifications: string[]; minRating: number; priceRange: { min: number; max: number; }; deliveryRequirements: any; volumeRequirements: any; }, suppliers: unknown[]) {
    return await supplierMatchingService.matchSuppliers(requirements, suppliers);
  }

  async getRecommendations(userId: string) {
    return await recommendationEngine.getUserRecommendations(userId);
  }

  async analyzeDocument(file: File | string, options?: Record<string, unknown>) {
    return await documentIntelligenceService.analyzeDocument(file, options);
  }

  async chatWithAI(message: string, userId: string, sessionId?: string) {
    return await naturalLanguageInterface.processMessage(message, userId, sessionId);
  }

  async generateInsights(data: Record<string, unknown>, context: string) {
    return await aiService.generateInsights(data, context);
  }

  async optimizeRoutes(deliveries: DeliveryOptimization[], constraints: { vehicleCapacity: number; maxDeliveryTime: number; temperatureRequirements: boolean; fuelCostPerKm: number; }) {
    return await supplyChainOptimizationService.optimizeDeliveryRoutes(deliveries, constraints);
  }

  async optimizeInventory(products: InventoryOptimization[]) {
    return await supplyChainOptimizationService.optimizeInventory(products);
  }

  async predictTemperatureRisks(shipments: TemperatureRisk[]) {
    return await supplyChainOptimizationService.predictTemperatureRisks(shipments);
  }

  async getMarketIntelligence(category: string, region?: string) {
    return await marketIntelligenceService.getMarketIntelligence(category, region);
  }

  async identifyOpportunities(businessProfile: MarketExpansion) {
    return await marketIntelligenceService.identifyMarketOpportunities(businessProfile);
  }

  async analyzeMarketEntry(targetMarket: CompetitorAnalysis, analysisType: { budget: number; timeline: string; expertise: string[]; }) {
    return await marketIntelligenceService.analyzeMarketEntryStrategy(targetMarket, analysisType);
  }

  // Batch operations
  async processDocumentBatch(documents: Array<{ id: string; content: string | File; options?: Record<string, unknown> }>) {
    const results = [];
    for (const doc of documents) {
      try {
        const analysis = await this.analyzeDocument(doc.content, doc.options);
        results.push({ id: doc.id, status: 'success', analysis });
      } catch (error) {
        results.push({ id: doc.id, status: 'error', error: (error as Error).message });
      }
    }
    return results;
  }

  async generateBulkInsights(dataPoints: Array<{ data: Record<string, unknown>; context: string }>) {
    const results = [];
    for (const point of dataPoints) {
      try {
        const insights = await this.generateInsights(point.data, point.context);
        results.push({ status: 'success', insights });
      } catch (error) {
        results.push({ status: 'error', error: (error as Error).message });
      }
    }
    return results;
  }

  // Configuration management
  updateConfiguration(newConfig: Partial<typeof AI_CONFIG>) {
    Object.assign(AI_CONFIG, newConfig);
    logger.info('AI configuration updated');
  }

  clearCache() {
    aiService.clearCache();
    logger.info('AI service cache cleared');
  }
}

export const aiServiceManager = AIServiceManager.getInstance();