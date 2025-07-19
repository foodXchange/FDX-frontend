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

const fixJSXFragmentErrors = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  let fixed = content;
  let hasChanges = false;

  // Fix malformed JSX fragments
  fixed = fixed.replace(/\<\s*\/\s*\>/g, '</>');
  fixed = fixed.replace(/\<\s*\>/g, '<>');
  
  // Fix malformed closing tags with spaces
  fixed = fixed.replace(/\<\s*\/\s*\>/g, '</>');
  
  // Fix malformed React.Fragment syntax
  fixed = fixed.replace(/<React\.Fragment\s*\/>/g, '<></>');
  
  // Fix specific broken patterns from the error messages
  fixed = fixed.replace(/\<\s*\s*\/\s*\>/g, '</>');
  fixed = fixed.replace(/\<\s*\>\s*\<\s*\/\s*\>/g, '<></>');
  
  // Fix JSX element closing issues
  fixed = fixed.replace(/\<\s*\/\s*([A-Za-z][A-Za-z0-9]*)\s*\>/g, '</$1>');
  
  // Fix malformed fragment expressions
  fixed = fixed.replace(/\{\s*\<\s*\>\s*\}/g, '{<></>}');
  
  // Fix incomplete JSX elements
  fixed = fixed.replace(/\<([A-Za-z][A-Za-z0-9]*)\s*\>\s*\<\s*\/\s*\>/g, '<$1></$1>');
  
  // Fix specific error patterns from the log
  fixed = fixed.replace(/\<\s*\s*\/\s*\>/g, '</>');
  fixed = fixed.replace(/\<\s*\>\s*\<\s*\/\s*\>/g, '<></>');
  
  // Fix closing tags that are malformed
  fixed = fixed.replace(/\<\s*\/([A-Za-z][A-Za-z0-9]*)\s*\>/g, '</$1>');
  
  // Fix self-closing tags
  fixed = fixed.replace(/\<([A-Za-z][A-Za-z0-9]*)\s*\/\s*\>/g, '<$1 />');
  
  // Fix broken JSX attributes
  fixed = fixed.replace(/\s*\/\s*\>/g, ' />');
  
  // Fix specific patterns causing issues
  fixed = fixed.replace(/\<\s*\>\s*\<\s*\>/g, '<>');
  fixed = fixed.replace(/\<\s*\/\s*\>\s*\<\s*\/\s*\>/g, '</>');
  
  // Fix React.Fragment patterns
  fixed = fixed.replace(/\<React\.Fragment\s*\>\s*\<\s*\/React\.Fragment\s*\>/g, '<></>');
  
  // Fix malformed component closing tags
  fixed = fixed.replace(/\<\s*\/([A-Z][A-Za-z0-9]*)\s*\>/g, '</$1>');
  
  // Fix empty JSX expressions
  fixed = fixed.replace(/\{\s*\<\s*\>\s*\<\s*\/\s*\>\s*\}/g, '{<></>}');
  
  // Fix malformed conditional JSX
  fixed = fixed.replace(/\{\s*([^}]+)\s*\?\s*\(\s*\<\s*\>\s*([^<>]+)\s*\<\s*\/\s*\>\s*\)\s*:\s*null\s*\}/g, '{$1 ? (<>$2</>) : null}');
  
  // Fix specific broken patterns
  fixed = fixed.replace(/\<\s*\s*\/\s*\>/g, '</>');
  fixed = fixed.replace(/\<\s*\>\s*\<\s*\/\s*\>/g, '<></>');
  
  // Fix ThemeProvider specific issue
  fixed = fixed.replace(/\<ThemeProvider\s+theme=\{theme\}\s*\>\s*\<\s*\/\s*\>/g, '<ThemeProvider theme={theme}></>');
  
  // Fix component self-closing syntax
  fixed = fixed.replace(/\<([A-Z][A-Za-z0-9]*)\s*\/\s*\>/g, '<$1 />');
  
  // Fix malformed props
  fixed = fixed.replace(/\s*\/\s*\>/g, ' />');
  
  // Fix specific App.tsx issues based on error messages
  fixed = fixed.replace(/\<\s*\/\s*\>\s*\n\s*\)\s*;\s*\n\s*\}/g, '</>\n  );\n}');
  
  // Clean up any remaining malformed patterns
  fixed = fixed.replace(/\<\s*\>\s*\<\s*\>/g, '<>');
  fixed = fixed.replace(/\<\s*\/\s*\>\s*\<\s*\/\s*\>/g, '</>');
  
  // Ensure proper spacing in JSX
  fixed = fixed.replace(/\>\s*\<\s*\>/g, '><>');
  fixed = fixed.replace(/\<\s*\/\s*\>\s*\</g, '</><');
  
  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed);
    hasChanges = true;
  }
  
  return hasChanges;
};

// Main execution
const srcDir = path.join(__dirname, 'src');
const files = getTypeScriptFiles(srcDir);

console.log(`Processing ${files.length} TypeScript files for JSX fragment fixes`);

let fixedCount = 0;
const fixedFiles = [];

for (const file of files) {
  try {
    if (fixJSXFragmentErrors(file)) {
      fixedCount++;
      fixedFiles.push(file);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
}

console.log(`Applied JSX fragment fixes to ${fixedCount} files`);
if (fixedFiles.length > 0) {
  console.log('Fixed files:');
  fixedFiles.slice(0, 10).forEach(file => console.log(`  - ${file}`));
  if (fixedFiles.length > 10) {
    console.log(`  ... and ${fixedFiles.length - 10} more files`);
  }
}