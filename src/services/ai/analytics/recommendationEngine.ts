import { SearchResult, SupplierMatch, RecommendationEngine } from '../types';
import { aiService } from '../aiService';
import { searchService } from '../nlp/searchService';
import { supplierMatchingService } from './supplierMatchingService';
import { logger } from '../../logger';

interface UserProfile {
  id: string;
  preferences: {
    categories: string[];
    priceRange: { min: number; max: number };
    qualityPreference: 'premium' | 'standard' | 'budget';
    certifications: string[];
    sustainabilityScore: number;
  };
  orderHistory: any[];
  browsingHistory: any[];
  interactions: any[];
}

interface RecommendationContext {
  userId?: string;
  currentCart?: any[];
  searchHistory?: string[];
  timeOfDay?: string;
  dayOfWeek?: string;
  seasonality?: string;
  businessType?: string;
  location?: { lat: number; lng: number };
}

export class IntelligentRecommendationEngine implements RecommendationEngine {
  private static instance: IntelligentRecommendationEngine;
  private userProfiles: Map<string, UserProfile> = new Map();
  private productInteractions: Map<string, any[]> = new Map();
  private categoryTrends: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): IntelligentRecommendationEngine {
    if (!IntelligentRecommendationEngine.instance) {
      IntelligentRecommendationEngine.instance = new IntelligentRecommendationEngine();
    }
    return IntelligentRecommendationEngine.instance;
  }

  async getUserRecommendations(
    userId: string,
    context?: RecommendationContext
  ): Promise<SearchResult[]> {
    try {
      const userProfile = await this.getUserProfile(userId);
      const personalizedRecs = await this.getPersonalizedRecommendations(userProfile, context);
      const trendingRecs = await this.getTrendingRecommendations(context);
      const similarUserRecs = await this.getSimilarUserRecommendations(userProfile);

      // Combine and rank recommendations
      const allRecommendations = [
        ...personalizedRecs.map(r => ({ ...r, source: 'personalized', weight: 1.0 })),
        ...trendingRecs.map(r => ({ ...r, source: 'trending', weight: 0.7 })),
        ...similarUserRecs.map(r => ({ ...r, source: 'similar_users', weight: 0.8 })),
      ];

      // Remove duplicates and rank
      const uniqueRecs = this.deduplicateRecommendations(allRecommendations);
      const rankedRecs = await this.rankRecommendations(uniqueRecs, userProfile, context);

      return rankedRecs.slice(0, 20);
    } catch (error) {
      logger.error('User recommendations error:', error);
      return [];
    }
  }

  async getProductRecommendations(
    productId: string,
    context?: RecommendationContext
  ): Promise<SearchResult[]> {
    try {
      const productData = await this.getProductData(productId);
      
      // Get complementary products
      const complementary = await this.getComplementaryProducts(productData);
      
      // Get alternative products
      const alternatives = await this.getAlternativeProducts(productData);
      
      // Get frequently bought together
      const frequentlyTogether = await this.getFrequentlyBoughtTogether(productId);

      // Get AI-driven suggestions
      const aiSuggestions = await this.getAIProductSuggestions(productData, context);

      const allRecommendations = [
        ...complementary.map(r => ({ ...r, source: 'complementary', weight: 0.9 })),
        ...alternatives.map(r => ({ ...r, source: 'alternatives', weight: 0.8 })),
        ...frequentlyTogether.map(r => ({ ...r, source: 'frequently_together', weight: 0.95 })),
        ...aiSuggestions.map(r => ({ ...r, source: 'ai_suggestions', weight: 0.85 })),
      ];

      const uniqueRecs = this.deduplicateRecommendations(allRecommendations);
      return uniqueRecs.slice(0, 15);
    } catch (error) {
      logger.error('Product recommendations error:', error);
      return [];
    }
  }

  async getSupplierRecommendations(criteria: any): Promise<SupplierMatch[]> {
    try {
      return await supplierMatchingService.getSupplierRecommendations(criteria);
    } catch (error) {
      logger.error('Supplier recommendations error:', error);
      return [];
    }
  }

  private async getUserProfile(userId: string): Promise<UserProfile> {
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId)!;
    }

    // Build user profile from order history and interactions
    const profile = await this.buildUserProfile(userId);
    this.userProfiles.set(userId, profile);
    return profile;
  }

  private async buildUserProfile(userId: string): Promise<UserProfile> {
    const prompt = `
      Build a user profile for recommendation purposes based on available data.
      User ID: ${userId}
      
      Create a profile including:
      1. Preferred categories
      2. Price sensitivity
      3. Quality preferences
      4. Certification preferences
      5. Sustainability scoring
      
      If no data available, use reasonable defaults for a food industry professional.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      const profileData = JSON.parse(response);
      
      return {
        id: userId,
        preferences: {
          categories: profileData.categories || ['produce', 'dairy', 'meat'],
          priceRange: profileData.priceRange || { min: 0, max: 1000 },
          qualityPreference: profileData.qualityPreference || 'standard',
          certifications: profileData.certifications || ['organic'],
          sustainabilityScore: profileData.sustainabilityScore || 0.7,
        },
        orderHistory: [],
        browsingHistory: [],
        interactions: [],
      };
    } catch (error) {
      logger.error('User profile building error:', error);
      return this.getDefaultUserProfile(userId);
    }
  }

  private getDefaultUserProfile(userId: string): UserProfile {
    return {
      id: userId,
      preferences: {
        categories: ['produce', 'dairy', 'meat', 'pantry'],
        priceRange: { min: 0, max: 500 },
        qualityPreference: 'standard',
        certifications: ['organic'],
        sustainabilityScore: 0.6,
      },
      orderHistory: [],
      browsingHistory: [],
      interactions: [],
    };
  }

  private async getPersonalizedRecommendations(
    userProfile: UserProfile,
    context?: RecommendationContext
  ): Promise<SearchResult[]> {
    const prompt = `
      Generate personalized product recommendations based on user profile:
      
      User Preferences:
      - Categories: ${userProfile.preferences.categories.join(', ')}
      - Price Range: $${userProfile.preferences.priceRange.min} - $${userProfile.preferences.priceRange.max}
      - Quality: ${userProfile.preferences.qualityPreference}
      - Certifications: ${userProfile.preferences.certifications.join(', ')}
      
      Context: ${JSON.stringify(context || {})}
      
      Recommend 10 products that match user preferences and current context.
      Consider seasonality, trending items, and user's ordering patterns.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return this.parseRecommendationResponse(response);
    } catch (error) {
      logger.error('Personalized recommendations error:', error);
      return this.getFallbackRecommendations('personalized');
    }
  }

  private async getTrendingRecommendations(context?: RecommendationContext): Promise<SearchResult[]> {
    const prompt = `
      Identify trending products in the food industry based on:
      - Current season
      - Market trends
      - Popular certifications
      - Emerging categories
      
      Context: ${JSON.stringify(context || {})}
      
      Return 8 trending products with high relevance scores.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return this.parseRecommendationResponse(response);
    } catch (error) {
      return this.getFallbackRecommendations('trending');
    }
  }

  private async getSimilarUserRecommendations(userProfile: UserProfile): Promise<SearchResult[]> {
    // Find users with similar preferences
    const similarUsers = await this.findSimilarUsers(userProfile);
    
    if (similarUsers.length === 0) return [];

    const prompt = `
      Based on similar user preferences, recommend products that users with similar profiles enjoy:
      
      Similar User Patterns:
      ${similarUsers.map(u => `- ${u.categories.join(', ')}`).join('\n')}
      
      Generate 6 recommendations based on collaborative filtering.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return this.parseRecommendationResponse(response);
    } catch (error) {
      return [];
    }
  }

  private async findSimilarUsers(userProfile: UserProfile): Promise<any[]> {
    // Simplified similarity calculation
    const allUsers = Array.from(this.userProfiles.values());
    
    return allUsers
      .filter(user => user.id !== userProfile.id)
      .map(user => {
        const similarity = this.calculateUserSimilarity(userProfile, user);
        return { ...user.preferences, similarity };
      })
      .filter(user => user.similarity > 0.6)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }

  private calculateUserSimilarity(user1: UserProfile, user2: UserProfile): number {
    const categories1 = new Set(user1.preferences.categories);
    const categories2 = new Set(user2.preferences.categories);
    
    const intersection = new Set([...categories1].filter(x => categories2.has(x)));
    const union = new Set([...categories1, ...categories2]);
    
    const categoryScore = intersection.size / union.size;
    
    const priceScore = 1 - Math.abs(
      user1.preferences.priceRange.max - user2.preferences.priceRange.max
    ) / Math.max(user1.preferences.priceRange.max, user2.preferences.priceRange.max);
    
    const qualityScore = user1.preferences.qualityPreference === user2.preferences.qualityPreference ? 1 : 0.5;
    
    return (categoryScore * 0.5 + priceScore * 0.3 + qualityScore * 0.2);
  }

  private async getProductData(productId: string): Promise<any> {
    // Mock product data - in real implementation, fetch from database
    return {
      id: productId,
      name: `Product ${productId}`,
      category: 'produce',
      price: 10.99,
      certifications: ['organic'],
      tags: ['fresh', 'local'],
    };
  }

  private async getComplementaryProducts(productData: any): Promise<SearchResult[]> {
    const prompt = `
      Suggest complementary products that go well with:
      Product: ${productData.name}
      Category: ${productData.category}
      Tags: ${productData.tags?.join(', ')}
      
      Think about:
      - Recipe combinations
      - Meal planning
      - Seasonal pairings
      - Nutritional completeness
      
      Return 5 complementary products.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return this.parseRecommendationResponse(response);
    } catch (error) {
      return [];
    }
  }

  private async getAlternativeProducts(productData: any): Promise<SearchResult[]> {
    const prompt = `
      Suggest alternative products similar to:
      Product: ${productData.name}
      Category: ${productData.category}
      Price: $${productData.price}
      
      Consider:
      - Same category but different brands
      - Similar price range
      - Similar quality level
      - Different varieties
      
      Return 4 alternative products.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return this.parseRecommendationResponse(response);
    } catch (error) {
      return [];
    }
  }

  private async getFrequentlyBoughtTogether(productId: string): Promise<SearchResult[]> {
    // In real implementation, analyze order data
    // For now, return mock frequently bought together items
    return [
      {
        id: 'freq-1',
        type: 'product',
        title: 'Frequently Bought Item 1',
        description: 'Often purchased with this product',
        relevanceScore: 0.9,
        highlights: ['popular combination'],
        metadata: { reason: 'frequently_together' },
      },
    ];
  }

  private async getAIProductSuggestions(
    productData: any,
    context?: RecommendationContext
  ): Promise<SearchResult[]> {
    const prompt = `
      Generate intelligent product suggestions considering:
      
      Current Product: ${productData.name}
      Context: ${JSON.stringify(context || {})}
      
      Think creatively about:
      - Upselling opportunities
      - Cross-selling potential
      - Seasonal relevance
      - Market trends
      - Business needs
      
      Return 5 smart suggestions with reasoning.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return this.parseRecommendationResponse(response);
    } catch (error) {
      return [];
    }
  }

  private parseRecommendationResponse(response: string): SearchResult[] {
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) {
        return parsed.map((item, index) => ({
          id: item.id || `rec-${Date.now()}-${index}`,
          type: 'product',
          title: item.title || item.name || 'Recommended Product',
          description: item.description || 'AI recommended item',
          relevanceScore: item.relevanceScore || 0.8,
          highlights: item.highlights || [],
          metadata: item.metadata || {},
        }));
      }
      return [];
    } catch (error) {
      logger.error('Recommendation response parsing error:', error);
      return [];
    }
  }

  private getFallbackRecommendations(type: string): SearchResult[] {
    return [
      {
        id: `fallback-${type}-1`,
        type: 'product',
        title: 'Popular Product',
        description: 'A popular choice among customers',
        relevanceScore: 0.7,
        highlights: ['popular'],
        metadata: { source: type },
      },
    ];
  }

  private deduplicateRecommendations(recommendations: any[]): SearchResult[] {
    const seen = new Set<string>();
    return recommendations.filter(rec => {
      if (seen.has(rec.id)) return false;
      seen.add(rec.id);
      return true;
    });
  }

  private async rankRecommendations(
    recommendations: any[],
    userProfile: UserProfile,
    context?: RecommendationContext
  ): Promise<SearchResult[]> {
    // Apply sophisticated ranking algorithm
    return recommendations
      .map(rec => {
        let score = rec.relevanceScore * rec.weight;
        
        // Boost based on user preferences
        if (userProfile.preferences.categories.some(cat => 
          rec.metadata?.category === cat
        )) {
          score *= 1.2;
        }
        
        // Context-based adjustments
        if (context?.timeOfDay === 'morning' && rec.metadata?.mealType === 'breakfast') {
          score *= 1.1;
        }
        
        return { ...rec, finalScore: score };
      })
      .sort((a, b) => b.finalScore - a.finalScore)
      .map(({ finalScore, weight, source, ...rec }) => rec);
  }

  // Analytics and learning methods
  async recordInteraction(
    userId: string,
    productId: string,
    interactionType: 'view' | 'add_to_cart' | 'purchase' | 'search',
    metadata?: any
  ): Promise<void> {
    const interaction = {
      userId,
      productId,
      type: interactionType,
      timestamp: new Date(),
      metadata,
    };

    // Store interaction for learning
    const userInteractions = this.productInteractions.get(productId) || [];
    userInteractions.push(interaction);
    this.productInteractions.set(productId, userInteractions);

    // Update user profile
    const userProfile = await this.getUserProfile(userId);
    userProfile.interactions.push(interaction);
  }

  async getRecommendationExplanation(
    recommendationId: string,
    userId: string
  ): Promise<string> {
    const prompt = `
      Explain why this recommendation was made for the user.
      
      Recommendation ID: ${recommendationId}
      User ID: ${userId}
      
      Provide a clear, friendly explanation of the reasoning behind this recommendation.
      Keep it concise but informative.
    `;

    try {
      return await aiService.generateCompletion(prompt);
    } catch (error) {
      return 'This item was recommended based on your preferences and browsing history.';
    }
  }
}

export const recommendationEngine = IntelligentRecommendationEngine.getInstance();