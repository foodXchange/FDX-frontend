const fs = require('fs');
const path = require('path');

// Files that need IconButton import added
const filesToFix = [
  'src/components/RealTimeNotifications.tsx',
  'src/components/landing/Navbar.tsx',
  'src/components/landing/SocialProof.tsx',
  'src/components/layout/Header.tsx',
  'src/components/layout/Sidebar.tsx',
  'src/components/leads/LeadDocuments.tsx',
  'src/components/onboarding/OnboardingManager.tsx',
  'src/components/onboarding/OnboardingTour.tsx',
  'src/components/profile/ProfileImageUpload.tsx',
  'src/components/shared/DataTable.tsx',
  'src/components/ui/FileUpload.tsx',
  'src/components/ui/LazyImage.tsx',
  'src/components/ui/Modal.tsx',
  'src/components/ui/Toast.tsx',
  'src/features/agents/components/ARMDashboardOptimized.tsx',
  'src/features/agents/components/ARMDashboard/components/ARMDashboardHeader.tsx',
  'src/features/agents/components/CommunicationCenter.tsx',
  'src/features/agents/components/LeadManagement.tsx',
  'src/features/agents/components/LeadPipeline.tsx',
  'src/features/agents/components/LeadPipelineOptimized.tsx',
  'src/features/agents/components/RelationshipTimeline.tsx',
  'src/features/agents/components/RelationshipTimelineOptimized.tsx',
  'src/features/agents/components/atoms/AccessibleCard.tsx',
  'src/features/agents/components/molecules/AdvancedSearchFilter.tsx',
  'src/features/agents/components/organisms/AILeadScoring.tsx',
  'src/features/agents/components/organisms/AdvancedAnalytics.tsx',
  'src/features/agents/components/organisms/AdvancedNotifications.tsx',
  'src/features/agents/components/organisms/AnalyticsDashboard.tsx',
  'src/features/agents/components/organisms/BulkOperations.tsx',
  'src/features/agents/components/organisms/CollaborationHub.tsx',
  'src/features/agents/components/organisms/InternationalizationSystem.tsx',
  'src/features/agents/components/organisms/KeyboardShortcutsHelp.tsx',
  'src/features/agents/components/organisms/LeadKanban.tsx',
  'src/features/agents/components/organisms/MobileFeatures.tsx',
  'src/features/agents/components/organisms/OfflineIndicator.tsx',
  'src/features/agents/components/organisms/SecurityAuditSystem.tsx',
  'src/features/agents/components/organisms/WhatsAppChat.tsx',
  'src/features/agents/pages/AgentLogin.tsx',
  'src/features/dashboard/TrackingDashboard.tsx',
  'src/features/expert-marketplace/components/molecules/ExpertSearchBar.tsx',
  'src/features/expert-marketplace/components/organisms/ExpertFilters.tsx',
  'src/features/expert-marketplace/pages/BookingManagement.tsx',
  'src/features/expert-marketplace/pages/CollaborationWorkspace.tsx',
  'src/features/marketplace/MarketplaceView.tsx',
  'src/features/monitoring/TemperatureMonitor.tsx',
  'src/features/orders/OrderLinesTable.tsx',
  'src/features/orders/StandingOrderManager.tsx',
  'src/features/profile/Settings.tsx',
  'src/features/rfq/CreateRFQ.tsx',
  'src/features/rfq/RFQDashboard.tsx',
  'src/features/rfq/RFQDetail.tsx',
  'src/features/rfq/RFQList.tsx',
  'src/layouts/DashboardLayout.tsx',
  'src/layouts/MainLayout.tsx'
];

// Function to add IconButton to MUI imports
function addIconButtonImport(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Find @mui/material import
  const muiImportRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]@mui\/material['"];?/;
  const match = content.match(muiImportRegex);
  
  if (match) {
    const imports = match[1].split(',').map(i => i.trim());
    
    // Check if IconButton is already imported
    if (!imports.includes('IconButton')) {
      // Add IconButton to imports
      imports.push('IconButton');
      
      // Sort imports alphabetically (optional)
      imports.sort();
      
      // Rebuild import statement
      const newImport = `import { ${imports.join(', ')} } from '@mui/material';`;
      content = content.replace(match[0], newImport);
      modified = true;
    }
  } else {
    // No MUI import found, add a new one
    const firstImportMatch = content.match(/^import\s+/m);
    if (firstImportMatch) {
      const insertPosition = content.indexOf(firstImportMatch[0]);
      content = content.slice(0, insertPosition) + 
                `import { IconButton } from '@mui/material';\n` + 
                content.slice(insertPosition);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${path.basename(filePath)}`);
    return true;
  }
  
  return false;
}

// Process all files
let fixedCount = 0;
filesToFix.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (addIconButtonImport(fullPath)) {
    fixedCount++;
  }
});

console.log(`\nFixed ${fixedCount} files with missing IconButton imports.`);