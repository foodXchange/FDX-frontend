// File: C:\Users\foodz\Documents\GitHub\Development\FDX-frontend\src\components\orders\OrderDetail.js

import React from 'react';
import { useParams } from 'react-router-dom';
import { TruckIcon, MapPinIcon, CalendarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const OrderDetail = () => {
  const { id } = useParams();
  
  const mockOrder = {
    id: id,
    product: 'Organic Almonds',
    quantity: '500kg',
    status: 'shipped',
    orderDate: '2024-01-15',
    estimatedDelivery: '2024-01-25',
    supplier: 'ABC Farms',
    trackingNumber: 'TRK123456789',
    price: '$2,750.00'
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order #{mockOrder.id}</h1>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
          {mockOrder.status}
        </span>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Product:</span>
                <span className="ml-2 text-gray-900">{mockOrder.product}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Quantity:</span>
                <span className="ml-2 text-gray-900">{mockOrder.quantity}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Supplier:</span>
                <span className="ml-2 text-gray-900">{mockOrder.supplier}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Total Price:</span>
                <span className="ml-2 text-gray-900 font-semibold">{mockOrder.price}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Order Date:</span>
                <span className="ml-2 text-gray-900">{mockOrder.orderDate}</span>
              </div>
              <div className="flex items-center">
                <TruckIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Est. Delivery:</span>
                <span className="ml-2 text-gray-900">{mockOrder.estimatedDelivery}</span>
              </div>
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Tracking:</span>
                <span className="ml-2 text-gray-900">{mockOrder.trackingNumber}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Order Placed</p>
                <p className="text-sm text-gray-500">January 15, 2024</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Processing</p>
                <p className="text-sm text-gray-500">January 16, 2024</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <TruckIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Shipped</p>
                <p className="text-sm text-gray-500">January 18, 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;