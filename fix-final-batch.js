const fs = require('fs');
const { execSync } = require('child_process');

// Get files with TypeScript errors
function getTopErrorFiles() {
  try {
    const output = execSync('npx tsc --noEmit 2>&1', { encoding: 'utf8' });
    const lines = output.split('\n').slice(0, 500); // Only process first 500 error lines
    const fileSet = new Set();
    
    lines.forEach(line => {
      const match = line.match(/^([^(]+)\.tsx?\(/);
      if (match) {
        fileSet.add(match[1] + (line.includes('.tsx') ? '.tsx' : '.ts'));
      }
    });
    
    return Array.from(fileSet).slice(0, 30); // Process top 30 files
  } catch (error) {
    return [];
  }
}

function fixFileBasic(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let hasChanges = false;

  // Fix 1: Basic syntax patterns
  const fixes = [
    // Fix semicolons to commas in object/interface properties
    [/(\w+):\s*([^,;\n}]+);(\s*(?:\w+:|}))/g, (match, prop, value, next) => {
      if (!next.trim().startsWith('}')) {
        hasChanges = true;
        return `${prop}: ${value},${next}`;
      }
      return match;
    }],
    
    // Fix double semicolons
    [/;;/g, ';'],
    
    // Fix arrow function spacing
    [/= >\s*/g, '=> '],
    
    // Fix assignment spacing
    [/([a-zA-Z_$][a-zA-Z0-9_$]*)=([a-zA-Z_$])/g, '$1 = $2'],
    
    // Fix JSX fragment syntax
    [/\<\s*\/\s*\>/g, '</>'],
    
    // Fix function parameter syntax (semicolons to commas)
    [/\(([^)]+);\s*([^)]+)\)/g, '($1, $2)'],
    
    // Fix missing commas in function calls
    [/([a-zA-Z_$][a-zA-Z0-9_$]*)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1, $2:'],
    
    // Fix JSX prop spacing
    [/=\s*\{([^}]+)\}\s*([A-Za-z])/g, '={$1} $2'],
    
    // Fix template literal syntax
    [/`([^`]*?)\$\{([^}]*?)\}([^`]*?)(?!\`)/gm, (match, before, expr, after) => {
      if (after && !after.includes('`') && after.trim()) {
        hasChanges = true;
        return `\`${before}\${${expr}}${after}\``;
      }
      return match;
    }]
  ];

  fixes.forEach(([pattern, replacement]) => {
    if (typeof replacement === 'function') {
      content = content.replace(pattern, replacement);
    } else {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    }
  });

  // Fix 2: Interface and type specific issues
  if (content.includes('interface ')) {
    // Fix interface property syntax
    content = content.replace(/interface\s+\w+\s*\{[^}]*\}/gs, (interfaceBlock) => {
      let fixed = interfaceBlock.replace(/(\w+):\s*([^,;\n}]+);(\s*(?:\w+:|}))/g, (match, prop, value, next) => {
        if (!next.trim().startsWith('}')) {
          hasChanges = true;
          return `${prop}: ${value},${next}`;
        }
        return `${prop}: ${value};${next}`;
      });
      return fixed;
    });
  }

  // Fix 3: Simple structural issues
  const lines = content.split('\n');
  const fixedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Fix missing closing braces for simple if statements
    if (line.includes('if (') && line.includes(') {') && 
        i + 1 < lines.length && 
        lines[i + 1].trim().startsWith('return') && 
        !lines[i + 1].includes('}') &&
        i + 2 < lines.length &&
        !lines[i + 2].includes('}')) {
      fixedLines.push(line);
      fixedLines.push(lines[i + 1]);
      fixedLines.push('  }');
      hasChanges = true;
      i++; // Skip the return line as we already added it
      continue;
    }
    
    fixedLines.push(line);
  }
  
  if (hasChanges) {
    content = fixedLines.join('\n');
  }

  return { content, hasChanges };
}

console.log('Getting files with most TypeScript errors...');
const errorFiles = getTopErrorFiles();

if (errorFiles.length === 0) {
  console.log('No files with errors found.');
  process.exit(0);
}

console.log(`Processing ${errorFiles.length} files with most errors...`);

let fixedCount = 0;

errorFiles.forEach(filePath => {
  console.log(`Processing: ${filePath}`);
  
  const result = fixFileBasic(filePath);
  
  if (result && result.hasChanges) {
    try {
      fs.writeFileSync(filePath, result.content, 'utf8');
      fixedCount++;
      console.log(`✓ Fixed: ${filePath}`);
    } catch (error) {
      console.log(`✗ Error writing ${filePath}: ${error.message}`);
    }
  } else {
    console.log(`- No changes: ${filePath}`);
  }
});

console.log(`\nFixed ${fixedCount} files.`);

// Check new error count
console.log('\nChecking new error count...');
try {
  const output = execSync('npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0"', { encoding: 'utf8' });
  const newErrorCount = parseInt(output.trim());
  console.log(`TypeScript errors after fixes: ${newErrorCount}`);
} catch (error) {
  console.log('Could not count errors.');
}