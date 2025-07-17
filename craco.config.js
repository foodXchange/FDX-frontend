const CracoAlias = require('craco-alias');
const path = require('path');

module.exports = {
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        baseUrl: '.',
        tsConfigPath: './tsconfig.json',
      },
    },
  ],
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Optimize for faster development builds
      if (env === 'development') {
        // Faster source maps
        webpackConfig.devtool = 'eval-source-map';
        
        // Cache configuration for faster rebuilds
        webpackConfig.cache = {
          type: 'filesystem',
          cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/webpack'),
          buildDependencies: {
            config: [__filename]
          }
        };
        
        // Optimize chunk splitting for faster HMR
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: 10
              },
              mui: {
                test: /[\\/]node_modules[\\/]@mui[\\/]/,
                name: 'mui',
                chunks: 'all',
                priority: 20
              }
            }
          }
        };
      }
      
      return webpackConfig;
    }
  },
  devServer: {
    // Faster hot reloading
    hot: true,
    liveReload: false,
    
    // Optimize for development
    client: {
      overlay: {
        errors: true,
        warnings: false
      }
    },
    
    // Compress responses
    compress: true,
    
    // Headers for better caching
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  },
  
  // TypeScript configuration - only check types in production
  typescript: {
    enableTypeChecking: process.env.NODE_ENV === 'production'
  },
  
  // ESLint configuration - only lint in production
  eslint: {
    enable: process.env.NODE_ENV === 'production',
    mode: 'file'
  }
}