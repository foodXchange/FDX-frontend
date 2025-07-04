// File: C:\Users\foodz\Documents\GitHub\Development\FDX-frontend\src\components\marketplace\ProductDetail.js

import React from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBagIcon, StarIcon } from '@heroicons/react/24/outline';

const ProductDetail = () => {
  const { id } = useParams();
  
  const mockProduct = {
    id: id,
    name: 'Organic Almonds',
    price: '$5.50/kg',
    supplier: 'ABC Farms',
    rating: 4.8,
    description: 'Premium organic almonds, grown without pesticides.',
    specifications: ['Organic certified', 'Non-GMO', 'Gluten-free'],
    minOrder: '100kg',
    availability: 'In Stock'
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
            <ShoppingBagIcon className="h-24 w-24 text-gray-400" />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{mockProduct.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className={`h-5 w-5 ${i < Math.floor(mockProduct.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
                <span className="ml-2 text-sm text-gray-600">({mockProduct.rating})</span>
              </div>
            </div>
            
            <div className="mb-6">
              <span className="text-3xl font-bold text-blue-600">{mockProduct.price}</span>
              <span className="text-gray-500 ml-2">Minimum order: {mockProduct.minOrder}</span>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{mockProduct.description}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Specifications</h3>
              <ul className="text-gray-600 space-y-1">
                {mockProduct.specifications.map((spec, index) => (
                  <li key={index}>• {spec}</li>
                ))}
              </ul>
            </div>
            
            <div className="flex space-x-4">
              <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                Request Quote
              </button>
              <button className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors">
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;