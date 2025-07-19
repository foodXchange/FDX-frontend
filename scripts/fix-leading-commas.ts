const fs = require('fs');
const path = require('path');

// Files with leading comma in imports
const filesToFix = [
  'src/features/expert-marketplace/components/molecules/DeliverablesPanel.tsx',
  'src/features/agents/pages/WhatsAppIntegration.tsx',
  'src/features/agents/pages/CommissionTracking.tsx',
  'src/features/agents/pages/AgentDashboard.tsx',
  'src/features/agents/components/RelationshipTimeline.tsx',
  'src/features/agents/components/RelationshipTimelineOptimized.tsx',
  'src/features/agents/components/organisms/WhatsAppChat.tsx',
  'src/features/agents/components/organisms/SecurityAuditSystem.tsx',
  'src/features/agents/components/organisms/OfflineIndicator.tsx',
  'src/features/agents/components/organisms/CollaborationHub.tsx',
  'src/features/agents/components/organisms/BulkOperations.tsx',
  'src/features/agents/components/organisms/AILeadScoring.tsx',
  'src/features/agents/components/organisms/AnalyticsDashboard.tsx',
  'src/features/agents/components/organisms/AdvancedNotifications.tsx',
  'src/features/agents/components/CommunicationCenter.tsx',
  'src/features/agents/components/ARMDashboardOptimized.tsx',
  'src/features/agents/components/ARMDashboard/components/RelationshipMetricsCards.tsx',
  'src/features/agents/components/ARMDashboard/components/ARMDashboardHeader.tsx',
  'src/components/ui/FileUpload.tsx',
  'src/components/onboarding/OnboardingTour.tsx',
  'src/components/onboarding/InteractiveDemoComponents.tsx'
];

console.log('🔧 Fixing leading comma imports...\n');

let fixedCount = 0;

filesToFix.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Fix leading comma in imports
    content = content.replace(/import\s*{\s*,\s*/g, 'import { ');
    
    // Also fix any double commas that might have been created
    content = content.replace(/,\s*,/g, ',');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}: ${error instanceof Error ? error.message : String(error)}`);
  }
});

console.log(`\n✨ Fixed ${fixedCount} files with leading comma issues!`);