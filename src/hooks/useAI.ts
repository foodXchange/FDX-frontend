import { useState, useEffect, useCallback } from 'react';
import {
  aiServiceManager,
  searchService,
  demandForecastingService,
  priceOptimizationService,
  supplierMatchingService,
  recommendationEngine,
  documentIntelligenceService,
  naturalLanguageInterface,
} from '../services/ai';
import type {
  SearchResult,
  DocumentAnalysis,
  ChatMessage,
  AIInsight,
} from '../services/ai/types';

interface UseAIOptions {
  autoInitialize?: boolean;
  enableCaching?: boolean;
  userId?: string;
}

interface AIState {
  initialized: boolean;
  loading: boolean;
  error: string | null;
  serviceStatus: Record<string, boolean>;
}

export const useAI = (options: UseAIOptions = {}) => {
  const { autoInitialize = true, userId } = options;

  const [state, setState] = useState<AIState>({
    initialized: false,
    loading: false,
    error: null,
    serviceStatus: {},
  });

  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Search state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<SearchResult[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  // Initialize AI services
  const initialize = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const success = await aiServiceManager.initialize();
      const serviceStatus = aiServiceManager.getServiceStatus();
      
      setState(prev => ({
        ...prev,
        initialized: success,
        loading: false,
        serviceStatus,
      }));

      return success;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Initialization failed',
      }));
      return false;
    }
  }, []);

  // Auto-initialize on mount
  useEffect(() => {
    if (autoInitialize && !state.initialized) {
      initialize();
    }
  }, [autoInitialize, state.initialized, initialize]);

  // Smart Search
  const search = useCallback(async (
    query: string,
    filters?: any,
    _options?: { useCache?: boolean }
  ): Promise<SearchResult[]> => {
    setSearchLoading(true);
    
    try {
      const results = await searchService.search(query, filters);
      setSearchResults(results);
      return results;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Get search suggestions
  const getSearchSuggestions = useCallback(async (partialQuery: string): Promise<string[]> => {
    try {
      return await searchService.getSuggestions(partialQuery);
    } catch (error) {
      console.error('Search suggestions error:', error);
      return [];
    }
  }, []);

  // Demand Forecasting
  const forecastDemand = useCallback(async (
    productId: string,
    historicalOrders: any[],
    daysToForecast?: number
  ) => {
    try {
      return await demandForecastingService.forecastDemand(
        productId,
        historicalOrders,
        daysToForecast
      );
    } catch (error) {
      console.error('Demand forecasting error:', error);
      return null;
    }
  }, []);

  // Price Optimization
  const optimizePrice = useCallback(async (
    productId: string,
    currentPrice: number,
    historicalData: any
  ) => {
    try {
      return await priceOptimizationService.optimizePrice(
        productId,
        currentPrice,
        historicalData
      );
    } catch (error) {
      console.error('Price optimization error:', error);
      return null;
    }
  }, []);

  // Dynamic Pricing
  const getDynamicPrice = useCallback(async (
    productId: string,
    context: any
  ): Promise<number> => {
    try {
      return await priceOptimizationService.getDynamicPricing(productId, context);
    } catch (error) {
      console.error('Dynamic pricing error:', error);
      return 1.0; // No adjustment
    }
  }, []);

  // Supplier Matching
  const findSuppliers = useCallback(async (
    requirements: any,
    availableSuppliers: any[]
  ) => {
    try {
      return await supplierMatchingService.matchSuppliers(requirements, availableSuppliers);
    } catch (error) {
      console.error('Supplier matching error:', error);
      return null;
    }
  }, []);

  // Recommendations
  const getUserRecommendations = useCallback(async (
    targetUserId?: string,
    context?: any
  ) => {
    if (!targetUserId && !userId) {
      console.warn('No user ID provided for recommendations');
      return [];
    }

    setRecommendationsLoading(true);
    
    try {
      const results = await recommendationEngine.getUserRecommendations(
        targetUserId || userId!,
        context
      );
      setRecommendations(results);
      return results;
    } catch (error) {
      console.error('Recommendations error:', error);
      return [];
    } finally {
      setRecommendationsLoading(false);
    }
  }, [userId]);

  const getProductRecommendations = useCallback(async (
    productId: string,
    context?: any
  ) => {
    try {
      return await recommendationEngine.getProductRecommendations(productId, context);
    } catch (error) {
      console.error('Product recommendations error:', error);
      return [];
    }
  }, []);

  // Record user interaction for learning
  const recordInteraction = useCallback(async (
    productId: string,
    interactionType: 'view' | 'add_to_cart' | 'purchase' | 'search',
    metadata?: any
  ) => {
    if (!userId) return;
    
    try {
      await recommendationEngine.recordInteraction(
        userId,
        productId,
        interactionType,
        metadata
      );
    } catch (error) {
      console.error('Interaction recording error:', error);
    }
  }, [userId]);

  // Document Analysis
  const analyzeDocument = useCallback(async (
    file: File | string,
    options?: any
  ): Promise<DocumentAnalysis | null> => {
    try {
      return await documentIntelligenceService.analyzeDocument(file, options);
    } catch (error) {
      console.error('Document analysis error:', error);
      return null;
    }
  }, []);

  const extractTableData = useCallback(async (
    ocrText: string,
    tableHeaders?: string[]
  ) => {
    try {
      return await documentIntelligenceService.extractTableData(ocrText, tableHeaders);
    } catch (error) {
      console.error('Table extraction error:', error);
      return [];
    }
  }, []);

  const summarizeDocument = useCallback(async (text: string) => {
    try {
      return await documentIntelligenceService.summarizeDocument(text);
    } catch (error) {
      console.error('Document summarization error:', error);
      return 'Summary not available';
    }
  }, []);

  // Natural Language Interface
  const chatWithAI = useCallback(async (
    message: string,
    sessionId?: string
  ): Promise<ChatMessage | null> => {
    if (!userId) {
      console.warn('No user ID provided for chat');
      return null;
    }

    setChatLoading(true);
    
    try {
      const response = await naturalLanguageInterface.processMessage(
        message,
        userId,
        sessionId
      );
      
      // Add both user message and AI response to history
      setChatHistory(prev => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: 'user',
          content: message,
          timestamp: new Date().toISOString(),
        },
        response,
      ]);
      
      return response;
    } catch (error) {
      console.error('Chat error:', error);
      return null;
    } finally {
      setChatLoading(false);
    }
  }, [userId]);

  const getChatSuggestions = useCallback(async (partialMessage: string) => {
    try {
      return await naturalLanguageInterface.getSuggestions(partialMessage);
    } catch (error) {
      console.error('Chat suggestions error:', error);
      return [];
    }
  }, []);

  const clearChatHistory = useCallback((sessionId?: string) => {
    if (userId && sessionId) {
      naturalLanguageInterface.clearConversation(userId, sessionId);
    }
    setChatHistory([]);
  }, [userId]);

  // Anomaly Detection
  const detectAnomalies = useCallback(async (
    productId: string,
    recentOrders: any[]
  ) => {
    try {
      return await demandForecastingService.detectAnomalies(productId, recentOrders);
    } catch (error) {
      console.error('Anomaly detection error:', error);
      return [];
    }
  }, []);

  // AI Insights Generation
  const generateInsights = useCallback(async (
    data: any,
    context: string
  ): Promise<AIInsight[]> => {
    try {
      return await aiServiceManager.generateInsights(data, context);
    } catch (error) {
      console.error('Insights generation error:', error);
      return [];
    }
  }, []);

  // Health Check
  const getHealthStatus = useCallback(async () => {
    try {
      return await aiServiceManager.getHealthCheck();
    } catch (error) {
      console.error('Health check error:', error);
      return {
        status: 'unhealthy' as const,
        services: {},
        timestamp: new Date().toISOString(),
      };
    }
  }, []);

  // Batch Operations
  const processBatchDocuments = useCallback(async (documents: any[]) => {
    try {
      return await aiServiceManager.processDocumentBatch(documents);
    } catch (error) {
      console.error('Batch document processing error:', error);
      return [];
    }
  }, []);

  // Cache Management
  const clearCache = useCallback(() => {
    aiServiceManager.clearCache();
  }, []);

  // Utility Functions
  const isFeatureAvailable = useCallback((feature: string): boolean => {
    return state.serviceStatus[feature] || false;
  }, [state.serviceStatus]);

  return {
    // State
    ...state,
    chatHistory,
    chatLoading,
    searchResults,
    searchLoading,
    recommendations,
    recommendationsLoading,

    // Core Operations
    initialize,
    
    // Search
    search,
    getSearchSuggestions,

    // Predictions
    forecastDemand,
    optimizePrice,
    getDynamicPrice,
    detectAnomalies,

    // Analytics
    findSuppliers,
    getUserRecommendations,
    getProductRecommendations,
    recordInteraction,

    // Document Intelligence
    analyzeDocument,
    extractTableData,
    summarizeDocument,
    processBatchDocuments,

    // Natural Language
    chatWithAI,
    getChatSuggestions,
    clearChatHistory,

    // Insights
    generateInsights,

    // System
    getHealthStatus,
    clearCache,
    isFeatureAvailable,

    // Convenience methods for common workflows
    analyzeProductDemand: useCallback(async (productId: string, orders: any[]) => {
      const [forecast, anomalies] = await Promise.all([
        forecastDemand(productId, orders),
        detectAnomalies(productId, orders),
      ]);
      return { forecast, anomalies };
    }, [forecastDemand, detectAnomalies]),

    optimizeProductStrategy: useCallback(async (
      productId: string,
      currentPrice: number,
      orders: any[],
      competitors: any[]
    ) => {
      const [priceOpt, forecast] = await Promise.all([
        optimizePrice(productId, currentPrice, {
          salesHistory: orders,
          competitorPrices: competitors.map(c => c.price),
          marketConditions: { demand: 'normal' },
        }),
        forecastDemand(productId, orders),
      ]);
      return { priceOptimization: priceOpt, demandForecast: forecast };
    }, [optimizePrice, forecastDemand]),

    searchAndRecommend: useCallback(async (query: string, filters?: any) => {
      const [searchResults, userRecs] = await Promise.all([
        search(query, filters),
        userId ? getUserRecommendations() : Promise.resolve([]),
      ]);
      return { searchResults, recommendations: userRecs };
    }, [search, getUserRecommendations, userId]),
  };
};