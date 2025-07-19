const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all TypeScript files
function getAllTSFiles() {
  try {
    const output = execSync('find src -name "*.ts" -o -name "*.tsx" 2>/dev/null || dir /s /b src\\*.ts src\\*.tsx 2>nul', { encoding: 'utf8' });
    return output.split('\n').filter(file => file.trim() && fs.existsSync(file));
  } catch (error) {
    // Fallback for Windows
    const files = [];
    function findFiles(dir) {
      try {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            findFiles(fullPath);
          } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
            files.push(fullPath);
          }
        });
      } catch (e) {
        // Skip directories we can't read
      }
    }
    findFiles('src');
    return files;
  }
}

function fixBasicSyntax(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let hasChanges = false;

    // Skip files that are already clean or too large
    if (content.length > 100000) return false;

    // Fix 1: Basic interface property syntax
    content = content.replace(/(\w+):\s*([^,;\n}]+);(\s*(?:\w+:|}))/g, (match, prop, value, next) => {
      if (!next.trim().startsWith('}')) {
        hasChanges = true;
        return `${prop}: ${value},${next}`;
      }
      return match;
    });

    // Fix 2: Double semicolons
    if (content.includes(';;')) {
      content = content.replace(/;;/g, ';');
      hasChanges = true;
    }

    // Fix 3: Arrow function spacing
    if (content.includes('= >')) {
      content = content.replace(/= >\s*/g, '=> ');
      hasChanges = true;
    }

    // Fix 4: Assignment spacing
    content = content.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)=([a-zA-Z_$])/g, '$1 = $2');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Fix 5: JSX fragment syntax
    if (content.includes('< />')) {
      content = content.replace(/\<\s*\/\s*\>/g, '</>');
      hasChanges = true;
    }

    // Fix 6: Function parameter syntax
    content = content.replace(/\(([^)]+);\s*([^)]+)\)/g, '($1, $2)');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Fix 7: Object literal commas
    content = content.replace(/,\s*,/g, ',');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Fix 8: JSX prop syntax
    content = content.replace(/=\s*\{([^}]+)\}\s*([A-Za-z])/g, '={$1} $2');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Fix 9: Missing spaces after commas
    content = content.replace(/,(\w)/g, ', $1');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Fix 10: Template literal issues (simple cases)
    content = content.replace(/`([^`]*?)\$\{([^}]*?)\}([^`]*?)(?!\`)/gm, (match, before, expr, after) => {
      if (after && !after.includes('`') && after.trim() && after.length < 50) {
        hasChanges = true;
        return `\`${before}\${${expr}}${after}\``;
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

console.log('Finding all TypeScript files...');
const tsFiles = getAllTSFiles();
console.log(`Found ${tsFiles.length} TypeScript files.`);

let fixedCount = 0;

// Process files in batches to avoid overwhelming
const batchSize = 100;
const batches = [];
for (let i = 0; i < tsFiles.length; i += batchSize) {
  batches.push(tsFiles.slice(i, i + batchSize));
}

batches.forEach((batch, batchIndex) => {
  console.log(`Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} files)...`);
  
  batch.forEach(filePath => {
    if (fixBasicSyntax(filePath)) {
      fixedCount++;
      console.log(`✓ Fixed: ${path.relative('.', filePath)}`);
    }
  });
});

console.log(`\nFixed ${fixedCount} files with basic syntax issues.`);

// Check new error count
console.log('\nChecking TypeScript errors after fixes...');
try {
  const output = execSync('npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0"', { 
    encoding: 'utf8',
    timeout: 60000 
  });
  const newErrorCount = parseInt(output.trim());
  console.log(`TypeScript errors after fixes: ${newErrorCount}`);
  
  if (newErrorCount < 2396) {
    console.log(`🎉 Reduced errors by: ${2396 - newErrorCount}`);
  }
} catch (error) {
  console.log('Could not count errors after fixes.');
}