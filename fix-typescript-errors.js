const fs = require('fs');
const path = require('path');
const glob = require('glob');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Fix duplicate React imports
    // Pattern: import React, { useState, useEffect } from 'react';
    //          import { FC, useState, useEffect } from 'react';
    content = content.replace(/import React,\s*\{([^}]+)\}\s*from\s*'react';\s*\nimport\s*\{[^}]+\}\s*from\s*'react';/g, 
                              (match) => {
                                const firstImport = match.match(/import React,\s*\{([^}]+)\}/)[1];
                                return `import React, { ${firstImport} } from 'react';`;
                              });
    
    // Fix leading commas in imports
    content = content.replace(/import\s*\{\s*,\s*/g, 'import { ');
    
    // Fix underscore in Omit type annotations
    content = content.replace(/Omit<([^,]+),\s*_'([^']+)'/g, "Omit<$1, '$2'");
    content = content.replace(/Omit<([^,]+),\s*_"([^"]+)"/g, 'Omit<$1, "$2"');
    
    // Fix multiple quote marks in Omit
    content = content.replace(/Omit<([^,]+),\s*'([^']+)'\s*\|\s*'([^']+)'/g, "Omit<$1, '$2' | '$3'");
    
    // Fix Promise<ResponseType<T>> patterns
    content = content.replace(/Promise<([^>]+)>>/g, 'Promise<$1>');
    
    // Fix missing type imports
    if (filePath.includes('expert-marketplace') && content.includes('FC') && !content.includes("import { FC")) {
      content = content.replace(/^(import React[^;]+;)$/m, "$1\nimport { FC } from 'react';");
    }
    
    // Fix duplicate type imports
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+'([^']+)';\s*\nimport\s+\{([^}]+)\}\s+from\s+'\2';/g,
                              (match, imports1, module, imports2) => {
                                const allImports = [...new Set([...imports1.split(','), ...imports2.split(',')]
                                  .map(i => i.trim())
                                  .filter(i => i))];
                                return `import { ${allImports.join(', ')} } from '${module}';`;
                              });
    
    // Fix useState without React prefix in class components
    content = content.replace(/^(\s*)const\s+\[([^,]+),\s*set([^\]]+)\]\s*=\s*useState/gm, 
                              '$1const [$2, set$3] = React.useState');
    
    // Fix useEffect without React prefix in class components  
    content = content.replace(/^(\s*)useEffect\(/gm, '$1React.useEffect(');
    
    // Fix missing semicolons after type declarations
    content = content.replace(/^(type\s+\w+\s*=\s*[^;]+)$/gm, '$1;');
    content = content.replace(/^(interface\s+\w+\s*\{[^}]+\})$/gm, '$1;');
    
    // Fix async arrow functions with incorrect syntax
    content = content.replace(/async\s*\(([^)]*)\)\s*:\s*Promise</g, 'async ($1): Promise<');
    
    // Fix missing return types in arrow functions
    content = content.replace(/=>\s*\{$/gm, '=> {');
    
    // Fix JSX attribute without quotes
    content = content.replace(/(\s+\w+)=\{([^}]+)\}/g, (match, attr, value) => {
      if (value.match(/^["'].*["']$/)) {
        return `${attr}=${value}`;
      }
      return match;
    });
    
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