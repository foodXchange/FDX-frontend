const fs = require('fs');
const path = require('path');

// Function to fix JSX and syntax errors
function fixJSXAndSyntaxErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    const originalContent = content;

    // Fix malformed JSX fragments
    const fragmentFixPatterns = [
      // Fix < /> patterns
      { pattern: /\s*<\s*\/\s*>\s*/g, replacement: '</>' },
      { pattern: /\s*<\s*>\s*/g, replacement: '<>' },
      
      // Fix mismatched closing tags
      { pattern: /\{\s*\/\s*\>\s*\}/g, replacement: '</>' },
      { pattern: /\<\s*\/\s*\>\s*\}/g, replacement: '</>' },
      
      // Fix malformed React.Fragment
      { pattern: /<React\.Fragment\s*\/>/g, replacement: '<></>' },
      { pattern: /<React\.Fragment>/g, replacement: '<>' },
      { pattern: /<\/React\.Fragment>/g, replacement: '</>' },
      
      // Fix broken JSX fragment patterns
      { pattern: /\{\s*<\s*\/\s*>\s*\}/g, replacement: '<></>' },
      { pattern: /\<\s*\>\s*\{\s*\}/g, replacement: '<></>' },
      
      // Fix closing JSX fragment with extra characters
      { pattern: /\<\s*\/\s*\>\s*\;\s*$/gm, replacement: '</>' },
      { pattern: /\<\s*\/\s*\>\s*\,\s*$/gm, replacement: '</>' },
      
      // Fix malformed closing tags
      { pattern: /\<\s*\/\s*\>\s*\n\s*\}/g, replacement: '</>\n  }' },
      
      // Fix JSX fragment in wrong context
      { pattern: /\s*\<\s*\/\s*\>\s*\n\s*\)/g, replacement: '</>\n  )' },
      
      // Fix standalone closing braces that should be JSX
      { pattern: /\{\s*\/\s*\>/g, replacement: '</>' },
      { pattern: /\<\s*\/\s*\}\s*\>/g, replacement: '</>' },
    ];

    // Apply JSX fragment fixes
    fragmentFixPatterns.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    });

    // Fix semicolon and comma issues in objects/interfaces
    const syntaxFixPatterns = [
      // Fix semicolon instead of comma in object properties
      { pattern: /;\s*\n\s*\}/g, replacement: '\n  }' },
      { pattern: /;\s*\n\s*\]/g, replacement: '\n  ]' },
      
      // Fix missing closing parentheses
      { pattern: /\(\s*\n\s*\}\s*$/gm, replacement: '()\n  }' },
      
      // Fix malformed arrow functions
      { pattern: /=>\s*\{\s*\n\s*\}/g, replacement: '=> {}' },
      
      // Fix switch statements with extra semicolons
      { pattern: /case\s+([^:]+):\s*;\s*\n/g, replacement: 'case $1:\n' },
      { pattern: /default:\s*;\s*\n/g, replacement: 'default:\n' },
      
      // Fix object property syntax errors
      { pattern: /:\s*([^;,\n]+);\s*\n/g, replacement: ': $1,\n' },
      
      // Fix function call syntax
      { pattern: /\(\s*;\s*\)/g, replacement: '()' },
      
      // Fix array syntax
      { pattern: /\[\s*;\s*\]/g, replacement: '[]' },
      
      // Fix malformed template literals
      { pattern: /\{\$1\}/g, replacement: '{value}' },
      { pattern: /\{\$2\}/g, replacement: '{secondValue}' },
      
      // Fix misplaced semicolons in return statements
      { pattern: /return\s*;\s*\n/g, replacement: 'return;\n' },
      
      // Fix malformed JSX props
      { pattern: /\s*=\s*\{\s*;\s*\}/g, replacement: '={}' },
      
      // Fix broken conditional expressions
      { pattern: /\?\s*;\s*:/g, replacement: '? null :' },
      
      // Fix malformed spread operators
      { pattern: /\.\.\.\s*;\s*/g, replacement: '...' },
    ];

    // Apply syntax fixes
    syntaxFixPatterns.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    });

    // Fix specific TypeScript errors
    const tsFixPatterns = [
      // Fix malformed type annotations
      { pattern: /:\s*;\s*\n/g, replacement: ';\n' },
      
      // Fix interface declarations
      { pattern: /interface\s+(\w+)\s*\{\s*;\s*\n/g, replacement: 'interface $1 {\n' },
      
      // Fix type imports
      { pattern: /import\s*\{\s*;\s*\}/g, replacement: 'import {}' },
      
      // Fix export statements
      { pattern: /export\s*\{\s*;\s*\}/g, replacement: 'export {}' },
      
      // Fix function parameters
      { pattern: /\(\s*;\s*\)/g, replacement: '()' },
      
      // Fix generic type parameters
      { pattern: /<\s*;\s*>/g, replacement: '<>' },
      
      // Fix array type annotations
      { pattern: /\[\s*;\s*\]/g, replacement: '[]' },
      
      // Fix union types
      { pattern: /\|\s*;\s*\|/g, replacement: ' | ' },
      
      // Fix malformed JSX elements
      { pattern: /\<(\w+)\s*\/\s*\>\s*\}/g, replacement: '<$1 />}' },
      
      // Fix closing tags with semicolons
      { pattern: /\<\/(\w+)\s*;\s*\>/g, replacement: '</$1>' },
    ];

    // Apply TypeScript fixes
    tsFixPatterns.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    });

    // Fix specific patterns found in the files
    const specificFixes = [
      // Fix malformed closing braces after JSX
      { pattern: /\s*\<\s*\/\s*\>\s*\n\s*\}\s*\n\s*\}\s*$/gm, replacement: '</>\n  }\n}' },
      
      // Fix broken imports
      { pattern: /import\s*\{\s*,\s*\}/g, replacement: 'import {}' },
      
      // Fix malformed exports
      { pattern: /export\s*\{\s*,\s*\}/g, replacement: 'export {}' },
      
      // Fix broken component props
      { pattern: /\{\s*,\s*\}/g, replacement: '{}' },
      
      // Fix malformed JSX attributes
      { pattern: /\s*=\s*\{\s*,\s*\}/g, replacement: '={}' },
      
      // Fix broken conditional rendering
      { pattern: /\{\s*\&\&\s*\<\s*\/\s*\>\s*\}/g, replacement: '{condition && <></>}' },
      
      // Fix malformed string interpolation
      { pattern: /\$\{[^}]*\s*;\s*\}/g, replacement: '${value}' },
      
      // Fix broken function calls in JSX
      { pattern: /\{\s*\(\s*\)\s*=>\s*\{\s*;\s*\}\s*\}/g, replacement: '{() => {}}' },
      
      // Fix malformed object destructuring
      { pattern: /\{\s*\.\.\.\s*;\s*\}/g, replacement: '{...props}' },
      
      // Fix broken ternary operators
      { pattern: /\?\s*\<\s*\/\s*\>\s*:/g, replacement: '? </> :' },
    ];

    // Apply specific fixes
    specificFixes.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    });

    // Write the file if changes were made
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively process files
function processDirectory(dir) {
  let fixedFiles = 0;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other non-source directories
      if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(file)) {
        fixedFiles += processDirectory(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (fixJSXAndSyntaxErrors(filePath)) {
        fixedFiles++;
        console.log(`Fixed: ${filePath}`);
      }
    }
  }
  
  return fixedFiles;
}

// Main execution
const rootDir = process.cwd();
console.log('Starting JSX and syntax error fixes...');
console.log(`Processing directory: ${rootDir}`);

const fixedFiles = processDirectory(path.join(rootDir, 'src'));

console.log(`\nCompleted! Fixed ${fixedFiles} files.`);