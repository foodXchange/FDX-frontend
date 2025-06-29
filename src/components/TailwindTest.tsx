import React from 'react';

const TailwindTest: React.FC = () => {
  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded-xl shadow-lg space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">FoodXchange</h2>
        <p className="text-gray-500">Tailwind CSS is working!</p>
      </div>
      <div className="flex justify-center space-x-4">
        <button className="btn-primary">
          Primary Button
        </button>
        <button className="btn-secondary">
          Secondary Button
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-primary-600">Buyers</h3>
          <p className="text-sm text-gray-600">Israeli food importers</p>
        </div>
        <div className="card">
          <h3 className="font-semibold text-secondary-600">Suppliers</h3>
          <p className="text-sm text-gray-600">European producers</p>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;
