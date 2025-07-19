const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get files with TypeScript errors from sample
function getErrorFiles() {
  try {
    const output = execSync('npx tsc --noEmit 2>&1 | head -100', { encoding: 'utf8' });
    const lines = output.split('\n');
    const fileSet = new Set();
    
    lines.forEach(line => {
      const match = line.match(/^([^(]+\.tsx?)\(/);
      if (match) {
        fileSet.add(match[1]);
      }
    });
    
    return Array.from(fileSet);
  } catch (error) {
    return [];
  }
}

function fixConservativePatterns(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let hasChanges = false;

    // Skip very large files
    if (content.length > 100000) return false;

    // Pattern 1: Fix missing semicolons after interface/type definitions
    content = content.replace(/^(\s*export\s+(?:interface|type)\s+\w+[^{]*\{[^}]*\})\s*$/gm, '$1;');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Pattern 2: Fix trailing commas in interface properties (very conservative)
    content = content.replace(/(\w+:\s*[^;,\n}]+);(\s*\n\s*\})/g, '$1$2');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Pattern 3: Fix double commas
    content = content.replace(/,,+/g, ',');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Pattern 4: Fix space after import { (conservative)
    content = content.replace(/import\s*\{\s*([^}]+)\s*\}\s*from/g, (match, imports) => {
      const cleanImports = imports.trim().replace(/\s*,\s*/g, ', ');
      if (cleanImports !== imports.trim()) {
        hasChanges = true;
        return `import { ${cleanImports} } from`;
      }
      return match;
    });

    // Pattern 5: Fix missing spaces around JSX props (conservative)
    content = content.replace(/(\w+)=\{([^}]+)\}(\w)/g, '$1={$2} $3');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Pattern 6: Fix obvious typos in JSX fragments
    content = content.replace(/<\s*\/\s*>/g, '</>');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Pattern 7: Fix useState destructuring syntax
    content = content.replace(/const\s*\[\s*([^,\]]+)\s*,?\s*\]\s*=/g, 'const [$1,');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Pattern 8: Fix React.FC syntax (add missing semicolon)
    content = content.replace(/(\w+):\s*React\.FC<([^>]*)>\s*=\s*\(/g, '$1: React.FC<$2> = (');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Pattern 9: Fix missing return statement syntax
    content = content.replace(/return\s*\n\s*\(/g, 'return (');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Pattern 10: Fix missing spaces in object property syntax
    content = content.replace(/(\w+):\{/g, '$1: {');
    content = content.replace(/\{(\w+):/g, '{ $1:');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Write the file if it changed
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.log(`Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

console.log('Finding files with TypeScript errors...');
const errorFiles = getErrorFiles();

if (errorFiles.length === 0) {
  console.log('No TypeScript error files found.');
  process.exit(0);
}

console.log(`Found ${errorFiles.length} files with TypeScript errors.`);

let fixedCount = 0;

console.log('\nProcessing error files with conservative fixes...');

errorFiles.forEach((filePath, index) => {
  console.log(`${index + 1}/${errorFiles.length}: ${path.relative('.', filePath)}`);
  
  if (fixConservativePatterns(filePath)) {
    fixedCount++;
    console.log(`  ✓ Applied conservative fixes`);
  } else {
    console.log(`  - No fixes needed`);
  }
});

console.log(`\n=== Conservative Fixes Complete ===`);
console.log(`Files processed: ${errorFiles.length}`);
console.log(`Files modified: ${fixedCount}`);

// Check new error count
console.log('\nChecking TypeScript errors after conservative fixes...');
try {
  const output = execSync('npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0"', { 
    encoding: 'utf8',
    timeout: 120000 
  });
  const newErrorCount = parseInt(output.trim());
  console.log(`TypeScript errors after fixes: ${newErrorCount}`);
  
  if (newErrorCount < 2030) {
    console.log(`🎉 Reduced errors by: ${2030 - newErrorCount}`);
  } else if (newErrorCount > 2030) {
    console.log(`⚠️  Error count increased by: ${newErrorCount - 2030} - consider reverting changes`);
  } else {
    console.log(`No change in error count`);
  }
} catch (error) {
  console.log('Could not count errors after fixes.');
}