const fs = require('fs');
const path = require('path');

// Function to fix sx prop issues in ErrorContext.tsx
function fixErrorContext() {
  const filePath = './src/components/ErrorBoundary/ErrorContext.tsx';
  
  if (!fs.existsSync(filePath)) {
    console.log('ErrorContext.tsx not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace div elements with sx props to Box components
  content = content.replace(/<div sx=\{/g, '<Box sx={');
  content = content.replace(/<\/div>/g, '</Box>');
  
  // Replace span elements with sx props to Typography components
  content = content.replace(/<span sx=\{([^}]+)\}>([^<]+)<\/span>/g, '<Typography variant="body2" sx={$1}>$2</Typography>');
  
  // Replace h3/h4 elements with sx props to Typography components
  content = content.replace(/<h3 sx=\{([^}]+)\}>([^<]+)<\/h3>/g, '<Typography variant="h6" sx={$1}>$2</Typography>');
  content = content.replace(/<h4 sx=\{([^}]+)\}>([^<]+)<\/h4>/g, '<Typography variant="h6" sx={$1}>$2</Typography>');
  
  // Replace button with sx props to Button component
  content = content.replace(
    /<button\s+onClick=\{([^}]+)\}\s+sx=\{([^}]+\})\}\s*>\s*([^<]+)\s*<\/button>/gs,
    '<Button onClick={$1} sx={$2}>$3</Button>'
  );
  
  // Add necessary imports if not present
  if (!content.includes('import { Box, Typography, Button } from')) {
    if (content.includes('import React')) {
      content = content.replace(
        'import React',
        'import React from \'react\';\nimport { Box, Typography, Button } from \'@mui/material\';'
      );
    } else {
      content = 'import React from \'react\';\nimport { Box, Typography, Button } from \'@mui/material\';\n' + content;
    }
  }
  
  fs.writeFileSync(filePath, content);
  console.log('Fixed sx props in ErrorContext.tsx');
}

// Run the fix
fixErrorContext();