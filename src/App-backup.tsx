import React from 'react';
import ComplianceOverlay from './components/ComplianceOverlay';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Your existing app content stays the same */}
      
      {/* Add the floating compliance tester */}
      <ComplianceOverlay />
    </div>
  );
}

export default App;
