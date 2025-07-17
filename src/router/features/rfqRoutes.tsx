import { Routes, Route } from 'react-router-dom';
import { lazyWithOptimizations } from '@/components/shared/withOptimizations';

// Lazy load RFQ components
const RFQList = lazyWithOptimizations(() => 
  import('@/features/rfq/RFQList').then(m => ({ default: m.RFQList }))
);
const CreateRFQ = lazyWithOptimizations(() => 
  import('@/features/rfq/CreateRFQ').then(m => ({ default: m.CreateRFQ }))
);
const RFQDetail = lazyWithOptimizations(() => 
  import('@/features/rfq/RFQDetail').then(m => ({ default: m.RFQDetail }))
);
const RFQDashboard = lazyWithOptimizations(() => 
  import('@/features/rfq/RFQDashboard').then(m => ({ default: m.RFQDashboard }))
);

export default function RFQRoutes() {
  return (
    <Routes>
      <Route index element={<RFQList />} />
      <Route path="dashboard" element={<RFQDashboard />} />
      <Route path="create" element={<CreateRFQ />} />
      <Route path=":id" element={<RFQDetail />} />
    </Routes>
  );
}