const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read the warnings data
const { warnings, warningsByType } = require('./fix-lint-warnings');

// Helper function to read file
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Helper function to write file
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

// Fix unused variables and imports
function fixUnusedVars(filePath, unusedVars) {
  let content = readFile(filePath);
  const lines = content.split('\n');
  
  // Sort warnings by line number in reverse order to avoid offset issues
  const sortedWarnings = unusedVars.sort((a, b) => b.line - a.line);
  
  for (const warning of sortedWarnings) {
    const lineIndex = warning.line - 1;
    const line = lines[lineIndex];
    
    if (!line) continue;
    
    // Extract variable name from warning message
    const match = warning.message.match(/'([^']+)' is (defined but never used|assigned a value but never used)/);
    if (!match) continue;
    
    const varName = match[1];
    
    // Handle imports
    if (line.includes('import')) {
      // Check if it's a default import
      if (line.match(new RegExp(`^import\\s+${varName}\\s+from`))) {
        // Remove entire line for default imports
        lines.splice(lineIndex, 1);
      } 
      // Check if it's a named import
      else if (line.includes('{')) {
        // Remove specific import
        const importRegex = new RegExp(`\\b${varName}\\b,?\\s*`, 'g');
        lines[lineIndex] = line.replace(importRegex, '');
        
        // Clean up commas
        lines[lineIndex] = lines[lineIndex]
          .replace(/,\s*,/g, ',')
          .replace(/{\s*,/g, '{')
          .replace(/,\s*}/g, '}')
          .replace(/{\s*}/g, '{}');
        
        // Remove line if import is empty
        if (lines[lineIndex].match(/^import\s*{\s*}\s*from/)) {
          lines.splice(lineIndex, 1);
        }
      }
    }
    // Handle variable declarations
    else if (line.match(new RegExp(`\\b(const|let|var)\\s+.*\\b${varName}\\b`))) {
      // Check if it's a destructuring assignment
      if (line.includes('{') || line.includes('[')) {
        // Replace variable with underscore prefix
        lines[lineIndex] = line.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`);
      } else {
        // For simple declarations, check if we can remove the entire line
        if (!line.includes(',')) {
          lines.splice(lineIndex, 1);
        }
      }
    }
    // Handle function parameters
    else if (line.match(new RegExp(`\\(.*\\b${varName}\\b.*\\)`))) {
      // Prefix with underscore
      lines[lineIndex] = line.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`);
    }
  }
  
  // Write back
  writeFile(filePath, lines.join('\n'));
}

// Fix redeclared variables
function fixRedeclaredVars(filePath, redeclaredVars) {
  let content = readFile(filePath);
  const lines = content.split('\n');
  
  // Group by variable name
  const varsByName = {};
  redeclaredVars.forEach(warning => {
    const match = warning.message.match(/'([^']+)' is already defined/);
    if (match) {
      const varName = match[1];
      if (!varsByName[varName]) {
        varsByName[varName] = [];
      }
      varsByName[varName].push(warning);
    }
  });
  
  // Fix each redeclared variable
  Object.entries(varsByName).forEach(([varName, warnings]) => {
    // Sort by line number
    warnings.sort((a, b) => a.line - b.line);
    
    // Keep first declaration, rename others
    for (let i = 1; i < warnings.length; i++) {
      const lineIndex = warnings[i].line - 1;
      const line = lines[lineIndex];
      if (line) {
        // Rename the variable
        const newName = `${varName}${i + 1}`;
        lines[lineIndex] = line.replace(new RegExp(`\\b${varName}\\b`), newName);
        
        // Also update references in the same scope (simplified approach)
        for (let j = lineIndex + 1; j < Math.min(lineIndex + 20, lines.length); j++) {
          if (lines[j].includes(varName) && !lines[j].includes('const') && !lines[j].includes('let')) {
            lines[j] = lines[j].replace(new RegExp(`\\b${varName}\\b`, 'g'), newName);
          }
        }
      }
    }
  });
  
  writeFile(filePath, lines.join('\n'));
}

// Process files
console.log('Starting automatic lint fix...\n');

// Group warnings by file
const warningsByFile = {};
warnings.forEach(w => {
  if (!warningsByFile[w.file]) {
    warningsByFile[w.file] = {
      unusedVars: [],
      redeclaredVars: [],
      other: []
    };
  }
  
  if (w.rule === '@typescript-eslint/no-unused-vars') {
    warningsByFile[w.file].unusedVars.push(w);
  } else if (w.rule === '@typescript-eslint/no-redeclare') {
    warningsByFile[w.file].redeclaredVars.push(w);
  } else {
    warningsByFile[w.file].other.push(w);
  }
});

// Process each file
let processedFiles = 0;
Object.entries(warningsByFile).forEach(([filePath, fileWarnings]) => {
  console.log(`Processing ${path.basename(filePath)}...`);
  
  try {
    // Fix unused variables first
    if (fileWarnings.unusedVars.length > 0) {
      fixUnusedVars(filePath, fileWarnings.unusedVars);
    }
    
    // Then fix redeclared variables
    if (fileWarnings.redeclaredVars.length > 0) {
      fixRedeclaredVars(filePath, fileWarnings.redeclaredVars);
    }
    
    processedFiles++;
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
  }
});

console.log(`\nProcessed ${processedFiles} files`);

// Run ESLint fix
console.log('\nRunning ESLint auto-fix...');
try {
  execSync('npx eslint src --ext .js,.jsx,.ts,.tsx --fix', { stdio: 'inherit' });
} catch (error) {
  // ESLint returns non-zero exit code when there are warnings
}

console.log('\nDone! Run "npm run lint" to see remaining warnings.');