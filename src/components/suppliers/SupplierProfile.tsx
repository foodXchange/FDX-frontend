// File: C:\Users\foodz\Documents\GitHub\Development\FDX-frontend\src\components\suppliers\SupplierProfile.js

import React from 'react';
import { useParams } from 'react-router-dom';
import { BuildingOfficeIcon, MapPinIcon, StarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const SupplierProfile = () => {
  const { id } = useParams();
  
  const mockSupplier = {
    id: id,
    name: 'ABC Farms',
    location: 'California, USA',
    rating: 4.8,
    description: 'Premium organic farm specializing in nuts and dried fruits.',
    certifications: ['Organic', 'Fair Trade', 'Non-GMO'],
    products: ['Almonds', 'Walnuts', 'Pistachios'],
    established: '1995',
    employees: '50-100'
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <BuildingOfficeIcon className="h-12 w-12 text-blue-500 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{mockSupplier.name}</h1>
              <div className="flex items-center mt-2">
                <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">{mockSupplier.location}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Established:</span>
                  <span className="ml-2 text-gray-900">{mockSupplier.established}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Employees:</span>
                  <span className="ml-2 text-gray-900">{mockSupplier.employees}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500">Rating:</span>
                  <div className="flex items-center ml-2">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className={`h-4 w-4 ${i < Math.floor(mockSupplier.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">({mockSupplier.rating})</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {mockSupplier.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    <ShieldCheckIcon className="h-4 w-4 mr-1" />
                    {cert}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
            <p className="text-gray-600">{mockSupplier.description}</p>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Products</h3>
            <div className="flex flex-wrap gap-2">
              {mockSupplier.products.map((product, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {product}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-8 flex space-x-4">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Send Message
            </button>
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Request Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierProfile;