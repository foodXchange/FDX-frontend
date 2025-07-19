const fs = require('fs');
const path = require('path');

interface Fix {
  file: string;
  find: string | RegExp;
  replace: string;
}

const fixes: Fix[] = [
  // Fix duplicate List imports
  {
    file: 'src/components/landing/Navbar.tsx',
    find: /import { List } from '@mui\/icons-material';/,
    replace: '// List icon removed - already imported from MUI'
  },
  {
    file: 'src/components/layout/Sidebar.tsx',
    find: /import { List } from '@mui\/icons-material';/,
    replace: '// List icon removed - already imported from MUI'
  },
  {
    file: 'src/features/admin/DataImport.tsx',
    find: /import { Cancel, CheckCircle, CloudUpload, Description, List } from '@mui\/icons-material';/,
    replace: "import { Cancel, CheckCircle, CloudUpload, Description } from '@mui/icons-material';"
  },
  
  // Fix empty imports (leading comma)
  {
    file: 'src/features/agents/components/organisms/MobileFeatures.tsx',
    find: /import { , /g,
    replace: 'import { '
  },
  {
    file: 'src/features/ai-recommendations/components/PredictiveAnalytics.tsx',
    find: /import { , /g,
    replace: 'import { '
  },
  {
    file: 'src/features/ai-recommendations/components/VisualSimilarityMatching.tsx',
    find: /import { , /g,
    replace: 'import { '
  },
  {
    file: 'src/features/collaboration/pages/CollaborationHub.tsx',
    find: /import { , /g,
    replace: 'import { '
  },
  {
    file: 'src/features/compliance/ComplianceDashboard.tsx',
    find: /import { , /g,
    replace: 'import { '
  },
  {
    file: 'src/features/compliance/components/CertificationManager.tsx',
    find: /import { , /g,
    replace: 'import { '
  },
  {
    file: 'src/features/rfq/RFQDetail.tsx',
    find: /import { , /g,
    replace: 'import { '
  },
  {
    file: 'src/features/rfq/RFQList.tsx',
    find: /import { , /g,
    replace: 'import { '
  },
  
  // Fix incomplete expressions
  {
    file: 'src/features/agents/pages/ARMTestPage.tsx',
    find: /onClick=\{[^}]*\}\);/,
    replace: 'onClick={() => {}}'
  },
  {
    file: 'src/features/analytics/components/ReportingEngine.tsx',
    find: /onSave=\{\(chart\) => \}/,
    replace: 'onSave={(chart) => {}}'
  },
  {
    file: 'src/features/collaboration/components/ProjectManagement.tsx',
    find: /onEdit=\{\(\) => \}/,
    replace: 'onEdit={() => {}}'
  },
  {
    file: 'src/features/collaboration/components/ProjectManagement.tsx',
    find: /onDelete=\{\(\) => \}/,
    replace: 'onDelete={() => {}}'
  },
  {
    file: 'src/features/marketplace/MarketplaceView.tsx',
    find: /onView=\{\(\) => \}/g,
    replace: 'onView={() => {}}'
  },
  {
    file: 'src/features/marketplace/MarketplaceView.tsx',
    find: /onRequestSample=\{\(\) => \}/g,
    replace: 'onRequestSample={() => {}}'
  },
  {
    file: 'src/features/marketplace/MarketplaceView.tsx',
    find: /onQuickRFQ=\{\(\) => \}/g,
    replace: 'onQuickRFQ={() => {}}'
  },
  
  // Fix api-client.ts authorization header
  {
    file: 'src/services/api-client.ts',
    find: /originalRequest\.headers\.Authorization = `Bearer \${newToken}`;/,
    replace: "originalRequest.headers['Authorization'] = `Bearer ${newToken}`;"
  },
  
  // Fix logger.ts incomplete expression
  {
    file: 'src/services/logger.ts',
    find: /^\s*,\s*entry\.context,\s*entry\.error\);/m,
    replace: '        // Console output removed'
  },
  
  // Remove TestUpload import from routes
  {
    file: 'src/router/routes.tsx',
    find: /const TestUpload = lazy\(\(\) => import\('\.\.\/pages\/TestUpload'\)\);/,
    replace: '// TestUpload removed'
  },
  {
    file: 'src/router/routes.tsx',
    find: /\{\s*path:\s*'test-upload',\s*element:\s*<TestUpload\s*\/>,?\s*\},?/,
    replace: ''
  }
];

async function fixFiles() {
  console.log('🔧 Fixing cleanup errors...\n');
  
  for (const fix of fixes) {
    const filePath = path.join(process.cwd(), fix.file);
    
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${fix.file}`);
        continue;
      }
      
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      if (typeof fix.find === 'string') {
        content = content.replace(fix.find, fix.replace);
      } else {
        content = content.replace(fix.find, fix.replace);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed: ${fix.file}`);
      }
    } catch (error) {
      console.error(`❌ Error fixing ${fix.file}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  console.log('\n✨ Error fixing complete!');
}

fixFiles().catch(console.error);