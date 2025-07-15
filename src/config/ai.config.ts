export const AI_CONFIG = {
  providers: {
    openai: {
      apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
    },
  },
  openai: {
    apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
  },
  claude: {
    apiKey: process.env.REACT_APP_CLAUDE_API_KEY || '',
    model: 'claude-3-opus-20240229',
    maxTokens: 2000,
  },
  features: {
    search: true,
    predictions: true,
    analytics: true,
    nlp: true,
  },
  cache: {
    enabled: true,
    ttl: 3600000, // 1 hour
  },
};

export const AI_ENDPOINTS = {
  completion: '/api/ai/completion',
  embedding: '/api/ai/embedding',
  analysis: '/api/ai/analysis',
  openai: process.env.REACT_APP_OPENAI_ENDPOINT || 'https://api.openai.com/v1',
  claude: process.env.REACT_APP_CLAUDE_ENDPOINT || 'https://api.anthropic.com/v1',
};