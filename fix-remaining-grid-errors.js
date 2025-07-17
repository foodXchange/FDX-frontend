const fs = require('fs');
const path = require('path');

// Helper function to fix Grid errors more comprehensively
function fixGridComponentErrors(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // More comprehensive patterns for Grid fixes
    
    // Fix Grid with item and multiple breakpoints on same line
    content = content.replace(
      /<Grid\s+item\s+xs={(\d+)}\s+sm={(\d+)}\s+md={(\d+)}>/g,
      '<Grid size={{ xs: $1, sm: $2, md: $3 }}>'
    );
    
    // Fix Grid with item and xs/md only
    content = content.replace(
      /<Grid\s+item\s+xs={(\d+)}\s+md={(\d+)}>/g,
      '<Grid size={{ xs: $1, md: $2 }}>'
    );
    
    // Fix Grid with item and xs only
    content = content.replace(
      /<Grid\s+item\s+xs={(\d+)}>/g,
      '<Grid size={{ xs: $1 }}>'
    );
    
    // Fix Grid with key prop (preserve key)
    content = content.replace(
      /<Grid\s+item\s+xs={(\d+)}\s+sm={(\d+)}\s+lg={(\d+)}\s+key={([^}]+)}>/g,
      '<Grid size={{ xs: $1, sm: $2, lg: $3 }} key={$4}>'
    );
    
    // Fix Grid with item={true} syntax
    content = content.replace(
      /<Grid\s+item={true}\s+xs={(\d+)}>/g,
      '<Grid size={{ xs: $1 }}>'
    );
    
    // Remove standalone item props
    content = content.replace(/\s+item(?=[>\s])/g, '');
    
    // Fix cases where item: true appears in object syntax
    content = content.replace(/item:\s*true,?\s*/g, '');
    
    if (content !== fs.readFileSync(filePath, 'utf8')) {
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

console.log('🚀 Starting comprehensive Grid error fixes...\n');

// Files that still have Grid errors
const filesToFix = [
  'src/features/agents/components/molecules/AdvancedSearchFilter.tsx',
  'src/features/agents/components/organisms/AILeadScoring.tsx',
  'src/features/agents/components/organisms/AnalyticsDashboard.tsx',
  'src/features/agents/components/organisms/BulkOperations.tsx',
  'src/features/agents/components/organisms/CollaborationHub.tsx',
  'src/features/agents/components/organisms/AdvancedAnalytics.tsx',
  'src/features/agents/components/organisms/AdvancedNotifications.tsx',
  'src/features/agents/components/organisms/InternationalizationSystem.tsx',
  'src/features/agents/components/organisms/LeadKanban.tsx',
  'src/features/agents/components/organisms/MobileFeatures.tsx',
  'src/features/agents/components/organisms/SecurityAuditSystem.tsx',
  'src/features/agents/components/organisms/WhatsAppChat.tsx',
  'src/features/agents/pages/AgentDashboard.tsx',
  'src/features/agents/pages/AgentOnboarding.tsx',
  'src/features/agents/pages/CommissionTracking.tsx',
  'src/features/agents/pages/LeadManagement.tsx',
  'src/features/agents/pages/WhatsAppIntegration.tsx',
  'src/features/agents/components/AgentDashboard.tsx',
  'src/features/agents/components/CommissionDashboard.tsx',
  'src/features/agents/components/LeadManagement.tsx',
  'src/features/agents/components/PerformanceBadge.tsx',
  'src/features/expert-marketplace/components/organisms/BookingManagement.tsx',
  'src/features/expert-marketplace/pages/ExpertDiscovery.tsx',
  'src/features/expert-marketplace/pages/ExpertMarketplace.tsx',
  'src/features/expert-marketplace/pages/ExpertProfile.tsx',
  'src/features/expert-marketplace/pages/BookingManagement.tsx',
  'src/features/expert-marketplace/pages/CollaborationWorkspace.tsx',
  'src/features/expert-marketplace/pages/ExpertDashboard.tsx',
  'src/features/expert-marketplace/pages/ExpertServices.tsx'
];

// Fix each file
filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  fixGridComponentErrors(filePath);
});

// Fix ErrorBoundary - more specific fix
console.log('\n🔧 Fixing ErrorBoundary error references...');
const errorBoundaryPath = path.join(__dirname, 'src/features/agents/components/utils/ErrorBoundary.tsx');
if (fs.existsSync(errorBoundaryPath)) {
  let content = fs.readFileSync(errorBoundaryPath, 'utf8');
  
  // Find the specific line with the error
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('error.message') && i === 429) {
      lines[i] = lines[i].replace('error.message', 'error.message || errorId');
    }
  }
  
  fs.writeFileSync(errorBoundaryPath, lines.join('\n'));
  console.log('✅ Fixed ErrorBoundary error reference');
}

// Fix duplicate flushEvents in useAnalytics
console.log('\n🔧 Fixing useAnalytics flushEvents...');
const analyticsPath = path.join(__dirname, 'src/features/agents/hooks/useAnalytics.ts');
if (fs.existsSync(analyticsPath)) {
  let content = fs.readFileSync(analyticsPath, 'utf8');
  
  // Remove the line that just says "// Flush events to server" followed by empty line
  content = content.replace(/\/\/ Flush events to server\n\s*\n/g, '\n');
  
  // Look for duplicate const flushEvents declarations
  const flushEventsRegex = /const flushEvents = useCallback\(\(\) => \{[\s\S]*?\}, \[\]\);/g;
  const matches = content.match(flushEventsRegex);
  
  if (matches && matches.length > 1) {
    // Keep only the first occurrence
    let firstOccurrence = true;
    content = content.replace(flushEventsRegex, (match) => {
      if (firstOccurrence) {
        firstOccurrence = false;
        return match;
      }
      return ''; // Remove subsequent occurrences
    });
  }
  
  fs.writeFileSync(analyticsPath, content);
  console.log('✅ Fixed useAnalytics');
}

console.log('\n✨ Comprehensive Grid fixes completed!');
console.log('\nNext step: Run npm run build to check remaining errors');