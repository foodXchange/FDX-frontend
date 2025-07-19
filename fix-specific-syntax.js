const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  const content = fs.readFileSync(filePath, 'utf8');
  let fixed = content;
  let hasChanges = false;

  // Fix interface properties that end with semicolons instead of commas
  const interfacePropPattern = /(\w+\s*:\s*[^,;\n]+);(\s*[\w}])/g;
  if (fixed.match(interfacePropPattern)) {
    fixed = fixed.replace(/(\w+\s*:\s*[^,;\n]+);(\s*[\w}])/g, '$1,$2');
    hasChanges = true;
  }

  // Fix object properties that have semicolons instead of commas
  const objectSemicolonPattern = /(\w+\s*:\s*[^,;\n}]+);(\s*[\w'])/g;
  if (fixed.match(objectSemicolonPattern)) {
    fixed = fixed.replace(/(\w+\s*:\s*[^,;\n}]+);(\s*[\w'])/g, '$1,$2');
    hasChanges = true;
  }

  // Fix missing commas in destructuring
  const destructuringPattern = /\{\s*([^}]+)\s*\}\s*=/g;
  const matches = fixed.match(destructuringPattern);
  if (matches) {
    matches.forEach(match => {
      const fixedMatch = match.replace(/(\w+)\s+(\w+)/g, '$1, $2');
      if (fixedMatch !== match) {
        fixed = fixed.replace(match, fixedMatch);
        hasChanges = true;
      }
    });
  }

  // Fix malformed arrow functions with extra spaces
  const arrowFunctionSpacingPattern = /\)\s*=\s*>\s*\{/g;
  if (fixed.match(arrowFunctionSpacingPattern)) {
    fixed = fixed.replace(/\)\s*=\s*>\s*\{/g, ') => {');
    hasChanges = true;
  }

  // Fix function parameters with missing commas
  const funcParamPattern = /\(\s*\{\s*([^}]+)\s*\}\s*\)/g;
  const paramMatches = fixed.match(funcParamPattern);
  if (paramMatches) {
    paramMatches.forEach(match => {
      const inner = match.slice(2, -2); // Remove ({ and })
      const fixedInner = inner.replace(/(\w+)\s+(\w+)(?!\s*[,:}])/g, '$1, $2');
      const fixedMatch = `({ ${fixedInner} })`;
      if (fixedMatch !== match) {
        fixed = fixed.replace(match, fixedMatch);
        hasChanges = true;
      }
    });
  }

  // Fix interface declarations with malformed syntax
  const interfaceDeclarationPattern = /interface\s+(\w+)\s*\{([^}]+)\}/g;
  const interfaceMatches = [...fixed.matchAll(interfaceDeclarationPattern)];
  interfaceMatches.forEach(match => {
    const interfaceBody = match[2];
    let fixedBody = interfaceBody;
    
    // Fix property declarations
    fixedBody = fixedBody.replace(/(\w+\s*:\s*[^,;\n}]+);/g, '$1;');
    fixedBody = fixedBody.replace(/(\w+\s*:\s*[^,;\n}]+),/g, '$1;');
    
    if (fixedBody !== interfaceBody) {
      const fixedInterface = `interface ${match[1]} {${fixedBody}}`;
      fixed = fixed.replace(match[0], fixedInterface);
      hasChanges = true;
    }
  });

  // Fix export statements with malformed syntax
  const exportPattern = /export\s*\{\s*([^}]+)\s*\}\s*from/g;
  const exportMatches = [...fixed.matchAll(exportPattern)];
  exportMatches.forEach(match => {
    const exports = match[1];
    const fixedExports = exports.replace(/(\w+)\s+(\w+)/g, '$1, $2').replace(/,\s*,/g, ',');
    if (fixedExports !== exports) {
      const fixedExport = `export { ${fixedExports.trim()} } from`;
      fixed = fixed.replace(match[0], fixedExport);
      hasChanges = true;
    }
  });

  // Fix const declarations with missing equals
  const constPattern = /const\s+(\w+)\s*([^=\n;]+)(?!=)/g;
  if (fixed.match(constPattern)) {
    fixed = fixed.replace(/const\s+(\w+)\s*([^=\n;]+)(?!=)/g, 'const $1 = $2');
    hasChanges = true;
  }

  // Fix return statements in wrong places
  const wrongReturnPattern = /(\s+)return\s+(const|let|var|if|for|while|switch|function|\w+\s*:\s*)/g;
  if (fixed.match(wrongReturnPattern)) {
    fixed = fixed.replace(/(\s+)return\s+(const|let|var|if|for|while|switch|function|\w+\s*:\s*)/g, '$1$2');
    hasChanges = true;
  }

  // Fix missing closing brackets/braces
  const openBrackets = (fixed.match(/\[/g) || []).length;
  const closeBrackets = (fixed.match(/\]/g) || []).length;
  if (openBrackets > closeBrackets) {
    fixed = fixed + ']'.repeat(openBrackets - closeBrackets);
    hasChanges = true;
  }

  const openParens = (fixed.match(/\(/g) || []).length;
  const closeParens = (fixed.match(/\)/g) || []).length;
  if (openParens > closeParens) {
    fixed = fixed + ')'.repeat(openParens - closeParens);
    hasChanges = true;
  }

  // Fix template literal issues
  const templateLiteralPattern = /`([^`]*)\${([^}]*)}([^`]*)`/g;
  const templateMatches = [...fixed.matchAll(templateLiteralPattern)];
  templateMatches.forEach(match => {
    const [full, before, expr, after] = match;
    if (expr.includes('$')) {
      const fixedExpr = expr.replace(/\$/g, '');
      const fixedTemplate = `\`${before}\${${fixedExpr}}${after}\``;
      fixed = fixed.replace(full, fixedTemplate);
      hasChanges = true;
    }
  });

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

console.log('Starting specific syntax fixes...');
const fixedCount = walkDirectory('./src');
console.log(`Fixed ${fixedCount} files`);