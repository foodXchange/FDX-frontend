const fs = require('fs');
const path = require('path');

// Fix AdvancedSearchFilter.tsx
const advancedSearchPath = path.join(__dirname, 'src/features/agents/components/molecules/AdvancedSearchFilter.tsx');
let content = fs.readFileSync(advancedSearchPath, 'utf8');

// Check if it's already importing Grid correctly
if (!content.includes("import { Grid }") && !content.includes("Grid,")) {
  // Add Grid to the existing MUI imports
  content = content.replace(
    "} from '@mui/material';",
    ",\n  Grid\n} from '@mui/material';"
  );
  
  // Remove any Grid2 imports if they exist
  content = content.replace(/import Grid from '@mui\/material\/Grid2';\n?/g, '');
  
  fs.writeFileSync(advancedSearchPath, content);
  console.log('Fixed Grid import in AdvancedSearchFilter.tsx');
}

// Fix AILeadScoring.tsx
const aiLeadScoringPath = path.join(__dirname, 'src/features/agents/components/organisms/AILeadScoring.tsx');
content = fs.readFileSync(aiLeadScoringPath, 'utf8');

if (!content.includes("import { Grid }") && !content.includes("Grid,")) {
  content = content.replace(
    "} from '@mui/material';",
    ",\n  Grid\n} from '@mui/material';"
  );
  
  content = content.replace(/import Grid from '@mui\/material\/Grid2';\n?/g, '');
  
  fs.writeFileSync(aiLeadScoringPath, content);
  console.log('Fixed Grid import in AILeadScoring.tsx');
}

// Fix LeadManagement.tsx
const leadManagementPath = path.join(__dirname, 'src/features/agents/pages/LeadManagement.tsx');
content = fs.readFileSync(leadManagementPath, 'utf8');

if (!content.includes("import { Grid }") && !content.includes("Grid,")) {
  content = content.replace(
    "} from '@mui/material';",
    ",\n  Grid\n} from '@mui/material';"
  );
  
  content = content.replace(/import Grid from '@mui\/material\/Grid2';\n?/g, '');
  
  fs.writeFileSync(leadManagementPath, content);
  console.log('Fixed Grid import in LeadManagement.tsx');
}

console.log('Grid usage fixes completed!');