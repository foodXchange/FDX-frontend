import { aiService } from '../aiService';
import { SearchResult } from '../types';
import { logger } from '../../logger';

export class IntelligentSearchService {
  private static instance: IntelligentSearchService;
  private embeddingCache: Map<string, number[]> = new Map();

  private constructor() {}

  static getInstance(): IntelligentSearchService {
    if (!IntelligentSearchService.instance) {
      IntelligentSearchService.instance = new IntelligentSearchService();
    }
    return IntelligentSearchService.instance;
  }

  async search(
    query: string,
    filters?: {
      type?: string[];
      category?: string[];
      dateRange?: { start: Date; end: Date };
    }
  ): Promise<SearchResult[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.getOrCreateEmbedding(query);

      // Enhanced query understanding using NLP
      const enhancedQuery = await this.enhanceQuery(query);

      // Search across different data types
      const results = await Promise.all([
        this.searchProducts(queryEmbedding, enhancedQuery, filters),
        this.searchSuppliers(queryEmbedding, enhancedQuery, filters),
        this.searchOrders(queryEmbedding, enhancedQuery, filters),
        this.searchDocuments(queryEmbedding, enhancedQuery, filters),
      ]);

      // Flatten and sort by relevance
      const allResults = results.flat().sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Apply post-processing and re-ranking
      return this.reRankResults(allResults, query);
    } catch (error) {
      logger.error('Intelligent search error:', error);
      return [];
    }
  }

  private async enhanceQuery(query: string): Promise<any> {
    const prompt = `
      Analyze the following search query and extract:
      1. Intent (browse, find specific item, compare, etc.)
      2. Key entities (products, suppliers, dates, quantities)
      3. Filters or constraints
      4. Synonyms or related terms
      
      Query: "${query}"
      
      Return as JSON format.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error('Query enhancement error:', error);
      return { original: query };
    }
  }

  private async getOrCreateEmbedding(text: string): Promise<number[]> {
    const cached = this.embeddingCache.get(text);
    if (cached) return cached;

    const embedding = await aiService.generateEmbedding(text);
    this.embeddingCache.set(text, embedding);
    
    // Limit cache size
    if (this.embeddingCache.size > 1000) {
      const firstKey = this.embeddingCache.keys().next().value;
      this.embeddingCache.delete(firstKey);
    }

    return embedding;
  }

  private async searchProducts(
    embedding: number[],
    enhancedQuery: any,
    filters?: any
  ): Promise<SearchResult[]> {
    // This would typically query a vector database
    // For now, return mock data
    return [
      {
        id: 'prod-1',
        type: 'product',
        title: 'Organic Apples',
        description: 'Fresh organic apples from local farms',
        relevanceScore: 0.95,
        highlights: ['organic', 'apples', 'fresh'],
        metadata: {
          price: 2.99,
          unit: 'per lb',
          availability: 'In Stock',
        },
      },
    ];
  }

  private async searchSuppliers(
    embedding: number[],
    enhancedQuery: any,
    filters?: any
  ): Promise<SearchResult[]> {
    return [
      {
        id: 'supp-1',
        type: 'supplier',
        title: 'Green Valley Farms',
        description: 'Certified organic produce supplier',
        relevanceScore: 0.88,
        highlights: ['organic', 'certified', 'farms'],
        metadata: {
          rating: 4.8,
          certifications: ['Organic', 'Fair Trade'],
          location: 'California',
        },
      },
    ];
  }

  private async searchOrders(
    embedding: number[],
    enhancedQuery: any,
    filters?: any
  ): Promise<SearchResult[]> {
    return [];
  }

  private async searchDocuments(
    embedding: number[],
    enhancedQuery: any,
    filters?: any
  ): Promise<SearchResult[]> {
    return [];
  }

  private async reRankResults(
    results: SearchResult[],
    originalQuery: string
  ): Promise<SearchResult[]> {
    if (results.length === 0) return results;

    // Use AI to re-rank based on user intent and context
    const prompt = `
      Re-rank these search results based on relevance to the query: "${originalQuery}"
      Consider user intent, practical relevance, and business value.
      
      Results: ${JSON.stringify(results.slice(0, 10))}
      
      Return the IDs in order of relevance.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      // Parse and reorder results
      return results; // Simplified - implement actual reordering
    } catch (error) {
      logger.error('Re-ranking error:', error);
      return results;
    }
  }

  async getSuggestions(partialQuery: string): Promise<string[]> {
    const prompt = `
      Generate 5 relevant search suggestions for a food exchange platform based on:
      "${partialQuery}"
      
      Consider:
      - Product names
      - Supplier names
      - Common search patterns
      - Business-relevant queries
      
      Return as a simple array of strings.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error('Suggestion generation error:', error);
      return [];
    }
  }
}

export const searchService = IntelligentSearchService.getInstance();