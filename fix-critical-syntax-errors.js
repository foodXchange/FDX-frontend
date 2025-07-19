const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to fix critical syntax errors
function fixCriticalSyntaxErrors() {
  console.log('🔧 Starting critical syntax error fixes...');
  
  const sourceDir = path.join(__dirname, 'src');
  const files = glob.sync('**/*.{ts,tsx}', { cwd: sourceDir });
  
  let filesFixed = 0;
  let totalChanges = 0;
  
  files.forEach(file => {
    const filePath = path.join(sourceDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let hasChanges = false;
    
    // Fix malformed interface declarations
    content = content.replace(/interface\s+(\w+)\s*\{\s*([^}]*)\s*;\s*\n\s*\}\s*\n\s*\}\s*\n\s*\}/g, (match, name, props) => {
      hasChanges = true;
      return `interface ${name} {\n  ${props.trim()}\n}`;
    });
    
    // Fix broken JSX closing tags with semicolons
    content = content.replace(/(<\/[^>]*>)\s*;\s*\)/g, '$1)');
    content = content.replace(/(<[^>]*\/?>)\s*;\s*\)/g, '$1)');
    
    // Fix malformed return statements
    content = content.replace(/return\s*<\s*>\s*\{([^}]*)\}\s*<\s*\/\s*>\s*\n\s*;/g, 'return <>{$1}</>;');
    
    // Fix broken function declarations
    content = content.replace(/=\s*\(\s*\{\s*([^}]*)\s*\}\s*\)\s*=>\s*\{/g, '= ({ $1 }) => {');
    
    // Fix malformed Box components
    content = content.replace(/\n\s*}\s*\n\s*}/g, '\n  }');
    
    // Fix specific AuthGuard.tsx issues
    if (file.includes('AuthGuard.tsx')) {
      content = content.replace(/interface AuthGuardProps \{ children: React\.ReactNode;\s*\n\s*\}\s*\n\s*\}\s*\n\s*\}/g, 
        'interface AuthGuardProps {\n  children: React.ReactNode;\n}');
      
      content = content.replace(/if \(isLoading\) \{ return \(/g, 'if (isLoading) {\n    return (');
      content = content.replace(/<CircularProgress \/>;/g, '<CircularProgress />');
      content = content.replace(/<\/Box>;?\)/g, '</Box>');
      content = content.replace(/\);?\s*\n\s*\);?\s*\n\s*\}/g, '\n    );\n  }');
      content = content.replace(/return\s*<\s*>\s*\{children\}\s*<\s*\/\s*>\s*\n\s*;/g, 'return <>{children}</>;');
    }
    
    // Fix specific RoleGuard.tsx issues  
    if (file.includes('RoleGuard.tsx')) {
      content = content.replace(/interface RoleGuardProps \{ children: React\.ReactNode,\s*\n\s*allowedRoles: string\[\];\s*\n\s*\}\s*\n\s*\}\s*\n\s*\}/g, 
        'interface RoleGuardProps {\n  children: React.ReactNode;\n  allowedRoles: string[];\n}');
      
      content = content.replace(/if \(!user\) \{ return <Navigate to="\/login" replace \/>;?\s*\n\s*\}/g, 
        'if (!user) {\n    return <Navigate to="/login" replace />;\n  }');
      
      content = content.replace(/if \(!allowedRoles\.includes\(user\.role\)\) \{ return \(/g, 
        'if (!allowedRoles.includes(user.role)) {\n    return (');
      
      content = content.replace(/<Typography[^>]*>\s*You don't have permission to access this page\s*<\/Typography>;/g, 
        '<Typography variant="h5" color="error">\n          You don\'t have permission to access this page\n        </Typography>');
      
      content = content.replace(/<\/Box>;?\)/g, '</Box>');
      content = content.replace(/\);?\s*\n\s*\);?\s*\n\s*\}/g, '\n    );\n  }');
    }
    
    // Fix malformed JSX fragments
    content = content.replace(/\<\s*\/?\s*\>/g, (match) => {
      if (match.includes('/')) return '</>';
      return '<>';
    });
    
    // Fix semicolons in wrong places
    content = content.replace(/;\s*\n\s*\}/g, '\n}');
    content = content.replace(/;\s*\n\s*\);/g, '\n  );');
    
    // Fix broken template literals
    content = content.replace(/\{\$1\}/g, '{children}');
    content = content.replace(/\{\$2\}/g, '{props}');
    
    // Fix malformed arrow functions
    content = content.replace(/=\s*\(\s*\{([^}]*)\s*\}\s*\)\s*=>\s*\{/g, '= ({ $1 }) => {');
    
    // Fix malformed object properties
    content = content.replace(/(\w+):\s*([^,\n]*);/g, '$1: $2,');
    
    // Fix missing closing braces
    let openBraces = 0;
    let closeBraces = 0;
    for (let char of content) {
      if (char === '{') openBraces++;
      if (char === '}') closeBraces++;
    }
    
    if (openBraces > closeBraces) {
      const missingBraces = openBraces - closeBraces;
      content += '\n' + '}'.repeat(missingBraces);
      hasChanges = true;
    }
    
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
  const result = fixCriticalSyntaxErrors();
  console.log(`\n✨ Critical syntax error fixes completed!`);
  console.log(`📊 Files fixed: ${result.filesFixed}`);
  console.log(`📊 Total changes: ${result.totalChanges}`);
} catch (error) {
  console.error('❌ Error during fixing:', error);
  process.exit(1);
}