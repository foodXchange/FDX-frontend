import React from 'react';
import RFQFormRealTime from './components/RFQFormRealTime';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold">
                <span className="text-orange-400">🥣</span> FoodXchange
              </div>
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                LIVE
              </span>
            </div>
            <div className="text-sm">
              Transforming Global Food Sourcing
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Real-Time RFQ Management
            </h1>
            <p className="text-gray-600">
              Collaborate with your team in real-time • Prevent costly errors • Ensure compliance
            </p>
          </div>

          <RFQFormRealTime />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 mb-3">🔗</div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-Time Collaboration</h3>
              <p className="text-gray-600 text-sm">
                Team members see changes instantly and get notified of critical compliance issues
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-red-600 mb-3">🚨</div>
              <h3 className="font-semibold text-gray-900 mb-2">Error Prevention</h3>
              <p className="text-gray-600 text-sm">
                Prevents spec errors like wrong cornflake colors that caused 9-month project failures
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-green-600 mb-3">✅</div>
              <h3 className="font-semibold text-gray-900 mb-2">Compliance Validation</h3>
              <p className="text-gray-600 text-sm">
                Automated food safety and regulatory compliance checks for global markets
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2025 FoodXchange • Transforming Global Food Sourcing with Unified Digital Solutions
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
