import React from 'react';
import RFQForm from './components/RFQForm';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">🥘 FoodXchange Platform</h1>
              <p className="text-blue-100 mt-1">Transforming Global Food Sourcing with Unified Digital Solutions</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">New Platform</div>
              <button className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded text-white text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Create Request for Quotation
          </h2>
          <p className="text-lg text-gray-600">
            ⚡ Now with <strong>real-time compliance validation</strong> to prevent costly specification errors
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Business Impact:</strong> This system prevents specification errors like the cornflake color mistake that caused a 9-month project failure and product recall.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">12</div>
            <div className="text-gray-600">Active RFQs</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">847</div>
            <div className="text-gray-600">Products Available</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-orange-600">23</div>
            <div className="text-gray-600">Pending Orders</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600">156</div>
            <div className="text-gray-600">Verified Suppliers</div>
          </div>
        </div>

        {/* RFQ Form with Compliance */}
        <RFQForm />

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>🛡️ Protected by FoodXchange Compliance Engine • Preventing costly specification errors</p>
        </div>
      </main>
    </div>
  );
}

export default App;
