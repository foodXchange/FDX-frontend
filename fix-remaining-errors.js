const fs = require('fs');
const path = require('path');
const glob = require('glob');

function fixRemainingErrors() {
  console.log('🔧 Starting remaining error fixes...');
  
  const sourceDir = path.join(__dirname, 'src');
  const files = glob.sync('**/*.{ts,tsx}', { cwd: sourceDir });
  
  let filesFixed = 0;
  let totalChanges = 0;
  
  files.forEach(file => {
    const filePath = path.join(sourceDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let hasChanges = false;
    
    // Fix trailing commas that should be semicolons
    content = content.replace(/(\w+):\s*([^,\n]*),\s*\n\s*const\s+/g, '$1: $2;\n  const ');
    
    // Fix missing semicolons after function declarations
    content = content.replace(/\}\s*\n\s*}/g, '};\n}');
    
    // Fix broken try-catch blocks
    content = content.replace(/(\w+)\s*\{\s*\n\s*try\s*\{/g, '$1() {\n    try {');
    content = content.replace(/\}\s*\n\s*catch\s*\{/g, '    } catch (error) {');
    content = content.replace(/\}\s*\n\s*finally\s*\{/g, '    } finally {');
    
    // Fix broken object/interface syntax
    content = content.replace(/(\w+):\s*([^,\n]*),\s*\n\s*\}/g, '$1: $2\n}');
    
    // Fix missing closing parentheses
    content = content.replace(/\(\s*\{\s*([^}]*)\s*\}\s*\n\s*\)/g, '({ $1 })');
    
    // Fix malformed arrow functions
    content = content.replace(/=\s*\(\s*\{\s*([^}]*)\s*\}\s*\)\s*=>\s*\{/g, '= ({ $1 }) => {');
    
    // Fix semicolon issues in property definitions
    content = content.replace(/(\w+):\s*([^,\n]*);/g, '$1: $2,');
    
    // Fix broken return statements
    content = content.replace(/return\s*\(\s*\n\s*</g, 'return (');
    
    // Fix closing braces/parentheses
    content = content.replace(/\n\s*\}\s*\n\s*\)\s*\n\s*\}/g, '\n    }\n  );\n}');
    
    // Fix extra closing braces at end of files
    content = content.replace(/\n\s*\}\s*\}\s*\}\s*\}\s*\}\s*\n\s*No\s+newline\s+at\s+end\s+of\s+file\s*$/g, '\n');
    
    // Fix malformed template literals
    content = content.replace(/\$\{\s*([^}]*)\s*\}\s*\n\s*\}/g, '${$1}');
    
    // Fix specific problematic patterns
    content = content.replace(/(\w+):\s*([^,\n]*),\s*\n\s*const\s+/g, '$1: $2;\n  const ');
    
    // Fix missing return statements
    content = content.replace(/\{\s*\n\s*<([^>]*)>/g, '{\n    return <$1>');
    
    // Fix broken JSX closing tags
    content = content.replace(/<\/(\w+)>\s*\n\s*\)/g, '</$1>');
    
    // Fix missing semicolons in function calls
    content = content.replace(/\)\s*\n\s*\}/g, ');\n}');
    
    // Fix specific file patterns
    if (file.includes('AuthGuard.tsx')) {
      content = content.replace(/return\s*<>\s*\{\s*children\s*\}\s*<\/>\s*;\s*\n\s*export\s+default\s+AuthGuard;\s*\n\s*\}/g, 
        'return <>{children}</>;\n};\n\nexport default AuthGuard;');
    }
    
    if (file.includes('RoleGuard.tsx')) {
      content = content.replace(/return\s*<>\s*\{\s*children\s*\}\s*<\/>\s*;\s*\n\s*export\s+default\s+RoleGuard;\s*\n\s*\}/g, 
        'return <>{children}</>;\n};\n\nexport default RoleGuard;');
    }
    
    // Fix malformed interface definitions
    content = content.replace(/interface\s+(\w+)\s*\{\s*\n\s*(\w+):\s*([^,\n]*),\s*\n\s*([^}]*)\s*\}/g, 
      'interface $1 {\n  $2: $3;\n  $4\n}');
    
    // Fix malformed useEffect dependencies
    content = content.replace(/\}\s*,\s*\[\s*([^\]]*)\s*\]\s*\)\s*;/g, '}, [$1]);');
    
    // Fix missing closing braces in objects
    let openBraces = 0;
    let closeBraces = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const prevChar = content[i - 1];
      
      if ((char === '"' || char === "'") && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
      }
      
      if (!inString) {
        if (char === '{') openBraces++;
        if (char === '}') closeBraces++;
      }
    }
    
    // If we have unmatched braces, try to fix them
    if (openBraces > closeBraces) {
      const missingBraces = openBraces - closeBraces;
      // Remove "No newline at end of file" if it exists
      content = content.replace(/\n\s*No\s+newline\s+at\s+end\s+of\s+file\s*$/, '');
      // Add missing closing braces
      content = content.trim() + '\n' + '}'.repeat(missingBraces) + '\n';
      hasChanges = true;
    }
    
    // Fix specific error patterns from the type check
    content = content.replace(/\}\s*\n\s*\}\s*\n\s*\}\s*\n\s*\}\s*\n\s*\}\s*\n\s*\}\s*\n\s*\}\s*\n\s*No\s+newline\s+at\s+end\s+of\s+file\s*$/g, '\n');
    
    // Clean up extra newlines and whitespace
    content = content.replace(/\n\s*\n\s*\n\s*\n/g, '\n\n');
    content = content.replace(/\s+$/gm, '');
    
    if (hasChanges || content !== originalContent) {
      fs.writeFileSync(filePath, content);
      filesFixed++;
      totalChanges++;
      console.log(`✅ Fixed ${file}`);
    }
  });
  
  console.log(`\n🎉 Fixed ${filesFixed} files with ${totalChanges} changes`);
  return { filesFixed, totalChanges };
}

// Run the fix
try {
  const result = fixRemainingErrors();
  console.log(`\n✨ Remaining error fixes completed!`);
  console.log(`📊 Files fixed: ${result.filesFixed}`);
  console.log(`📊 Total changes: ${result.totalChanges}`);
} catch (error) {
  console.error('❌ Error during fixing:', error);
  process.exit(1);
}