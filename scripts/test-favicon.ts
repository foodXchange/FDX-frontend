import * as fs from 'fs';
import * as path from 'path';

console.log('🔍 Testing favicon setup...\n');

const publicDir = path.join(__dirname, '../public');
const svgPath = path.join(publicDir, 'favicon.svg');
const icoPath = path.join(publicDir, 'favicon.ico');
const htmlPath = path.join(publicDir, 'index.html');

// Check if favicon files exist
console.log('📁 Checking favicon files:');

if (fs.existsSync(svgPath)) {
  const svgStats = fs.statSync(svgPath);
  console.log('✅ favicon.svg found');
  console.log(`   Size: ${svgStats.size} bytes`);
  console.log(`   Last modified: ${svgStats.mtime}`);
} else {
  console.log('❌ favicon.svg not found');
}

if (fs.existsSync(icoPath)) {
  const icoStats = fs.statSync(icoPath);
  console.log('✅ favicon.ico found');
  console.log(`   Size: ${icoStats.size} bytes`);
  console.log(`   Last modified: ${icoStats.mtime}`);
} else {
  console.log('❌ favicon.ico not found');
}

// Check HTML configuration
console.log('\n📄 Checking HTML configuration:');
if (fs.existsSync(htmlPath)) {
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const hasFaviconLinks = htmlContent.includes('favicon.svg') && htmlContent.includes('favicon.ico');
  const hasCacheBusting = htmlContent.includes('favicon.svg?v=2');
  
  console.log(`✅ index.html found`);
  console.log(`   Favicon links: ${hasFaviconLinks ? '✅' : '❌'}`);
  console.log(`   Cache busting: ${hasCacheBusting ? '✅' : '❌'}`);
} else {
  console.log('❌ index.html not found');
}

console.log('\n🎯 Favicon should now appear on all pages!');
console.log('\n📋 To see the new favicon:');
console.log('1. Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)');
console.log('2. Clear browser cache completely');
console.log('3. Try opening in incognito/private mode');
console.log('4. Check browser developer tools > Network tab for favicon requests');
console.log('\n🌐 Test URLs:');
console.log('- http://localhost:3006/');
console.log('- http://localhost:3006/login');
console.log('- http://localhost:3006/dashboard');
console.log('\n💡 If favicon still doesn\'t appear:');
console.log('- Check browser console for errors');
console.log('- Verify the favicon.svg file loads correctly');
console.log('- Try a different browser');