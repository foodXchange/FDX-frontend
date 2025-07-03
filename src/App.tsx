import React from 'react';
import './App.css';

// Simple components without external dependencies
const RFQDashboard = () => (
  <div className="dashboard">
    <h2 className="dashboard-title">🎯 RFQ Management Dashboard</h2>
    <div className="dashboard-card">
      <h3 className="dashboard-subtitle">AI-Enhanced RFQ System</h3>
      <p className="dashboard-description">Smart supplier matching and risk prevention powered by AI</p>
      <div className="badge-container">
        <span className="badge badge-blue">Active RFQs: 12</span>
        <span className="badge badge-green">Compliance: 95%</span>
      </div>
    </div>
  </div>
);

const ComplianceDashboard = () => (
  <div className="dashboard">
    <h2 className="dashboard-title">🛡️ Compliance Management</h2>
    <div className="dashboard-card">
      <h3 className="dashboard-subtitle">Automated Regulatory Checks</h3>
      <p className="dashboard-description">Prevent costly errors with real-time compliance validation</p>
      <div className="badge-container">
        <span className="badge badge-yellow">Risk Prevention: Active</span>
        <span className="badge badge-green">Certifications: Valid</span>
      </div>
    </div>
  </div>
);

function App() {
  const [activeFeature, setActiveFeature] = React.useState<'rfq' | 'compliance'>('rfq');

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <h1 className="nav-title">🍴 FoodXchange</h1>
          <div className="nav-buttons">
            <button
              onClick={() => setActiveFeature('rfq')}
              className={`nav-button ${activeFeature === 'rfq' ? 'active' : 'inactive'}`}
            >
              RFQ Management
            </button>
            <button
              onClick={() => setActiveFeature('compliance')}
              className={`nav-button ${activeFeature === 'compliance' ? 'active' : 'inactive'}`}
            >
              Compliance
            </button>
          </div>
        </div>
      </nav>

      {/* Feature Content */}
      <main>
        {activeFeature === 'rfq' && <RFQDashboard />}
        {activeFeature === 'compliance' && <ComplianceDashboard />}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>🎯 Architecture Migration Complete - Ready for Feature Development!</p>
      </footer>
    </div>
  );
}

export default App;
