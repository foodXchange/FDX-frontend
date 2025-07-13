import React from 'react';

export const ProductList: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <p className="text-gray-600 col-span-full">Products will be displayed here.</p>
    </div>
  );
};

export default ProductList;