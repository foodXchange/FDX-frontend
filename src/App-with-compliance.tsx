import React from 'react';
import ComplianceRFQDashboard from './components/ComplianceRFQDashboard';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Your existing header */}
      <header className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">🥘 FoodXchange Platform</h1>
          <p className="text-blue-100">Transforming Global Food Sourcing with Unified Digital Solutions</p>
        </div>
      </header>
      
      {/* Add our compliance dashboard */}
      <main className="min-h-screen bg-gray-50">
        <ComplianceRFQDashboard />
      </main>
    </div>
  );
}

export default App;
