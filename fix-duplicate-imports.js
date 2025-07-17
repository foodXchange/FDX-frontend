const fs = require('fs');
const path = require('path');

// Function to fix duplicate React imports
function fixDuplicateReactImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const reactImportLines = [];
    const otherLines = [];
    
    // Separate React imports from other lines
    lines.forEach((line, index) => {
      if (line.trim().startsWith('import React')) {
        reactImportLines.push({ line, index });
      } else {
        otherLines.push({ line, index });
      }
    });
    
    // If there are multiple React imports, consolidate them
    if (reactImportLines.length > 1) {
      console.log(`Fixing duplicate React imports in: ${filePath}`);
      
      // Extract all React imports
      const reactImports = new Set();
      let hasDefaultReact = false;
      
      reactImportLines.forEach(({ line }) => {
        // Check for default React import
        if (line.includes('import React from')) {
          hasDefaultReact = true;
        }
        
        // Extract named imports
        const namedImportMatch = line.match(/import\s+(?:React,\s*)?\{\s*([^}]+)\s*\}\s+from\s+['"]react['"]/);
        if (namedImportMatch) {
          const namedImports = namedImportMatch[1].split(',').map(imp => imp.trim());
          namedImports.forEach(imp => reactImports.add(imp));
        }
        
        // Extract React with named imports
        const reactWithNamedMatch = line.match(/import\s+React,\s*\{\s*([^}]+)\s*\}\s+from\s+['"]react['"]/);
        if (reactWithNamedMatch) {
          hasDefaultReact = true;
          const namedImports = reactWithNamedMatch[1].split(',').map(imp => imp.trim());
          namedImports.forEach(imp => reactImports.add(imp));
        }
      });
      
      // Build the consolidated import
      let consolidatedImport = '';
      if (hasDefaultReact && reactImports.size > 0) {
        consolidatedImport = `import React, { ${Array.from(reactImports).join(', ')} } from 'react';`;
      } else if (hasDefaultReact) {
        consolidatedImport = `import React from 'react';`;
      } else if (reactImports.size > 0) {
        consolidatedImport = `import { ${Array.from(reactImports).join(', ')} } from 'react';`;
      }
      
      // Reconstruct the file
      const newLines = [];
      let reactImportAdded = false;
      
      lines.forEach((line, index) => {
        if (line.trim().startsWith('import React')) {
          // Skip duplicate React imports, add consolidated one only once
          if (!reactImportAdded && consolidatedImport) {
            newLines.push(consolidatedImport);
            reactImportAdded = true;
          }
        } else {
          newLines.push(line);
        }
      });
      
      // Write the fixed content
      fs.writeFileSync(filePath, newLines.join('\n'));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Get all TypeScript/React files
function getAllFiles() {
  const { execSync } = require('child_process');
  const files = execSync('find src -type f -name "*.tsx" -o -name "*.ts" | grep -E "(components|features|services|hooks|utils)"', { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(f => f.length > 0);
  return files;
}

// Main execution
console.log('Fixing duplicate React imports...');
const files = getAllFiles();
let fixedCount = 0;

files.forEach(file => {
  if (fixDuplicateReactImports(file)) {
    fixedCount++;
  }
});

console.log(`Fixed duplicate React imports in ${fixedCount} files.`);