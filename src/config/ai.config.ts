export const AI_CONFIG = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 2000,
  },

  // Claude Configuration
  claude: {
    apiKey: process.env.REACT_APP_CLAUDE_API_KEY || '',
    model: 'claude-3-opus-20240229',
    maxTokens: 2000,
  },

  // Vector Database Configuration (for semantic search)
  vectorDB: {
    provider: 'pinecone',
    apiKey: process.env.REACT_APP_PINECONE_API_KEY || '',
    environment: process.env.REACT_APP_PINECONE_ENV || 'gcp-starter',
    indexName: 'foodxchange-products',
  },

  // ML Model Configuration
  mlModels: {
    demandForecasting: {
      modelPath: '/models/demand-forecast.onnx',
      inputShape: [1, 30, 5], // 30 days of history, 5 features
      outputShape: [1, 7], // 7 days forecast
    },
    priceOptimization: {
      modelPath: '/models/price-optimization.onnx',
      inputShape: [1, 10], // 10 features
      outputShape: [1, 1], // optimal price
    },
    supplierMatching: {
      modelPath: '/models/supplier-match.onnx',
      inputShape: [1, 20], // 20 features
      outputShape: [1, 10], // top 10 suppliers
    },
  },

  // Feature Flags
  features: {
    enableNLP: true,
    enablePredictiveAnalytics: true,
    enableDocumentAI: true,
    enableRecommendations: true,
    enableVoiceInterface: false,
    enableMarketIntelligence: true,
  },

  // Rate Limiting
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerDay: 1000,
  },

  // Caching
  cache: {
    ttl: 3600, // 1 hour
    maxSize: 100, // MB
  },
};

export const AI_ENDPOINTS = {
  openai: 'https://api.openai.com/v1',
  claude: 'https://api.anthropic.com/v1',
  internal: {
    predictions: '/api/ai/predictions',
    analytics: '/api/ai/analytics',
    recommendations: '/api/ai/recommendations',
    nlp: '/api/ai/nlp',
  },
};