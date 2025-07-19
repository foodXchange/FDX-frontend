import React from 'react';
import { Box, Typography, Container } from "@mui/material";

export const OrderList: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Orders
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your orders
        </Typography>
      </Box>
    </Container>
  );
};

export default OrderList;