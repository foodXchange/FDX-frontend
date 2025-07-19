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

const fixTypeScriptErrors = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  let fixed = content;
  let hasChanges = false;

  // Fix Grid2 import issues
  if (fixed.includes('Grid2 as Grid')) {
    fixed = fixed.replace(/import\s*\{\s*([^}]*),?\s*Grid2\s+as\s+Grid\s*([^}]*)\s*\}\s*from\s*'@mui\/material'/g, 
      "import { $1 Grid $2 } from '@mui/material'");
    hasChanges = true;
  }

  // Fix size prop issues in Grid components
  fixed = fixed.replace(/size=\{\{\s*xs:\s*(\d+),?\s*sm:\s*(\d+),?\s*md:\s*(\d+),?\s*lg:\s*(\d+),?\s*xl:\s*(\d+)\s*\}\}/g, 
    'xs={$1} sm={$2} md={$3} lg={$4} xl={$5}');
  fixed = fixed.replace(/size=\{\{\s*xs:\s*(\d+),?\s*sm:\s*(\d+),?\s*md:\s*(\d+),?\s*lg:\s*(\d+)\s*\}\}/g, 
    'xs={$1} sm={$2} md={$3} lg={$4}');
  fixed = fixed.replace(/size=\{\{\s*xs:\s*(\d+),?\s*sm:\s*(\d+),?\s*md:\s*(\d+)\s*\}\}/g, 
    'xs={$1} sm={$2} md={$3}');
  fixed = fixed.replace(/size=\{\{\s*xs:\s*(\d+),?\s*md:\s*(\d+)\s*\}\}/g, 
    'xs={$1} md={$2}');
  fixed = fixed.replace(/size=\{\{\s*xs:\s*(\d+)\s*\}\}/g, 'xs={$1}');

  // Fix malformed JSX fragments
  fixed = fixed.replace(/\<\>\s*\n\s*\<\>/g, '<>');
  fixed = fixed.replace(/\<\/\>\s*\n\s*\<\/\>/g, '</>');

  // Fix malformed type annotations
  fixed = fixed.replace(/:\s*\{([^}]+)\}\s*=>\s*\{/g, ': ({ $1 }) => {');

  // Fix malformed object destructuring
  fixed = fixed.replace(/const\s*\{\s*([^}]+)\s*\}\s*=\s*([^;]+);\s*\n\s*\{/g, 'const { $1 } = $2;');

  // Fix malformed export statements
  fixed = fixed.replace(/export\s*\{\s*([^}]+)\s*\}\s*;?\s*\n\s*\}/g, 'export { $1 };');

  // Fix malformed function declarations
  fixed = fixed.replace(/const\s+(\w+)\s*=\s*\(\s*([^)]*)\s*\)\s*:\s*([^=]+)\s*=>\s*\{/g, 
    'const $1 = ($2): $3 => {');

  // Fix malformed interface declarations
  fixed = fixed.replace(/interface\s+(\w+)\s*\{\s*([^}]+)\s*\}\s*\n\s*\}/g, 
    'interface $1 {\n  $2\n}');

  // Fix malformed arrow functions
  fixed = fixed.replace(/\(\s*([^)]+)\s*\)\s*=>\s*\(\s*\n/g, '($1) => (\n');

  // Fix malformed return statements
  fixed = fixed.replace(/return\s*\(\s*\n\s*\<([^>]+)\>/g, 'return (\n    <$1>');

  // Fix malformed JSX attributes
  fixed = fixed.replace(/\s+([a-zA-Z]+)=\{([^}]+)\}\s*\n\s*\}/g, ' $1={$2}');

  // Fix malformed conditional expressions
  fixed = fixed.replace(/\?\s*\(\s*\n\s*\<([^>]+)\>/g, '? (\n      <$1>');

  // Fix malformed map functions
  fixed = fixed.replace(/\.map\(\s*\(([^)]+)\)\s*=>\s*\(\s*\n/g, '.map(($1) => (');

  // Fix malformed useState hooks
  fixed = fixed.replace(/const\s*\[([^,]+),\s*([^\]]+)\]\s*=\s*React\.useState\s*\<([^>]+)\>\s*\(\s*([^)]+)\s*\)\s*;\s*\n\s*\}/g, 
    'const [$1, $2] = React.useState<$3>($4);');

  // Fix malformed useEffect hooks
  fixed = fixed.replace(/React\.useEffect\s*\(\s*\(\s*\)\s*=>\s*\{\s*([^}]+)\s*\}\s*,\s*\[([^\]]*)\]\s*\)\s*;\s*\n\s*\}/g, 
    'React.useEffect(() => {\n    $1\n  }, [$2]);');

  // Fix malformed switch statements
  fixed = fixed.replace(/switch\s*\(\s*([^)]+)\s*\)\s*\{\s*([^}]+)\s*\}\s*\n\s*\}/g, 
    'switch ($1) {\n    $2\n  }');

  // Fix malformed try-catch blocks
  fixed = fixed.replace(/try\s*\{\s*([^}]+)\s*\}\s*catch\s*\(\s*([^)]+)\s*\)\s*\{\s*([^}]+)\s*\}\s*\n\s*\}/g, 
    'try {\n    $1\n  } catch ($2) {\n    $3\n  }');

  // Fix malformed async/await
  fixed = fixed.replace(/const\s+(\w+)\s*=\s*async\s*\(\s*([^)]*)\s*\)\s*:\s*Promise\<([^>]+)\>\s*=>\s*\{/g, 
    'const $1 = async ($2): Promise<$3> => {');

  // Fix malformed class methods
  fixed = fixed.replace(/(\w+)\s*\(\s*([^)]*)\s*\)\s*:\s*([^{]+)\s*\{\s*([^}]+)\s*\}\s*\n\s*\}/g, 
    '$1($2): $3 {\n    $4\n  }');

  // Fix malformed template literals
  fixed = fixed.replace(/\$\{([^}]+)\}\s*\n\s*\}/g, '${$1}');

  // Fix malformed optional chaining
  fixed = fixed.replace(/\?\.\s*\n\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g, '?.$1');

  // Fix malformed spread operators
  fixed = fixed.replace(/\.\.\.\s*\n\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g, '...$1');

  // Fix malformed generic types
  fixed = fixed.replace(/\<([^>]+)\>\s*\n\s*\(/g, '<$1>(');

  // Fix malformed component props
  fixed = fixed.replace(/\{\s*([^}]+)\s*\}\s*:\s*([^=]+)\s*=>\s*\{/g, '({ $1 }: $2) => {');

  // Fix malformed import statements
  fixed = fixed.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*'([^']+)';\s*\n\s*\}/g, 
    'import { $1 } from \'$2\';');

  // Fix malformed export default
  fixed = fixed.replace(/export\s*default\s*([^;]+);\s*\n\s*\}/g, 'export default $1;');

  // Fix malformed JSX self-closing tags
  fixed = fixed.replace(/\<([a-zA-Z]+)([^>]*)\s*\>\s*\<\/\1\>/g, '<$1$2 />');

  // Fix malformed CSS-in-JS objects
  fixed = fixed.replace(/sx=\{\{\s*([^}]+)\s*\}\}\s*\n\s*\}/g, 'sx={{ $1 }}');

  // Fix malformed event handlers
  fixed = fixed.replace(/onClick=\{\s*\(\s*([^)]*)\s*\)\s*=>\s*\{\s*([^}]+)\s*\}\s*\}\s*\n\s*\}/g, 
    'onClick={($1) => { $2 }}');

  // Fix malformed conditional rendering
  fixed = fixed.replace(/\{\s*([^&]+)\s*&&\s*\(\s*\n\s*\<([^>]+)\>/g, '{$1 && (\n      <$2>');

  // Fix malformed array methods
  fixed = fixed.replace(/\.(filter|map|reduce|forEach)\s*\(\s*\(([^)]+)\)\s*=>\s*\{\s*([^}]+)\s*\}\s*\)\s*\n\s*\}/g, 
    '.$1(($2) => {\n    $3\n  })');

  // Fix malformed object methods
  fixed = fixed.replace(/(\w+):\s*\(\s*([^)]*)\s*\)\s*=>\s*\{\s*([^}]+)\s*\}\s*,?\s*\n\s*\}/g, 
    '$1: ($2) => {\n    $3\n  },');

  // Fix malformed React hooks
  fixed = fixed.replace(/(use\w+)\s*\(\s*([^)]*)\s*\)\s*\n\s*\}/g, '$1($2)');

  // Fix malformed type assertions
  fixed = fixed.replace(/\(([^)]+)\s+as\s+([^)]+)\)\s*\n\s*\}/g, '($1 as $2)');

  // Fix malformed nullable types
  fixed = fixed.replace(/:\s*([^|]+)\s*\|\s*null\s*\|\s*undefined\s*\n\s*\}/g, ': $1 | null | undefined');

  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed);
    return true;
  }
  
  return false;
};

// Main execution
const srcDir = path.join(__dirname, 'src');
const files = getTypeScriptFiles(srcDir);

console.log(`Found ${files.length} TypeScript files to process`);

let fixedCount = 0;
const fixedFiles = [];

for (const file of files) {
  try {
    if (fixTypeScriptErrors(file)) {
      fixedCount++;
      fixedFiles.push(file);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
}

console.log(`Applied comprehensive TypeScript fixes to ${fixedCount} files`);
if (fixedFiles.length > 0) {
  console.log('Fixed files:');
  fixedFiles.slice(0, 10).forEach(file => console.log(`  - ${file}`));
  if (fixedFiles.length > 10) {
    console.log(`  ... and ${fixedFiles.length - 10} more files`);
  }
}