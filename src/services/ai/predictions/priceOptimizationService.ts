// Price Optimization service for dynamic pricing strategies using AI-driven market analysis
import { PriceOptimization, PredictionResult } from '../types';
import { aiService } from '../aiService';
import { logger } from '../../logger';

export class PriceOptimizationService {
  private static instance: PriceOptimizationService;

  private constructor() {}

  static getInstance(): PriceOptimizationService {
    if (!PriceOptimizationService.instance) {
      PriceOptimizationService.instance = new PriceOptimizationService();
    }
    return PriceOptimizationService.instance;
  }

  async optimizePrice(
    productId: string,
    currentPrice: number,
    historicalData: {
      salesHistory: any[];
      competitorPrices: number[];
      marketConditions: any;
    }
  ): Promise<PredictionResult<PriceOptimization>> {
    try {
      // Analyze price elasticity
      const elasticity = await this.calculatePriceElasticity(
        historicalData.salesHistory
      );

      // Get AI-driven price recommendation
      const aiRecommendation = await this.getAIPriceRecommendation(
        productId,
        currentPrice,
        historicalData,
        elasticity
      );

      // Validate against business rules
      const validatedPrice = this.validatePrice(
        aiRecommendation.suggestedPrice,
        currentPrice,
        historicalData.competitorPrices
      );

      // Calculate expected revenue impact
      const revenueImpact = this.calculateRevenueImpact(
        currentPrice,
        validatedPrice,
        elasticity,
        historicalData.salesHistory
      );

      const optimization: PriceOptimization = {
        productId,
        currentPrice,
        suggestedPrice: validatedPrice,
        expectedRevenue: revenueImpact.expectedRevenue,
        elasticity,
        competitorPrices: historicalData.competitorPrices,
      };

      return {
        prediction: optimization,
        confidence: aiRecommendation.confidence,
        metadata: {
          factors: aiRecommendation.factors,
          constraints: aiRecommendation.constraints,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Price optimization error:', error as Error);
      throw error;
    }
  }

  private async calculatePriceElasticity(salesHistory: any[]): Promise<number> {
    // Group sales by price points
    const priceGroups = new Map<number, number[]>();

    salesHistory.forEach(sale => {
      const price = sale.price;
      const quantity = sale.quantity;
      
      if (!priceGroups.has(price)) {
        priceGroups.set(price, []);
      }
      priceGroups.get(price)!.push(quantity);
    });

    // Calculate elasticity using regression
    const dataPoints: Array<{ price: number; avgQuantity: number }> = [];
    
    priceGroups.forEach((quantities, price) => {
      const avgQuantity = quantities.reduce((a, b) => a + b, 0) / quantities.length;
      dataPoints.push({ price, avgQuantity });
    });

    // Simplified elasticity calculation
    if (dataPoints.length < 2) return -1.2; // Default elastic demand

    dataPoints.sort((a, b) => a.price - b.price);
    
    let sumPriceChange = 0;
    let sumQuantityChange = 0;
    
    for (let i = 1; i < dataPoints.length; i++) {
      const priceChange = (dataPoints[i].price - dataPoints[i-1].price) / dataPoints[i-1].price;
      const quantityChange = (dataPoints[i].avgQuantity - dataPoints[i-1].avgQuantity) / dataPoints[i-1].avgQuantity;
      
      if (priceChange !== 0) {
        sumPriceChange += Math.abs(priceChange);
        sumQuantityChange += Math.abs(quantityChange);
      }
    }

    return sumPriceChange === 0 ? -1.2 : -(sumQuantityChange / sumPriceChange);
  }

  private async getAIPriceRecommendation(
    productId: string,
    currentPrice: number,
    historicalData: any,
    _elasticity: number
  ): Promise<any> {
    const prompt = `
      Analyze pricing data and recommend optimal price for maximum revenue.
      
      Product ID: ${productId}
      Current Price: $${currentPrice}
      Price Elasticity: ${_elasticity}
      Competitor Prices: ${historicalData.competitorPrices.join(', ')}
      
      Recent Sales Summary:
      ${this.summarizeSalesHistory(historicalData.salesHistory)}
      
      Market Conditions:
      ${JSON.stringify(historicalData.marketConditions)}
      
      Consider:
      1. Price elasticity of demand
      2. Competitor pricing
      3. Market positioning
      4. Profit margins
      5. Customer segments
      6. Seasonal factors
      
      Provide:
      1. Suggested price
      2. Confidence level (0-1)
      3. Key factors influencing the recommendation
      4. Potential risks
      5. Alternative pricing strategies
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      const parsed = JSON.parse(response);
      
      return {
        suggestedPrice: parsed.suggestedPrice || currentPrice,
        confidence: parsed.confidence || 0.7,
        factors: parsed.factors || [],
        constraints: parsed.constraints || [],
        alternatives: parsed.alternatives || [],
      };
    } catch (error) {
      logger.error('AI price recommendation error:', error as Error);
      // Fallback to rule-based pricing
      return this.getRuleBasedPrice(currentPrice, historicalData, _elasticity);
    }
  }

  private validatePrice(
    suggestedPrice: number,
    currentPrice: number,
    competitorPrices: number[]
  ): number {
    // Apply business rules
    const minPrice = currentPrice * 0.7; // Max 30% decrease
    const maxPrice = currentPrice * 1.5; // Max 50% increase
    
    // Stay competitive
    const avgCompetitorPrice = competitorPrices.length > 0
      ? competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length
      : currentPrice;
    
    const competitiveMin = avgCompetitorPrice * 0.85;
    const competitiveMax = avgCompetitorPrice * 1.15;
    
    // Apply constraints
    let validatedPrice = Math.max(minPrice, Math.min(maxPrice, suggestedPrice));
    validatedPrice = Math.max(competitiveMin, Math.min(competitiveMax, validatedPrice));
    
    // Round to nearest cent
    return Math.round(validatedPrice * 100) / 100;
  }

  private calculateRevenueImpact(
    currentPrice: number,
    newPrice: number,
    elasticity: number,
    salesHistory: any[]
  ): any {
    // Calculate average current quantity
    const recentSales = salesHistory.slice(-30);
    const avgQuantity = recentSales.reduce((sum, sale) => sum + sale.quantity, 0) / recentSales.length;
    
    // Calculate expected quantity change
    const priceChangePercent = (newPrice - currentPrice) / currentPrice;
    const quantityChangePercent = priceChangePercent * elasticity;
    const newQuantity = avgQuantity * (1 + quantityChangePercent);
    
    // Calculate revenues
    const currentRevenue = currentPrice * avgQuantity;
    const expectedRevenue = newPrice * newQuantity;
    const revenueChange = expectedRevenue - currentRevenue;
    const revenueChangePercent = (revenueChange / currentRevenue) * 100;
    
    return {
      currentRevenue,
      expectedRevenue,
      revenueChange,
      revenueChangePercent,
      expectedQuantity: newQuantity,
    };
  }

  private summarizeSalesHistory(salesHistory: any[]): string {
    const recent = salesHistory.slice(-30);
    const totalQuantity = recent.reduce((sum, sale) => sum + sale.quantity, 0);
    const avgPrice = recent.reduce((sum, sale) => sum + sale.price, 0) / recent.length;
    
    return `
      Last 30 sales:
      - Total quantity: ${totalQuantity}
      - Average price: $${avgPrice.toFixed(2)}
      - Date range: ${recent[0]?.date} to ${recent[recent.length - 1]?.date}
    `;
  }

  private getRuleBasedPrice(
    currentPrice: number,
    historicalData: any,
    _elasticity: number
  ): any {
    const avgCompetitorPrice = historicalData.competitorPrices.length > 0
      ? historicalData.competitorPrices.reduce((a: number, b: number) => a + b, 0) / historicalData.competitorPrices.length
      : currentPrice;
    
    // Simple rule-based pricing
    let suggestedPrice = currentPrice;
    
    if (currentPrice > avgCompetitorPrice * 1.1) {
      // We're priced too high
      suggestedPrice = avgCompetitorPrice * 1.05;
    } else if (currentPrice < avgCompetitorPrice * 0.9) {
      // We might be leaving money on the table
      suggestedPrice = avgCompetitorPrice * 0.95;
    }
    
    return {
      suggestedPrice,
      confidence: 0.6,
      factors: ['Competitor pricing', 'Market position'],
      constraints: ['Business rules applied'],
      alternatives: [],
    };
  }

  async getDynamicPricing(
    productId: string,
    context: {
      timeOfDay: string;
      dayOfWeek: string;
      inventory: number;
      demand: number;
    }
  ): Promise<number> {
    const prompt = `
      Calculate dynamic price adjustment for real-time conditions.
      
      Product ID: ${productId}
      Context: ${JSON.stringify(context)}
      
      Consider:
      - Time-based demand patterns
      - Inventory levels
      - Current demand
      - Perishability
      
      Return a price multiplier (0.8 to 1.2).
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      const multiplier = parseFloat(response);
      return Math.max(0.8, Math.min(1.2, multiplier));
    } catch (error) {
      logger.error('Dynamic pricing error:', error as Error);
      return 1.0; // No adjustment
    }
  }
}

export const priceOptimizationService = PriceOptimizationService.getInstance();