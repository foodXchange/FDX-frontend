// src/components/ComplianceOverlay.tsx
import React, { useState } from 'react';

const ComplianceOverlay: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState('');
  const [showError, setShowError] = useState(false);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const approvedColors = ['golden', 'light_brown', 'amber', 'honey'];
    setShowError(!approvedColors.includes(color) && color !== '');
  };

  return (
    <div 
      className="fixed bottom-4 right-4 bg-white shadow-2xl border-2 border-blue-500 rounded-lg p-4 max-w-sm z-50"
      style={{ 
        backgroundColor: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '2px solid #3b82f6'
      }}
    >
      <div className="bg-blue-100 p-2 rounded mb-3">
        <h3 className="text-lg font-bold text-blue-900 mb-1">🧪 COMPLIANCE TESTER</h3>
        <p className="text-sm text-blue-700">Test cornflake color validation:</p>
      </div>
      
      <select
        value={selectedColor}
        onChange={(e) => handleColorChange(e.target.value)}
        className="w-full p-3 border-2 border-gray-300 rounded mb-3 text-base"
        style={{ fontSize: '16px' }}
      >
        <option value="">🎨 Select Cornflake Color</option>
        <option value="golden">✅ Golden (APPROVED)</option>
        <option value="light_brown">✅ Light Brown (APPROVED)</option>
        <option value="amber">✅ Amber (APPROVED)</option>
        <option value="honey">✅ Honey (APPROVED)</option>
        <option value="dark_brown">❌ Dark Brown (INVALID)</option>
        <option value="white">❌ White (INVALID)</option>
      </select>
      
      {showError && (
        <div className="bg-red-100 border-2 border-red-500 rounded p-3 text-sm animate-pulse">
          <p className="text-red-900 font-bold">🚨 CRITICAL ERROR DETECTED</p>
          <p className="text-red-800">Invalid color: {selectedColor}</p>
          <p className="text-red-700 text-xs mt-1 font-medium">
            This error caused 9-month project failure!
          </p>
        </div>
      )}
      
      {selectedColor && !showError && (
        <div className="bg-green-100 border-2 border-green-500 rounded p-3 text-sm">
          <p className="text-green-900 font-bold">✅ COMPLIANCE PASSED</p>
          <p className="text-green-800">Approved color: {selectedColor}</p>
        </div>
      )}
    </div>
  );
};

export default ComplianceOverlay;
