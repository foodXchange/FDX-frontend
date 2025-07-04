// File: C:\Users\foodz\Documents\GitHub\Development\FDX-frontend\src\components\rfq\RFQList.js

import React from 'react';
import { Link } from 'react-router-dom';
import { DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline';

const RFQList = () => {
  const mockRFQs = [
    { id: 1, title: 'Organic Almonds', status: 'active', created: '2024-01-15' },
    { id: 2, title: 'Premium Olive Oil', status: 'pending', created: '2024-01-14' },
    { id: 3, title: 'Gluten-Free Flour', status: 'completed', created: '2024-01-13' }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">RFQ Management</h1>
        <Link
          to="/rfqs/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create RFQ
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active RFQs</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {mockRFQs.map((rfq) => (
            <li key={rfq.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{rfq.title}</p>
                    <p className="text-sm text-gray-500">Created: {rfq.created}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    rfq.status === 'active' ? 'bg-green-100 text-green-800' :
                    rfq.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {rfq.status}
                  </span>
                  <Link
                    to={`/rfqs/${rfq.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RFQList;