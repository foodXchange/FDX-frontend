// File: /src/App.tsx
import React from 'react';
import './App.css';

// Import real-time features
import RealTimeRFQDashboard from './features/rfq/components/RealTimeRFQDashboard';
import ComplianceDashboard from './features/compliance/components/ComplianceDashboard';

function App() {
  const [activeFeature, setActiveFeature] = React.useState<'rfq' | 'compliance'>('rfq');
  
  // Mock user data - replace with actual auth
  const currentUser = {
    userId: 'user_001',
    userName: 'John Doe'
  };

  return (
    <div className="App">
      <nav className="bg-white shadow mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">FoodXchange</h1>
              <span className="ml-2 text-sm text-green-600">● Live</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveFeature('rfq')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeFeature === 'rfq'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Real-time RFQ
              </button>
              <button
                onClick={() => setActiveFeature('compliance')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeFeature === 'compliance'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Compliance
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {activeFeature === 'rfq' && (
          <RealTimeRFQDashboard
            userId={currentUser.userId}
            userName={currentUser.userName}
          />
        )}
        {activeFeature === 'compliance' && <ComplianceDashboard />}
      </main>
    </div>
  );
}

export default App;

