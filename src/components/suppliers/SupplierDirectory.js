// File: C:\Users\foodz\Documents\GitHub\Development\FDX-frontend\src\components\suppliers\SupplierDirectory.js

import React from 'react';
import { Link } from 'react-router-dom';
import { BuildingOfficeIcon, MapPinIcon, StarIcon } from '@heroicons/react/24/outline';

const SupplierDirectory = () => {
  const mockSuppliers = [
    { id: 1, name: 'ABC Farms', location: 'California, USA', rating: 4.8, products: ['Almonds', 'Walnuts'] },
    { id: 2, name: 'Mediterranean Foods', location: 'Greece', rating: 4.9, products: ['Olive Oil', 'Olives'] },
    { id: 3, name: 'Healthy Grains Co', location: 'Kansas, USA', rating: 4.7, products: ['Flour', 'Grains'] }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Supplier Directory</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockSuppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-500 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">{supplier.name}</h3>
              </div>
              
              <div className="flex items-center mb-3">
                <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{supplier.location}</span>
              </div>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`h-4 w-4 ${i < Math.floor(supplier.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({supplier.rating})</span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Products:</p>
                <div className="flex flex-wrap gap-2">
                  {supplier.products.map((product, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {product}
                    </span>
                  ))}
                </div>
              </div>
              
              <Link
                to={`/suppliers/${supplier.id}`}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                View Profile
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupplierDirectory;