// File: C:\Users\foodz\Documents\GitHub\Development\FDX-frontend\src\components\rfq\RFQForm.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RFQForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    targetPrice: '',
    deadline: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('RFQ submitted:', formData);
    navigate('/rfqs');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New RFQ</h1>
      
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="text"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., 500kg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Price</label>
            <input
              type="text"
              name="targetPrice"
              value={formData.targetPrice}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., $5.00/kg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Deadline</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Detailed requirements and specifications..."
            required
          />
        </div>
        
        <div className="mt-6 flex space-x-3">
          <button
            type="submit"
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Create RFQ
          </button>
          <button
            type="button"
            onClick={() => navigate('/rfqs')}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RFQForm;