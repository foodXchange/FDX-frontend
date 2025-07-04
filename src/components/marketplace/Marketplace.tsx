// File: C:\Users\foodz\Documents\GitHub\Development\FDX-frontend\src\components\marketplace\Marketplace.js

import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Marketplace = () => {
  const mockProducts = [
    { id: 1, name: 'Organic Almonds', price: '$5.50/kg', supplier: 'ABC Farms', image: '/api/placeholder/150/150' },
    { id: 2, name: 'Premium Olive Oil', price: '$12.00/L', supplier: 'Mediterranean Foods', image: '/api/placeholder/150/150' },
    { id: 3, name: 'Gluten-Free Flour', price: '$3.20/kg', supplier: 'Healthy Grains Co', image: '/api/placeholder/150/150' }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mockProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="aspect-square bg-gray-200 rounded-t-lg flex items-center justify-center">
              <ShoppingBagIcon className="h-12 w-12 text-gray-400" />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{product.supplier}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-blue-600">{product.price}</span>
                <Link
                  to={`/marketplace/products/${product.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;