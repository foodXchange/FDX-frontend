const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up unused imports...');

// Files with unused imports
const filesToClean = [
  {
    file: './src/components/__tests__/ErrorProvider.test.tsx',
    remove: ['React']
  },
  {
    file: './src/components/leads/LeadDocuments.tsx',
    remove: ['DescriptionIcon']
  },
  {
    file: './src/components/OfflineIndicator.tsx',
    remove: ['Box']
  }
];

function cleanUnusedImports(fileInfo) {
  const { file, remove } = fileInfo;
  
  if (!fs.existsSync(file)) {
    console.warn(`⚠️ File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;

  remove.forEach(importName => {
    // Remove from import statements
    const importRegex = new RegExp(`import\\s+${importName}\\s+from\\s+['"][^'"]+['"];?\\s*\\n?`, 'g');
    content = content.replace(importRegex, '');

    // Remove from named imports
    const namedImportRegex = new RegExp(`(import\\s*{[^}]*?)\\s*${importName}\\s*,?\\s*([^}]*}\\s*from)`, 'g');
    content = content.replace(namedImportRegex, (match, before, after) => {
      // Clean up extra commas
      let result = before + after;
      result = result.replace(/,\s*,/g, ',');
      result = result.replace(/{\s*,/g, '{');
      result = result.replace(/,\s*}/g, '}');
      result = result.replace(/{\s*}/g, '{}'); // Handle empty imports
      return result;
    });

    // Also handle cases where it might be the only import
    const singleNamedImportRegex = new RegExp(`(import\\s*{\\s*)${importName}(\\s*}\\s*from\\s*['"][^'"]+['"];?)`, 'g');
    content = content.replace(singleNamedImportRegex, '');
  });

  // Clean up any resulting empty lines
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log(`✅ Cleaned ${path.basename(file)} - removed: ${remove.join(', ')}`);
  }
}

// Clean all files
filesToClean.forEach(fileInfo => {
  cleanUnusedImports(fileInfo);
});

console.log('\n✅ Import cleanup complete!');