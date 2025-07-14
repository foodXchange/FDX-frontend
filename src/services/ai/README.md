# FoodXchange AI Services

A comprehensive AI-powered suite for the FoodXchange platform, providing intelligent automation, predictions, and insights across the entire food supply chain.

## 🚀 Features

### Core AI Services
- **OpenAI & Claude Integration**: Dual AI provider support for reliability and performance
- **Intelligent Caching**: Optimized response times with smart caching mechanisms
- **Error Handling**: Robust error handling with fallback mechanisms

### 🔍 Search & Discovery
- **Semantic Search**: Natural language product and supplier search
- **Auto-suggestions**: Smart search completion and recommendations
- **Multi-modal Search**: Search across products, suppliers, orders, and documents

### 📊 Predictive Analytics
- **Demand Forecasting**: AI-powered demand predictions with confidence intervals
- **Price Optimization**: Dynamic pricing recommendations based on market conditions
- **Anomaly Detection**: Identify unusual patterns in orders and data

### 🏢 Supplier Intelligence
- **Smart Matching**: AI-driven supplier matching based on requirements
- **Performance Analysis**: Comprehensive supplier performance evaluation
- **Risk Assessment**: Supplier risk scoring and mitigation strategies

### 🛒 Recommendation Engine
- **Personalized Recommendations**: User-specific product suggestions
- **Collaborative Filtering**: Recommendations based on similar users
- **Cross-selling**: Intelligent product pairing and bundling

### 📄 Document Intelligence
- **OCR Processing**: Extract text and data from images and PDFs
- **Smart Classification**: Automatic document type detection
- **Data Extraction**: Structured data extraction from invoices, certificates, contracts
- **Compliance Checking**: Automated compliance verification

### 💬 Natural Language Interface
- **Conversational AI**: Chat-based interaction with the platform
- **Intent Recognition**: Understand user goals and provide relevant actions
- **Context Awareness**: Maintain conversation context for better responses

### 🚛 Supply Chain Optimization
- **Route Optimization**: AI-powered delivery route planning
- **Inventory Optimization**: Smart inventory management recommendations
- **Temperature Risk Prediction**: Cold chain failure prevention
- **Sustainability Optimization**: Carbon footprint reduction strategies

### 📈 Market Intelligence
- **Price Analysis**: Market pricing trends and competitor analysis
- **Demand Analysis**: Market demand patterns and projections
- **Competitor Intelligence**: Comprehensive competitor analysis
- **Opportunity Identification**: Market opportunity discovery

## 🛠 Installation & Setup

### Prerequisites
```bash
npm install
```

### Environment Variables
Create a `.env` file with your API keys:

```env
REACT_APP_OPENAI_API_KEY=your_openai_api_key
REACT_APP_CLAUDE_API_KEY=your_claude_api_key
REACT_APP_PINECONE_API_KEY=your_pinecone_api_key
REACT_APP_PINECONE_ENV=your_pinecone_environment
```

### Configuration
Update `src/config/ai.config.ts` with your specific settings:

```typescript
export const AI_CONFIG = {
  openai: {
    apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
  },
  // ... other configurations
};
```

## 📖 Usage

### Quick Start
```typescript
import { useAI } from '../hooks/useAI';

function MyComponent() {
  const {
    search,
    forecastDemand,
    chatWithAI,
    generateInsights,
    initialized,
    loading
  } = useAI({
    autoInitialize: true,
    userId: 'current-user-id'
  });

  // Use AI features
  const handleSearch = async () => {
    const results = await search('organic apples');
    console.log(results);
  };

  const handleChat = async () => {
    const response = await chatWithAI('Find me suppliers for organic produce');
    console.log(response);
  };

  return (
    <div>
      {loading ? 'Initializing AI...' : 'AI Ready!'}
      <button onClick={handleSearch}>Search Products</button>
      <button onClick={handleChat}>Chat with AI</button>
    </div>
  );
}
```

### Service Manager
```typescript
import { aiServiceManager } from '../services/ai';

// Initialize all services
await aiServiceManager.initialize();

// Get health status
const health = await aiServiceManager.getHealthCheck();

// Use individual services
const forecast = await aiServiceManager.getForecast('product-123', historicalData);
const prices = await aiServiceManager.optimizePrice('product-123', 10.99, marketData);
```

### Enhanced Dashboard Metrics
```typescript
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';

function Dashboard() {
  const {
    generateAIInsights,
    getDemandForecast,
    getPriceOptimization,
    findSupplierMatches,
    aiInsights
  } = useDashboardMetrics();

  useEffect(() => {
    // Generate insights from current metrics
    generateAIInsights();
    
    // Get demand forecast for a product
    getDemandForecast('product-123', historicalOrders);
  }, []);

  return (
    <div>
      {aiInsights.map(insight => (
        <div key={insight.id}>
          <h3>{insight.title}</h3>
          <p>{insight.description}</p>
          {insight.confidence && (
            <span>Confidence: {(insight.confidence * 100).toFixed(1)}%</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

## 🔧 Service Architecture

### Core Services
- `aiService.ts` - Main AI orchestration and API management
- `aiServiceManager.ts` - Service lifecycle and health management

### Prediction Services
- `demandForecastingService.ts` - Demand prediction and anomaly detection
- `priceOptimizationService.ts` - Price optimization and dynamic pricing

### Analytics Services
- `supplierMatchingService.ts` - Supplier intelligence and matching
- `recommendationEngine.ts` - Personalized recommendations
- `supplyChainOptimizationService.ts` - Supply chain optimization
- `marketIntelligenceService.ts` - Market analysis and intelligence

### NLP Services
- `searchService.ts` - Intelligent search and discovery
- `documentIntelligenceService.ts` - Document processing and OCR
- `naturalLanguageInterface.ts` - Conversational AI interface

## 🎯 Best Practices

### Error Handling
```typescript
try {
  const results = await search('query');
} catch (error) {
  // All services include comprehensive error handling
  console.error('Search failed:', error);
  // Fallback to cached or default results
}
```

### Performance Optimization
```typescript
// Use caching for frequently accessed data
const cachedResults = await search('common query', { useCache: true });

// Batch operations when possible
const batchResults = await aiServiceManager.processDocumentBatch(documents);
```

### User Privacy
```typescript
// Record interactions for learning (with user consent)
await recordInteraction('product-123', 'view', { source: 'search' });

// Clear sensitive data when needed
clearChatHistory(sessionId);
```

## 📊 Monitoring & Analytics

### Health Monitoring
```typescript
const health = await aiServiceManager.getHealthCheck();
console.log(health.status); // 'healthy' | 'degraded' | 'unhealthy'
```

### Service Status
```typescript
const status = aiServiceManager.getServiceStatus();
console.log(status.openAIConfigured); // boolean
console.log(status.initialized); // boolean
```

### Performance Metrics
All services include built-in performance monitoring:
- Response times
- Cache hit rates
- Error rates
- API usage tracking

## 🔒 Security

- API keys are never exposed to client-side code
- All AI communications are encrypted
- User data is handled according to privacy policies
- No sensitive data is sent to external AI providers

## 🚀 Advanced Features

### Custom Model Integration
```typescript
// Add custom models to the configuration
AI_CONFIG.mlModels.customModel = {
  modelPath: '/models/custom-model.onnx',
  inputShape: [1, 10],
  outputShape: [1, 1],
};
```

### Webhook Integration
```typescript
// Set up webhooks for real-time insights
websocket.on('ai_insight_update', (insight) => {
  // Handle real-time AI insights
});
```

### Batch Processing
```typescript
// Process large datasets efficiently
const batchResults = await aiServiceManager.generateBulkInsights(dataPoints);
```

## 📈 Future Roadmap

- **Computer Vision**: Product quality assessment from images
- **Voice Interface**: Voice-based ordering and queries
- **Blockchain Integration**: Supply chain traceability
- **IoT Integration**: Real-time sensor data processing
- **Advanced ML Models**: Custom domain-specific models

## 🤝 Contributing

1. Follow the existing code patterns
2. Add comprehensive error handling
3. Include unit tests for new features
4. Update documentation for new services
5. Ensure privacy and security compliance

## 📞 Support

For issues or questions:
1. Check the console for detailed error messages
2. Verify API key configuration
3. Review service health status
4. Contact the development team

---

Built with ❤️ for the FoodXchange platform