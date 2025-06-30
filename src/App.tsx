import React from 'react';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🍔 FoodXchange
          </h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-2xl font-bold text-primary-600 mb-4">
                  Welcome to FoodXchange
                </h2>
                <p className="text-gray-600 mb-4">
                  B2B Food Trading Platform - Connecting Israeli buyers with European suppliers
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-primary-700">✅ React</h3>
                    <p className="text-sm text-primary-600">Setup Complete</p>
                  </div>
                  <div className="bg-secondary-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-secondary-700">✅ TypeScript</h3>
                    <p className="text-sm text-secondary-600">Configured</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-700">✅ Tailwind</h3>
                    <p className="text-sm text-green-600">Ready to use</p>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="btn-primary mr-2">Get Started</button>
                  <button className="btn-secondary">Learn More</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
