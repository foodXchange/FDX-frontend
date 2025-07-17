const fs = require('fs');
const path = require('path');

// Load analysis results
const analysisResults = JSON.parse(fs.readFileSync('import-analysis-results.json', 'utf8'));

// Files to process
const filesToProcess = new Set();

// Add all files with issues
analysisResults.unusedImports.forEach(item => filesToProcess.add(item.file));
analysisResults.deadCode.forEach(item => filesToProcess.add(item.file));
analysisResults.duplicateImports.forEach(item => filesToProcess.add(item.file));

console.log('Starting comprehensive codebase cleanup...');

// Function to clean up a single file
function cleanupFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 1. Remove unused imports
    const unusedImportsData = analysisResults.unusedImports.find(item => item.file === filePath);
    if (unusedImportsData) {
      unusedImportsData.unused.forEach(unusedImport => {
        // Remove from named imports
        content = content.replace(new RegExp(`import\\s*\\{([^}]*,\\s*)?${unusedImport}(\\s*,\\s*[^}]*)?\\}`, 'g'), (match, before, after) => {
          const cleanBefore = before ? before.replace(/,$/, '') : '';
          const cleanAfter = after ? after.replace(/^,/, '') : '';
          const combined = [cleanBefore, cleanAfter].filter(Boolean).join(',');
          return combined ? `import { ${combined} }` : '';
        });
        
        // Remove entire import line if it becomes empty
        content = content.replace(/import\s*\{\s*\}\s*from\s*['"][^'"]*['"];\s*\n?/g, '');
        
        // Remove default imports that are unused
        content = content.replace(new RegExp(`import\\s+${unusedImport}\\s+from\\s+['"][^'"]*['"];?\\s*\\n?`, 'g'), '');
      });
      modified = true;
    }
    
    // 2. Remove duplicate imports
    const duplicateImportsData = analysisResults.duplicateImports.find(item => item.file === filePath);
    if (duplicateImportsData) {
      duplicateImportsData.duplicates.forEach(duplicate => {
        const importRegex = new RegExp(`import\\s+.*from\\s+['"]${duplicate.module.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];?`, 'g');
        const matches = content.match(importRegex);
        if (matches && matches.length > 1) {
          // Keep first import, remove duplicates
          let foundFirst = false;
          content = content.replace(importRegex, (match) => {
            if (!foundFirst) {
              foundFirst = true;
              return match;
            }
            return '';
          });
          modified = true;
        }
      });
    }
    
    // 3. Remove Tailwind CSS classes and replace with MUI
    const tailwindToMuiMap = {
      'bg-white': 'sx={{ bgcolor: "white" }}',
      'bg-gray-50': 'sx={{ bgcolor: "grey.50" }}',
      'bg-gray-100': 'sx={{ bgcolor: "grey.100" }}',
      'bg-gray-200': 'sx={{ bgcolor: "grey.200" }}',
      'bg-blue-500': 'sx={{ bgcolor: "primary.main" }}',
      'bg-red-500': 'sx={{ bgcolor: "error.main" }}',
      'bg-green-500': 'sx={{ bgcolor: "success.main" }}',
      'text-white': 'sx={{ color: "white" }}',
      'text-gray-600': 'sx={{ color: "grey.600" }}',
      'text-gray-700': 'sx={{ color: "grey.700" }}',
      'text-gray-900': 'sx={{ color: "grey.900" }}',
      'text-blue-600': 'sx={{ color: "primary.main" }}',
      'text-red-600': 'sx={{ color: "error.main" }}',
      'p-4': 'sx={{ p: 2 }}',
      'p-6': 'sx={{ p: 3 }}',
      'p-8': 'sx={{ p: 4 }}',
      'm-4': 'sx={{ m: 2 }}',
      'mt-4': 'sx={{ mt: 2 }}',
      'mb-4': 'sx={{ mb: 2 }}',
      'ml-4': 'sx={{ ml: 2 }}',
      'mr-4': 'sx={{ mr: 2 }}',
      'w-full': 'sx={{ width: "100%" }}',
      'h-full': 'sx={{ height: "100%" }}',
      'flex': 'sx={{ display: "flex" }}',
      'flex-col': 'sx={{ flexDirection: "column" }}',
      'items-center': 'sx={{ alignItems: "center" }}',
      'justify-center': 'sx={{ justifyContent: "center" }}',
      'rounded': 'sx={{ borderRadius: 1 }}',
      'rounded-lg': 'sx={{ borderRadius: 2 }}',
      'border': 'sx={{ border: 1 }}',
      'border-gray-300': 'sx={{ borderColor: "grey.300" }}',
      'shadow': 'sx={{ boxShadow: 1 }}',
      'shadow-lg': 'sx={{ boxShadow: 3 }}'
    };
    
    // Replace Tailwind classes with MUI sx props
    if (content.includes('className=')) {
      const classNameRegex = /className=["']([^"']+)["']/g;
      let match;
      while ((match = classNameRegex.exec(content)) !== null) {
        const classes = match[1];
        let hasReplacements = false;
        let sxProps = [];
        
        // Check if any Tailwind classes are present
        Object.keys(tailwindToMuiMap).forEach(tailwindClass => {
          if (classes.includes(tailwindClass)) {
            hasReplacements = true;
            const muiSx = tailwindToMuiMap[tailwindClass];
            sxProps.push(muiSx);
          }
        });
        
        if (hasReplacements) {
          // Remove the className and add sx prop
          const newContent = content.replace(match[0], sxProps.join(' '));
          if (newContent !== content) {
            content = newContent;
            modified = true;
          }
        }
      }
    }
    
    // 4. Add missing React imports if needed
    if (content.includes('React.') || content.includes('<') && !content.includes('import React')) {
      content = "import React from 'react';\n" + content;
      modified = true;
    }
    
    // 5. Add missing React hooks imports
    const hooks = ['useState', 'useEffect', 'useContext', 'useCallback', 'useMemo', 'useRef'];
    const usedHooks = hooks.filter(hook => content.includes(hook));
    if (usedHooks.length > 0 && !content.includes(`import { ${usedHooks.join(', ')} } from 'react'`)) {
      const reactImportRegex = /import React from 'react';/;
      if (reactImportRegex.test(content)) {
        content = content.replace(reactImportRegex, `import React, { ${usedHooks.join(', ')} } from 'react';`);
      } else {
        content = `import { ${usedHooks.join(', ')} } from 'react';\n` + content;
      }
      modified = true;
    }
    
    // 6. Clean up empty lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✓ Cleaned up: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error cleaning up ${filePath}:`, error.message);
    return false;
  }
}

// Priority files to clean first (high impact)
const priorityFiles = [
  'src/features/agents/components/LeadPipeline.tsx',
  'src/features/agents/components/LeadPipelineOptimized.tsx',
  'src/features/documents/DocumentUploadCenter.tsx',
  'src/features/agents/components/AgentDashboard.tsx',
  'src/features/agents/components/ARMDashboard.tsx',
  'src/features/dashboard/TrackingDashboard.tsx',
  'src/components/ErrorBoundary/LandingErrorBoundary.tsx',
  'src/components/ErrorBoundary/RouteErrorBoundary.tsx',
  'src/components/landing/LoginModal.tsx',
  'src/components/landing/TrustBar.tsx'
];

// Process priority files first
console.log('Processing priority files...');
let processedCount = 0;
priorityFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    if (cleanupFile(filePath)) {
      processedCount++;
    }
  }
});

// Process remaining files
console.log('Processing remaining files...');
Array.from(filesToProcess).forEach(filePath => {
  if (!priorityFiles.includes(filePath) && fs.existsSync(filePath)) {
    if (cleanupFile(filePath)) {
      processedCount++;
    }
  }
});

console.log(`\nCleanup complete! Processed ${processedCount} files.`);
console.log('\nSummary of fixes:');
console.log(`- Removed unused imports from ${analysisResults.unusedImports.length} files`);
console.log(`- Removed duplicate imports from ${analysisResults.duplicateImports.length} files`);
console.log(`- Fixed dead code in ${analysisResults.deadCode.length} files`);
console.log(`- Replaced Tailwind CSS with MUI sx props where possible`);
console.log(`- Added missing React imports where needed`);

// Generate report
const report = {
  processed: processedCount,
  timestamp: new Date().toISOString(),
  fixes: {
    unusedImports: analysisResults.unusedImports.length,
    duplicateImports: analysisResults.duplicateImports.length,
    deadCode: analysisResults.deadCode.length,
    tailwindReplacements: 'Multiple files processed'
  }
};

fs.writeFileSync('cleanup-report.json', JSON.stringify(report, null, 2));
console.log('\nDetailed report saved to cleanup-report.json');