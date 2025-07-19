const fs = require('fs');
const path = require('path');

// Map of missing icons to their correct imports
const iconMappings = {
  'ChevronUpIcon': '@heroicons/react/24/outline',
  'ChevronDownIcon': '@heroicons/react/24/outline',
  'ExclamationTriangleIcon': '@heroicons/react/24/outline',
  'ArrowPathIcon': '@heroicons/react/24/outline',
  'UserCircleIcon': '@heroicons/react/24/outline',
  'LogoutIcon': '@heroicons/react/24/outline',
  'PdfIcon': '@heroicons/react/24/outline',
  'ImageIcon': '@heroicons/react/24/outline',
  'AddIcon': '@heroicons/react/24/outline',
  'AttachIcon': '@heroicons/react/24/outline',
  'ViewIcon': '@heroicons/react/24/outline',
  'DownloadIcon': '@heroicons/react/24/outline',
  'DeleteIcon': '@heroicons/react/24/outline',
  'SparklesIcon': '@heroicons/react/24/outline',
  'ChartBarIcon': '@heroicons/react/24/outline',
  'UserGroupIcon': '@heroicons/react/24/outline',
  'ShieldCheckIcon': '@heroicons/react/24/outline',
  'PlusIcon': '@heroicons/react/24/outline',
  'FunnelIcon': '@heroicons/react/24/outline',
  'DocumentTextIcon': '@heroicons/react/24/outline',
  'CalendarDaysIcon': '@heroicons/react/24/outline',
  'EyeIcon': '@heroicons/react/24/outline',
  'AlertCircle': '@heroicons/react/24/outline'
};

// Function to fix heroicons imports in a file
function fixHeroiconsInFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Find all used icons in the file
  const usedIcons = new Set();
  
  Object.keys(iconMappings).forEach(icon => {
    if (content.includes(`<${icon}`)) {
      usedIcons.add(icon);
    }
  });
  
  if (usedIcons.size === 0) return false;
  
  // Group icons by their import source
  const importGroups = {};
  usedIcons.forEach(icon => {
    const source = iconMappings[icon];
    if (!importGroups[source]) {
      importGroups[source] = [];
    }
    importGroups[source].push(icon);
  });
  
  // Check if imports already exist
  let importsExist = false;
  Object.keys(importGroups).forEach(source => {
    if (content.includes(`from '${source}'`)) {
      importsExist = true;
    }
  });
  
  if (!importsExist) {
    // Add imports at the top after other imports
    const importStatements = Object.entries(importGroups)
      .map(([source, icons]) => `import { ${icons.join(', ')} } from '${source}';`)
      .join('\n');
    
    // Find the position to insert imports (after existing imports)
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Find the last import statement
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') && !lines[i].includes('//')) {
        insertIndex = i + 1;
      }
    }
    
    lines.splice(insertIndex, 0, importStatements);
    content = lines.join('\n');
    hasChanges = true;
  }
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed icons in: ${filePath}`);
    return true;
  }
  
  return false;
}

// Function to find all React files
function findReactFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir);
    
    entries.forEach(entry => {
      const fullPath = path.join(currentDir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !entry.includes('node_modules') && !entry.includes('.git')) {
        traverse(fullPath);
      } else if (stat.isFile() && (entry.endsWith('.tsx') || entry.endsWith('.jsx'))) {
        files.push(fullPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}

// Fix all React files
const reactFiles = findReactFiles('./src');
let fixedCount = 0;

reactFiles.forEach(file => {
  if (fixHeroiconsInFile(file)) {
    fixedCount++;
  }
});

console.log(`Fixed Heroicons imports in ${fixedCount} files.`);