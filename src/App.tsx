import React, { useState } from 'react';
import RFQFormRealTime from './components/RFQFormRealTime';
import RealTimeNotifications from './components/RealTimeNotifications';
import './App.css';

function App() {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <div className="App">
        <header className="bg-blue-600 text-white p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">🥘 FoodXchange Platform</h1>
              <p className="text-blue-100">Real-Time Collaboration • Compliance Protection</p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded-md transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </header>
        
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <RFQFormRealTime />
          </div>
        </main>
        
        {/* Real-time notifications */}
        <RealTimeNotifications />
      </div>
    );
  }

  return (
    <div className="App">
      <header className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">🥘 FoodXchange Platform</h1>
          <p className="text-blue-100">Transforming Global Food Sourcing with Unified Digital Solutions</p>
        </div>
      </header>
      
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            🛡️ Real-Time Compliance System
          </h2>
          <p className="text-gray-600 mb-6">
            Live collaboration with instant compliance alerts to prevent project failures.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <h3 className="font-medium text-green-800 mb-2">🚀 NEW: Real-Time Features</h3>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• Team sees your changes instantly</li>
              <li>• Immediate alerts for compliance violations</li>
              <li>• Live collaboration on RFQ specifications</li>
              <li>• Prevents miscommunication errors</li>
            </ul>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
          >
            🔗 Start Real-Time RFQ Collaboration
          </button>
        </div>
      </main>
      
      {/* Real-time notifications */}
      <RealTimeNotifications />
    </div>
  );
}

export default App;
