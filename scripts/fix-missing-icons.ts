const fs = require('fs');
const path = require('path');

interface IconMapping {
  [key: string]: string;
}

// Map of icon names to their Material-UI import names
const iconMapping: IconMapping = {
  // Common icons
  'WarningIcon': 'Warning',
  'PeopleIcon': 'People',
  'TrendingUpIcon': 'TrendingUp',
  'EventIcon': 'Event',
  'DashboardIcon': 'Dashboard',
  'PhoneIcon': 'Phone',
  'MoneyIcon': 'AttachMoney',
  'CurrencyDollarIcon': 'AttachMoney',
  'ArrowUpIcon': 'ArrowUpward',
  'ArrowDownIcon': 'ArrowDownward',
  'BriefcaseIcon': 'BusinessCenter',
  'ClockIcon': 'AccessTime',
  'TrophyIcon': 'EmojiEvents',
  'ChartBarIcon': 'BarChart',
  'FireIcon': 'LocalFireDepartment',
  'MapPinIcon': 'LocationOn',
  'TagIcon': 'Label',
  'FunnelIcon': 'FilterList',
  'CheckCircleIcon': 'CheckCircle',
  'CalendarIcon': 'CalendarToday',
  'HistoryIcon': 'History',
  'SmsIcon': 'Sms',
  'AttachFileIcon': 'AttachFile',
  'TemplateIcon': 'Description',
  'StarIcon': 'Star',
  'StarBorderIcon': 'StarBorder',
  'DragIcon': 'DragIndicator',
  'MoreIcon': 'MoreVert',
  'FlagIcon': 'Flag',
  'CheckIcon': 'Check',
  'TimeIcon': 'AccessTime',
  'FilterListIcon': 'FilterList',
  'DownloadIcon': 'Download',
  'ArrowDownTrayIcon': 'Download',
  'ImageIcon': 'Image',
  'DocumentTextIcon': 'Description',
  'CloudArrowUpIcon': 'CloudUpload',
  'XCircleIcon': 'Cancel',
  'List': 'List',
  'Record': 'FiberManualRecord',
  'MuiTab': 'Tab'
};

function fixMissingIcons(filePath: string): boolean {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const usedIcons = new Set<string>();

  // Find all icon usages
  Object.keys(iconMapping).forEach(iconName => {
    const regex = new RegExp(`<${iconName}[\\s/>]`, 'g');
    if (regex.test(content)) {
      usedIcons.add(iconMapping[iconName]);
      // Replace the icon name with the correct one
      content = content.replace(new RegExp(`<${iconName}([\\s/>])`, 'g'), `<${iconMapping[iconName]}$1`);
      content = content.replace(new RegExp(`</${iconName}>`, 'g'), `</${iconMapping[iconName]}>`);
      modified = true;
    }
  });

  if (usedIcons.size > 0) {
    // Check if file already has MUI icon imports
    const muiIconImportRegex = /import\s+{([^}]+)}\s+from\s+['"]@mui\/icons-material['"]/;
    const match = content.match(muiIconImportRegex);
    
    if (match) {
      // Add missing icons to existing import
      const existingIcons = match[1].split(',').map((s: string) => s.trim());
      const allIcons = new Set([...existingIcons, ...usedIcons]);
      const sortedIcons = Array.from(allIcons).sort();
      
      content = content.replace(
        muiIconImportRegex,
        `import { ${sortedIcons.join(', ')} } from '@mui/icons-material'`
      );
    } else {
      // Add new import after other imports
      const sortedIcons = Array.from(usedIcons).sort();
      const importStatement = `import { ${sortedIcons.join(', ')} } from '@mui/icons-material';`;
      
      // Find the last import statement
      const importRegex = /import[^;]+from[^;]+;/g;
      const imports = content.match(importRegex);
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        content = content.slice(0, lastImportIndex + lastImport.length) + '\n' + importStatement + content.slice(lastImportIndex + lastImport.length);
      }
    }
    
    fs.writeFileSync(filePath, content);
    return true;
  }
  
  return modified;
}

function processDirectory(dir: string): void {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules')) {
      processDirectory(filePath);
    } else if ((file.endsWith('.tsx') || file.endsWith('.ts')) && !file.includes('.test.')) {
      if (fixMissingIcons(filePath)) {
        console.log(`✅ Fixed icons in: ${path.relative(process.cwd(), filePath)}`);
        fixedCount++;
      }
    }
  }
}

console.log('🔧 Fixing missing icon imports...\n');
processDirectory(path.join(process.cwd(), 'src'));
console.log('\n✨ Icon import fixing complete!');