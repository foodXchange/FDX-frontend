const fs = require('fs');
const path = require('path');
const glob = require('glob');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Fix broken imports that are all on one line
    content = content.replace(/import\s*\{[^}]*\}\s*from\s*'[^']*';\s*import\s*\{[^}]*\}\s*from\s*'[^']*';\s*import\s*\{[^}]*\}\s*from\s*'[^']*';/g, (match) => {
      return match.replace(/';import/g, '\';\nimport');
    });
    
    // Fix basic interface syntax
    content = content.replace(/interface\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{([^}]*)\}/g, (match, name, body) => {
      // Clean up the body by ensuring proper semicolons
      let cleanBody = body.replace(/;\s*\n\s*;/g, ';\n').replace(/\n\s*\n/g, '\n').trim();
      return `interface ${name} {\n${cleanBody}\n}`;
    });
    
    // Fix malformed JSX returns
    content = content.replace(/return\s*\(\s*\n\s*<([^>]+)>\s*\n\s*\)\s*\n\s*}/g, 'return (\n    <$1>\n  );\n}');
    
    // Fix component exports
    content = content.replace(/\)\s*\n\s*}\s*\n\s*export\s+default/g, ');\n};\n\nexport default');
    
    // Fix type definitions
    content = content.replace(/type\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*\|\s*'([^']+)'\s*\|\s*'([^']+)'/g, 'type $1 = \n  | \'$2\'\n  | \'$3\'');
    
    // Fix function declarations
    content = content.replace(/function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\([^)]*\)\s*\{/g, (match) => {
      return match.replace(/\{$/, '{\n');
    });
    
    // Fix const declarations
    content = content.replace(/const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([^;]+)\s*\n([A-Za-z_])/g, 'const $1 = $2;\n$3');
    
    // Fix object destructuring
    content = content.replace(/const\s*\{\s*\}\s*=\s*([^;]+)\s*\n/g, 'const {} = $1;\n');
    
    // Fix JSX components
    content = content.replace(/\}\s*\n\s*function\s+([A-Za-z_][A-Za-z0-9_]*)/g, '}\n\nfunction $1');
    
    // Fix interface closing
    content = content.replace(/\}\s*\n\s*interface\s+([A-Za-z_][A-Za-z0-9_]*)/g, '}\n\ninterface $1');
    
    // Fix missing semicolons in interface properties
    content = content.replace(/^(\s*[a-zA-Z_][a-zA-Z0-9_]*\??:\s*[^;,\n\}]+)\s*\n(\s*[a-zA-Z_][a-zA-Z0-9_]*\??:\s*)/gm, '$1;\n$2');
    
    // Fix missing closing braces
    content = content.replace(/\s*\n\s*export\s+default\s+([A-Za-z_][A-Za-z0-9_]*);/g, '\n\nexport default $1;');
    
    // Fix arrow function syntax
    content = content.replace(/=>\s*\{\s*\n\s*\}\s*;/g, '=> {};');
    
    // Fix switch statements
    content = content.replace(/switch\s*\([^)]+\)\s*\{\s*case\s+'([^']+)':\s*;\s*return\s+'([^']+)'/g, 'switch ($1) {\n      case \'$1\':\n        return \'$2\'');
    
    // Fix No newline at end of file
    content = content.replace(/No newline at end of file[^\n]*\n?/g, '');
    
    // Fix basic JSX syntax
    content = content.replace(/<\/([A-Za-z][A-Za-z0-9]*)\s*>\s*\.\s*$/gm, '</$1>');
    
    // Fix empty destructuring
    content = content.replace(/\{\s*\}\s*=\s*([^;]+)\s*\n/g, '{} = $1;\n');
    
    // Fix component function definitions
    content = content.replace(/const\s+([A-Za-z_][A-Za-z0-9_]*)\s*:\s*React\.FC\s*=\s*\(\)\s*=>\s*\{/g, 'const $1: React.FC = () => {');
    
    // Fix React Fragment syntax
    content = content.replace(/<React\.Fragment\s+key=\{([^}]+)\}>/g, '<React.Fragment key={$1}>');
    
    // Fix closing parentheses
    content = content.replace(/\)\s*\n\s*\}\s*\n\s*export/g, ');\n};\n\nexport');
    
    // Fix missing semicolons after variable declarations
    content = content.replace(/^(\s*const\s+[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*[^;]+)\s*\n(\s*[a-zA-Z_])/gm, '$1;\n$2');
    
    // Fix line endings
    content = content.replace(/\r\n/g, '\n');
    
    // Ensure file ends with newline
    if (!content.endsWith('\n')) {
      content += '\n';
    }
    
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

// Find all TypeScript/TSX files
const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/build/**', '**/dist/**']
});

console.log(`Found ${files.length} TypeScript files to check...`);

let fixedCount = 0;
files.forEach(file => {
  if (fixFile(file)) {
    console.log(`Fixed: ${file}`);
    fixedCount++;
  }
});

console.log(`\nFixed ${fixedCount} files`);