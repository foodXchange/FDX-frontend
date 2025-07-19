const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to get files with the most errors
function getTopErrorFiles() {
  try {
    const output = execSync('npx tsc --noEmit 2>&1', { encoding: 'utf8' });
    const lines = output.split('\n');
    const fileErrorCounts = {};
    
    lines.forEach(line => {
      const match = line.match(/^([^(]+)\(/);
      if (match) {
        const filePath = match[1];
        fileErrorCounts[filePath] = (fileErrorCounts[filePath] || 0) + 1;
      }
    });
    
    // Sort by error count and take top 20
    return Object.entries(fileErrorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([file]) => file);
  } catch (error) {
    console.error('Error getting files:', error.message);
    return [];
  }
}

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let hasChanges = false;

  // Fix 1: Basic syntax errors
  
  // Fix missing closing braces in if statements
  content = content.replace(/if\s*\([^)]+\)\s*\{\s*return\s+[^}]+$/gm, (match) => {
    if (!match.includes('}')) {
      hasChanges = true;
      return match + '\n  }';
    }
    return match;
  });

  // Fix interface property syntax - semicolons to commas, except for last property
  content = content.replace(/(\w+):\s*([^,;\n}]+);(\s*(?:\w+:))/g, (match, prop, value, next) => {
    hasChanges = true;
    return `${prop}: ${value},${next}`;
  });

  // Fix double semicolons
  if (content.includes(';;')) {
    content = content.replace(/;;/g, ';');
    hasChanges = true;
  }

  // Fix malformed arrow functions
  if (content.includes('= >')) {
    content = content.replace(/= >\s*/g, '=> ');
    hasChanges = true;
  }

  // Fix spacing around assignment operators
  content = content.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)=([a-zA-Z_$])/g, '$1 = $2');
  if (content !== originalContent && !hasChanges) hasChanges = true;

  // Fix function parameter syntax (semicolons to commas)
  content = content.replace(/\(([^)]+);\s*([^)]+)\)/g, '($1, $2)');
  if (content !== originalContent && !hasChanges) hasChanges = true;

  // Fix object literal syntax issues
  content = content.replace(/\{\s*([^{}]+):\s*([^{}]+);\s*([^{}]+):\s*([^{}]+)\s*\}/g, 
    '{ $1: $2, $3: $4 }');
  if (content !== originalContent && !hasChanges) hasChanges = true;

  // Fix JSX fragment syntax
  if (content.includes('< />')) {
    content = content.replace(/\<\s*\/\s*\>/g, '</>');
    hasChanges = true;
  }

  // Fix missing return statements in arrow functions
  content = content.replace(/=>\s*\{\s*([^{};]+);\s*\}/g, '=> {\n    return $1;\n  }');
  if (content !== originalContent && !hasChanges) hasChanges = true;

  // Fix missing commas in arrays
  content = content.replace(/\[\s*([^,\]]+)\s+([^,\]]+)\s*\]/g, '[$1, $2]');
  if (content !== originalContent && !hasChanges) hasChanges = true;

  // Fix template literal syntax
  content = content.replace(/`([^`]*?)\$\{([^}]*?)\}([^`]*?)$/gm, (match, before, expr, after) => {
    if (!after.includes('`') && after.length > 0) {
      hasChanges = true;
      return `\`${before}\${${expr}}${after}\``;
    }
    return match;
  });

  // Fix JSX prop syntax
  content = content.replace(/=\s*\{([^}]+)\}\s*([A-Za-z])/g, '={$1} $2');
  if (content !== originalContent && !hasChanges) hasChanges = true;

  // Fix standalone closing braces
  content = content.replace(/^\s*\}\s*$/gm, (match, offset) => {
    // Only remove if it seems orphaned (simple heuristic)
    const beforeContext = content.substring(Math.max(0, offset - 100), offset);
    if (beforeContext.includes('interface ') && !beforeContext.includes('{')) {
      hasChanges = true;
      return '';
    }
    return match;
  });

  // Fix missing opening braces after if/for/while statements
  content = content.replace(/(if|for|while)\s*\([^)]+\)\s*(?!{|\s*{)/g, '$1($2) {');
  if (content !== originalContent && !hasChanges) hasChanges = true;

  return { content, hasChanges };
}

function main() {
  console.log('Getting files with most TypeScript errors...');
  const topErrorFiles = getTopErrorFiles();
  
  if (topErrorFiles.length === 0) {
    console.log('No files with errors found.');
    return;
  }

  console.log(`Processing ${topErrorFiles.length} files with most errors...`);
  let fixedFiles = 0;

  topErrorFiles.forEach(filePath => {
    const fullPath = path.resolve(filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`- Skipping ${filePath} (not found)`);
      return;
    }

    const result = fixFile(fullPath);
    
    if (result && result.hasChanges) {
      try {
        fs.writeFileSync(fullPath, result.content, 'utf8');
        fixedFiles++;
        console.log(`✓ Fixed: ${filePath}`);
      } catch (error) {
        console.log(`✗ Error writing ${filePath}: ${error.message}`);
      }
    } else {
      console.log(`- No changes: ${filePath}`);
    }
  });

  console.log(`\nFixed ${fixedFiles} files.`);
  
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