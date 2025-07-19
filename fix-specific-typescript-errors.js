const fs = require('fs');
const path = require('path');

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

const fixSpecificErrors = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  let fixed = content;
  let hasChanges = false;

  // Fix semicolon issues in object/interface definitions
  fixed = fixed.replace(/;\s*\n\s*\}/g, '\n}');
  
  // Fix malformed JSX variable placeholders
  fixed = fixed.replace(/\{\$1\}/g, '{message.id}');
  
  // Fix malformed semicolons in JSX attributes
  fixed = fixed.replace(/color="[^"]*";\s*\n/g, (match) => match.replace(';', ''));
  
  // Fix malformed import statements (remove line breaks)
  fixed = fixed.replace(/import\s*\{([^}]*)\}\s*from\s*'([^']*)'\s*;import\s*\{([^}]*)\}\s*from\s*'([^']*)'\s*;/g, 
    'import { $1 } from \'$2\';\nimport { $3 } from \'$4\';');
  
  // Fix malformed Grid size props
  fixed = fixed.replace(/Grid2\s+as\s+Grid/g, 'Grid');
  
  // Fix closing tags without proper spacing
  fixed = fixed.replace(/\s*\/\s*>/g, ' />');
  
  // Fix malformed conditional JSX
  fixed = fixed.replace(/\s*&&\s*\(\s*\n\s*</g, ' && (\n      <');
  
  // Fix malformed arrow functions in JSX
  fixed = fixed.replace(/\(\s*\)\s*=>\s*\{\s*\n\s*\}/g, '() => {}');
  
  // Fix malformed object property separators
  fixed = fixed.replace(/;\s*\n\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, ',\n    $1:');
  
  // Fix malformed template literals
  fixed = fixed.replace(/\$\{([^}]*)\}\s*;\s*\n/g, '${$1}');
  
  // Fix malformed function calls
  fixed = fixed.replace(/\(\s*\{\s*([^}]*)\s*\}\s*\)\s*=>\s*\{\s*;\s*\n/g, '({ $1 }) => {');
  
  // Fix malformed type annotations
  fixed = fixed.replace(/:\s*([^;]+)\s*;\s*\n\s*\}/g, ': $1\n}');
  
  // Fix malformed JSX fragments
  fixed = fixed.replace(/<>\s*\n\s*<>/g, '<>');
  fixed = fixed.replace(/<\/>\s*\n\s*<\/>/g, '</>');
  
  // Fix malformed React.Fragment syntax
  fixed = fixed.replace(/<React\.Fragment\s*key=\{\$1\}>/g, '<React.Fragment key={message.id}>');
  
  // Fix malformed switch statements
  fixed = fixed.replace(/switch\s*\(\s*([^)]+)\s*\)\s*\{\s*;\s*\n/g, 'switch ($1) {\n');
  
  // Fix malformed return statements
  fixed = fixed.replace(/return\s*\(\s*\n\s*\<([^>]+)\>\s*\n\s*\)/g, 'return (\n      <$1>\n    )');
  
  // Fix malformed ListItemText closing tags
  fixed = fixed.replace(/\/\s*\/>/g, ' />');
  
  // Fix malformed sx prop objects
  fixed = fixed.replace(/sx=\{\s*\{\s*([^}]*)\s*\}\s*\}\s*\n\s*\>/g, 'sx={{ $1 }}>');
  
  // Fix progress property syntax error (semicolon instead of comma)
  fixed = fixed.replace(/progress:\s*35;\s*\n\s*\}/g, 'progress: 35\n  }');
  
  // Fix malformed if statements
  fixed = fixed.replace(/\s*&&\s*\(\s*\n\s*\<([^>]+)\>\s*\n\s*\</g, ' && (\n      <$1>\n        <');
  
  // Fix malformed boolean checks
  fixed = fixed.replace(/\s*\&\&\s*\(\s*\n\s*\<([^>]+)\>/g, ' && (\n      <$1>');
  
  // Fix semicolon ending on object properties
  fixed = fixed.replace(/(\w+):\s*([^;,}]+);\s*\n\s*\}/g, '$1: $2\n}');
  
  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed);
    hasChanges = true;
  }
  
  return hasChanges;
};

// Main execution
const srcDir = path.join(__dirname, 'src');
const files = getTypeScriptFiles(srcDir);

console.log(`Processing ${files.length} TypeScript files for specific error fixes`);

let fixedCount = 0;
const fixedFiles = [];

for (const file of files) {
  try {
    if (fixSpecificErrors(file)) {
      fixedCount++;
      fixedFiles.push(file);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
}

console.log(`Applied specific TypeScript fixes to ${fixedCount} files`);
if (fixedFiles.length > 0) {
  console.log('Fixed files:');
  fixedFiles.slice(0, 10).forEach(file => console.log(`  - ${file}`));
  if (fixedFiles.length > 10) {
    console.log(`  ... and ${fixedFiles.length - 10} more files`);
  }
}