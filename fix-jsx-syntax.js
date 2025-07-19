const fs = require('fs');
const path = require('path');
const glob = require('glob');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Fix broken JSX closing tags
    content = content.replace(/<\/>;/g, '</>');
    
    // Fix React Fragment syntax
    content = content.replace(/<>\s*<\/>;/g, '<>\n    </>;');
    
    // Fix basic JSX structure
    content = content.replace(/return\s*\(\s*<>\s*<\/>\s*\)\s*;/g, 'return (\n    <>\n    </>\n  );');
    
    // Fix component exports
    content = content.replace(/\)\s*;\s*\n\s*\}\s*;\s*\n\s*export\s+default/g, ');\n};\n\nexport default');
    
    // Fix closing JSX fragments
    content = content.replace(/(<\/[^>]+>)\s*;\s*$/gm, '$1');
    
    // Fix JSX component syntax - remove semicolons from JSX tags
    content = content.replace(/(<[^>]+>)\s*;/g, '$1');
    content = content.replace(/(<\/[^>]+>)\s*;/g, '$1');
    
    // Fix function returns
    content = content.replace(/\)\s*;\s*\n\s*\}\s*;\s*$/gm, ');\n};');
    
    // Fix React component declarations
    content = content.replace(/const\s+([A-Za-z_][A-Za-z0-9_]*)\s*:\s*React\.FC\s*=\s*\(\)\s*=>\s*\{/g, 'const $1: React.FC = () => {');
    
    // Fix missing closing braces for components
    content = content.replace(/\s*\n\s*export\s+default\s+([A-Za-z_][A-Za-z0-9_]*)\s*;/g, '\n\nexport default $1;');
    
    // Fix interface definitions
    content = content.replace(/interface\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{([^}]*)\}/g, (match, name, body) => {
      // Clean up interface body
      let cleanBody = body.replace(/;\s*\n\s*;/g, ';\n').replace(/\n\s*\n/g, '\n').trim();
      if (cleanBody && !cleanBody.endsWith(';')) {
        cleanBody += ';';
      }
      return `interface ${name} {\n  ${cleanBody}\n}`;
    });
    
    // Remove extra semicolons from type definitions
    content = content.replace(/type\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([^;]+)\s*;\s*;/g, 'type $1 = $2;');
    
    // Fix const declarations
    content = content.replace(/const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([^;]+)\s*;\s*;/g, 'const $1 = $2;');
    
    // Fix object destructuring
    content = content.replace(/const\s*\{\s*\}\s*=\s*([^;]+)\s*;\s*;/g, 'const {} = $1;');
    
    // Fix switch statements
    content = content.replace(/switch\s*\([^)]+\)\s*\{\s*case\s+'([^']+)':\s*;\s*return\s+'([^']+)'/g, 'switch ($1) {\n      case \'$1\':\n        return \'$2\';');
    
    // Fix function declarations
    content = content.replace(/function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\([^)]*\)\s*\{\s*;/g, 'function $1() {');
    
    // Fix arrow functions
    content = content.replace(/=>\s*\{\s*;\s*\}/g, '=> {}');
    
    // Fix JSX attributes
    content = content.replace(/=\s*\{\s*;\s*\}/g, '={}');
    
    // Remove trailing semicolons from JSX elements
    content = content.replace(/(<[^>]*\/>)\s*;/g, '$1');
    
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