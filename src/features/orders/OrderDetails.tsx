import React from 'react';
import { Box, Typography, Container } from "@mui/material";
import { useParams } from "react-router-dom";

export const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Order Details
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Order ID: {orderId}
        </Typography>
      </Box>
    </Container>
  );
};

export default OrderDetails;