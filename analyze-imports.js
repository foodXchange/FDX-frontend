const fs = require('fs');
const path = require('path');

// Analysis results
const results = {
  unusedImports: [],
  deadCode: [],
  duplicateImports: [],
  missingImports: [],
  optimizationOpportunities: []
};

// Helper functions
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const analysis = {
      file: filePath,
      unusedImports: [],
      duplicateImports: [],
      deadCode: [],
      missingImports: [],
      optimizations: []
    };

    // Extract imports
    const imports = [];
    const importRegex = /^import\s+(?:(?:\{[^}]*\}|\w+|\*\s+as\s+\w+)(?:\s*,\s*(?:\{[^}]*\}|\w+))*\s+from\s+)?['"]([^'"]+)['"];?/gm;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const line = lines.findIndex(l => l.includes(match[0]));
      imports.push({
        full: match[0],
        module: match[1],
        line: line + 1,
        raw: match[0]
      });
    }

    // Check for duplicate imports
    const moduleMap = new Map();
    imports.forEach(imp => {
      if (moduleMap.has(imp.module)) {
        analysis.duplicateImports.push({
          module: imp.module,
          lines: [moduleMap.get(imp.module).line, imp.line]
        });
      } else {
        moduleMap.set(imp.module, imp);
      }
    });

    // Extract imported names
    const importedNames = new Set();
    imports.forEach(imp => {
      const namedImports = imp.full.match(/\{([^}]+)\}/);
      if (namedImports) {
        namedImports[1].split(',').forEach(name => {
          const cleanName = name.trim().split(' as ')[0];
          importedNames.add(cleanName);
        });
      }
      
      const defaultImport = imp.full.match(/import\s+(\w+)\s+from/);
      if (defaultImport) {
        importedNames.add(defaultImport[1]);
      }
      
      const namespaceImport = imp.full.match(/import\s+\*\s+as\s+(\w+)/);
      if (namespaceImport) {
        importedNames.add(namespaceImport[1]);
      }
    });

    // Check for unused imports
    importedNames.forEach(name => {
      const usageRegex = new RegExp(`\\b${name}\\b`, 'g');
      const matches = content.match(usageRegex) || [];
      // If only found in import statement, it's unused
      if (matches.length <= 1) {
        analysis.unusedImports.push(name);
      }
    });

    // Check for dead code (unused functions, variables, components)
    const declarations = content.match(/(?:const|let|var|function|class|interface|type)\s+(\w+)/g) || [];
    declarations.forEach(decl => {
      const name = decl.split(/\s+/)[1];
      if (name && !importedNames.has(name)) {
        const usageRegex = new RegExp(`\\b${name}\\b`, 'g');
        const matches = content.match(usageRegex) || [];
        if (matches.length <= 1) {
          analysis.deadCode.push(name);
        }
      }
    });

    // Check for common missing imports
    const commonMissingImports = [
      { pattern: /React\./, import: "import React from 'react';" },
      { pattern: /useState|useEffect|useContext/, import: "import { useState, useEffect, useContext } from 'react';" },
      { pattern: /Material-UI|@mui/, import: "Missing MUI imports" }
    ];

    commonMissingImports.forEach(({ pattern, import: importStatement }) => {
      if (pattern.test(content) && !content.includes(importStatement.split(' from ')[0])) {
        analysis.missingImports.push(importStatement);
      }
    });

    // Check for optimization opportunities
    if (content.includes("import * as")) {
      analysis.optimizations.push("Consider using named imports instead of namespace imports");
    }
    
    if (content.includes("import '@mui/material'")) {
      analysis.optimizations.push("Use specific MUI component imports for better tree-shaking");
    }

    return analysis;
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return null;
  }
}

// Get all TypeScript/React files
function getAllFiles() {
  const { execSync } = require('child_process');
  const files = execSync('find src -type f -name "*.tsx" -o -name "*.ts" | grep -E "(components|features|services|hooks|utils)"', { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(f => f.length > 0);
  return files;
}

// Main analysis
console.log('Starting comprehensive import analysis...');
const files = getAllFiles();
console.log(`Analyzing ${files.length} files...`);

const analysisResults = [];
files.forEach((file, index) => {
  if (index % 20 === 0) {
    console.log(`Progress: ${index}/${files.length}`);
  }
  
  const analysis = analyzeFile(file);
  if (analysis) {
    analysisResults.push(analysis);
  }
});

// Aggregate results
const summary = {
  totalFiles: files.length,
  filesWithUnusedImports: 0,
  filesWithDeadCode: 0,
  filesWithDuplicates: 0,
  filesWithMissingImports: 0,
  filesWithOptimizations: 0,
  topIssues: []
};

analysisResults.forEach(analysis => {
  if (analysis.unusedImports.length > 0) {
    summary.filesWithUnusedImports++;
    results.unusedImports.push({
      file: analysis.file,
      unused: analysis.unusedImports
    });
  }
  
  if (analysis.deadCode.length > 0) {
    summary.filesWithDeadCode++;
    results.deadCode.push({
      file: analysis.file,
      dead: analysis.deadCode
    });
  }
  
  if (analysis.duplicateImports.length > 0) {
    summary.filesWithDuplicates++;
    results.duplicateImports.push({
      file: analysis.file,
      duplicates: analysis.duplicateImports
    });
  }
  
  if (analysis.missingImports.length > 0) {
    summary.filesWithMissingImports++;
    results.missingImports.push({
      file: analysis.file,
      missing: analysis.missingImports
    });
  }
  
  if (analysis.optimizations.length > 0) {
    summary.filesWithOptimizations++;
    results.optimizationOpportunities.push({
      file: analysis.file,
      optimizations: analysis.optimizations
    });
  }
});

// Sort by impact
results.unusedImports.sort((a, b) => b.unused.length - a.unused.length);
results.deadCode.sort((a, b) => b.dead.length - a.dead.length);

console.log('\n=== IMPORT ANALYSIS SUMMARY ===');
console.log(`Total files analyzed: ${summary.totalFiles}`);
console.log(`Files with unused imports: ${summary.filesWithUnusedImports}`);
console.log(`Files with dead code: ${summary.filesWithDeadCode}`);
console.log(`Files with duplicate imports: ${summary.filesWithDuplicates}`);
console.log(`Files with missing imports: ${summary.filesWithMissingImports}`);
console.log(`Files with optimization opportunities: ${summary.filesWithOptimizations}`);

// Output top issues
console.log('\n=== TOP UNUSED IMPORTS ===');
results.unusedImports.slice(0, 10).forEach(item => {
  console.log(`${item.file}: ${item.unused.join(', ')}`);
});

console.log('\n=== TOP DEAD CODE ===');
results.deadCode.slice(0, 10).forEach(item => {
  console.log(`${item.file}: ${item.dead.join(', ')}`);
});

console.log('\n=== DUPLICATE IMPORTS ===');
results.duplicateImports.slice(0, 10).forEach(item => {
  console.log(`${item.file}: ${item.duplicates.map(d => d.module).join(', ')}`);
});

// Write detailed results to file
fs.writeFileSync('import-analysis-results.json', JSON.stringify(results, null, 2));
console.log('\nDetailed results written to import-analysis-results.json');