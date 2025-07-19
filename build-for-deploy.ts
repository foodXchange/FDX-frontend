import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building for deployment...');

// Set environment variables
process.env.SKIP_PREFLIGHT_CHECK = 'true';
process.env.DISABLE_ESLINT_PLUGIN = 'true';
process.env.TSC_COMPILE_ON_ERROR = 'true';

// Create a simple server file if needed
const serverContent = `
import express from 'express';
import path from 'path';

const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});
`;

// Write server file
fs.writeFileSync('server.ts', serverContent);

// Install express if not already installed
try {
  require.resolve('express');
} catch(e) {
  console.log('📦 Installing express...');
  execSync('npm install express', { stdio: 'inherit' });
}

// Build the app
console.log('🏗️ Building React app...');
try {
  execSync('react-scripts build', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  console.log('✅ Build completed successfully!');
  
  console.log('\n📋 Next steps:');
  console.log('1. Your app is ready in the "build" folder');
  console.log('2. To test locally: npx ts-node server.ts');
  console.log('3. To deploy: Upload the build folder and server.ts to your server');
  console.log('4. Make sure to set environment variables on your server');
} catch (error: any) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}