const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getFilesWithErrors() {
  try {
    const output = execSync('npx tsc --noEmit 2>&1', { encoding: 'utf8' });
    const lines = output.split('\n');
    const files = new Set();
    
    lines.forEach(line => {
      const match = line.match(/^([^(]+)\(/);
      if (match) {
        files.add(match[1]);
      }
    });
    
    return Array.from(files).slice(0, 50); // Limit to first 50 files to avoid overwhelming
  } catch (error) {
    console.error('Error getting TypeScript errors:', error.message);
    return [];
  }
}

function fixCommonPatterns(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let hasChanges = false;

  // Fix 1: Missing closing braces for if statements
  content = content.replace(/if\s*\([^)]+\)\s*\{\s*return\s+[^;]+;\s*return\s+/g, (match) => {
    hasChanges = true;
    return match.replace(/;\s*return\s+/, ';\n  }\n  return ');
  });

  // Fix 2: Semicolons instead of commas in object properties
  content = content.replace(/(\w+):\s*([^,\n}]*);(\s*(?:\w+:|}))/g, (match, prop, value, next) => {
    if (!next.trim().startsWith('}')) {
      hasChanges = true;
      return `${prop}: ${value},${next}`;
    }
    return match;
  });

  // Fix 3: Double semicolons
  content = content.replace(/;;/g, ';');
  if (content !== originalContent && !hasChanges) hasChanges = true;

  // Fix 4: Malformed arrow functions
  content = content.replace(/= >\s*\(/g, '=> (');
  content = content.replace(/= >\s*\{/g, '=> {');
  if (content !== originalContent && !hasChanges) hasChanges = true;

  // Fix 5: Missing spaces around operators
  content = content.replace(/=useLocation\(\)/g, '= useLocation()');
  content = content.replace(/=this\./g, '= this.');
  if (content !== originalContent && !hasChanges) hasChanges = true;

  // Fix 6: Missing commas in arrays and function parameters
  content = content.replace(/(\w+): (\w+|\d+)\s+(\w+):/g, '$1: $2, $3:');
  if (content !== originalContent && !hasChanges) hasChanges = true;

  // Fix 7: Template literal issues (fix simple cases only)
  content = content.replace(/`([^`]*?)\$\{([^}]*?)\}([^`]*?)$/gm, (match, before, expr, after) => {
    if (!after.includes('`')) {
      hasChanges = true;
      return `\`${before}\${${expr}}${after}\``;
    }
    return match;
  });

  // Fix 8: Fix function parameter syntax
  content = content.replace(/\(([^)]+); ([^)]+)\)/g, '($1, $2)');
  if (content !== originalContent && !hasChanges) hasChanges = true;

  // Fix 9: Fix spacing in JSX props
  content = content.replace(/=\s*\{([^}]+)\s*\}([A-Za-z])/g, '={$1} $2');
  if (content !== originalContent && !hasChanges) hasChanges = true;

  // Fix 10: Fix missing closing braces in object literals
  const bracePattern = /\{\s*([^{}]+):\s*([^{}]+),?\s*$/gm;
  content = content.replace(bracePattern, (match) => {
    if (!match.includes('}')) {
      hasChanges = true;
      return match.trim() + '\n}';
    }
    return match;
  });

  return { content, hasChanges };
}

function main() {
  console.log('Getting files with TypeScript errors...');
  const filesWithErrors = getFilesWithErrors();
  
  if (filesWithErrors.length === 0) {
    console.log('No TypeScript errors found or unable to get error list.');
    return;
  }

  console.log(`Found ${filesWithErrors.length} files with errors. Processing...`);
  let fixedFiles = 0;

  filesWithErrors.forEach(filePath => {
    const fullPath = path.resolve(filePath);
    const result = fixCommonPatterns(fullPath);
    
    if (result && result.hasChanges) {
      try {
        fs.writeFileSync(fullPath, result.content, 'utf8');
        fixedFiles++;
        console.log(`✓ Fixed: ${filePath}`);
      } catch (error) {
        console.log(`✗ Error writing ${filePath}: ${error.message}`);
      }
    }
  });

  console.log(`\nFixed ${fixedFiles} files with common pattern issues.`);
  
  // Check new error count
  try {
    const output = execSync('npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0"', { encoding: 'utf8' });
    const errorCount = parseInt(output.trim());
    console.log(`TypeScript errors after fixes: ${errorCount}`);
  } catch (error) {
    console.log('Could not count errors after fixes.');
  }
}

main();