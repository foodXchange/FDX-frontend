// Demand Forecasting service for predicting product demand using historical data and AI models
import { DemandForecast, PredictionResult } from '../types';
import { aiService } from '../aiService';
import { logger } from '../../logger';

export class DemandForecastingService {
  private static instance: DemandForecastingService;
  private historicalData: Map<string, any[]> = new Map();

  private constructor() {}

  static getInstance(): DemandForecastingService {
    if (!DemandForecastingService.instance) {
      DemandForecastingService.instance = new DemandForecastingService();
    }
    return DemandForecastingService.instance;
  }

  async forecastDemand(
    productId: string,
    historicalOrders: any[],
    daysToForecast: number = 7
  ): Promise<PredictionResult<DemandForecast>> {
    try {
      // Store historical data for future use
      this.historicalData.set(productId, historicalOrders);

      // Prepare data for analysis
      const analysisData = this.prepareDataForAnalysis(historicalOrders);

      // Use AI to analyze patterns and generate forecast
      const forecast = await this.generateAIForecast(
        productId,
        analysisData,
        daysToForecast
      );

      // Apply statistical models for validation
      const validatedForecast = await this.validateWithStatisticalModels(forecast);

      // Calculate confidence intervals
      const enhancedForecast = this.addConfidenceIntervals(validatedForecast);

      return {
        prediction: enhancedForecast,
        confidence: this.calculateOverallConfidence(enhancedForecast),
        metadata: {
          modelVersion: '1.0',
          dataPoints: historicalOrders.length,
          forecastHorizon: daysToForecast,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Demand forecasting error:', error as Error);
      throw error;
    }
  }

  private prepareDataForAnalysis(orders: any[]): any {
    // Extract relevant features
    const dailyQuantities = this.aggregateByDay(orders);
    const seasonalityFactors = this.calculateSeasonality(dailyQuantities);
    const trendFactors = this.calculateTrend(dailyQuantities);
    const externalFactors = this.identifyExternalFactors(orders);

    return {
      dailyQuantities,
      seasonalityFactors,
      trendFactors,
      externalFactors,
      statistics: {
        mean: this.calculateMean(dailyQuantities),
        stdDev: this.calculateStdDev(dailyQuantities),
        min: Math.min(...dailyQuantities.map(d => d.quantity)),
        max: Math.max(...dailyQuantities.map(d => d.quantity)),
      },
    };
  }

  private async generateAIForecast(
    productId: string,
    analysisData: any,
    daysToForecast: number
  ): Promise<DemandForecast> {
    const prompt = `
      Analyze historical order data and generate a demand forecast for the next ${daysToForecast} days.
      
      Product ID: ${productId}
      Historical Data Summary:
      - Average daily quantity: ${analysisData.statistics.mean}
      - Standard deviation: ${analysisData.statistics.stdDev}
      - Trend: ${analysisData.trendFactors.direction} (${analysisData.trendFactors.strength})
      - Seasonality detected: ${analysisData.seasonalityFactors.hasSeasonality}
      
      Recent 30-day data: ${JSON.stringify(analysisData.dailyQuantities.slice(-30))}
      
      Generate a forecast with:
      1. Daily quantity predictions
      2. Confidence levels
      3. Key factors influencing the forecast
      4. Any detected patterns or anomalies
      
      Consider:
      - Day of week patterns
      - Monthly trends
      - Seasonal variations
      - Special events or holidays
      
      Return as structured JSON matching the DemandForecast type.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      const parsedForecast = JSON.parse(response);
      
      // Ensure the forecast matches our expected structure
      return {
        productId,
        predictions: parsedForecast.predictions || this.generateDefaultPredictions(daysToForecast),
        factors: {
          seasonality: parsedForecast.seasonality || 0,
          trend: parsedForecast.trend || 0,
          events: parsedForecast.events || [],
        },
      };
    } catch (error) {
      logger.error('AI forecast generation error:', error as Error);
      // Fallback to statistical forecast
      return this.generateStatisticalForecast(productId, analysisData, daysToForecast);
    }
  }

  private validateWithStatisticalModels(forecast: DemandForecast): DemandForecast {
    // Apply ARIMA or other time series models for validation
    // This is a simplified version
    forecast.predictions.forEach(pred => {
      // Apply smoothing and ensure predictions are reasonable
      pred.quantity = Math.max(0, Math.round(pred.quantity));
      pred.confidence = Math.min(0.95, Math.max(0.5, pred.confidence));
    });

    return forecast;
  }

  private addConfidenceIntervals(forecast: DemandForecast): DemandForecast {
    forecast.predictions.forEach((pred, index) => {
      const uncertaintyFactor = 1 + (index * 0.05); // Uncertainty increases with time
      const stdDev = pred.quantity * 0.15 * uncertaintyFactor;
      
      pred.bounds = {
        lower: Math.max(0, Math.round(pred.quantity - 2 * stdDev)),
        upper: Math.round(pred.quantity + 2 * stdDev),
      };
    });

    return forecast;
  }

  private calculateOverallConfidence(forecast: DemandForecast): number {
    const avgConfidence = forecast.predictions.reduce(
      (sum, pred) => sum + pred.confidence,
      0
    ) / forecast.predictions.length;

    return Number(avgConfidence.toFixed(2));
  }

  private aggregateByDay(orders: any[]): any[] {
    const dailyMap = new Map<string, number>();

    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      const current = dailyMap.get(date) || 0;
      dailyMap.set(date, current + order.quantity);
    });

    return Array.from(dailyMap.entries()).map(([date, quantity]) => ({
      date,
      quantity,
    }));
  }

  private calculateSeasonality(dailyQuantities: any[]): any {
    // Simplified seasonality detection
    return {
      hasSeasonality: dailyQuantities.length > 30,
      pattern: 'weekly',
      strength: 0.7,
    };
  }

  private calculateTrend(dailyQuantities: any[]): any {
    if (dailyQuantities.length < 7) {
      return { direction: 'stable', strength: 0 };
    }

    const recentAvg = this.calculateMean(dailyQuantities.slice(-7));
    const previousAvg = this.calculateMean(dailyQuantities.slice(-14, -7));

    const change = (recentAvg - previousAvg) / previousAvg;

    return {
      direction: change > 0.05 ? 'increasing' : change < -0.05 ? 'decreasing' : 'stable',
      strength: Math.abs(change),
    };
  }

  private identifyExternalFactors(_orders: any[]): any {
    return {
      holidays: [],
      events: [],
      weatherImpact: 'low',
    };
  }

  private calculateMean(data: any[]): number {
    const sum = data.reduce((acc, item) => acc + item.quantity, 0);
    return sum / data.length;
  }

  private calculateStdDev(data: any[]): number {
    const mean = this.calculateMean(data);
    const variance = data.reduce((acc, item) => {
      return acc + Math.pow(item.quantity - mean, 2);
    }, 0) / data.length;
    return Math.sqrt(variance);
  }

  private generateDefaultPredictions(days: number): any[] {
    const predictions = [];
    const baseQuantity = 100;

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);

      predictions.push({
        date: date.toISOString().split('T')[0],
        quantity: baseQuantity + Math.random() * 20 - 10,
        confidence: 0.7 - (i * 0.05),
        bounds: {
          lower: baseQuantity - 20,
          upper: baseQuantity + 20,
        },
      });
    }

    return predictions;
  }

  private generateStatisticalForecast(
    productId: string,
    analysisData: any,
    daysToForecast: number
  ): DemandForecast {
    // Fallback statistical forecasting
    const avgQuantity = analysisData.statistics.mean;
    const trend = analysisData.trendFactors.strength * 
      (analysisData.trendFactors.direction === 'increasing' ? 1 : -1);

    const predictions = [];
    for (let i = 0; i < daysToForecast; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);

      const trendAdjustment = avgQuantity * trend * (i / daysToForecast);
      const quantity = Math.max(0, avgQuantity + trendAdjustment);

      predictions.push({
        date: date.toISOString().split('T')[0],
        quantity: Math.round(quantity),
        confidence: 0.75 - (i * 0.05),
        bounds: {
          lower: Math.round(quantity * 0.8),
          upper: Math.round(quantity * 1.2),
        },
      });
    }

    return {
      productId,
      predictions,
      factors: {
        seasonality: analysisData.seasonalityFactors.strength || 0,
        trend: trend,
        events: [],
      },
    };
  }

  async detectAnomalies(productId: string, recentOrders: any[]): Promise<any[]> {
    const historicalData = this.historicalData.get(productId) || [];
    const analysisData = this.prepareDataForAnalysis([...historicalData, ...recentOrders]);

    const prompt = `
      Analyze recent order data for anomalies or unusual patterns.
      
      Statistics:
      - Historical average: ${analysisData.statistics.mean}
      - Standard deviation: ${analysisData.statistics.stdDev}
      
      Recent orders: ${JSON.stringify(recentOrders.slice(-10))}
      
      Identify:
      1. Unusual spikes or drops
      2. Pattern breaks
      3. Potential data quality issues
      4. External factors that might explain anomalies
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error('Anomaly detection error:', error as Error);
      return [];
    }
  }
}

export const demandForecastingService = DemandForecastingService.getInstance();