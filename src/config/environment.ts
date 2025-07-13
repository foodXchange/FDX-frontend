export const config = {
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    wsUrl: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
  },
  environment: process.env.REACT_APP_ENVIRONMENT || 'development',
  isDevelopment: process.env.REACT_APP_ENVIRONMENT === 'development',
  isProduction: process.env.REACT_APP_ENVIRONMENT === 'production',
} as const;

export default config;