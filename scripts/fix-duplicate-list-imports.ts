const fs = require('fs');
const path = require('path');

// Files that might have duplicate List imports
const filesToCheck = [
  'src/features/ai-recommendations/components/VisualSimilarityMatching.tsx',
  'src/features/ai-recommendations/components/PredictiveAnalytics.tsx',
  'src/components/onboarding/OnboardingTour.tsx',
  'src/components/ui/FileUpload.tsx',
  'src/features/agents/components/ARMDashboardOptimized.tsx',
  'src/features/agents/components/CommunicationCenter.tsx',
  'src/features/agents/components/organisms/AdvancedNotifications.tsx',
  'src/features/agents/components/organisms/AILeadScoring.tsx',
  'src/features/agents/components/organisms/AnalyticsDashboard.tsx',
  'src/features/agents/components/organisms/BulkOperations.tsx',
  'src/features/agents/components/organisms/CollaborationHub.tsx',
  'src/features/agents/components/organisms/OfflineIndicator.tsx',
  'src/features/agents/components/organisms/SecurityAuditSystem.tsx',
  'src/features/agents/components/organisms/WhatsAppChat.tsx',
  'src/features/agents/components/RelationshipTimelineOptimized.tsx',
  'src/features/agents/components/RelationshipTimeline.tsx',
  'src/features/agents/pages/AgentDashboard.tsx',
  'src/features/agents/pages/CommissionTracking.tsx',
  'src/features/agents/pages/WhatsAppIntegration.tsx',
  'src/features/expert-marketplace/components/molecules/DeliverablesPanel.tsx',
  'src/components/leads/LeadDocuments.tsx',
  'src/features/marketplace/MarketplaceView.tsx',
  'src/features/collaboration/components/ProjectManagement.tsx',
  'src/features/analytics/components/ReportingEngine.tsx',
  'src/features/rfq/RFQList.tsx',
  'src/features/compliance/ComplianceDashboard.tsx',
  'src/features/compliance/components/CertificationManager.tsx',
  'src/features/collaboration/pages/CollaborationHub.tsx',
  'src/features/agents/components/organisms/MobileFeatures.tsx',
  'src/features/compliance/components/ComplianceDashboard.tsx',
  'src/features/compliance/components/ComplianceValidator.tsx',
  'src/features/agents/components/organisms/InternationalizationSystem.tsx',
  'src/features/agents/components/LeadPipelineOptimized.tsx',
  'src/features/agents/components/LeadPipeline.tsx',
  'src/features/agents/components/ARMDashboard/components/LeadsRequiringAttention.tsx',
  'src/features/agents/components/AgentRFQList.tsx',
  'src/components/shared/VirtualizedList.tsx',
  'src/features/expert-marketplace/pages/ExpertDiscovery.tsx',
  'src/features/agents/pages/LeadManagement.tsx'
];

console.log('🔧 Fixing duplicate List imports...\n');

let fixedCount = 0;

filesToCheck.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Check if file imports List from both @mui/material and @mui/icons-material
    const hasMuiList = content.includes('import') && content.includes('List') && content.includes('@mui/material');
    const hasMuiIconsList = content.includes('import') && content.includes('List') && content.includes('@mui/icons-material');
    
    if (hasMuiList && hasMuiIconsList) {
      // Replace List with ListIcon in icon imports
      content = content.replace(
        /import\s*{([^}]*)\bList\b([^}]*)}\s*from\s*['"]@mui\/icons-material['"]/g,
        (match: string, before: string, after: string) => {
          return `import {${before}List as ListIcon${after}} from '@mui/icons-material'`;
        }
      );
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed: ${file}`);
        fixedCount++;
      }
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}: ${error instanceof Error ? error.message : String(error)}`);
  }
});

console.log(`\n✨ Fixed ${fixedCount} files with duplicate List imports!`);