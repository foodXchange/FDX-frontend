import React from 'react';
import './App.css';
import TailwindTest from './components/TailwindTest';

function App() {
  return (
    <div className="App">
      <header className="App-header p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-primary-600">
            FoodXchange Development Environment
          </h1>
          <p className="text-gray-600 mt-2">
            B2B Food Trading Platform - Ready for Development
          </p>
        </div>
      </header>
      
      <main className="container mx-auto py-8">
        <TailwindTest />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            🚀 Frontend ready for development! 
            <br />
            TypeScript ✅ | Tailwind CSS ✅ | React 18 ✅
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
