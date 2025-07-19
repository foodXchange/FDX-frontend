const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get list of files with errors from first 200 error lines
function getErrorFiles() {
  try {
    const output = execSync('npx tsc --noEmit 2>&1 | head -200', { encoding: 'utf8' });
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

function fixSpecificPatterns(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let hasChanges = false;

    // Skip very large files
    if (content.length > 150000) return false;

    // Pattern 1: Fix ';' expected errors - missing semicolons
    content = content.replace(/(\w+)\s*=\s*([^;,\n}]+)(\s*\n|\s*$)/g, (match, varName, value, ending) => {
      if (!value.includes(';') && !value.endsWith(';') && !ending.includes(';')) {
        hasChanges = true;
        return `${varName} = ${value};${ending}`;
      }
      return match;
    });

    // Pattern 2: Fix object property ending with semicolon instead of comma
    content = content.replace(/(\w+):\s*([^,;}\n]+);(\s*\w+\s*:)/g, '$1: $2,$3');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Pattern 3: Fix function parameters with semicolons instead of commas
    content = content.replace(/\(([^)]+);\s*([^)]+)\)/g, '($1, $2)');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Pattern 4: Fix 'if' is not allowed as variable name - likely malformed code
    content = content.replace(/(\w+)\s+if\s*=\s*/g, '$1 = ');
    content = content.replace(/(\w+)\s+return\s*=\s*/g, '$1 = ');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Pattern 5: Fix Expression expected errors - missing operators
    content = content.replace(/(\w+)\s+(\w+)(?=\s*[;,\n}])/g, '$1, $2');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Pattern 6: Fix missing commas in arrays and objects
    content = content.replace(/(\w+:\s*[^,}\n]+)\s+(\w+:)/g, '$1, $2');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Pattern 7: Fix malformed JSX prop syntax
    content = content.replace(/(\w+)=\{([^}]+)\}\s*(\w+)=/g, '$1={$2} $3=');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Pattern 8: Fix double commas
    content = content.replace(/,,+/g, ',');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Pattern 9: Fix trailing semicolons in arrays
    content = content.replace(/\[([^\]]*);([^\]]*)\]/g, '[$1,$2]');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Pattern 10: Fix import statement issues
    content = content.replace(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?\s*import/g, 
      (match, imports, from) => {
        hasChanges = true;
        return `import { ${imports.trim()} } from '${from}';\nimport`;
      });

    // Pattern 11: Fix incomplete object destructuring
    content = content.replace(/const\s*\{\s*\}\s*=\s*([^;]+)\s*\n/g, 'const {} = $1;\n');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Pattern 12: Fix space issues in object properties
    content = content.replace(/\{\s*([^}]+)\s*\}/g, (match, props) => {
      if (props.length < 200) { // Only fix small objects
        let fixed = props.replace(/\s*,\s*/g, ', ').replace(/\s*:\s*/g, ': ');
        if (fixed !== props) {
          hasChanges = true;
          return `{ ${fixed} }`;
        }
      }
      return match;
    });

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

console.log('\nProcessing error files...');

errorFiles.forEach((filePath, index) => {
  console.log(`${index + 1}/${errorFiles.length}: ${path.relative('.', filePath)}`);
  
  if (fixSpecificPatterns(filePath)) {
    fixedCount++;
    console.log(`  ✓ Applied specific error fixes`);
  } else {
    console.log(`  - No fixes needed`);
  }
});

console.log(`\n=== Specific Error Fixes Complete ===`);
console.log(`Files processed: ${errorFiles.length}`);
console.log(`Files modified: ${fixedCount}`);

// Check new error count
console.log('\nChecking TypeScript errors after specific fixes...');
try {
  const output = execSync('npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0"', { 
    encoding: 'utf8',
    timeout: 120000 
  });
  const newErrorCount = parseInt(output.trim());
  console.log(`TypeScript errors after fixes: ${newErrorCount}`);
  
  if (newErrorCount < 2064) {
    console.log(`🎉 Reduced errors by: ${2064 - newErrorCount}`);
  }
} catch (error) {
  console.log('Could not count errors after fixes.');
}