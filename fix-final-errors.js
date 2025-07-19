const fs = require('fs');
const path = require('path');
const glob = require('glob');

function fixFinalErrors() {
  console.log('🔧 Starting final error fixes...');
  
  const sourceDir = path.join(__dirname, 'src');
  const files = glob.sync('**/*.{ts,tsx}', { cwd: sourceDir });
  
  let filesFixed = 0;
  let totalChanges = 0;
  
  files.forEach(file => {
    const filePath = path.join(sourceDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let hasChanges = false;
    
    // Fix interface/type property endings
    content = content.replace(/(\w+:\s*[^,;\n]+),(\s*\n\s*\})/g, '$1$2');
    
    // Fix missing semicolons in property declarations
    content = content.replace(/(\w+:\s*[^,;\n]+)(\s*\n\s*[a-zA-Z])/g, '$1;$2');
    
    // Fix semicolon placement in objects
    content = content.replace(/(\w+:\s*[^,;\n]+);(\s*\n\s*[a-zA-Z])/g, '$1,$2');
    
    // Fix arrow functions without proper closing
    content = content.replace(/=>\s*\{\s*\n\s*([^}]+)\s*\n\s*\}/g, '=> {\n      $1\n    }');
    
    // Fix missing closing braces
    content = content.replace(/\{\s*\n\s*([^}]+)\s*\n\s*([^}])\s*$/g, '{\n      $1\n    }\n  $2');
    
    // Fix malformed function parameters
    content = content.replace(/=\s*\(\s*\{\s*([^}]*)\s*\}\s*\)\s*=>/g, '= ({ $1 }) =>');
    
    // Fix missing closing parentheses in function calls
    content = content.replace(/\(\s*\{\s*([^}]*)\s*\}\s*\n\s*\)/g, '({ $1 })');
    
    // Fix object property definitions
    content = content.replace(/(\w+):\s*([^,;\n]+),\s*\n\s*const\s+/g, '$1: $2;\n  const ');
    
    // Fix JSX attribute syntax
    content = content.replace(/=\s*\{\s*\n\s*([^}]+)\s*\n\s*\}/g, '={$1}');
    
    // Fix import statements
    content = content.replace(/import\s*\{\s*([^}]*)\s*\}\s*from\s*['"]([^'"]+)['"]\s*;?/g, 'import { $1 } from "$2";');
    
    // Fix export statements
    content = content.replace(/export\s*\{\s*([^}]*)\s*\}\s*;?/g, 'export { $1 };');
    
    // Fix type definitions
    content = content.replace(/type\s+(\w+)\s*=\s*([^;]+)\s*;?/g, 'type $1 = $2;');
    
    // Fix interface definitions
    content = content.replace(/interface\s+(\w+)\s*\{([^}]*)\}\s*;?/g, 'interface $1 {$2}');
    
    // Fix function return types
    content = content.replace(/\):\s*([^{]+)\s*\{/g, '): $1 {');
    
    // Fix async function syntax
    content = content.replace(/async\s+(\w+)\s*\(/g, 'async $1(');
    
    // Fix Promise types
    content = content.replace(/Promise<([^>]+)>\s*\{/g, 'Promise<$1> {');
    
    // Fix generic type parameters
    content = content.replace(/<([^>]+)>\s*\(/g, '<$1>(');
    
    // Fix optional parameters
    content = content.replace(/(\w+)\?\s*:\s*([^,;\n]+)/g, '$1?: $2');
    
    // Fix union types
    content = content.replace(/\|\s*([^|]+)\s*\|/g, '| $1 |');
    
    // Fix template literals
    content = content.replace(/`([^`]*\$\{[^}]*\}[^`]*)`/g, '`$1`');
    
    // Fix try-catch blocks
    content = content.replace(/try\s*\{([^}]*)\}\s*catch\s*\{([^}]*)\}/g, 'try {$1} catch (error) {$2}');
    
    // Fix missing return statements
    content = content.replace(/\{\s*\n\s*([^}]+)\s*\n\s*\}/g, (match, content) => {
      if (content.includes('return') || content.includes('throw') || content.includes('console')) {
        return match;
      }
      return `{\n      return ${content};\n    }`;
    });
    
    // Fix dangling commas
    content = content.replace(/,\s*\n\s*\}/g, '\n  }');
    
    // Fix missing commas in object literals
    content = content.replace(/(\w+:\s*[^,\n]+)\s*\n\s*(\w+:)/g, '$1,\n    $2');
    
    // Fix method definitions
    content = content.replace(/(\w+)\s*\(\s*([^)]*)\s*\)\s*\{/g, '$1($2) {');
    
    // Fix class property definitions
    content = content.replace(/(\w+):\s*([^,;\n]+)\s*\n\s*(\w+):/g, '$1: $2;\n  $3:');
    
    // Fix destructuring assignments
    content = content.replace(/const\s*\{\s*([^}]*)\s*\}\s*=\s*([^;]+)\s*;?/g, 'const { $1 } = $2;');
    
    // Fix spread operators
    content = content.replace(/\.\.\.\s*([^,\n]+)/g, '...$1');
    
    // Fix conditional expressions
    content = content.replace(/\?\s*([^:]+)\s*:\s*([^;,\n]+)/g, '? $1 : $2');
    
    // Fix logical operators
    content = content.replace(/&&\s*([^&\n]+)/g, '&& $1');
    content = content.replace(/\|\|\s*([^|\n]+)/g, '|| $1');
    
    // Fix comparison operators
    content = content.replace(/===\s*([^=\n]+)/g, '=== $1');
    content = content.replace(/!==\s*([^=\n]+)/g, '!== $1');
    
    // Fix assignment operators
    content = content.replace(/=\s*([^=\n]+)/g, '= $1');
    
    // Clean up extra whitespace
    content = content.replace(/\s+$/gm, '');
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Final cleanup
    content = content.trim() + '\n';
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      filesFixed++;
      totalChanges++;
      hasChanges = true;
    }
    
    if (hasChanges) {
      console.log(`✅ Fixed ${file}`);
    }
  });
  
  console.log(`\n🎉 Fixed ${filesFixed} files with ${totalChanges} changes`);
  return { filesFixed, totalChanges };
}

// Run the fix
try {
  const result = fixFinalErrors();
  console.log(`\n✨ Final error fixes completed!`);
  console.log(`📊 Files fixed: ${result.filesFixed}`);
  console.log(`📊 Total changes: ${result.totalChanges}`);
} catch (error) {
  console.error('❌ Error during fixing:', error);
  process.exit(1);
}