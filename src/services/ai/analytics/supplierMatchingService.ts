import { SupplierMatch, PredictionResult } from '../types';
import { aiService } from '../aiService';
import { logger } from '../../logger';

export class SupplierMatchingService {
  private static instance: SupplierMatchingService;
  private supplierProfiles: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): SupplierMatchingService {
    if (!SupplierMatchingService.instance) {
      SupplierMatchingService.instance = new SupplierMatchingService();
    }
    return SupplierMatchingService.instance;
  }

  async matchSuppliers(
    requirements: {
      productCategories: string[];
      location: { lat: number; lng: number; radius: number };
      certifications: string[];
      minRating: number;
      priceRange: { min: number; max: number };
      deliveryRequirements: any;
      volumeRequirements: any;
    },
    availableSuppliers: any[]
  ): Promise<PredictionResult<SupplierMatch[]>> {
    try {
      // Build supplier profiles
      await this.buildSupplierProfiles(availableSuppliers);

      // Get AI-driven matching
      const aiMatches = await this.getAISupplierMatches(
        requirements,
        availableSuppliers
      );

      // Score and rank suppliers
      const scoredSuppliers = await this.scoreSuppliers(
        aiMatches,
        requirements
      );

      // Get detailed analysis for top matches
      const topMatches = await this.analyzeTopMatches(
        scoredSuppliers.slice(0, 10),
        requirements
      );

      return {
        prediction: topMatches,
        confidence: this.calculateMatchConfidence(topMatches),
        metadata: {
          totalSuppliers: availableSuppliers.length,
          matchCriteria: Object.keys(requirements),
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Supplier matching error:', error);
      throw error;
    }
  }

  private async buildSupplierProfiles(suppliers: any[]): Promise<void> {
    for (const supplier of suppliers) {
      const profile = await this.generateSupplierProfile(supplier);
      this.supplierProfiles.set(supplier.id, profile);
    }
  }

  private async generateSupplierProfile(supplier: any): Promise<any> {
    const prompt = `
      Analyze this supplier and create a comprehensive profile:
      
      Supplier Data: ${JSON.stringify(supplier)}
      
      Generate a profile including:
      1. Core competencies
      2. Strengths and weaknesses
      3. Ideal customer match
      4. Risk factors
      5. Growth potential
      6. Reliability indicators
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error('Supplier profile generation error:', error);
      return this.generateBasicProfile(supplier);
    }
  }

  private generateBasicProfile(supplier: any): any {
    return {
      competencies: supplier.categories || [],
      strengths: [],
      weaknesses: [],
      idealMatch: {},
      riskFactors: [],
      growthPotential: 'medium',
      reliability: {
        score: supplier.rating || 3,
        factors: [],
      },
    };
  }

  private async getAISupplierMatches(
    requirements: any,
    suppliers: any[]
  ): Promise<any[]> {
    const prompt = `
      Match suppliers to requirements using intelligent analysis.
      
      Requirements:
      ${JSON.stringify(requirements, null, 2)}
      
      Available Suppliers (top 20):
      ${JSON.stringify(suppliers.slice(0, 20).map(s => ({
        id: s.id,
        name: s.name,
        categories: s.categories,
        location: s.location,
        certifications: s.certifications,
        rating: s.rating,
        capabilities: s.capabilities,
      })), null, 2)}
      
      For each supplier, provide:
      1. Match score (0-100)
      2. Strengths relative to requirements
      3. Weaknesses or gaps
      4. Unique value propositions
      5. Potential risks
      
      Consider:
      - Geographic proximity and logistics
      - Certification alignment
      - Capacity to meet volume requirements
      - Price competitiveness
      - Reliability and track record
      - Cultural and business fit
      
      Return top 10 matches with detailed analysis.
    `;

    try {
      const response = await aiService.generateCompletion(prompt, 'openai', {
        maxTokens: 3000,
      });
      return JSON.parse(response);
    } catch (error) {
      logger.error('AI supplier matching error:', error);
      return this.getFallbackMatches(requirements, suppliers);
    }
  }

  private async scoreSuppliers(
    aiMatches: any[],
    requirements: any
  ): Promise<any[]> {
    const scored = aiMatches.map(match => {
      const supplier = match.supplier;
      const scores = {
        location: this.scoreLocation(supplier, requirements.location),
        certifications: this.scoreCertifications(supplier, requirements.certifications),
        price: this.scorePrice(supplier, requirements.priceRange),
        rating: this.scoreRating(supplier, requirements.minRating),
        capacity: this.scoreCapacity(supplier, requirements.volumeRequirements),
        delivery: this.scoreDelivery(supplier, requirements.deliveryRequirements),
      };

      const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / 
                        Object.keys(scores).length;

      return {
        ...match,
        scores,
        totalScore,
        aiScore: match.score || totalScore,
      };
    });

    return scored.sort((a, b) => b.totalScore - a.totalScore);
  }

  private scoreLocation(supplier: any, locationReq: any): number {
    if (!supplier.location || !locationReq) return 50;

    const distance = this.calculateDistance(
      supplier.location,
      locationReq
    );

    if (distance <= locationReq.radius) return 100;
    if (distance <= locationReq.radius * 2) return 75;
    if (distance <= locationReq.radius * 3) return 50;
    return 25;
  }

  private calculateDistance(loc1: any, loc2: any): number {
    // Haversine formula for distance calculation
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

  private scoreCertifications(supplier: any, requiredCerts: string[]): number {
    if (!requiredCerts || requiredCerts.length === 0) return 100;
    if (!supplier.certifications) return 0;

    const matchCount = requiredCerts.filter(cert => 
      supplier.certifications.includes(cert)
    ).length;

    return (matchCount / requiredCerts.length) * 100;
  }

  private scorePrice(supplier: any, priceRange: any): number {
    if (!priceRange || !supplier.priceLevel) return 50;

    // Assuming priceLevel is 1-5 scale
    const normalizedPrice = supplier.priceLevel / 5;
    const rangeCenter = (priceRange.min + priceRange.max) / 2;
    const rangeSize = priceRange.max - priceRange.min;

    const distance = Math.abs(normalizedPrice - rangeCenter);
    const score = Math.max(0, 100 - (distance / rangeSize) * 200);

    return score;
  }

  private scoreRating(supplier: any, minRating: number): number {
    if (!minRating || !supplier.rating) return 50;
    
    if (supplier.rating >= minRating) {
      // Bonus points for exceeding minimum
      return Math.min(100, 70 + (supplier.rating - minRating) * 30);
    }
    
    // Penalty for not meeting minimum
    return Math.max(0, 50 * (supplier.rating / minRating));
  }

  private scoreCapacity(supplier: any, volumeReq: any): number {
    if (!volumeReq || !supplier.capacity) return 50;

    const capacityRatio = supplier.capacity.max / volumeReq.typical;
    
    if (capacityRatio >= 2) return 100; // Can handle double the typical volume
    if (capacityRatio >= 1.5) return 90;
    if (capacityRatio >= 1) return 80;
    if (capacityRatio >= 0.8) return 60;
    return 40;
  }

  private scoreDelivery(supplier: any, deliveryReq: any): number {
    if (!deliveryReq || !supplier.deliveryCapabilities) return 50;

    let score = 0;
    let factors = 0;

    if (deliveryReq.frequency && supplier.deliveryCapabilities.frequency) {
      factors++;
      if (supplier.deliveryCapabilities.frequency >= deliveryReq.frequency) {
        score += 100;
      } else {
        score += 50 * (supplier.deliveryCapabilities.frequency / deliveryReq.frequency);
      }
    }

    if (deliveryReq.leadTime && supplier.deliveryCapabilities.leadTime) {
      factors++;
      if (supplier.deliveryCapabilities.leadTime <= deliveryReq.leadTime) {
        score += 100;
      } else {
        score += 50 * (deliveryReq.leadTime / supplier.deliveryCapabilities.leadTime);
      }
    }

    return factors > 0 ? score / factors : 50;
  }

  private async analyzeTopMatches(
    topSuppliers: any[],
    requirements: any
  ): Promise<SupplierMatch[]> {
    const matches: SupplierMatch[] = [];

    for (const supplier of topSuppliers) {
      const profile = this.supplierProfiles.get(supplier.supplier.id) || {};
      
      const match: SupplierMatch = {
        supplierId: supplier.supplier.id,
        score: supplier.totalScore,
        strengths: supplier.strengths || profile.strengths || [],
        weaknesses: supplier.weaknesses || profile.weaknesses || [],
        historicalPerformance: {
          onTimeDelivery: supplier.supplier.metrics?.onTimeDelivery || 0.85,
          qualityScore: supplier.supplier.metrics?.qualityScore || 0.90,
          priceCompetitiveness: supplier.scores?.price / 100 || 0.75,
        },
      };

      // Get AI insights for this specific match
      const insights = await this.getMatchInsights(supplier, requirements);
      match.strengths = [...match.strengths, ...insights.strengths];
      match.weaknesses = [...match.weaknesses, ...insights.weaknesses];

      matches.push(match);
    }

    return matches;
  }

  private async getMatchInsights(supplier: any, requirements: any): Promise<any> {
    const prompt = `
      Provide specific insights for this supplier match:
      
      Supplier: ${supplier.supplier.name}
      Score: ${supplier.totalScore}
      Requirements: ${JSON.stringify(requirements, null, 2)}
      
      List 3 key strengths and 3 potential concerns for this match.
      Be specific and actionable.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      return { strengths: [], weaknesses: [] };
    }
  }

  private calculateMatchConfidence(matches: SupplierMatch[]): number {
    if (matches.length === 0) return 0;

    // Confidence based on top match score and score distribution
    const topScore = matches[0].score;
    const avgScore = matches.reduce((sum, m) => sum + m.score, 0) / matches.length;
    
    let confidence = topScore / 100;
    
    // Adjust based on score distribution
    if (matches.length > 1) {
      const scoreDiff = topScore - matches[1].score;
      if (scoreDiff > 10) confidence *= 1.1; // Clear winner
      if (scoreDiff < 5) confidence *= 0.9; // Close competition
    }

    return Math.min(0.95, Math.max(0.5, confidence));
  }

  private getFallbackMatches(requirements: any, suppliers: any[]): any[] {
    // Simple rule-based matching as fallback
    return suppliers
      .map(supplier => ({
        supplier,
        score: this.calculateFallbackScore(supplier, requirements),
        strengths: [],
        weaknesses: [],
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  private calculateFallbackScore(supplier: any, requirements: any): number {
    let score = 50; // Base score

    // Category match
    if (supplier.categories?.some((cat: string) => 
      requirements.productCategories?.includes(cat)
    )) {
      score += 20;
    }

    // Rating
    if (supplier.rating >= requirements.minRating) {
      score += 15;
    }

    // Certifications
    const certMatches = supplier.certifications?.filter((cert: string) =>
      requirements.certifications?.includes(cert)
    ).length || 0;
    score += certMatches * 5;

    return Math.min(100, score);
  }

  async getSupplierRecommendations(
    businessContext: any
  ): Promise<SupplierMatch[]> {
    const prompt = `
      Recommend suppliers based on business context:
      ${JSON.stringify(businessContext)}
      
      Consider:
      - Current supplier gaps
      - Growth opportunities
      - Risk diversification
      - Strategic partnerships
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error('Supplier recommendation error:', error);
      return [];
    }
  }
}

export const supplierMatchingService = SupplierMatchingService.getInstance();