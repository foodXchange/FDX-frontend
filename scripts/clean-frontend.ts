const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

interface CleanupResult {
  deleted: string[];
  errors: string[];
  consoleLogsRemoved: number;
}

const FILES_TO_DELETE = [
  // Backup files
  'src/App.backup.tsx',
  'src/App.debug.tsx',
  'src/App.fallback.tsx',
  'src/App.full.tsx',
  'src/App.minimal.tsx',
  'src/App.simple.tsx',
  'src/index.simple.tsx',
  'src/index.original.tsx',
  'srcApp.minimal.tsx',
  
  // Test files (keeping actual test files)
  'src/App.test.tsx', // Remove if not using tests
  
  // Temporary files
  'nul',
  
  // Batch files (keeping essential ones)
  'restart.bat',
  'start-react.bat',
  'start-dev.bat',
  'stop-dev.bat',
  'quick-start.bat',
  
  // Other temporary files
  'src/pages/TestUpload.tsx',
];

// Files to check for cleanup
const FILES_TO_CLEAN = [
  'src/App.tsx',
  'src/index.tsx',
];

async function cleanFrontend(): Promise<CleanupResult> {
  const result: CleanupResult = {
    deleted: [],
    errors: [],
    consoleLogsRemoved: 0
  };

  console.log('🧹 Cleaning frontend...\n');

  // 1. Delete unnecessary files
  console.log('📁 Removing temporary and backup files...');
  for (const file of FILES_TO_DELETE) {
    const filePath = path.join(process.cwd(), file);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        result.deleted.push(file);
        console.log(`   ✅ Deleted: ${file}`);
      }
    } catch (error) {
      result.errors.push(`Failed to delete ${file}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 2. Remove console.log statements
  console.log('\n🔍 Removing console.log statements...');
  const srcPath = path.join(process.cwd(), 'src');
  removeConsoleLogs(srcPath, result);

  // 3. Clean up unused imports
  console.log('\n📦 Running ESLint to fix unused imports...');
  try {
    execSync('npm run lint:fix', { stdio: 'inherit' });
  } catch (error) {
    console.log('   ⚠️  Some linting issues may need manual review');
  }

  // 4. Format code
  console.log('\n✨ Formatting code...');
  try {
    execSync('npm run format', { stdio: 'inherit' });
  } catch (error) {
    console.log('   ⚠️  Some formatting issues may need manual review');
  }

  // Summary
  console.log('\n📊 Cleanup Summary:');
  console.log(`   Files deleted: ${result.deleted.length}`);
  console.log(`   Console.logs removed: ${result.consoleLogsRemoved}`);
  if (result.errors.length > 0) {
    console.log(`   Errors: ${result.errors.length}`);
    result.errors.forEach(err => console.log(`      ❌ ${err}`));
  }

  return result;
}

function removeConsoleLogs(dir: string, result: CleanupResult): void {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules')) {
      removeConsoleLogs(filePath, result);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const newContent = content.replace(/console\.(log|warn|error|info|debug)\([^)]*\);?\s*\n?/g, '');
      
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        const removed = (content.match(/console\.(log|warn|error|info|debug)/g) || []).length;
        result.consoleLogsRemoved += removed;
        console.log(`   📝 Cleaned ${removed} console statements from: ${path.relative(process.cwd(), filePath)}`);
      }
    }
  }
}

// Run cleanup
cleanFrontend().catch(console.error);