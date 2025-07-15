import { Box, Typography, Button } from '@mui/material';

// NO className, NO style={{}}
// This is an example of MUI-only component structure
const ExampleComponent = () => {
  return (
    <Box 
      sx={{ 
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1
      }}
    >
      <Typography variant="h5" gutterBottom>
        Title
      </Typography>
      <Button variant="contained" color="primary">
        Click Me
      </Button>
    </Box>
  );
};

export default ExampleComponent;