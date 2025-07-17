const fs = require('fs');
const path = require('path');

// Function to fix Grid size syntax errors
function fixGridSizeSyntax(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const original = content;
    
    // Fix pattern: size={{ xs: 12 }} sm={6} md={4} -> size={{ xs: 12, sm: 6, md: 4 }}
    content = content.replace(
      /<Grid\s+size={{\s*xs:\s*(\d+)\s*}}\s+sm={(\d+)}\s+md={(\d+)}>/g,
      '<Grid size={{ xs: $1, sm: $2, md: $3 }}>'
    );
    
    // Fix pattern: size={{ xs: 12 }} md={6} -> size={{ xs: 12, md: 6 }}
    content = content.replace(
      /<Grid\s+size={{\s*xs:\s*(\d+)\s*}}\s+md={(\d+)}>/g,
      '<Grid size={{ xs: $1, md: $2 }}>'
    );
    
    // Fix pattern: size={{ xs: 12 }} sm={6} -> size={{ xs: 12, sm: 6 }}
    content = content.replace(
      /<Grid\s+size={{\s*xs:\s*(\d+)\s*}}\s+sm={(\d+)}>/g,
      '<Grid size={{ xs: $1, sm: $2 }}>'
    );
    
    // Fix pattern: size={{ xs: 12 }} sm={6} lg={4} -> size={{ xs: 12, sm: 6, lg: 4 }}
    content = content.replace(
      /<Grid\s+size={{\s*xs:\s*(\d+)\s*}}\s+sm={(\d+)}\s+lg={(\d+)}>/g,
      '<Grid size={{ xs: $1, sm: $2, lg: $3 }}>'
    );
    
    // Fix pattern with key: size={{ xs: 12 }} sm={6} lg={4} key={...} -> size={{ xs: 12, sm: 6, lg: 4 }} key={...}
    content = content.replace(
      /<Grid\s+size={{\s*xs:\s*(\d+)\s*}}\s+sm={(\d+)}\s+lg={(\d+)}\s+key={([^}]+)}>/g,
      '<Grid size={{ xs: $1, sm: $2, lg: $3 }} key={$4}>'
    );
    
    // Fix pattern: item xs={12} (remaining old syntax)
    content = content.replace(
      /<Grid\s+item\s+xs={true}>/g,
      '<Grid size={12}>'
    );
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${path.basename(filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🚀 Fixing Grid size syntax errors...\n');

// List of files with Grid errors
const filesToFix = [
  'src/features/agents/components/molecules/AdvancedSearchFilter.tsx',
  'src/features/agents/components/organisms/AILeadScoring.tsx',
  'src/features/expert-marketplace/components/organisms/BookingCalendar.tsx',
  'src/features/expert-marketplace/pages/ExpertDiscovery.tsx'
];

// Fix each file
filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  fixGridSizeSyntax(filePath);
});

// Also check and fix the ErrorBoundary error message issue
console.log('\n🔧 Fixing ErrorBoundary...');
const errorBoundaryPath = path.join(__dirname, 'src/features/agents/components/utils/ErrorBoundary.tsx');
if (fs.existsSync(errorBoundaryPath)) {
  let content = fs.readFileSync(errorBoundaryPath, 'utf8');
  
  // Fix line 167 where error.message is used but error is not defined
  content = content.replace(
    /message: error\.message/g,
    'message: errorId'
  );
  
  fs.writeFileSync(errorBoundaryPath, content);
  console.log('✅ Fixed ErrorBoundary');
}

console.log('\n✨ Grid size syntax fixes completed!');