import { Routes, Route } from 'react-router-dom';
import { lazyWithOptimizations } from '@/components/shared/withOptimizations';

// Lazy load Agent components
const AgentDashboard = lazyWithOptimizations(() => 
  import('@/features/agents/components/AgentDashboard').then(m => ({ default: m.AgentDashboard }))
);
const ARMDashboard = lazyWithOptimizations(() => 
  import('@/features/agents/components/ARMDashboard').then(m => ({ default: m.ARMDashboard }))
);
const LeadManagement = lazyWithOptimizations(() => 
  import('@/features/agents/components/LeadManagement').then(m => ({ default: m.LeadManagement }))
);
const CommissionDashboard = lazyWithOptimizations(() => 
  import('@/features/agents/components/CommissionDashboard').then(m => ({ default: m.CommissionDashboard }))
);
const AgentRFQList = lazyWithOptimizations(() => 
  import('@/features/agents/components/AgentRFQList').then(m => ({ default: m.AgentRFQList }))
);

export default function AgentRoutes() {
  return (
    <Routes>
      <Route index element={<AgentDashboard />} />
      <Route path="arm" element={<ARMDashboard />} />
      <Route path="leads" element={<LeadManagement />} />
      <Route path="commissions" element={<CommissionDashboard />} />
      <Route path="rfqs" element={<AgentRFQList />} />
    </Routes>
  );
}