import React, { useState } from 'react';
import RFQFormRealTime from './components/RFQFormRealTime';
import RFQDashboard from './components/RFQDashboard';
import AIEnhancedRFQDashboard from './components/dashboard/AIEnhancedRFQDashboard';
import ComplianceSystem from './features/compliance/ComplianceSystem';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'create' | 'dashboard' | 'ai-rfq' | 'compliance'>('dashboard');

  return (
    <div className='App'>
      <header className='bg-gradient-to-r from-blue-600 to-teal-600 text-white py-6'>
        <div className='container mx-auto px-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='text-2xl font-bold'>
                <span className='text-orange-400'>🥣</span> FoodXchange
              </div>
              <span className='bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium'>LIVE</span>
            </div>
            <nav className='flex space-x-4'>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={'px-4 py-2 rounded-md text-sm font-medium ' + 
                  (currentView === 'dashboard' ? 'bg-white text-blue-600' : 'text-white hover:bg-blue-700')}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setCurrentView('ai-rfq')}
                className={'px-4 py-2 rounded-md text-sm font-medium ' + 
                  (currentView === 'ai-rfq' ? 'bg-white text-blue-600' : 'text-white hover:bg-blue-700')}
              >
                🤖 AI RFQ
              </button>
              <button
                onClick={() => setCurrentView('compliance')}
                className={'px-4 py-2 rounded-md text-sm font-medium ' + 
                  (currentView === 'compliance' ? 'bg-white text-blue-600' : 'text-white hover:bg-blue-700')}
              >
                🛡️ Compliance
              </button>
              <button
                onClick={() => setCurrentView('create')}
                className={'px-4 py-2 rounded-md text-sm font-medium ' + 
                  (currentView === 'create' ? 'bg-white text-blue-600' : 'text-white hover:bg-blue-700')}
              >
                ➕ Create RFQ
              </button>
            </nav>
          </div>
        </div>
      </header>
      
      <main className='min-h-screen bg-gray-50 py-8'>
        {currentView === 'dashboard' && <RFQDashboard />}
        {currentView === 'ai-rfq' && <AIEnhancedRFQDashboard />}
        {currentView === 'compliance' && <ComplianceSystem />}
        {currentView === 'create' && <RFQFormRealTime />}
      </main>
      
      <footer className='bg-gray-800 text-white py-6 mt-12'>
        <div className='container mx-auto px-6 text-center'>
          <p className='text-gray-400'>
            © 2025 FoodXchange • Transforming Global Food Sourcing with Unified Digital Solutions
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;