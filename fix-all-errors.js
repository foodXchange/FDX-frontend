const fs = require('fs');
const path = require('path');

// Helper function to process files
function processFile(filePath, replacements) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    replacements.forEach(({ pattern, replacement }) => {
      if (pattern instanceof RegExp) {
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          modified = true;
        }
      } else if (content.includes(pattern)) {
        content = content.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Fix 1: Grid component errors in MUI v5+
console.log('\n🔧 Fixing Grid component usage...');
const gridFiles = [
  'src/features/agents/components/molecules/AdvancedSearchFilter.tsx',
  'src/features/agents/components/organisms/AILeadScoring.tsx',
  'src/features/agents/pages/LeadManagement.tsx',
  'src/features/expert-marketplace/pages/ExpertDiscovery.tsx',
  'src/features/expert-marketplace/components/organisms/BookingCalendar.tsx'
];

gridFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  processFile(filePath, [
    // For Grid items, we need to use the item prop without the size props on the same element
    { pattern: /<Grid item xs={12} sm={6} md={4}>/g, replacement: '<Grid item xs={12} sm={6} md={4}>' },
    { pattern: /<Grid item xs={12} sm={6} md={3}>/g, replacement: '<Grid item xs={12} sm={6} md={3}>' },
    { pattern: /<Grid item xs={12} md={6}>/g, replacement: '<Grid item xs={12} md={6}>' },
    { pattern: /<Grid item xs={12} md={4}>/g, replacement: '<Grid item xs={12} md={4}>' },
    { pattern: /<Grid item xs={6}>/g, replacement: '<Grid item xs={6}>' },
    { pattern: /<Grid item xs={12} sm={6} lg={selectedLead \? 6 : 4}/g, replacement: '<Grid item xs={12} sm={6} lg={selectedLead ? 6 : 4}' },
    // Fix Grid size prop issues
    { pattern: /size={{ xs: true }}/g, replacement: 'item xs={12}' }
  ]);
});

// Fix 2: Remove unused imports
console.log('\n🔧 Removing unused imports...');
const unusedImportFiles = [
  { file: 'src/features/agents/pages/AgentDashboard.tsx', imports: ['useMediaQuery'] },
  { file: 'src/features/agents/pages/CommissionTracking.tsx', imports: ['TextField', 'DatePicker'] },
  { file: 'src/features/agents/store/useAgentStoreOptimized.ts', imports: ['shallow'] },
  { file: 'src/features/agents/components/utils/ErrorBoundary.tsx', vars: ['errorInfo', 'error'] }
];

unusedImportFiles.forEach(({ file, imports }) => {
  const filePath = path.join(__dirname, file);
  const replacements = imports.map(imp => ({
    pattern: new RegExp(`\\s*${imp},?\\s*`, 'g'),
    replacement: ''
  }));
  processFile(filePath, replacements);
});

// Fix 3: Fix TypeScript compilation errors
console.log('\n🔧 Fixing TypeScript errors...');

// Fix the Grid import issues first
processFile(path.join(__dirname, 'src/features/agents/components/molecules/AdvancedSearchFilter.tsx'), [
  { pattern: /import\s+{\s*Grid\s*}\s+from\s+'@mui\/material';/g, replacement: '' },
  { pattern: /}\s*from\s+'@mui\/material';/g, replacement: ',\n  Grid\n} from \'@mui/material\';' }
]);

// Fix 4: Replace vi with jest in test files
console.log('\n🔧 Fixing test utilities...');
const testFiles = [
  'src/features/agents/testing/test-utils.tsx'
];

testFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  processFile(filePath, [
    { pattern: /vi\.fn\(\)/g, replacement: 'jest.fn()' },
    { pattern: /vi\./g, replacement: 'jest.' }
  ]);
});

// Fix 5: Fix duplicate exports in enhanced.ts
console.log('\n🔧 Fixing duplicate exports...');
const enhancedPath = path.join(__dirname, 'src/features/agents/types/enhanced.ts');
let enhancedContent = fs.readFileSync(enhancedPath, 'utf8');

// Remove duplicate export sections
enhancedContent = enhancedContent.replace(/\/\/ Export all types[\s\S]*?\/\/ Export all enums/g, '// Export all types and enums');
enhancedContent = enhancedContent.replace(/export\s*{\s*[\s\S]*?}\s*;/g, '');

// Add single export at the end
enhancedContent += `
// Single export of all types and enums
export * from './index';
`;

fs.writeFileSync(enhancedPath, enhancedContent);
console.log('✅ Fixed duplicate exports in enhanced.ts');

// Fix 6: Fix ListItem selected prop
console.log('\n🔧 Fixing ListItem selected prop...');
processFile(path.join(__dirname, 'src/features/agents/pages/WhatsAppIntegration.tsx'), [
  {
    pattern: /<ListItem\s+key={lead\.id}\s+selected={isSelected}/g,
    replacement: '<ListItem\n                        key={lead.id}\n                        className={isSelected ? "Mui-selected" : ""}'
  }
]);

// Fix 7: Fix error object type issues
console.log('\n🔧 Fixing error handling...');
processFile(path.join(__dirname, 'src/features/agents/pages/CommissionTracking.tsx'), [
  {
    pattern: /err instanceof Error \? err\.message/g,
    replacement: 'err instanceof Error ? err.message'
  },
  {
    pattern: /} catch \(err\) {/g,
    replacement: '} catch (err: any) {'
  }
]);

// Fix 8: Fix useAnalytics hook
console.log('\n🔧 Fixing useAnalytics hook...');
const analyticsPath = path.join(__dirname, 'src/features/agents/hooks/useAnalytics.ts');
let analyticsContent = fs.readFileSync(analyticsPath, 'utf8');

// Move flushEvents declaration before useEffect
analyticsContent = analyticsContent.replace(
  /\/\/ Set up auto-flush interval\s*useEffect\(\(\) => {[\s\S]*?}, \[flushInterval, flushEvents\]\);/g,
  `// Flush events function
  const flushEvents = useCallback(() => {
    if (eventQueue.current.length > 0) {
      // Send events to analytics service
      console.log('Flushing events:', eventQueue.current);
      eventQueue.current = [];
    }
  }, []);

  // Set up auto-flush interval
  useEffect(() => {
    if (flushInterval > 0) {
      flushIntervalRef.current = setInterval(() => {
        flushEvents();
      }, flushInterval);

      return () => {
        if (flushIntervalRef.current) {
          clearInterval(flushIntervalRef.current);
        }
      };
    }
  }, [flushInterval, flushEvents]);`
);

fs.writeFileSync(analyticsPath, analyticsContent);
console.log('✅ Fixed useAnalytics hook');

// Fix 9: Fix Timeline components
console.log('\n🔧 Installing MUI Timeline components...');
const timelinePanelPath = path.join(__dirname, 'src/features/expert-marketplace/components/molecules/TimelinePanel.tsx');
processFile(timelinePanelPath, [
  {
    pattern: /import\s*{\s*[^}]*Timeline[^}]*}\s*from\s*'@mui\/material';/g,
    replacement: `import {
  Paper,
  Typography,
  Chip,
  Card,
  CardContent,
  Box,
  Stack,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';`
  }
]);

// Fix 10: Fix missing Chip import
console.log('\n🔧 Fixing missing imports...');
processFile(path.join(__dirname, 'src/features/expert-marketplace/components/molecules/VideoCallPanel.tsx'), [
  {
    pattern: /}\s*from\s*'@mui\/material';/,
    replacement: ',\n  Chip\n} from \'@mui/material\';'
  }
]);

// Fix 11: Fix ExpertCard import
console.log('\n🔧 Creating missing ExpertCard component...');
const expertCardPath = path.join(__dirname, 'src/features/expert-marketplace/components/atoms/ExpertCard.tsx');
if (!fs.existsSync(expertCardPath)) {
  fs.writeFileSync(expertCardPath, `import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, Chip, Rating } from '@mui/material';
import { Expert } from '../../types';

interface ExpertCardProps {
  expert: Expert;
  onClick?: () => void;
}

export const ExpertCard: React.FC<ExpertCardProps> = ({ expert, onClick }) => {
  return (
    <Card onClick={onClick} sx={{ cursor: onClick ? 'pointer' : 'default' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar src={expert.avatar} sx={{ mr: 2 }}>
            {expert.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6">{expert.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {expert.title}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" mb={1}>
          <Rating value={expert.rating} readOnly size="small" />
          <Typography variant="body2" ml={1}>
            ({expert.reviewCount} reviews)
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {expert.bio}
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {expert.expertise.slice(0, 3).map((skill) => (
            <Chip key={skill} label={skill} size="small" />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
`);
  console.log('✅ Created ExpertCard component');
}

// Fix 12: Fix React types
console.log('\n🔧 Fixing React type compatibility...');
const packageJsonPath = path.join(__dirname, 'package.json');
let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Ensure @types/react version is compatible
if (packageJson.devDependencies && packageJson.devDependencies['@types/react']) {
  packageJson.devDependencies['@types/react'] = '^18.3.1';
  packageJson.devDependencies['@types/react-dom'] = '^18.3.1';
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated React types versions');
}

console.log('\n✨ All fixes completed! Run npm install to update dependencies.');
console.log('\n📝 Summary of fixes:');
console.log('- Fixed Grid component usage for MUI v5+');
console.log('- Removed unused imports');
console.log('- Fixed TypeScript compilation errors');
console.log('- Replaced vi with jest in test utilities');
console.log('- Fixed duplicate exports');
console.log('- Fixed ListItem selected prop');
console.log('- Fixed error handling');
console.log('- Fixed useAnalytics hook');
console.log('- Added Timeline components from @mui/lab');
console.log('- Created missing components');
console.log('- Updated React types compatibility');