export interface AIProvider {
  name: 'openai' | 'claude' | 'custom';
  model: string;
  apiKey: string;
}

export interface PredictionResult<T = any> {
  prediction: T;
  confidence: number;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface DemandForecast {
  productId: string;
  predictions: {
    date: string;
    quantity: number;
    confidence: number;
    bounds: {
      lower: number;
      upper: number;
    };
  }[];
  factors: {
    seasonality: number;
    trend: number;
    events: string[];
  };
}

export interface PriceOptimization {
  productId: string;
  currentPrice: number;
  suggestedPrice: number;
  expectedRevenue: number;
  elasticity: number;
  competitorPrices: number[];
}

export interface SupplierMatch {
  supplierId: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  historicalPerformance: {
    onTimeDelivery: number;
    qualityScore: number;
    priceCompetitiveness: number;
  };
}

export interface SearchResult {
  id: string;
  type: 'product' | 'supplier' | 'order' | 'document';
  title: string;
  description: string;
  relevanceScore: number;
  highlights: string[];
  metadata: Record<string, any>;
}

export interface DocumentAnalysis {
  documentType: string;
  extractedData: Record<string, any>;
  confidence: number;
  warnings: string[];
  suggestions: string[];
}

export interface MarketIntelligence {
  category: string;
  trends: {
    period: string;
    priceChange: number;
    demandChange: number;
    insights: string[];
  }[];
  competitors: {
    name: string;
    marketShare: number;
    pricingStrategy: string;
  }[];
  opportunities: string[];
  risks: string[];
}

export interface AIInsight {
  id: string;
  type: 'info' | 'warning' | 'success' | 'prediction';
  category: 'demand' | 'pricing' | 'supplier' | 'compliance' | 'general';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actions?: {
    label: string;
    action: string;
    params?: Record<string, any>;
  }[];
  confidence?: number;
  validUntil?: string;
  data?: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    intent?: string;
    entities?: Record<string, any>;
    suggestions?: string[];
  };
}

export interface RecommendationEngine {
  getUserRecommendations(userId: string): Promise<SearchResult[]>;
  getProductRecommendations(productId: string): Promise<SearchResult[]>;
  getSupplierRecommendations(criteria: any): Promise<SupplierMatch[]>;
}