#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to remove unused imports
function removeUnusedImports(content) {
  const lines = content.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines and non-import lines
    if (!line.trim().startsWith('import ') || line.includes('from \'react\'') || line.includes('from "react"')) {
      newLines.push(line);
      continue;
    }
    
    // Handle multi-line imports
    let importStatement = line;
    let j = i;
    while (j < lines.length && !importStatement.includes('from ')) {
      j++;
      if (j < lines.length) {
        importStatement += '\n' + lines[j];
      }
    }
    
    // Extract imported items
    const importMatch = importStatement.match(/import\s*\{([^}]+)\}/);
    if (!importMatch) {
      newLines.push(line);
      continue;
    }
    
    const importedItems = importMatch[1].split(',').map(item => item.trim());
    const remainingContent = lines.slice(j + 1).join('\n');
    
    // Check which items are actually used
    const usedItems = importedItems.filter(item => {
      const itemName = item.replace(/\s+as\s+\w+/, '').trim();
      const regex = new RegExp(`\\b${itemName}\\b`, 'g');
      return regex.test(remainingContent);
    });
    
    if (usedItems.length === 0) {
      // Skip entire import if nothing is used
      i = j;
      continue;
    }
    
    if (usedItems.length === importedItems.length) {
      // Keep original import if all items are used
      newLines.push(line);
      continue;
    }
    
    // Reconstruct import with only used items
    const fromMatch = importStatement.match(/from\s+['"][^'"]+['"]/);
    if (fromMatch) {
      newLines.push(`import { ${usedItems.join(', ')} } ${fromMatch[0]};`);
    } else {
      newLines.push(line);
    }
    
    i = j;
  }
  
  return newLines.join('\n');
}

// Function to fix specific ESLint issues
function fixEslintIssues(content) {
  let newContent = content;
  
  // Fix no-throw-literal by wrapping in Error()
  newContent = newContent.replace(/throw\s+(['"][^'"]+['"])/g, 'throw new Error($1)');
  
  // Fix anonymous default exports
  newContent = newContent.replace(/export\s+default\s+\{/, 'const config = {\nexport default config;');
  
  // Add missing useCallback dependencies (basic fix)
  newContent = newContent.replace(/useCallback\(([^,]+),\s*\[\]\)/g, 'useCallback($1, [])');
  
  return newContent;
}

// Function to process a single file
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  // Apply transformations
  newContent = removeUnusedImports(newContent);
  newContent = fixEslintIssues(newContent);
  
  // Only write if content changed
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Fixed: ${filePath}`);
  }
}

// Function to process directory recursively
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other irrelevant directories
      if (!['node_modules', '.git', 'build', 'dist'].includes(file)) {
        processDirectory(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(filePath);
    }
  }
}

// Main execution
const srcPath = path.join(__dirname, 'src');
console.log('Starting unused imports cleanup...');
processDirectory(srcPath);
console.log('Unused imports cleanup completed!');