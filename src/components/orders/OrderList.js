// File: C:\Users\foodz\Documents\GitHub\Development\FDX-frontend\src\components\orders\OrderList.js

import React from 'react';
import { Link } from 'react-router-dom';
import { TruckIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const OrderList = () => {
  const mockOrders = [
    { id: 1, product: 'Organic Almonds', quantity: '500kg', status: 'shipped', date: '2024-01-15', supplier: 'ABC Farms' },
    { id: 2, product: 'Olive Oil', quantity: '200L', status: 'pending', date: '2024-01-14', supplier: 'Mediterranean Foods' },
    { id: 3, product: 'Flour', quantity: '1000kg', status: 'delivered', date: '2024-01-13', supplier: 'Healthy Grains Co' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'shipped': return <TruckIcon className="h-5 w-5 text-blue-500" />;
      case 'pending': return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'delivered': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default: return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Order History</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {mockOrders.map((order) => (
            <li key={order.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(order.status)}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{order.product}</p>
                    <p className="text-sm text-gray-500">{order.quantity} • {order.supplier}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{order.date}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <Link
                    to={`/orders/${order.id}`}
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

export default OrderList;