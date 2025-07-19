import React from 'react';
import { Box, Typography, Container } from "@mui/material";

export const ComplianceReports: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Compliance Reports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and generate compliance reports for your organization
        </Typography>
      </Box>
    </Container>
  );
};

export default ComplianceReports;