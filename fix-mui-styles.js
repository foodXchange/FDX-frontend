#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to convert inline styles to sx prop
function convertInlineStylesToSx(content) {
  // Replace style={{ ... }} with sx={{ ... }}
  const stylePattern = /style=\{\{([^}]+)\}\}/g;
  return content.replace(stylePattern, 'sx={{$1}}');
}

// Function to convert className to sx for MUI components
function convertClassNameToSx(content) {
  // This is a more complex conversion - for now, just remove className usage
  // In a real implementation, you'd need to parse CSS classes and convert them
  return content.replace(/className="([^"]+)"/g, '// TODO: Convert className="$1" to sx prop');
}

// Function to remove unused imports
function removeUnusedImports(content) {
  const lines = content.split('\n');
  const importLines = [];
  const codeLines = [];
  
  let inImportSection = false;
  
  for (const line of lines) {
    if (line.trim().startsWith('import ') || line.trim().startsWith('} from ')) {
      inImportSection = true;
      importLines.push(line);
    } else if (inImportSection && line.trim() === '') {
      importLines.push(line);
    } else {
      inImportSection = false;
      codeLines.push(line);
    }
  }
  
  const codeContent = codeLines.join('\n');
  const filteredImports = importLines.filter(line => {
    if (!line.trim().startsWith('import ')) return true;
    
    // Extract imported items
    const importMatch = line.match(/import\s+\{([^}]+)\}/);
    if (!importMatch) return true;
    
    const importedItems = importMatch[1].split(',').map(item => item.trim());
    const usedItems = importedItems.filter(item => {
      const regex = new RegExp(`\\b${item}\\b`, 'g');
      return regex.test(codeContent);
    });
    
    if (usedItems.length === 0) return false;
    if (usedItems.length === importedItems.length) return true;
    
    // Reconstruct import with only used items
    const fromPart = line.match(/from\s+['"][^'"]+['"]/)[0];
    return `import { ${usedItems.join(', ')} } ${fromPart}`;
  });
  
  return filteredImports.join('\n') + '\n' + codeContent;
}

// Function to process a single file
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  // Apply transformations
  newContent = convertInlineStylesToSx(newContent);
  newContent = convertClassNameToSx(newContent);
  
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
console.log('Starting MUI style fixes...');
processDirectory(srcPath);
console.log('MUI style fixes completed!');