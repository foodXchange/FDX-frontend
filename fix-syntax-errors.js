const fs = require('fs');
const path = require('path');
const glob = require('glob');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Remove extra semicolons in type definitions
    content = content.replace(/;\s*\};/g, ';\n};');
    content = content.replace(/;\s*}/g, '\n}');
    
    // Fix double semicolons
    content = content.replace(/;;\s*$/gm, ';');
    
    // Fix semicolons after closing braces in object literals
    content = content.replace(/},;\s*$/gm, '},');
    content = content.replace(/\}\);\s*$/gm, '})');
    
    // Fix semicolons in type union definitions
    content = content.replace(/\|\s*'(\w+)';\s*$/gm, "| '$1'");
    
    // Fix closing JSX tags with semicolons
    content = content.replace(/<\/(\w+)>;\s*$/gm, '</$1>');
    content = content.replace(/<\/Box>;\s*\);/gm, '</Box>\n  );');
    content = content.replace(/<\/(\w+)>;\s*\);\s*$/gm, '</$1>\n  );');
    
    // Fix patterns like </Button>; at the end of JSX
    content = content.replace(/(<\/[A-Za-z]+>);\s*$/gm, '$1');
    
    // Fix React hooks without React prefix
    if (!content.includes("import React") && content.includes("useState")) {
      content = content.replace(/const \[/g, 'const [');
    }
    
    // Fix semicolons in interface property definitions
    content = content.replace(/^(\s*\w+\??\s*:\s*\{)\s*;/gm, '$1');
    
    // Fix semicolons in arrow function return statements
    content = content.replace(/=>\s*\{;/g, '=> {');
    
    // Fix component definitions with extra semicolons
    content = content.replace(/\);\s*=>\s*\{/g, ') => {');
    
    // Fix onClick handlers with extra semicolons
    content = content.replace(/onClick=\{[^}]*\(\)\s*=>\s*\{;/g, (match) => {
      return match.replace('{;', '{');
    });
    
    // Fix variable declarations with extra semicolons
    content = content.replace(/^(\s*const\s+\w+\s*=\s*[^;]+);\s*;/gm, '$1;');
    
    // Fix object literals in variable declarations
    content = content.replace(/=\s*\{([^}]+)\};\s*;/g, '= {$1};');
    
    // Fix JSX return statements
    content = content.replace(/return\s*\(\s*<([^>]+)>;\s*$/gm, 'return (\n    <$1>');
    
    // Fix closing parentheses with semicolons
    content = content.replace(/\)\s*;\s*}/g, ')\n  }');
    
    // Fix No newline at end of file appearing in the middle
    content = content.replace(/ No newline at end of file/g, '');
    
    // Fix interface definitions with semicolons after properties
    content = content.replace(/^(\s*interface\s+\w+\s*\{[^}]*)};\s*$/gm, '$1}');
    
    // Fix type definitions with semicolons after properties  
    content = content.replace(/^(\s*type\s+\w+\s*=\s*\{[^}]*)};\s*$/gm, '$1}');
    
    // Fix arrow function with Promise type
    content = content.replace(/Promise<ApiResponse<T>,/g, 'Promise<ApiResponse<T>>');
    
    // Fix mutationFn declaration
    content = content.replace(/mutationFn:\s*\(variables:\s*TVariables\)\s*=>\s*Promise<ApiResponse<TData>,/g,
                              'mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>');
    
    // Fix result type declaration
    content = content.replace(/Promise<ApiResponse<TData>,\s*options/g, 'Promise<ApiResponse<TData>>, options');
    
    // Fix switch statement formatting
    content = content.replace(/case\s+'(\w+)':\s*return\s+'(\w+)';\s*case\s+'(\w+)':/g,
                              "case '$1':\n        return '$2';\n      case '$3':");
    
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