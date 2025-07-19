const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing type imports across the codebase...');

// Files that need import updates
const filesToUpdate = [
  './src/types/ai-rfq.ts',
  './src/types/sample-tracking.ts',
  './src/types/supplier-management.ts',
  './src/types/compliance-management.ts',
  './src/types/expert.ts',
  './src/types/order.ts'
];

// Common types that should be imported from common.ts
const commonTypes = [
  'DateRange',
  'ContactInfo',
  'Location',
  'GeoCoordinates',
  'Dimensions',
  'TemperatureRange',
  'HumidityRange',
  'CostAnalysis',
  'TrendData',
  'AuthorizationInfo',
  'ScheduleRequirement',
  'ProductSpecification',
  'Ingredient',
  'NutritionalInfo',
  'AllergenInfo',
  'LabelRequirement',
  'TransportationMode',
  'RouteInfo',
  'HandlingConditions',
  'IntegrityCheck',
  'MonitoringDevice',
  'SensorRange',
  'EquipmentInfo',
  'PersonnelInfo',
  'TestProtocol',
  'TestSequence',
  'PreparationStep',
  'TestParameter',
  'AcceptanceCriteria',
  'ReportingRequirement',
  'PerformanceData',
  'AnalyticsData',
  'BlockchainRecord',
  'IoTDeviceData',
  'CorrectiveAction',
  'AuditRecommendation',
  'AuditFinding',
  'AuditTeamMember',
  'SpendAnalysis',
  'DiversityMetrics',
  'SustainabilityMetrics',
  'ReviewPeriod',
  'ReviewCategory',
  'ActionItem',
  'ReviewParticipant',
  'CommunicationParticipant',
  'IntegrationConfig',
  'WebhookConfig',
  'ModelPrediction',
  'TrainingData',
  'CapacityConstraint',
  'SeasonalVariation'
];

function updateTypeImports(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Find types used in the file
  const usedTypes = [];
  commonTypes.forEach(type => {
    // Check if type is used (not in comments)
    const regex = new RegExp(`\\b${type}\\b(?![^/*]*\\*/)`, 'g');
    if (regex.test(content)) {
      usedTypes.push(type);
    }
  });

  if (usedTypes.length === 0) {
    console.log(`  No common types found in ${path.basename(filePath)}`);
    return;
  }

  // Check if import already exists
  const importRegex = /import\s*{[^}]*}\s*from\s*['"]\.\/common['"]/;
  if (importRegex.test(content)) {
    console.log(`  Import already exists in ${path.basename(filePath)}`);
    return;
  }

  // Add import at the beginning of the file
  const importStatement = `import { ${usedTypes.join(', ')} } from './common';\n`;
  
  // Find the position after the first line (usually a comment)
  const lines = content.split('\n');
  let insertPosition = 0;
  
  // Skip initial comments
  while (insertPosition < lines.length && lines[insertPosition].trim().startsWith('//')) {
    insertPosition++;
  }
  
  // Insert the import
  lines.splice(insertPosition, 0, importStatement);
  content = lines.join('\n');

  // Write back only if content changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${path.basename(filePath)} - added imports for: ${usedTypes.join(', ')}`);
  }
}

// Update all files
filesToUpdate.forEach(file => {
  updateTypeImports(file);
});

console.log('\n✅ Type import fixes complete!');