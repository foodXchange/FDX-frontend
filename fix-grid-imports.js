const fs = require('fs');
const path = require('path');

const files = [
  'src/features/expert-marketplace/components/organisms/ExpertProfile.tsx',
  'src/features/expert-marketplace/components/molecules/ServiceList.tsx',
  'src/features/expert-marketplace/components/molecules/ReviewList.tsx',
  'src/features/agents/pages/AgentOnboarding.tsx',
  'src/features/expert-marketplace/components/molecules/VideoCallPanel.tsx',
  'src/features/expert-marketplace/components/organisms/BookingCalendar.tsx',
  'src/features/expert-marketplace/components/organisms/BookingManagement.tsx',
  'src/features/expert-marketplace/pages/ExpertDiscovery.tsx',
  'src/features/expert-marketplace/components/molecules/PortfolioGallery.tsx',
  'src/features/expert-marketplace/components/molecules/ExpertStats.tsx',
  'src/features/agents/pages/CommissionTracking.tsx',
  'src/features/expert-marketplace/pages/ExpertMarketplace.tsx',
  'src/features/expert-marketplace/components/molecules/DocumentsPanel.tsx',
  'src/features/agents/pages/WhatsAppIntegration.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace Grid2 import with regular Grid import
  content = content.replace(
    "import Grid from '@mui/material/Grid2';",
    "import { Grid } from '@mui/material';"
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed: ${file}`);
});

console.log('All Grid imports have been fixed!');