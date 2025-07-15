import { ChatMessage } from '../types';
import { aiService } from '../aiService';
import { searchService } from './searchService';
import { demandForecastingService } from '../predictions/demandForecastingService';
import { priceOptimizationService } from '../predictions/priceOptimizationService';
import { supplierMatchingService } from '../analytics/supplierMatchingService';
import { recommendationEngine } from '../analytics/recommendationEngine';
import { logger } from '../../logger';

interface Intent {
  name: string;
  confidence: number;
  entities: Record<string, any>;
  parameters: Record<string, any>;
}

interface ConversationContext {
  userId: string;
  sessionId: string;
  history: ChatMessage[];
  currentTask?: string;
  userProfile?: any;
  businessContext?: any;
}

export class NaturalLanguageInterface {
  private static instance: NaturalLanguageInterface;
  private conversations: Map<string, ConversationContext> = new Map();

  private constructor() {}

  static getInstance(): NaturalLanguageInterface {
    if (!NaturalLanguageInterface.instance) {
      NaturalLanguageInterface.instance = new NaturalLanguageInterface();
    }
    return NaturalLanguageInterface.instance;
  }

  async processMessage(
    message: string,
    userId: string,
    sessionId?: string
  ): Promise<ChatMessage> {
    try {
      const session = sessionId || `${userId}-${Date.now()}`;
      const context = this.getOrCreateContext(userId, session);

      // Add user message to history
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      context.history.push(userMessage);

      // Analyze intent and entities
      const intent = await this.analyzeIntent(message, context);

      // Generate response based on intent
      const response = await this.generateResponse(intent, context);

      // Add assistant message to history
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        metadata: {
          intent: intent.name,
          entities: intent.entities,
          suggestions: response.suggestions,
        },
      };
      context.history.push(assistantMessage);

      return assistantMessage;
    } catch (error) {
      logger.error('NL processing error:', error as Error);
      return this.createErrorResponse();
    }
  }

  private getOrCreateContext(userId: string, sessionId: string): ConversationContext {
    const key = `${userId}-${sessionId}`;
    
    if (!this.conversations.has(key)) {
      this.conversations.set(key, {
        userId,
        sessionId,
        history: [],
        userProfile: this.getUserProfile(userId),
        businessContext: this.getBusinessContext(userId),
      });
    }

    return this.conversations.get(key)!;
  }

  private async analyzeIntent(
    message: string,
    _context: ConversationContext
  ): Promise<Intent> {
    const prompt = `
      Analyze the user's intent and extract entities from this message:
      
      Message: "${message}"
      
      Conversation History:
      ${_context.history.slice(-5).map((msg: ChatMessage) => `${msg.role}: ${msg.content}`).join('\n')}
      
      Business Context: FoodXchange platform - food supply chain management
      
      Identify intent as one of:
      - search_products
      - find_suppliers
      - get_recommendations
      - demand_forecast
      - price_optimization
      - place_order
      - track_order
      - get_analytics
      - ask_question
      - schedule_delivery
      - check_compliance
      - compare_products
      - get_help
      
      Extract relevant entities:
      - product_names
      - quantities
      - dates
      - locations
      - price_ranges
      - certifications
      - suppliers
      - categories
      
      Return JSON: { name, confidence, entities, parameters }
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return JSON.parse(response);
    } catch (error) {
      logger.error('Intent analysis error:', error as Error);
      return {
        name: 'ask_question',
        confidence: 0.5,
        entities: {},
        parameters: { query: message },
      };
    }
  }

  private async generateResponse(
    _intent: Intent,
    context: ConversationContext
  ): Promise<{ content: string; suggestions?: string[] }> {
    switch (_intent.name) {
      case 'search_products':
        return await this.handleProductSearch(_intent, context);
      
      case 'find_suppliers':
        return await this.handleSupplierSearch(_intent, context);
      
      case 'get_recommendations':
        return await this.handleRecommendations(_intent, context);
      
      case 'demand_forecast':
        return await this.handleDemandForecast(_intent, context);
      
      case 'price_optimization':
        return await this.handlePriceOptimization(_intent, context);
      
      case 'place_order':
        return await this.handleOrderPlacement(_intent, context);
      
      case 'track_order':
        return await this.handleOrderTracking(_intent, context);
      
      case 'get_analytics':
        return await this.handleAnalytics(_intent, context);
      
      case 'check_compliance':
        return await this.handleComplianceCheck(_intent, context);
      
      case 'get_help':
        return await this.handleHelp(_intent, context);
      
      default:
        return await this.handleGeneral(_intent, context);
    }
  }

  private async handleProductSearch(
    intent: Intent,
    _context: ConversationContext
  ): Promise<{ content: string; suggestions?: string[] }> {
    const query = intent.parameters.query || intent.entities.product_names?.join(' ') || 'products';
    const filters = {
      category: intent.entities.categories,
      priceRange: intent.entities.price_ranges?.[0],
    };

    const results = await searchService.search(query, filters);

    if (results.length === 0) {
      return {
        content: `I couldn't find any products matching "${query}". Would you like me to suggest similar items or broaden the search?`,
        suggestions: [
          'Show me similar products',
          'Expand search criteria',
          'Browse all categories',
        ],
      };
    }

    const topResults = results.slice(0, 5);
    let response = `I found ${results.length} products matching "${query}". Here are the top matches:\n\n`;
    
    topResults.forEach((result, index) => {
      response += `${index + 1}. **${result.title}**\n`;
      response += `   ${result.description}\n`;
      response += `   Score: ${(result.relevanceScore * 100).toFixed(0)}%\n\n`;
    });

    return {
      content: response,
      suggestions: [
        'Get more details about these products',
        'Find suppliers for these items',
        'Compare prices',
        'Add to cart',
      ],
    };
  }

  private async handleSupplierSearch(
    intent: Intent,
    _context: ConversationContext
  ): Promise<{ content: string; suggestions?: string[] }> {
    const requirements = {
      productCategories: intent.entities.categories || [],
      certifications: intent.entities.certifications || [],
      location: intent.entities.location || { lat: 0, lng: 0, radius: 100 },
      minRating: 4.0,
      priceRange: intent.entities.price_ranges?.[0] || { min: 0, max: 1000000 },
      deliveryRequirements: {},
      volumeRequirements: {},
    };

    // Mock available suppliers for demo
    const mockSuppliers = [
      { id: 'supp1', name: 'Fresh Farms Co', categories: ['produce'], rating: 4.5 },
      { id: 'supp2', name: 'Ocean Harvest', categories: ['seafood'], rating: 4.8 },
    ];

    const matches = await supplierMatchingService.matchSuppliers(requirements, mockSuppliers);

    if (matches.prediction.length === 0) {
      return {
        content: 'I couldn\'t find suppliers matching your criteria. Would you like me to adjust the search parameters?',
        suggestions: [
          'Expand search radius',
          'Lower rating requirements',
          'Show all suppliers',
        ],
      };
    }

    let response = `I found ${matches.prediction.length} suppliers that match your requirements:\n\n`;
    
    matches.prediction.slice(0, 3).forEach((match, index) => {
      response += `${index + 1}. **Supplier ${match.supplierId}**\n`;
      response += `   Match Score: ${match.score.toFixed(1)}%\n`;
      response += `   Strengths: ${match.strengths.join(', ')}\n`;
      if (match.weaknesses.length > 0) {
        response += `   Areas to consider: ${match.weaknesses.join(', ')}\n`;
      }
      response += '\n';
    });

    return {
      content: response,
      suggestions: [
        'Get detailed supplier profiles',
        'Request quotes',
        'Check availability',
        'Compare suppliers',
      ],
    };
  }

  private async handleRecommendations(
    _intent: Intent,
    context: ConversationContext
  ): Promise<{ content: string; suggestions?: string[] }> {
    const recommendations = await recommendationEngine.getUserRecommendations(context.userId);

    if (recommendations.length === 0) {
      return {
        content: 'I don\'t have enough information to make personalized recommendations yet. Try browsing our catalog or placing some orders first!',
        suggestions: [
          'Browse trending products',
          'Search for specific items',
          'View categories',
        ],
      };
    }

    let response = 'Based on your preferences and order history, here are my recommendations:\n\n';
    
    recommendations.slice(0, 5).forEach((rec, index) => {
      response += `${index + 1}. **${rec.title}**\n`;
      response += `   ${rec.description}\n`;
      response += `   Relevance: ${(rec.relevanceScore * 100).toFixed(0)}%\n\n`;
    });

    return {
      content: response,
      suggestions: [
        'Tell me why you recommended these',
        'Show more recommendations',
        'Update my preferences',
        'Add to cart',
      ],
    };
  }

  private async handleDemandForecast(
    intent: Intent,
    _context: ConversationContext
  ): Promise<{ content: string; suggestions?: string[] }> {
    const productId = intent.entities.product_names?.[0] || 'default-product';
    
    // Mock historical data
    const historicalOrders = [
      { createdAt: '2024-01-01', quantity: 100 },
      { createdAt: '2024-01-08', quantity: 120 },
      { createdAt: '2024-01-15', quantity: 95 },
    ];

    const forecast = await demandForecastingService.forecastDemand(productId, historicalOrders);

    if (!forecast) {
      return {
        content: 'I couldn\'t generate a demand forecast. This might be due to insufficient historical data.',
        suggestions: [
          'Check data availability',
          'Try another product',
          'View historical trends',
        ],
      };
    }

    const avgDemand = forecast.prediction.predictions.reduce((sum, p) => sum + p.quantity, 0) / 
                     forecast.prediction.predictions.length;

    let response = `Here's the demand forecast for ${productId}:\n\n`;
    response += `**7-day average predicted demand:** ${avgDemand.toFixed(0)} units\n`;
    response += `**Confidence level:** ${(forecast.confidence * 100).toFixed(1)}%\n\n`;
    
    response += '**Daily breakdown:**\n';
    forecast.prediction.predictions.slice(0, 3).forEach(pred => {
      response += `• ${pred.date}: ${pred.quantity} units (${(pred.confidence * 100).toFixed(0)}% confidence)\n`;
    });

    return {
      content: response,
      suggestions: [
        'View full 7-day forecast',
        'Get forecast for other products',
        'Set up automatic reordering',
        'Download forecast data',
      ],
    };
  }

  private async handlePriceOptimization(
    intent: Intent,
    _context: ConversationContext
  ): Promise<{ content: string; suggestions?: string[] }> {
    const productId = intent.entities.product_names?.[0] || 'default-product';
    const currentPrice = intent.entities.price_ranges?.[0]?.min || 10.99;

    const historicalData = {
      salesHistory: [
        { price: 10.99, quantity: 100, date: '2024-01-01' },
        { price: 11.99, quantity: 85, date: '2024-01-08' },
      ],
      competitorPrices: [9.99, 11.49, 12.99],
      marketConditions: { demand: 'high', season: 'peak' },
    };

    const optimization = await priceOptimizationService.optimizePrice(
      productId,
      currentPrice,
      historicalData
    );

    if (!optimization) {
      return {
        content: 'I couldn\'t analyze price optimization for this product. Please check if you have sufficient sales data.',
        suggestions: [
          'Try another product',
          'View competitor analysis',
          'Check market trends',
        ],
      };
    }

    const priceChange = optimization.prediction.suggestedPrice - currentPrice;
    const changePercent = (priceChange / currentPrice * 100).toFixed(1);

    let response = `**Price Optimization Analysis for ${productId}:**\n\n`;
    response += `• Current price: $${currentPrice.toFixed(2)}\n`;
    response += `• Suggested price: $${optimization.prediction.suggestedPrice.toFixed(2)}\n`;
    response += `• Change: ${priceChange > 0 ? '+' : ''}${changePercent}%\n`;
    response += `• Expected revenue impact: $${optimization.prediction.expectedRevenue.toFixed(2)}\n`;
    response += `• Price elasticity: ${optimization.prediction.elasticity.toFixed(2)}\n`;
    response += `• Confidence: ${(optimization.confidence * 100).toFixed(1)}%\n`;

    return {
      content: response,
      suggestions: [
        'Apply suggested price',
        'See detailed analysis',
        'Compare with competitors',
        'Test price gradually',
      ],
    };
  }

  private async handleOrderPlacement(
    _intent: Intent,
    _context: ConversationContext
  ): Promise<{ content: string; suggestions?: string[] }> {
    return {
      content: 'I can help you place an order! However, order placement requires accessing our secure ordering system. Let me guide you through the process or connect you with the ordering interface.',
      suggestions: [
        'Open ordering system',
        'Add items to cart',
        'Check inventory first',
        'Get price quotes',
      ],
    };
  }

  private async handleOrderTracking(
    intent: Intent,
    _context: ConversationContext
  ): Promise<{ content: string; suggestions?: string[] }> {
    const orderId = intent.entities.order_id || intent.parameters.order_number;

    if (!orderId) {
      return {
        content: 'I\'d be happy to help track your order! Please provide your order number.',
        suggestions: [
          'Enter order number',
          'Show recent orders',
          'Search by date',
        ],
      };
    }

    return {
      content: `I'll track order ${orderId} for you. Order tracking requires access to our logistics system. Let me connect you to the order tracking interface.`,
      suggestions: [
        'View order details',
        'Get delivery updates',
        'Contact delivery team',
        'Update delivery address',
      ],
    };
  }

  private async handleAnalytics(
    _intent: Intent,
    _context: ConversationContext
  ): Promise<{ content: string; suggestions?: string[] }> {
    // const analyticsType = intent.entities.analytics_type || 'general';

    return {
      content: `I can provide various analytics insights! What specific metrics would you like to see?\n\n**Available Analytics:**\n• Sales performance\n• Demand trends\n• Supplier metrics\n• Price analysis\n• Inventory levels\n• Customer insights`,
      suggestions: [
        'Show sales dashboard',
        'Demand forecasting',
        'Supplier performance',
        'Price trends',
      ],
    };
  }

  private async handleComplianceCheck(
    _intent: Intent,
    _context: ConversationContext
  ): Promise<{ content: string; suggestions?: string[] }> {
    return {
      content: 'I can help you check compliance for various requirements:\n\n• Food safety certifications\n• Organic standards\n• Import/export regulations\n• Quality standards\n• Sustainability metrics\n\nWhat specific compliance area do you need help with?',
      suggestions: [
        'Food safety compliance',
        'Certification status',
        'Regulatory updates',
        'Audit preparation',
      ],
    };
  }

  private async handleHelp(
    _intent: Intent,
    _context: ConversationContext
  ): Promise<{ content: string; suggestions?: string[] }> {
    return {
      content: `I'm your AI assistant for FoodXchange! I can help you with:\n\n**🔍 Search & Discovery**\n• Find products and suppliers\n• Get personalized recommendations\n\n**📊 Analytics & Insights**\n• Demand forecasting\n• Price optimization\n• Market analysis\n\n**📝 Orders & Tracking**\n• Place and track orders\n• Manage inventory\n\n**✅ Compliance & Quality**\n• Check certifications\n• Regulatory compliance\n\nJust ask me naturally, like "Find organic apples" or "What's the forecast for salmon demand?"`,
      suggestions: [
        'Search for products',
        'Get recommendations',
        'Check demand forecast',
        'Find suppliers',
      ],
    };
  }

  private async handleGeneral(
    intent: Intent,
    _context: ConversationContext
  ): Promise<{ content: string; suggestions?: string[] }> {
    const prompt = `
      Generate a helpful response for this food industry platform user:
      
      User Message: ${intent.parameters.query}
      Intent: ${intent.name}
      Entities: ${JSON.stringify(intent.entities)}
      
      Context: FoodXchange - food supply chain management platform
      
      Provide a conversational, helpful response that guides the user toward platform features.
    `;

    try {
      const response = await aiService.generateCompletion(prompt);
      return {
        content: response,
        suggestions: [
          'Search products',
          'Find suppliers',
          'Get help',
          'View analytics',
        ],
      };
    } catch (error) {
      return {
        content: 'I apologize, but I\'m having trouble understanding your request. Could you please rephrase it or ask me something specific about FoodXchange?',
        suggestions: [
          'Ask about products',
          'Get help',
          'Search suppliers',
          'View features',
        ],
      };
    }
  }

  private createErrorResponse(): ChatMessage {
    return {
      id: `error-${Date.now()}`,
      role: 'assistant',
      content: 'I apologize, but I encountered an error processing your request. Please try again.',
      timestamp: new Date().toISOString(),
    };
  }

  private getUserProfile(_userId: string): any {
    // In real implementation, fetch from user service
    return {
      preferences: ['organic', 'local'],
      businessType: 'restaurant',
      location: 'US',
    };
  }

  private getBusinessContext(_userId: string): any {
    return {
      industry: 'food_service',
      size: 'medium',
      specialties: ['fresh_produce'],
    };
  }

  async getSuggestions(partialMessage: string): Promise<string[]> {
    return await searchService.getSuggestions(partialMessage);
  }

  clearConversation(userId: string, sessionId: string): void {
    const key = `${userId}-${sessionId}`;
    this.conversations.delete(key);
  }

  getConversationHistory(userId: string, sessionId: string): ChatMessage[] {
    const key = `${userId}-${sessionId}`;
    return this.conversations.get(key)?.history || [];
  }
}

export const naturalLanguageInterface = NaturalLanguageInterface.getInstance();