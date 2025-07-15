import { MarketIntelligence } from '../types';
import { aiService } from '../aiService';
import { logger } from '../../logger';

interface PriceAnalysis {
  category: string;
  currentAveragePrice: number;
  priceHistory: Array<{ date: string; price: number }>;
  priceVolatility: number;
  priceDirection: 'rising' | 'falling' | 'stable';
  competitorPrices: Array<{ competitor: string; price: number; marketShare: number }>;
  recommendations: string[];
}

interface DemandAnalysis {
  category: string;
  currentDemand: number;
  demandTrend: 'increasing' | 'decreasing' | 'stable';
  seasonalFactors: Array<{ season: string; multiplier: number }>;
  demandDrivers: string[];
  futureProjections: Array<{ period: string; projectedDemand: number; confidence: number }>;
}

interface CompetitorAnalysis {
  competitorName: string;
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
  pricingStrategy: 'premium' | 'competitive' | 'budget';
  productPortfolio: string[];
  recentMoves: string[];
  threatLevel: 'low' | 'medium' | 'high';
}

interface MarketOpportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  potentialRevenue: number;
  investmentRequired: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: string;
  keyFactors: string[];
  actionItems: string[];
}

export class MarketIntelligenceService {
  private static instance: MarketIntelligenceService;
  // private _marketData: Map<string, any> = new Map();
  private analysisCache: Map<string, { data: any; timestamp: number }> = new Map();

  private constructor() {}

  static getInstance(): MarketIntelligenceService {
    if (!MarketIntelligenceService.instance) {
      MarketIntelligenceService.instance = new MarketIntelligenceService();
    }
    return MarketIntelligenceService.instance;
  }

  async getMarketIntelligence(
    category: string,
    region?: string,
    _timeframe?: string
  ): Promise<MarketIntelligence> {
    try {
      const cacheKey = `market-${category}-${region}-${_timeframe}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      // Gather market data from multiple sources
      const [priceAnalysis, demandAnalysis, competitorAnalysis] = await Promise.all([
        this.analyzePricing(category, region, _timeframe),
        this.analyzeDemand(category, region, _timeframe),
        this.analyzeCompetitors(category, region),
      ]);

      // Generate comprehensive market intelligence
      const intelligence = await this.synthesizeMarketIntelligence(
        category,
        priceAnalysis,
        demandAnalysis,
        competitorAnalysis
      );

      this.setCache(cacheKey, intelligence);
      return intelligence;
    } catch (error) {
      logger.error('Market intelligence error:', error as Error);
      throw error;
    }
  }

  private async analyzePricing(
    category: string,
    region?: string,
    timeframe?: string
  ): Promise<PriceAnalysis> {
    const prompt = `
      Analyze pricing trends for ${category} in ${region || 'global'} market over ${timeframe || 'last 6 months'}:
      
      Provide analysis on:
      1. Current average pricing
      2. Price history and trends
      3. Price volatility factors
      4. Competitor pricing comparison
      5. Price direction indicators
      6. Pricing recommendations
      
      Consider:
      - Seasonal variations
      - Supply chain disruptions
      - Economic factors
      - Regulatory changes
      - Consumer behavior shifts
      
      Return structured data with specific numbers and actionable insights.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      const analysis = JSON.parse(response);

      return {
        category,
        currentAveragePrice: analysis.currentPrice || 10.99,
        priceHistory: analysis.priceHistory || this.generateMockPriceHistory(),
        priceVolatility: analysis.volatility || 0.15,
        priceDirection: analysis.direction || 'stable',
        competitorPrices: analysis.competitors || this.generateMockCompetitorPrices(),
        recommendations: analysis.recommendations || [
          'Monitor competitor pricing closely',
          'Consider dynamic pricing strategies',
        ],
      };
    } catch (error) {
      logger.error('Price analysis error:', error as Error);
      return this.getFallbackPriceAnalysis(category);
    }
  }

  private async analyzeDemand(
    category: string,
    region?: string,
    _timeframe?: string
  ): Promise<DemandAnalysis> {
    const prompt = `
      Analyze demand patterns for ${category} in ${region || 'global'} market:
      
      Analyze:
      1. Current demand levels
      2. Demand trends and growth rates
      3. Seasonal demand patterns
      4. Key demand drivers
      5. Future demand projections
      
      Consider factors:
      - Population growth
      - Economic indicators
      - Consumer preferences
      - Health trends
      - Sustainability concerns
      - Supply chain factors
      
      Provide quantified projections with confidence intervals.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      const analysis = JSON.parse(response);

      return {
        category,
        currentDemand: analysis.currentDemand || 1000000,
        demandTrend: analysis.trend || 'stable',
        seasonalFactors: analysis.seasonal || this.generateSeasonalFactors(),
        demandDrivers: analysis.drivers || [
          'Population growth',
          'Health consciousness',
          'Economic conditions',
        ],
        futureProjections: analysis.projections || this.generateDemandProjections(),
      };
    } catch (error) {
      logger.error('Demand analysis error:', error as Error);
      return this.getFallbackDemandAnalysis(category);
    }
  }

  private async analyzeCompetitors(
    category: string,
    region?: string
  ): Promise<CompetitorAnalysis[]> {
    const prompt = `
      Analyze key competitors in ${category} market for ${region || 'global'} region:
      
      For each major competitor, analyze:
      1. Market share and position
      2. Key strengths and weaknesses
      3. Pricing strategy
      4. Product portfolio
      5. Recent strategic moves
      6. Threat level assessment
      
      Focus on:
      - Market leaders
      - Emerging competitors
      - Disruptive players
      - Strategic partnerships
      - Innovation efforts
      
      Provide actionable competitive intelligence.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      const competitors = JSON.parse(response);

      return Array.isArray(competitors) 
        ? competitors 
        : this.generateMockCompetitorAnalysis();
    } catch (error) {
      logger.error('Competitor analysis error:', error as Error);
      return this.generateMockCompetitorAnalysis();
    }
  }

  private async synthesizeMarketIntelligence(
    category: string,
    priceAnalysis: PriceAnalysis,
    demandAnalysis: DemandAnalysis,
    competitorAnalysis: CompetitorAnalysis[]
  ): Promise<MarketIntelligence> {
    const prompt = `
      Synthesize comprehensive market intelligence for ${category}:
      
      Price Analysis: ${JSON.stringify(priceAnalysis)}
      Demand Analysis: ${JSON.stringify(demandAnalysis)}
      Competitor Analysis: ${JSON.stringify(competitorAnalysis)}
      
      Generate:
      1. Overall market trends
      2. Key opportunities
      3. Major risks
      4. Strategic recommendations
      
      Provide insights that combine pricing, demand, and competitive factors.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      const synthesis = JSON.parse(response);

      return {
        category,
        trends: synthesis.trends || [{
          period: 'Q1 2024',
          priceChange: 0.05,
          demandChange: 0.08,
          insights: ['Growing demand for organic products', 'Supply chain stabilization'],
        }],
        competitors: competitorAnalysis.map(comp => ({
          name: comp.competitorName,
          marketShare: comp.marketShare,
          pricingStrategy: comp.pricingStrategy,
        })),
        opportunities: synthesis.opportunities || [
          'Expand organic product line',
          'Enter emerging markets',
          'Develop premium offerings',
        ],
        risks: synthesis.risks || [
          'Increased competition',
          'Supply chain disruptions',
          'Regulatory changes',
        ],
      };
    } catch (error) {
      logger.error('Market intelligence synthesis error:', error as Error);
      return this.getFallbackMarketIntelligence(category);
    }
  }

  async identifyMarketOpportunities(
    businessProfile: {
      currentCategories: string[];
      capabilities: string[];
      budget: number;
      riskTolerance: 'low' | 'medium' | 'high';
      timeframe: 'short' | 'medium' | 'long';
    }
  ): Promise<MarketOpportunity[]> {
    const prompt = `
      Identify market opportunities based on business profile:
      
      Business Profile: ${JSON.stringify(businessProfile)}
      
      Find opportunities that:
      1. Align with current capabilities
      2. Fit within budget constraints
      3. Match risk tolerance
      4. Suit timeframe preferences
      
      Consider:
      - Emerging market segments
      - Underserved customer needs
      - Technology disruptions
      - Regulatory changes
      - Sustainability trends
      
      Rank by potential ROI and feasibility.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      const opportunities = JSON.parse(response);

      return Array.isArray(opportunities) 
        ? opportunities.map((opp, index) => ({
            id: `opp-${Date.now()}-${index}`,
            title: opp.title || 'Market Opportunity',
            description: opp.description || 'Opportunity description',
            category: opp.category || 'general',
            potentialRevenue: opp.revenue || 100000,
            investmentRequired: opp.investment || 25000,
            riskLevel: opp.risk || 'medium',
            timeframe: opp.timeframe || '6-12 months',
            keyFactors: opp.factors || [],
            actionItems: opp.actions || [],
          }))
        : [];
    } catch (error) {
      logger.error('Opportunity identification error:', error as Error);
      return this.generateMockOpportunities();
    }
  }

  async analyzeMarketEntryStrategy(
    targetMarket: {
      category: string;
      region: string;
      customerSegment: string;
      competitionLevel: 'low' | 'medium' | 'high';
    },
    resources: {
      budget: number;
      timeline: string;
      expertise: string[];
    }
  ): Promise<{
    strategy: string;
    entryMode: 'direct' | 'partnership' | 'acquisition';
    timeline: string;
    investmentRequired: number;
    riskFactors: string[];
    successFactors: string[];
    kpis: string[];
  }> {
    const prompt = `
      Develop market entry strategy:
      
      Target Market: ${JSON.stringify(targetMarket)}
      Available Resources: ${JSON.stringify(resources)}
      
      Recommend:
      1. Optimal entry strategy
      2. Entry mode (direct, partnership, acquisition)
      3. Implementation timeline
      4. Investment requirements
      5. Risk mitigation strategies
      6. Success factors
      7. Key performance indicators
      
      Consider market dynamics, competition, and resource constraints.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error('Market entry strategy error:', error as Error);
      return {
        strategy: 'Gradual market penetration',
        entryMode: 'partnership',
        timeline: '12-18 months',
        investmentRequired: resources.budget * 0.7,
        riskFactors: ['Market acceptance', 'Competition response'],
        successFactors: ['Product quality', 'Local partnerships'],
        kpis: ['Market share', 'Revenue growth', 'Customer acquisition'],
      };
    }
  }

  async trackMarketSentiment(
    category: string,
    sources: string[] = ['news', 'social', 'industry']
  ): Promise<{
    overallSentiment: 'positive' | 'neutral' | 'negative';
    sentimentScore: number;
    keyTopics: Array<{ topic: string; sentiment: string; mentions: number }>;
    trends: Array<{ period: string; sentiment: number }>;
    influencers: Array<{ name: string; influence: number; sentiment: string }>;
  }> {
    const prompt = `
      Analyze market sentiment for ${category} from sources: ${sources.join(', ')}
      
      Track:
      1. Overall sentiment trend
      2. Key discussion topics
      3. Sentiment drivers
      4. Influential voices
      5. Emerging concerns or opportunities
      
      Provide sentiment scoring (-1 to +1) and trend analysis.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error('Sentiment tracking error:', error as Error);
      return {
        overallSentiment: 'neutral',
        sentimentScore: 0.1,
        keyTopics: [
          { topic: 'quality', sentiment: 'positive', mentions: 150 },
          { topic: 'pricing', sentiment: 'neutral', mentions: 89 },
        ],
        trends: [
          { period: 'last_week', sentiment: 0.2 },
          { period: 'last_month', sentiment: 0.1 },
        ],
        influencers: [
          { name: 'Industry Expert', influence: 85, sentiment: 'positive' },
        ],
      };
    }
  }

  // Helper methods for generating mock data
  private generateMockPriceHistory(): Array<{ date: string; price: number }> {
    const history = [];
    const basePrice = 10;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const price = basePrice + Math.random() * 2 - 1;
      history.push({
        date: date.toISOString().split('T')[0],
        price: Number(price.toFixed(2)),
      });
    }
    
    return history;
  }

  private generateMockCompetitorPrices(): Array<{ competitor: string; price: number; marketShare: number }> {
    return [
      { competitor: 'Competitor A', price: 11.99, marketShare: 0.25 },
      { competitor: 'Competitor B', price: 9.99, marketShare: 0.20 },
      { competitor: 'Competitor C', price: 12.99, marketShare: 0.15 },
    ];
  }

  private generateSeasonalFactors(): Array<{ season: string; multiplier: number }> {
    return [
      { season: 'Spring', multiplier: 1.1 },
      { season: 'Summer', multiplier: 1.3 },
      { season: 'Fall', multiplier: 1.0 },
      { season: 'Winter', multiplier: 0.8 },
    ];
  }

  private generateDemandProjections(): Array<{ period: string; projectedDemand: number; confidence: number }> {
    return [
      { period: 'Q2 2024', projectedDemand: 1050000, confidence: 0.85 },
      { period: 'Q3 2024', projectedDemand: 1120000, confidence: 0.78 },
      { period: 'Q4 2024', projectedDemand: 1080000, confidence: 0.70 },
    ];
  }

  private generateMockCompetitorAnalysis(): CompetitorAnalysis[] {
    return [
      {
        competitorName: 'Market Leader Co',
        marketShare: 0.35,
        strengths: ['Brand recognition', 'Distribution network'],
        weaknesses: ['High prices', 'Limited innovation'],
        pricingStrategy: 'premium',
        productPortfolio: ['Premium products', 'Organic line'],
        recentMoves: ['Acquired regional supplier', 'Launched new product line'],
        threatLevel: 'high',
      },
    ];
  }

  private generateMockOpportunities(): MarketOpportunity[] {
    return [
      {
        id: 'opp-mock-1',
        title: 'Organic Product Expansion',
        description: 'Growing demand for organic products in urban markets',
        category: 'organic',
        potentialRevenue: 500000,
        investmentRequired: 100000,
        riskLevel: 'medium',
        timeframe: '6-9 months',
        keyFactors: ['Consumer health trends', 'Premium pricing acceptance'],
        actionItems: ['Market research', 'Supplier identification', 'Product development'],
      },
    ];
  }

  private getFallbackPriceAnalysis(category: string): PriceAnalysis {
    return {
      category,
      currentAveragePrice: 10.99,
      priceHistory: this.generateMockPriceHistory(),
      priceVolatility: 0.15,
      priceDirection: 'stable',
      competitorPrices: this.generateMockCompetitorPrices(),
      recommendations: ['Monitor market trends', 'Consider competitive pricing'],
    };
  }

  private getFallbackDemandAnalysis(category: string): DemandAnalysis {
    return {
      category,
      currentDemand: 1000000,
      demandTrend: 'stable',
      seasonalFactors: this.generateSeasonalFactors(),
      demandDrivers: ['Market growth', 'Consumer preferences'],
      futureProjections: this.generateDemandProjections(),
    };
  }

  private getFallbackMarketIntelligence(category: string): MarketIntelligence {
    return {
      category,
      trends: [{
        period: 'Q1 2024',
        priceChange: 0.02,
        demandChange: 0.05,
        insights: ['Stable market conditions', 'Moderate growth expected'],
      }],
      competitors: [
        { name: 'Competitor A', marketShare: 0.3, pricingStrategy: 'competitive' },
        { name: 'Competitor B', marketShare: 0.25, pricingStrategy: 'budget' },
      ],
      opportunities: ['Product diversification', 'Market expansion'],
      risks: ['Economic uncertainty', 'Supply chain challenges'],
    };
  }

  private getFromCache(key: string): any | null {
    const cached = this.analysisCache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > 24 * 60 * 60 * 1000) { // 24 hours
      this.analysisCache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.analysisCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clearCache(): void {
    this.analysisCache.clear();
  }
}

export const marketIntelligenceService = MarketIntelligenceService.getInstance();