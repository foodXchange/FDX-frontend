import * as fs from 'fs';
import * as path from 'path';

console.log('🔍 Checking favicon setup...');

const publicDir = path.join(__dirname, '../public');
const svgPath = path.join(publicDir, 'favicon.svg');
const icoPath = path.join(publicDir, 'favicon.ico');
const browserConfigPath = path.join(publicDir, 'browserconfig.xml');

// Check if favicon files exist
console.log('📁 Checking favicon files:');

if (fs.existsSync(svgPath)) {
  console.log('✅ favicon.svg found');
  const svgStats = fs.statSync(svgPath);
  console.log(`   Size: ${svgStats.size} bytes`);
} else {
  console.log('❌ favicon.svg not found');
}

if (fs.existsSync(icoPath)) {
  console.log('✅ favicon.ico found');
  const icoStats = fs.statSync(icoPath);
  console.log(`   Size: ${icoStats.size} bytes`);
} else {
  console.log('❌ favicon.ico not found');
}

if (fs.existsSync(browserConfigPath)) {
  console.log('✅ browserconfig.xml found');
} else {
  console.log('❌ browserconfig.xml not found');
}

console.log('\n🎯 Favicon should now appear on all pages!');
console.log('\n📋 Troubleshooting tips:');
console.log('1. Clear browser cache (Ctrl+F5 or Cmd+Shift+R)');
console.log('2. Check browser developer tools > Network tab for favicon requests');
console.log('3. Try opening in incognito/private mode');
console.log('4. Ensure you\'re running the latest build (npm run build)');
console.log('\n🌐 Test URLs:');
console.log('- http://localhost:3006/');
console.log('- http://localhost:3006/login');
console.log('- http://localhost:3006/dashboard');