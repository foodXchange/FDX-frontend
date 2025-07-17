const fs = require('fs');
const path = require('path');

// Function to fix Grid component usage
function fixGridUsage(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace item prop with size prop
    // Pattern 1: item xs={number} -> size={{ xs: number }}
    content = content.replace(/<Grid\s+item\s+xs={(\d+)}/g, '<Grid size={{ xs: $1 }}');
    
    // Pattern 2: item xs={number} sm={number} -> size={{ xs: number, sm: number }}
    content = content.replace(/<Grid\s+item\s+xs={(\d+)}\s+sm={(\d+)}/g, '<Grid size={{ xs: $1, sm: $2 }}');
    
    // Pattern 3: item xs={number} sm={number} md={number} -> size={{ xs: number, sm: number, md: number }}
    content = content.replace(/<Grid\s+item\s+xs={(\d+)}\s+sm={(\d+)}\s+md={(\d+)}/g, '<Grid size={{ xs: $1, sm: $2, md: $3 }}');
    
    // Pattern 4: item xs={number} sm={number} lg={number} -> size={{ xs: number, sm: number, lg: number }}
    content = content.replace(/<Grid\s+item\s+xs={(\d+)}\s+sm={(\d+)}\s+lg={(\d+)}/g, '<Grid size={{ xs: $1, sm: $2, lg: $3 }}');
    
    // Pattern 5: item xs={number} md={number} -> size={{ xs: number, md: number }}
    content = content.replace(/<Grid\s+item\s+xs={(\d+)}\s+md={(\d+)}/g, '<Grid size={{ xs: $1, md: $2 }}');
    
    // Pattern 6: Handle cases with item prop first
    content = content.replace(/<Grid\s+item\s+/g, '<Grid ');
    
    // Pattern 7: Replace remaining item={true} with proper Grid usage
    content = content.replace(/item={true}/g, '');
    content = content.replace(/item: true/g, '');
    
    // Check if file was modified
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

console.log('🚀 Starting Grid v5 migration fixes...\n');

// List of files with Grid errors
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
  'src/features/expert-marketplace/components/organisms/BookingCalendar.tsx',
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
  fixGridUsage(filePath);
});

// Fix ErrorBoundary error reference
console.log('\n🔧 Fixing ErrorBoundary...');
const errorBoundaryPath = path.join(__dirname, 'src/features/agents/components/utils/ErrorBoundary.tsx');
if (fs.existsSync(errorBoundaryPath)) {
  let content = fs.readFileSync(errorBoundaryPath, 'utf8');
  content = content.replace(/Cannot find name 'error'. Did you mean 'errorId'?/g, 'Cannot find name \'errorId\'.');
  content = content.replace(/error\.message/g, 'errorId');
  fs.writeFileSync(errorBoundaryPath, content);
  console.log('✅ Fixed ErrorBoundary');
}

// Fix useAnalytics duplicate declaration
console.log('\n🔧 Fixing useAnalytics duplicate declaration...');
const analyticsPath = path.join(__dirname, 'src/features/agents/hooks/useAnalytics.ts');
if (fs.existsSync(analyticsPath)) {
  let content = fs.readFileSync(analyticsPath, 'utf8');
  
  // Remove duplicate flushEvents declarations
  const lines = content.split('\n');
  let inFlushEvents = false;
  let flushEventsCount = 0;
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('const flushEvents =')) {
      flushEventsCount++;
      if (flushEventsCount > 1) {
        // Skip duplicate declaration
        while (i < lines.length && !lines[i].includes('}, [])')) {
          i++;
        }
        continue;
      }
    }
    
    newLines.push(line);
  }
  
  fs.writeFileSync(analyticsPath, newLines.join('\n'));
  console.log('✅ Fixed useAnalytics');
}

console.log('\n✨ Grid v5 migration fixes completed!');
console.log('\nNext steps:');
console.log('1. Run: npm run build');
console.log('2. If there are still errors, they should be significantly reduced');