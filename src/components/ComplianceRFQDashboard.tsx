// src/components/ComplianceRFQDashboard.tsx
import React, { useState } from 'react';
import RFQForm from './RFQForm';

const ComplianceRFQDashboard: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New RFQ</h1>
              <p className="text-gray-600">With built-in compliance validation</p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
        <div className="p-6">
          <RFQForm />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          🛡️ Compliance-Enabled RFQ Creation
        </h2>
        <p className="text-gray-600 mb-6">
          Our new system prevents specification errors that could cause project failures like the cornflake color issue.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <h3 className="font-medium text-yellow-800 mb-2">⚠️ Prevents Business Failures</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Real-time validation of product specifications</li>
            <li>• Prevents wrong color selections for cornflakes</li>
            <li>• Mandatory allergen declarations</li>
            <li>• Food safety compliance checks</li>
          </ul>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
        >
          🚀 Create Compliance-Validated RFQ
        </button>
      </div>
    </div>
  );
};

export default ComplianceRFQDashboard;
