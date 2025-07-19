import React from 'react';
import { Route } from 'react-router-dom';
import ContractDashboard from '../../features/contracts/components/ContractDashboard';

export const contractRoutes = (
  <Route path="contracts">
    <Route index element={<ContractDashboard />} />
  </Route>
);