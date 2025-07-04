// File: C:\Users\foodz\Documents\GitHub\Development\FDX-frontend\src\components\rfq\RFQDetail.js

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { DocumentTextIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const RFQDetail = () => {
  const { id } = useParams();
  
  const mockRFQ = {
    id: id,
    title: 'Organic Almonds',
    description: 'Looking for premium organic almonds for our new product line.',
    quantity: '500kg',
    targetPrice: '$5.00/kg',
    deadline: '2024-02-15',
    status: 'active',
    created: '2024-01-15'
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">RFQ Details</h1>
        <Link
          to={`/rfqs/${id}/edit`}
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Edit RFQ
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <DocumentTextIcon className="h-6 w-6 text-blue-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">{mockRFQ.title}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Deadline</p>
              <p className="font-medium">{mockRFQ.deadline}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Target Price</p>
              <p className="font-medium">{mockRFQ.targetPrice}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
              {mockRFQ.status}
            </span>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600">{mockRFQ.description}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Specifications</h3>
          <ul className="text-gray-600 space-y-1">
            <li>• Quantity: {mockRFQ.quantity}</li>
            <li>• Organic certification required</li>
            <li>• Packaging: 25kg bags</li>
            <li>• Delivery: FOB destination</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RFQDetail;