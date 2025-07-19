#!/usr/bin/env node
const { execSync } = require('child_process');

console.log('🚀 Starting optimized build process...');

try {
  // Type check first
  console.log('📝 Running type check...');
  execSync('npm run type-check', { stdio: 'inherit' });
  
  // Lint and fix
  console.log('🔍 Running linter...');
  execSync('npm run lint:fix', { stdio: 'inherit' });
  
  // Build for production
  console.log('🏗️ Building for production...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
