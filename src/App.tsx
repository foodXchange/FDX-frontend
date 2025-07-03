import React, { useState } from 'react';
import RFQFormRealTime from './components/RFQFormRealTime';
import RFQDashboard from './components/RFQDashboard';
import SupplierDashboard from './components/SupplierDashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'buyer' | 'supplier'>('buyer');
  const [buyerTab, setBuyerTab] = useState<'create' | 'dashboard'>('dashboard');

  return (
    <div className="App">
      <header className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold">
                <span className="text-orange-400">🥣</span> FoodXchange
              </div>
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">LIVE</span>
            </div>
            <nav className="flex space-x-4">
              <button
                onClick={() => setCurrentView('buyer')}
                className={'px-4 py-2 rounded-md text-sm font-medium ' + 
                  (currentView === 'buyer' ? 'bg-white text-blue-600' : 'text-white hover:bg-blue-700')}
              >👤 Buyer Portal</button>
              <button
                onClick={() => setCurrentView('supplier')}
                className={'px-4 py-2 rounded-md text-sm font-medium ' + 
                  (currentView === 'supplier' ? 'bg-white text-blue-600' : 'text-white hover:bg-blue-700')}
              >🏭 Supplier Portal</button>
              {currentView === 'buyer' && (
                <>
                  <button
                    onClick={() => setBuyerTab('dashboard')}
                    className={'px-4 py-2 rounded-md text-sm font-medium ' + 
                      (buyerTab === 'dashboard' ? 'bg-blue-700' : 'text-white hover:bg-blue-700')}
                  >📊 Dashboard</button>
                  <button
                    onClick={() => setBuyerTab('create')}
                    className={'px-4 py-2 rounded-md text-sm font-medium ' + 
                      (buyerTab === 'create' ? 'bg-blue-700' : 'text-white hover:bg-blue-700')}
                  >➕ Create RFQ</button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="min-h-screen bg-gray-50 py-8">
        {currentView === 'supplier' ? (
          <SupplierDashboard />
        ) : (
          buyerTab === 'dashboard' ? <RFQDashboard /> : <RFQFormRealTime />
        )}
      </main>
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">© 2025 FoodXchange • Multi-Sided B2B Food Commerce Platform</p>
        </div>
      </footer>
    </div>
  );
}
export default App;
