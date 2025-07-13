import React from 'react';

export const ComplianceStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500">Total Checks</h4>
        <p className="text-2xl font-bold text-gray-900">156</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500">Passed</h4>
        <p className="text-2xl font-bold text-green-600">142</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500">Failed</h4>
        <p className="text-2xl font-bold text-red-600">14</p>
      </div>
    </div>
  );
};

export default ComplianceStats;