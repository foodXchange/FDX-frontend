const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Production optimizations
      if (env === 'production') {
        // Enable tree shaking
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          usedExports: true,
          sideEffects: false,
          
          // Advanced code splitting
          splitChunks: {
            chunks: 'all',
            maxInitialRequests: 20,
            maxAsyncRequests: 20,
            cacheGroups: {
              // Vendor chunks
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                priority: 10,
                chunks: 'all',
              },
              
              // React and React DOM
              react: {
                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                name: 'react',
                priority: 20,
                chunks: 'all',
              },
              
              // Material UI
              mui: {
                test: /[\\/]node_modules[\\/]@mui[\\/]/,
                name: 'mui',
                priority: 15,
                chunks: 'all',
              },
              
              // Heroicons
              heroicons: {
                test: /[\\/]node_modules[\\/]@heroicons[\\/]/,
                name: 'heroicons',
                priority: 15,
                chunks: 'all',
              },
              
              // React Query
              reactQuery: {
                test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
                name: 'react-query',
                priority: 15,
                chunks: 'all',
              },
              
              // Routing
              routing: {
                test: /[\\/]node_modules[\\/]react-router[\\/]/,
                name: 'routing',
                priority: 15,
                chunks: 'all',
              },
              
              // Common components
              common: {
                name: 'common',
                minChunks: 2,
                priority: 5,
                chunks: 'all',
                enforce: true,
              },
            },
          },
          
          // Module concatenation
          concatenateModules: true,
          
          // Minimize configuration
          minimize: true,
          minimizer: [
            ...webpackConfig.optimization.minimizer,
          ],
        };

        // Add compression plugin
        webpackConfig.plugins.push(
          new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 8192,
            minRatio: 0.8,
          })
        );

        // Add Brotli compression
        webpackConfig.plugins.push(
          new CompressionPlugin({
            filename: '[path][base].br',
            algorithm: 'brotliCompress',
            test: /\.(js|css|html|svg)$/,
            compressionOptions: { level: 11 },
            threshold: 8192,
            minRatio: 0.8,
          })
        );

        // Bundle analyzer (only when ANALYZE=true)
        if (process.env.ANALYZE) {
          webpackConfig.plugins.push(
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              openAnalyzer: false,
            })
          );
        }
      }

      // Development optimizations
      if (env === 'development') {
        // Faster builds in development
        webpackConfig.optimization.removeAvailableModules = false;
        webpackConfig.optimization.removeEmptyChunks = false;
        webpackConfig.optimization.splitChunks = false;
        
        // Better source maps
        webpackConfig.devtool = 'eval-cheap-module-source-map';
      }

      // Dynamic imports optimization
      webpackConfig.module.rules.push({
        test: /\.(js|jsx|ts|tsx)$/,
        include: paths.appSrc,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [
                '@babel/plugin-syntax-dynamic-import',
                ['@babel/plugin-proposal-decorators', { legacy: true }],
              ],
            },
          },
        ],
      });

      // Image optimization
      webpackConfig.module.rules.push({
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'static/media/[name].[contenthash:8].[ext]',
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: { progressive: true, quality: 75 },
              optipng: { enabled: true },
              pngquant: { quality: [0.6, 0.8] },
              gifsicle: { interlaced: false },
              webp: { quality: 75 },
            },
          },
        ],
      });

      return webpackConfig;
    },
  },
  
  // Development server optimizations
  devServer: {
    compress: true,
    hot: true,
    overlay: false,
    stats: 'minimal',
  },
};