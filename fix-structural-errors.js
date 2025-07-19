const fs = require('fs');
const path = require('path');

// Function to fix structural TypeScript errors
function fixStructuralErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    const originalContent = content;

    // Fix missing closing braces and brackets
    const structuralFixes = [
      // Fix missing closing braces for interfaces and types
      { pattern: /interface\s+(\w+)\s*\{[^}]*$/gm, replacement: (match) => match + '\n}' },
      { pattern: /type\s+(\w+)\s*=[^;]*$/gm, replacement: (match) => match + ';' },
      
      // Fix malformed object destructuring
      { pattern: /const\s*\{\s*([^}]*)\s*\}\s*=\s*([^;]*)\s*$/gm, replacement: 'const { $1 } = $2;' },
      
      // Fix malformed function parameters
      { pattern: /\(\s*\{\s*([^}]*)\s*\}\s*\)\s*=>/g, replacement: '({ $1 }) =>' },
      
      // Fix broken import statements
      { pattern: /import\s*\{\s*([^}]*)\s*\}\s*from\s*([^;]*)\s*$/gm, replacement: 'import { $1 } from $2;' },
      
      // Fix broken export statements  
      { pattern: /export\s*\{\s*([^}]*)\s*\}\s*$/gm, replacement: 'export { $1 };' },
      
      // Fix missing semicolons after statements
      { pattern: /^\s*([^;{}]*)\s*$/gm, replacement: (match) => {
        const trimmed = match.trim();
        if (trimmed && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}') && !trimmed.endsWith(',')) {
          return match + ';';
        }
        return match;
      }},
      
      // Fix malformed JSX props
      { pattern: /(\w+)=\{([^}]*)\}/g, replacement: '$1={$2}' },
      
      // Fix broken conditional expressions
      { pattern: /\?\s*([^:]*)\s*:\s*([^;]*)\s*$/gm, replacement: '? $1 : $2' },
      
      // Fix malformed array destructuring
      { pattern: /const\s*\[\s*([^\]]*)\s*\]\s*=\s*([^;]*)\s*$/gm, replacement: 'const [$1] = $2;' },
      
      // Fix broken function calls
      { pattern: /(\w+)\(\s*([^)]*)\s*\)\s*$/gm, replacement: '$1($2)' },
      
      // Fix malformed object literals
      { pattern: /\{\s*([^}]*)\s*\}\s*$/gm, replacement: '{ $1 }' },
      
      // Fix broken return statements
      { pattern: /return\s*([^;]*)\s*$/gm, replacement: 'return $1;' },
      
      // Fix malformed switch statements
      { pattern: /switch\s*\(\s*([^)]*)\s*\)\s*\{/g, replacement: 'switch ($1) {' },
      { pattern: /case\s*([^:]*)\s*:\s*([^;]*)\s*$/gm, replacement: 'case $1: $2' },
      { pattern: /default\s*:\s*([^;]*)\s*$/gm, replacement: 'default: $1' },
      
      // Fix malformed try-catch blocks
      { pattern: /try\s*\{([^}]*)\}\s*catch\s*\(\s*([^)]*)\s*\)\s*\{([^}]*)\}/g, replacement: 'try {\n$1\n} catch ($2) {\n$3\n}' },
      
      // Fix malformed if statements
      { pattern: /if\s*\(\s*([^)]*)\s*\)\s*\{/g, replacement: 'if ($1) {' },
      { pattern: /else\s*if\s*\(\s*([^)]*)\s*\)\s*\{/g, replacement: 'else if ($1) {' },
      { pattern: /else\s*\{/g, replacement: 'else {' },
      
      // Fix malformed for loops
      { pattern: /for\s*\(\s*([^)]*)\s*\)\s*\{/g, replacement: 'for ($1) {' },
      { pattern: /while\s*\(\s*([^)]*)\s*\)\s*\{/g, replacement: 'while ($1) {' },
      
      // Fix malformed template literals
      { pattern: /`([^`]*)`/g, replacement: '`$1`' },
      
      // Fix broken spread operators
      { pattern: /\.\.\.\s*([^,\s]*)/g, replacement: '...$1' },
      
      // Fix malformed async/await
      { pattern: /async\s*\(\s*([^)]*)\s*\)\s*=>/g, replacement: 'async ($1) =>' },
      { pattern: /await\s*([^;]*)\s*$/gm, replacement: 'await $1' },
    ];

    // Apply structural fixes
    structuralFixes.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    });

    // Fix specific patterns that cause missing braces
    const bracesFixes = [
      // Fix missing closing braces for components
      { pattern: /export\s+default\s+(\w+)\s*$/gm, replacement: 'export default $1;' },
      
      // Fix missing closing braces for functions
      { pattern: /const\s+(\w+)\s*:\s*React\.FC[^{]*\{[^}]*$/gm, replacement: (match) => match + '\n}' },
      
      // Fix missing closing braces for objects
      { pattern: /const\s+(\w+)\s*=\s*\{[^}]*$/gm, replacement: (match) => match + '\n}' },
      
      // Fix missing closing braces for interfaces
      { pattern: /interface\s+(\w+)\s*\{[^}]*$/gm, replacement: (match) => match + '\n}' },
      
      // Fix missing closing braces for enums
      { pattern: /enum\s+(\w+)\s*\{[^}]*$/gm, replacement: (match) => match + '\n}' },
      
      // Fix missing closing braces for classes
      { pattern: /class\s+(\w+)[^{]*\{[^}]*$/gm, replacement: (match) => match + '\n}' },
      
      // Fix missing closing braces for namespaces
      { pattern: /namespace\s+(\w+)\s*\{[^}]*$/gm, replacement: (match) => match + '\n}' },
      
      // Fix missing closing braces for modules
      { pattern: /module\s+(\w+)\s*\{[^}]*$/gm, replacement: (match) => match + '\n}' },
      
      // Fix missing closing parentheses
      { pattern: /\([^)]*$/gm, replacement: (match) => match + ')' },
      
      // Fix missing closing brackets
      { pattern: /\[[^\]]*$/gm, replacement: (match) => match + ']' },
      
      // Fix missing closing angle brackets
      { pattern: /<[^>]*$/gm, replacement: (match) => match + '>' },
      
      // Fix missing semicolons
      { pattern: /^(\s*[^;{}]*[^;{}\s])(\s*)$/gm, replacement: '$1;$2' },
    ];

    // Apply braces fixes
    bracesFixes.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    });

    // Fix specific TypeScript syntax errors
    const typescriptFixes = [
      // Fix malformed type definitions
      { pattern: /:\s*([^;,\n]*)\s*;/g, replacement: ': $1;' },
      
      // Fix malformed generic types
      { pattern: /<([^>]*)>/g, replacement: '<$1>' },
      
      // Fix malformed union types
      { pattern: /\|\s*([^|]*)\s*\|/g, replacement: '| $1 |' },
      
      // Fix malformed intersection types
      { pattern: /&\s*([^&]*)\s*&/g, replacement: '& $1 &' },
      
      // Fix malformed optional properties
      { pattern: /(\w+)\?\s*:\s*([^;,\n]*)/g, replacement: '$1?: $2' },
      
      // Fix malformed readonly properties
      { pattern: /readonly\s+(\w+)\s*:\s*([^;,\n]*)/g, replacement: 'readonly $1: $2' },
      
      // Fix malformed static properties
      { pattern: /static\s+(\w+)\s*:\s*([^;,\n]*)/g, replacement: 'static $1: $2' },
      
      // Fix malformed private properties
      { pattern: /private\s+(\w+)\s*:\s*([^;,\n]*)/g, replacement: 'private $1: $2' },
      
      // Fix malformed protected properties
      { pattern: /protected\s+(\w+)\s*:\s*([^;,\n]*)/g, replacement: 'protected $1: $2' },
      
      // Fix malformed public properties
      { pattern: /public\s+(\w+)\s*:\s*([^;,\n]*)/g, replacement: 'public $1: $2' },
      
      // Fix malformed abstract properties
      { pattern: /abstract\s+(\w+)\s*:\s*([^;,\n]*)/g, replacement: 'abstract $1: $2' },
      
      // Fix malformed implements clauses
      { pattern: /implements\s+([^{]*)\s*\{/g, replacement: 'implements $1 {' },
      
      // Fix malformed extends clauses
      { pattern: /extends\s+([^{]*)\s*\{/g, replacement: 'extends $1 {' },
      
      // Fix malformed decorators
      { pattern: /@(\w+)\s*\(/g, replacement: '@$1(' },
      
      // Fix malformed assertions
      { pattern: /as\s+([^;,\n]*)/g, replacement: 'as $1' },
      
      // Fix malformed keyof expressions
      { pattern: /keyof\s+([^;,\n]*)/g, replacement: 'keyof $1' },
      
      // Fix malformed typeof expressions
      { pattern: /typeof\s+([^;,\n]*)/g, replacement: 'typeof $1' },
      
      // Fix malformed instanceof expressions
      { pattern: /instanceof\s+([^;,\n]*)/g, replacement: 'instanceof $1' },
      
      // Fix malformed in expressions
      { pattern: /in\s+([^;,\n]*)/g, replacement: 'in $1' },
    ];

    // Apply TypeScript fixes
    typescriptFixes.forEach(({ pattern, replacement }) => {
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
      if (fixStructuralErrors(filePath)) {
        fixedFiles++;
        console.log(`Fixed: ${filePath}`);
      }
    }
  }
  
  return fixedFiles;
}

// Main execution
const rootDir = process.cwd();
console.log('Starting structural error fixes...');
console.log(`Processing directory: ${rootDir}`);

const fixedFiles = processDirectory(path.join(rootDir, 'src'));

console.log(`\nCompleted! Fixed ${fixedFiles} files.`);