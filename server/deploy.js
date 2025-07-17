const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('📦 Preparing server for deployment...');

// Check if dist directory exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
    console.log('⚠️  No dist directory found. Running TypeScript compiler in transpile-only mode...');
    try {
        execSync('npx tsc --transpileOnly', { stdio: 'inherit' });
        console.log('✅ Transpilation completed');
    } catch (error) {
        console.error('❌ Transpilation failed:', error.message);
        process.exit(1);
    }
}

// Create deployment package
console.log('📋 Creating deployment package...');

const deploymentFiles = [
    'dist',
    'node_modules',
    'package.json',
    'package-lock.json',
    '.env',
    'uploads',
    'data'
];

// Verify all required files exist
const missingFiles = deploymentFiles.filter(file => {
    const filePath = path.join(__dirname, file);
    return !fs.existsSync(filePath);
});

if (missingFiles.length > 0) {
    console.log('⚠️  Missing files/directories:', missingFiles.join(', '));
    console.log('Creating missing directories...');
    
    missingFiles.forEach(file => {
        if (file === 'uploads' || file === 'data') {
            fs.mkdirSync(path.join(__dirname, file), { recursive: true });
            console.log(`✅ Created ${file} directory`);
        }
    });
}

console.log('\n📦 Server is ready for deployment!');
console.log('\n🚀 Deployment options:');
console.log('1. Azure App Service: Use GitHub Actions or Azure CLI');
console.log('2. Heroku: git push heroku main');
console.log('3. AWS: Use Elastic Beanstalk or EC2');
console.log('4. Docker: Build and push container image');
console.log('\n💡 Make sure to set environment variables on your hosting platform!');