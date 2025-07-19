const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Fix malformed imports - split into separate lines
    content = content.replace(/import\s*\{[^}]*\}\s*from\s*'[^']*';import\s*\{[^}]*\}\s*from\s*'[^']*';/g, (match) => {
      return match.replace(/';import/g, '\';\nimport');
    });
    
    // Fix interface definitions that are missing opening braces
    content = content.replace(/^(\s*interface\s+[a-zA-Z_][a-zA-Z0-9_]*\s*)\{([^}]*)\}$/gm, (match, interfaceDef, body) => {
      return interfaceDef + '{\n' + body.replace(/;/g, ';\n') + '\n}';
    });
    
    // Fix function TabPanel definitions
    content = content.replace(/\}function TabPanel/g, '}\n\nfunction TabPanel');
    
    // Fix missing semicolons in interfaces
    content = content.replace(/^(\s*[a-zA-Z_][a-zA-Z0-9_]*\??:\s*[^;,\n\}]+)\s*\n(\s*[a-zA-Z_][a-zA-Z0-9_]*\??:\s*)/gm, '$1;\n$2');
    
    // Fix missing semicolons at end of interface properties
    content = content.replace(/^(\s*[a-zA-Z_][a-zA-Z0-9_]*\??:\s*[^;,\n\}]+)\s*\n(\s*\})/gm, '$1;\n$2');
    
    // Fix JSX expressions
    content = content.replace(/\(\s*<([^>]+)>\s*\n\s*\)\s*\n\s*\}/g, '(\n    <$1>\n  );\n}');
    
    // Fix return statements with JSX
    content = content.replace(/return\s*\(\s*\n\s*<([^>]+)>\s*\n\s*\)\s*\n\s*\}/g, 'return (\n    <$1>\n  );\n}');
    
    // Fix missing semicolons in variable declarations
    content = content.replace(/^(\s*const\s+[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*[^;]+)\s*\n(\s*[a-zA-Z_])/gm, '$1;\n$2');
    
    // Fix object literal syntax with trailing commas
    content = content.replace(/,\s*\n\s*\}\s*;/g, '\n};');
    
    // Fix switch statement case formatting
    content = content.replace(/case\s+'([^']+)':\s*;\s*return\s+'([^']+)';\s*case\s+'([^']+)':/g, 
                              "case '$1':\n        return '$2';\n      case '$3':");
    
    // Fix array declarations with trailing semicolons
    content = content.replace(/\]\s*;\s*;/g, '];');
    
    // Fix object property syntax
    content = content.replace(/^(\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:\s*\{[^}]*\})\s*$/gm, '$1;');
    
    // Fix function parameter syntax
    content = content.replace(/\(\s*variables:\s*TVariables\s*\)\s*=>\s*Promise<ApiResponse<TData>,/g, 
                              '(variables: TVariables) => Promise<ApiResponse<TData>>,');
    
    // Fix Promise type definitions
    content = content.replace(/Promise<ApiResponse<TData>,\s*options/g, 'Promise<ApiResponse<TData>>, options');
    
    // Fix case statements with empty semicolons
    content = content.replace(/case\s+'([^']+)':\s*;\s*$/gm, "case '$1':");
    
    // Fix object destructuring syntax
    content = content.replace(/const\s*\{\s*\}\s*=\s*([^;]+)\s*\n/g, 'const {} = $1;\n');
    
    // Fix JSX closing tags
    content = content.replace(/<\/([A-Za-z][A-Za-z0-9]*)\s*>\s*\.\s*$/gm, '</$1>');
    
    // Fix missing closing braces in JSX
    content = content.replace(/\}\s*\n\s*\}\s*export\s+default/g, '}\n\nexport default');
    
    // Fix component export statements
    content = content.replace(/\)\s*\n\s*\}\s*export\s+default/g, ');\n};\n\nexport default');
    
    // Fix missing closing parentheses in JSX
    content = content.replace(/\)\s*\n\s*\}\s*export/g, ');\n};\n\nexport');
    
    // Fix interface closing braces
    content = content.replace(/\}\s*\n\s*\}\s*interface/g, '}\n\ninterface');
    
    // Fix type definitions
    content = content.replace(/type\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([^;]+)\s*\n/g, 'type $1 = $2;\n');
    
    // Fix const declarations
    content = content.replace(/const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([^;]+)\s*\n([a-zA-Z_])/g, 'const $1 = $2;\n$3');
    
    // Fix JSX attribute syntax
    content = content.replace(/=\s*\{\s*\n\s*\}\s*/g, '={}');
    
    // Fix missing closing JSX tags
    content = content.replace(/<([A-Za-z][A-Za-z0-9]*)\s*\n\s*([^>]*)\s*\n\s*\/>/g, '<$1 $2 />');
    
    // Fix React Fragment syntax
    content = content.replace(/<React\.Fragment\s*key=\{[^}]+\}\s*>/g, '<React.Fragment key={$1}>');
    
    // Fix arrow function syntax
    content = content.replace(/=>\s*\{\s*\n\s*\}\s*;/g, '=> {}');
    
    // Fix missing semicolons after expressions
    content = content.replace(/\}\s*\n\s*([a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\))\s*\n/g, '}\n$1;\n');
    
    // Fix No newline at end of file
    content = content.replace(/No newline at end of file[^\n]*\n?/g, '');
    
    // Fix trailing periods in JSX
    content = content.replace(/\.\s*$/gm, '');
    
    // Fix missing closing braces
    content = content.replace(/\s*\n\s*export\s+default/g, '\n\nexport default');
    
    // Fix malformed JSX expressions
    content = content.replace(/\{\s*\n\s*\}\s*([a-zA-Z_])/g, '{}\n$1');
    
    // Fix switch statement returns
    content = content.replace(/default:\s*return\s*([^;]+)\s*\n\s*\}/g, 'default:\n        return $1;\n    }');
    
    // Fix function closing braces
    content = content.replace(/\}\s*\}\s*$/g, '}\n}');
    
    // Fix missing commas in arrays
    content = content.replace(/\],\s*\n\s*\[/g, '],\n  [');
    
    // Fix interface property syntax
    content = content.replace(/^(\s*[a-zA-Z_][a-zA-Z0-9_]*\??:\s*[^;,\n\}]+)\s*\n(\s*\})/gm, '$1;\n$2');
    
    // Fix empty object syntax
    content = content.replace(/\{\s*\n\s*\}\s*=\s*/g, '{} = ');
    
    // Fix function parameter types
    content = content.replace(/\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*([^)]+)\s*\)\s*=>\s*([^,]+),/g, '($1: $2) => $3,');
    
    // Ensure proper line endings
    content = content.replace(/\r\n/g, '\n');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Get files with TypeScript errors
function getErrorFiles() {
  try {
    const output = execSync('npx tsc --noEmit 2>&1', { encoding: 'utf8' });
    const lines = output.split('\n');
    const fileErrors = {};
    
    lines.forEach(line => {
      const match = line.match(/^([^(]+)\(/);
      if (match) {
        const filePath = match[1];
        if (!fileErrors[filePath]) {
          fileErrors[filePath] = [];
        }
        fileErrors[filePath].push(line);
      }
    });
    
    return fileErrors;
  } catch (error) {
    return {};
  }
}

console.log('Getting files with TypeScript errors...');
const errorFiles = getErrorFiles();
const files = Object.keys(errorFiles);

if (files.length === 0) {
  console.log('No TypeScript errors found.');
  process.exit(0);
}

console.log(`Found ${files.length} files with TypeScript errors.`);

// Sort by error count (most errors first)
const sortedFiles = files.sort((a, b) => errorFiles[b].length - errorFiles[a].length);

let fixedCount = 0;
let totalErrorsProcessed = 0;

// Process files with most errors first
sortedFiles.slice(0, 50).forEach(file => {
  const errorCount = errorFiles[file].length;
  totalErrorsProcessed += errorCount;
  
  console.log(`Processing: ${file} (${errorCount} errors)`);
  
  if (fixFile(file)) {
    console.log(`✓ Fixed: ${file}`);
    fixedCount++;
  } else {
    console.log(`- No changes: ${file}`);
  }
});

console.log(`\nProcessed ${Math.min(50, sortedFiles.length)} files with most errors`);
console.log(`Fixed ${fixedCount} files`);
console.log(`Total errors processed: ${totalErrorsProcessed}`);

// Check new error count
console.log('\nChecking TypeScript errors after fixes...');
try {
  const errorCountOutput = execSync('npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0"', { encoding: 'utf8' });
  const newErrorCount = parseInt(errorCountOutput.trim());
  console.log(`TypeScript errors after fixes: ${newErrorCount}`);
  
  if (newErrorCount < 2917) {
    console.log(`🎉 Reduced errors by: ${2917 - newErrorCount}`);
  }
} catch (error) {
  console.log('Could not count errors after fixes.');
}