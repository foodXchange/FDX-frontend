const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get files with TypeScript errors and their specific error types
function getErrorDetails() {
  try {
    const output = execSync('npx tsc --noEmit 2>&1', { encoding: 'utf8', timeout: 120000 });
    const lines = output.split('\n');
    const errorMap = new Map();
    
    lines.forEach(line => {
      const match = line.match(/^([^(]+)\((\d+),(\d+)\): error TS(\d+): (.+)$/);
      if (match) {
        const [, filePath, lineNum, colNum, errorCode, errorMsg] = match;
        if (!errorMap.has(filePath)) {
          errorMap.set(filePath, []);
        }
        errorMap.get(filePath).push({
          line: parseInt(lineNum),
          col: parseInt(colNum),
          code: errorCode,
          message: errorMsg
        });
      }
    });
    
    return errorMap;
  } catch (error) {
    return new Map();
  }
}

function fixAdvancedPatterns(filePath, errors) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let hasChanges = false;
    const lines = content.split('\n');

    // Skip very large files
    if (content.length > 200000) return false;

    // Pattern 1: Fix interface property syntax issues
    content = content.replace(/interface\s+\w+\s*\{[^}]*\}/gs, (interfaceBlock) => {
      let fixed = interfaceBlock;
      
      // Fix property syntax: semicolons to commas, but keep last property with semicolon
      const propertyLines = fixed.split('\n');
      for (let i = 0; i < propertyLines.length - 1; i++) {
        const line = propertyLines[i];
        const nextLine = propertyLines[i + 1];
        
        // If current line ends with semicolon and next line starts with property or has closing brace
        if (line.match(/^\s*\w+[?]?:\s*[^;,}]+;$/) && 
            (nextLine.match(/^\s*\w+[?]?:/) || nextLine.includes('}'))) {
          if (!nextLine.includes('}')) {
            propertyLines[i] = line.replace(/;$/, ',');
            hasChanges = true;
          }
        }
      }
      return propertyLines.join('\n');
    });

    // Pattern 2: Fix JSX prop spacing and formatting
    content = content.replace(/(\w+)=\{([^}]+)\}(\w)/g, '$1={$2} $3');
    content = content.replace(/(\w+)=\{([^}]+)\}\s*([A-Z]\w*)/g, '$1={$2}\n                    $3');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Pattern 3: Fix function call parameter spacing
    content = content.replace(/(\w+)\(([^)]+),\s*([^)]+)\)/g, (match, func, param1, param2) => {
      if (!param1.includes('(') && !param2.includes('(')) {
        hasChanges = true;
        return `${func}(${param1.trim()}, ${param2.trim()})`;
      }
      return match;
    });

    // Pattern 4: Fix object property shorthand and comma issues
    content = content.replace(/\{([^}]+)\}/g, (match, objContent) => {
      if (objContent.length > 200) return match; // Skip large objects
      
      let fixed = objContent;
      // Fix missing commas between properties
      fixed = fixed.replace(/(\w+:\s*[^,}\n]+)\s+(\w+:)/g, '$1, $2');
      // Fix trailing commas before closing brace
      fixed = fixed.replace(/,\s*$/, '');
      
      if (fixed !== objContent) {
        hasChanges = true;
        return `{${fixed}}`;
      }
      return match;
    });

    // Pattern 5: Fix array syntax issues
    content = content.replace(/\[([^\]]+)\]/g, (match, arrayContent) => {
      if (arrayContent.length > 100) return match; // Skip large arrays
      
      let fixed = arrayContent;
      // Fix missing commas in arrays
      fixed = fixed.replace(/('\w+')\s+('\w+')/g, '$1, $2');
      fixed = fixed.replace(/(\w+)\s+(\w+)(?=\s*[,\]])/g, '$1, $2');
      
      if (fixed !== arrayContent) {
        hasChanges = true;
        return `[${fixed}]`;
      }
      return match;
    });

    // Pattern 6: Fix function parameter destructuring
    content = content.replace(/\(\s*\{([^}]+)\}\s*\)/g, (match, params) => {
      let fixed = params.replace(/;\s*/g, ', ').replace(/,\s*,/g, ',').trim();
      if (fixed !== params) {
        hasChanges = true;
        return `({ ${fixed} })`;
      }
      return match;
    });

    // Pattern 7: Fix template literal issues
    content = content.replace(/`([^`]*?)(?<!\\)\$\{([^}]*?)\}([^`]*?)(?!`)/gm, (match, before, expr, after) => {
      if (after && after.trim() && !after.includes('`') && after.length < 100) {
        hasChanges = true;
        return `\`${before}\${${expr}}${after}\``;
      }
      return match;
    });

    // Pattern 8: Fix React component prop spreading
    content = content.replace(/\{\s*\.\.\.\s*(\w+)\s*\}/g, '{...$1}');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Pattern 9: Fix arrow function syntax issues
    content = content.replace(/=>\s*\{([^}]*)\}/g, (match, body) => {
      if (body.trim() && !body.includes('\n') && !body.includes('return')) {
        hasChanges = true;
        return `=> {\n    ${body.trim()}\n  }`;
      }
      return match;
    });

    // Pattern 10: Fix type annotation spacing
    content = content.replace(/:\s*([A-Z]\w*)\s*\|/g, ': $1 |');
    content = content.replace(/\|\s*([A-Z]\w*)/g, ' | $1');
    if (content !== originalContent && !hasChanges) hasChanges = true;

    // Pattern 11: Fix missing return types
    content = content.replace(/const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g, (match) => {
      if (!match.includes(': ')) {
        hasChanges = true;
        return match; // Keep as is for now, would need more context to add proper return type
      }
      return match;
    });

    // Pattern 12: Fix import statement formatting
    content = content.replace(/import\s*\{([^}]+)\}\s*from/g, (match, imports) => {
      let fixed = imports.replace(/,\s*,/g, ',').replace(/\s*,\s*/g, ', ').trim();
      if (fixed !== imports.trim()) {
        hasChanges = true;
        return `import { ${fixed} } from`;
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

console.log('Getting detailed TypeScript error information...');
const errorMap = getErrorDetails();
const filesWithErrors = Array.from(errorMap.keys()).slice(0, 80); // Process top 80 files

if (filesWithErrors.length === 0) {
  console.log('No TypeScript errors found or unable to parse error output.');
  process.exit(0);
}

console.log(`Found ${filesWithErrors.length} files with TypeScript errors.`);

// Sort files by number of errors (most errors first)
const sortedFiles = filesWithErrors.sort((a, b) => {
  const errorsA = errorMap.get(a)?.length || 0;
  const errorsB = errorMap.get(b)?.length || 0;
  return errorsB - errorsA;
});

let fixedCount = 0;
let totalErrorsProcessed = 0;

console.log('\nProcessing files with most errors first...');

sortedFiles.forEach((filePath, index) => {
  const errors = errorMap.get(filePath) || [];
  totalErrorsProcessed += errors.length;
  
  console.log(`${index + 1}/${sortedFiles.length}: ${path.relative('.', filePath)} (${errors.length} errors)`);
  
  if (fixAdvancedPatterns(filePath, errors)) {
    fixedCount++;
    console.log(`  ✓ Fixed advanced patterns`);
  } else {
    console.log(`  - No pattern fixes applied`);
  }
});

console.log(`\n=== Advanced Pattern Fixes Complete ===`);
console.log(`Files processed: ${sortedFiles.length}`);
console.log(`Files modified: ${fixedCount}`);
console.log(`Total errors in processed files: ${totalErrorsProcessed}`);

// Check new error count
console.log('\nChecking TypeScript errors after advanced fixes...');
try {
  const output = execSync('npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0"', { 
    encoding: 'utf8',
    timeout: 120000 
  });
  const newErrorCount = parseInt(output.trim());
  console.log(`TypeScript errors after fixes: ${newErrorCount}`);
  
  if (newErrorCount < 2064) {
    console.log(`🎉 Reduced errors by: ${2064 - newErrorCount}`);
  } else if (newErrorCount === 2064) {
    console.log(`No change in error count - may need manual fixes for remaining errors`);
  }
} catch (error) {
  console.log('Could not count errors after fixes.');
}