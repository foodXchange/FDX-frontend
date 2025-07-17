// Core AI service for managing AI provider integrations and generating completions, embeddings, and insights
import { AI_CONFIG, AI_ENDPOINTS } from '../../config/ai.config';
import { AIProvider, AIInsight } from './types';
import { logger } from '../logger';

class AIService {
  private static instance: AIService;
  private providers: Map<string, AIProvider> = new Map();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  private constructor() {
    this.initializeProviders();
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private initializeProviders() {
    if (AI_CONFIG.openai.apiKey) {
      this.providers.set('openai', {
        name: 'openai',
        model: AI_CONFIG.openai.model,
        apiKey: AI_CONFIG.openai.apiKey,
      });
    }

    if (AI_CONFIG.claude.apiKey) {
      this.providers.set('claude', {
        name: 'claude',
        model: AI_CONFIG.claude.model,
        apiKey: AI_CONFIG.claude.apiKey,
      });
    }
  }

  async generateCompletion(
    prompt: string,
    provider: 'openai' | 'claude' = 'openai',
    options: any = {}
  ): Promise<string> {
    const cacheKey = `completion:${provider}:${prompt}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      let response: string;

      if (provider === 'openai') {
        response = await this.callOpenAI(prompt, options);
      } else if (provider === 'claude') {
        response = await this.callClaude(prompt, options);
      } else {
        throw new Error(`Unknown provider: ${provider}`);
      }

      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      logger.error('AI completion error:', error as Error);
      throw error;
    }
  }

  private async callOpenAI(prompt: string, options: any = {}): Promise<string> {
    const response = await fetch(`${AI_ENDPOINTS.openai}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.openai.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || AI_CONFIG.openai.temperature,
        max_tokens: options.maxTokens || AI_CONFIG.openai.maxTokens,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callClaude(prompt: string, options: any = {}): Promise<string> {
    const response = await fetch(`${AI_ENDPOINTS.claude}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AI_CONFIG.claude.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: AI_CONFIG.claude.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || AI_CONFIG.claude.maxTokens,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const cacheKey = `embedding:${text}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${AI_ENDPOINTS.openai}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.statusText}`);
      }

      const data = await response.json();
      const embedding = data.data[0].embedding;
      
      this.setCache(cacheKey, embedding);
      return embedding;
    } catch (error) {
      logger.error('Embedding generation error:', error as Error);
      throw error;
    }
  }

  async generateInsights(data: any, context: string): Promise<AIInsight[]> {
    const prompt = `
      Analyze the following data and generate actionable insights for a food exchange platform.
      Context: ${context}
      Data: ${JSON.stringify(data)}
      
      Generate insights in the following format:
      - Type: info, warning, success, or prediction
      - Category: demand, pricing, supplier, compliance, or general
      - Priority: low, medium, or high
      - Include specific actions when applicable
      
      Focus on:
      1. Anomalies or unusual patterns
      2. Optimization opportunities
      3. Risk factors
      4. Predictive insights
      5. Actionable recommendations
    `;

    try {
      const response = await this.generateCompletion(prompt);
      // Parse the response and format as AIInsight[]
      // This is a simplified version - in production, you'd want more robust parsing
      return this.parseInsights(response);
    } catch (error) {
      logger.error('Insight generation error:', error as Error);
      return [];
    }
  }

  private parseInsights(response: string): AIInsight[] {
    // This is a placeholder - implement proper parsing logic
    // For now, return a sample insight
    return [{
      id: `insight-${Date.now()}`,
      type: 'info',
      category: 'general',
      title: 'AI Analysis Complete',
      description: response.substring(0, 200) + '...',
      priority: 'medium',
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }];
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > AI_CONFIG.cache.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any): void {
    // Implement cache size limit
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const aiService = AIService.getInstance();