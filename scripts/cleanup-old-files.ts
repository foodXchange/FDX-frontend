const fs = require('fs');
const path = require('path');

interface CleanupOptions {
  dryRun?: boolean;
  verbose?: boolean;
}

const OLD_JS_FILES = [
  'fix-grid-imports.js',
  'fix-grid-usage.js',
  'fix-all-errors.js',
  'fix-all-errors-v2.js',
  'fix-grid-v5-errors.js',
  'fix-remaining-grid-errors.js',
  'fix-grid-size-syntax.js',
  'fix-remaining-errors.js',
  'analyze-imports.js',
  'cleanup-codebase.js',
  'fix-duplicate-imports.js',
  'fix-mui-styles.js',
  'fix-unused-imports.js',
  'fix-imports.js',
  'fix-compilation-errors.js',
  'test-upload.js',
  'build-for-deploy.js', // We have .ts version now
  'server.js' // We have .ts version now
];

async function cleanupOldFiles(options: CleanupOptions = {}) {
  const { dryRun = false, verbose = true } = options;
  
  console.log('🧹 Cleaning up old JavaScript files...\n');
  
  let deletedCount = 0;
  let skippedCount = 0;
  
  for (const file of OLD_JS_FILES) {
    const filePath = path.join(process.cwd(), file);
    
    try {
      if (fs.existsSync(filePath)) {
        if (dryRun) {
          console.log(`[DRY RUN] Would delete: ${file}`);
        } else {
          fs.unlinkSync(filePath);
          if (verbose) {
            console.log(`✅ Deleted: ${file}`);
          }
        }
        deletedCount++;
      } else {
        skippedCount++;
        if (verbose) {
          console.log(`⏭️  Skipped (not found): ${file}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error deleting ${file}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Files ${dryRun ? 'would be' : ''} deleted: ${deletedCount}`);
  console.log(`   Files not found: ${skippedCount}`);
  
  if (dryRun) {
    console.log('\n💡 Run without --dry-run flag to actually delete files');
  }
}

// Run the cleanup
const isDryRun = process.argv.includes('--dry-run');
const isQuiet = process.argv.includes('--quiet');

cleanupOldFiles({ 
  dryRun: isDryRun, 
  verbose: !isQuiet 
}).catch(console.error);