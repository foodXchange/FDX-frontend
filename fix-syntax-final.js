const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  const content = fs.readFileSync(filePath, 'utf8');
  let fixed = content;
  let hasChanges = false;

  // Fix malformed arrow function declarations like "= : React.FC"
  if (fixed.includes('= : React.FC')) {
    fixed = fixed.replace(/= : React\.FC/g, ': React.FC');
    hasChanges = true;
  }

  // Fix variable assignments with malformed syntax like "locatio = n ="
  const malformedVarPattern = /(\w+)\s*=\s*(\w)\s*=\s*/g;
  if (fixed.match(malformedVarPattern)) {
    fixed = fixed.replace(/(\w+)\s*=\s*(\w)\s*=\s*/g, '$1$2 =');
    hasChanges = true;
  }

  // Fix corrupted destructuring like "{ children     }) => {,"
  const corruptedDestructuringPattern = /\{\s*([^}]+)\s+\}\)\s*=>\s*\{,/g;
  if (fixed.match(corruptedDestructuringPattern)) {
    fixed = fixed.replace(/\{\s*([^}]+)\s+\}\)\s*=>\s*\{,/g, '{ $1 }) => {');
    hasChanges = true;
  }

  // Fix JSX attributes with missing quotes like display= "flex"
  const jsxAttrPattern = /(\w+)=\s+"([^"]+)"/g;
  if (fixed.match(jsxAttrPattern)) {
    fixed = fixed.replace(/(\w+)=\s+"([^"]+)"/g, '$1="$2"');
    hasChanges = true;
  }

  // Fix JSX with object literals like state= {{ from: location }}
  const jsxObjectPattern = /(\w+)=\s+\{\{\s*([^}]+)\s*\}\}/g;
  if (fixed.match(jsxObjectPattern)) {
    fixed = fixed.replace(/(\w+)=\s+\{\{\s*([^}]+)\s*\}\}/g, '$1={{ $2 }}');
    hasChanges = true;
  }

  // Fix incomplete JSX tags like "/>" at the end of lines with "}"
  const incompleteJsxPattern = /\s*\/>\s*\}/g;
  if (fixed.match(incompleteJsxPattern)) {
    fixed = fixed.replace(/\s*\/>\s*\}/g, ' />');
    hasChanges = true;
  }

  // Fix comma in variable declaration like "const [position, setPosition] = useState({ top: 0, left: 0 }),"
  const variableCommaPattern = /\]\s*=\s*useState\([^)]+\),$/gm;
  if (fixed.match(variableCommaPattern)) {
    fixed = fixed.replace(/(\]\s*=\s*useState\([^)]+\)),$/gm, '$1;');
    hasChanges = true;
  }

  // Fix object property syntax in interfaces
  const interfacePropPattern = /(\w+:\s*[^,;\n]+),(\s*[\w}])/g;
  if (fixed.match(interfacePropPattern)) {
    fixed = fixed.replace(/(\w+:\s*[^,;\n]+),(\s*[\w}])/g, '$1;$2');
    hasChanges = true;
  }

  // Fix missing closing braces after return statements like "return <Navigate ... /> }"
  const returnJsxPattern = /(return\s+<[^>]+\/>\s*)\}/g;
  if (fixed.match(returnJsxPattern)) {
    fixed = fixed.replace(/(return\s+<[^>]+\/>\s*)\}/g, '$1;');
    hasChanges = true;
  }

  // Fix semicolons in object property definitions
  const objectSemicolonPattern = /(\w+:\s*[^,;\n}]+);(\s*[,}])/g;
  if (fixed.match(objectSemicolonPattern)) {
    fixed = fixed.replace(/(\w+:\s*[^,;\n}]+);(\s*[,}])/g, '$1$2');
    hasChanges = true;
  }

  // Fix return keyword in wrong places
  const wrongReturnPattern = /(data:|image:)/g;
  if (fixed.includes('data: image/')) {
    // Don't fix data: URLs
  } else if (fixed.match(wrongReturnPattern)) {
    fixed = fixed.replace(/return\s+(data:|image:)/g, '$1');
    hasChanges = true;
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    return true;
  }
  
  return false;
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        fixedCount += walkDirectory(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (fixFile(filePath)) {
        fixedCount++;
        console.log(`Fixed: ${filePath}`);
      }
    }
  }
  
  return fixedCount;
}

console.log('Starting final syntax fixes...');
const fixedCount = walkDirectory('./src');
console.log(`Fixed ${fixedCount} files`);