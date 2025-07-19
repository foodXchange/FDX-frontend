const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript files
const getTypeScriptFiles = (dir) => {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...getTypeScriptFiles(fullPath));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
};

const fixSyntaxIssues = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  let fixed = content;
  let hasChanges = false;

  // Fix standalone closing braces that create syntax errors
  if (fixed.includes('\n}\n') && fixed.includes('interface ')) {
    const lines = fixed.split('\n');
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = lines[i + 1];
      
      // Remove standalone closing braces after interface declarations
      if (line.trim() === '}' && nextLine && nextLine.includes('interface ')) {
        hasChanges = true;
        continue;
      }
      
      // Remove standalone closing braces after export statements
      if (line.trim() === '}' && nextLine && nextLine.includes('export ')) {
        hasChanges = true;
        continue;
      }
      
      newLines.push(line);
    }
    
    if (hasChanges) {
      fixed = newLines.join('\n');
    }
  }

  // Fix malformed interface declarations
  fixed = fixed.replace(/interface\s+(\w+)\s*\{\s*\n\s*children\?\s*:\s*React\.ReactNode;\s*\n\s*\}\s*\n\s*\}/g, 
    'interface $1 {\n  children?: React.ReactNode;\n}');

  // Fix malformed function parameters
  fixed = fixed.replace(/\(\s*\{\s*([^}]+)\s*\}\s*\)\s*=>\s*\{\s*\n\s*\}/g, '({ $1 }) => {');

  // Fix malformed JSX syntax
  fixed = fixed.replace(/\}\s*\n\s*\}\s*\n\s*export/g, '}\n\nexport');

  // Fix malformed return statements
  fixed = fixed.replace(/return\s*\(\s*\n\s*<>/g, 'return (\n    <>');

  // Fix malformed async function declarations
  fixed = fixed.replace(/const\s+(\w+)\s*=\s*async\s*\(\s*\)\s*=>\s*\{\s*\n\s*\}/g, 'const $1 = async () => {');

  // Fix malformed destructuring
  fixed = fixed.replace(/const\s*\{\s*([^}]+)\s*\}\s*=\s*([^;]+);\s*\n\s*\}/g, 'const { $1 } = $2;');

  // Fix malformed switch statements
  fixed = fixed.replace(/switch\s*\(\s*([^)]+)\s*\)\s*\{\s*\n\s*case\s*([^:]+):\s*\n\s*return\s*([^;]+);\s*\n\s*\}/g, 
    'switch ($1) {\n      case $2:\n        return $3;\n    }');

  // Fix malformed object properties
  fixed = fixed.replace(/\{\s*([^:]+):\s*([^,}]+),\s*\n\s*\}/g, '{ $1: $2 }');

  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed);
    return true;
  }
  
  return false;
};

// Main execution
const srcDir = path.join(__dirname, 'src');
const files = getTypeScriptFiles(srcDir);

console.log(`Found ${files.length} TypeScript files to check`);

let fixedCount = 0;
const fixedFiles = [];

for (const file of files) {
  try {
    if (fixSyntaxIssues(file)) {
      fixedCount++;
      fixedFiles.push(file);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
}

console.log(`Fixed syntax issues in ${fixedCount} files`);
if (fixedFiles.length > 0) {
  console.log('Fixed files:');
  fixedFiles.forEach(file => console.log(`  - ${file}`));
}