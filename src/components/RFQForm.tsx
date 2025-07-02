// src/components/RFQForm.tsx
import React, { useState } from 'react';
import { complianceValidator } from '../utils/validation/complianceValidator';

interface RFQFormData {
  title: string;
  description: string;
  productType: string;
  specifications: {
    color?: string;
    size?: string;
    packaging?: string;
    quantity: number;
    unit: string;
  };
  allergens: string[];
  deadline: string;
  budget: number;
}

const RFQForm: React.FC = () => {
  const [formData, setFormData] = useState<RFQFormData>({
    title: '',
    description: '',
    productType: '',
    specifications: {
      quantity: 0,
      unit: 'kg'
    },
    allergens: [],
    deadline: '',
    budget: 0
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'specifications' && value.color && formData.productType === 'cornflakes') {
      const validation = complianceValidator.validateSpecifications({
        productType: formData.productType,
        color: value.color
      });
      setValidationErrors(validation.errors);
    }
  };

  const handleSpecificationChange = (field: string, value: any) => {
    const updatedSpecs = {
      ...formData.specifications,
      [field]: value
    };

    setFormData(prev => ({
      ...prev,
      specifications: updatedSpecs
    }));

    if (formData.productType) {
      const validation = complianceValidator.validateSpecifications({
        productType: formData.productType,
        ...updatedSpecs
      });
      setValidationErrors(validation.errors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const complianceCheck = complianceValidator.validateProduct(formData);
    const specValidation = complianceValidator.validateSpecifications({
      productType: formData.productType,
      ...formData.specifications
    });
    const safetyCheck = complianceValidator.validateFoodSafety(formData);

    const allErrors = [
      ...complianceCheck.errors,
      ...specValidation.errors,
      ...safetyCheck.errors
    ];

    const allWarnings = [
      ...complianceCheck.warnings,
      ...safetyCheck.warnings
    ];

    setValidationErrors(allErrors);
    setValidationWarnings(allWarnings);

    if (allErrors.length === 0) {
      try {
        console.log('Submitting RFQ:', formData);
        alert('RFQ submitted successfully!');
      } catch (error) {
        console.error('Submission failed:', error);
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New RFQ</h2>

      {validationErrors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-red-800 font-medium mb-2">🚨 Compliance Errors</h3>
          <ul className="text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {validationWarnings.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="text-yellow-800 font-medium mb-2">⚡ Compliance Warnings</h3>
          <ul className="text-yellow-700 space-y-1">
            {validationWarnings.map((warning, index) => (
              <li key={index} className="flex items-center">
                <span className="mr-2">⚡</span>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RFQ Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Premium Cornflakes Supply"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Type
            </label>
            <select
              value={formData.productType}
              onChange={(e) => handleInputChange('productType', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Product Type</option>
              <option value="cornflakes">🥣 Cornflakes</option>
              <option value="wheat">🌾 Wheat</option>
              <option value="rice">🍚 Rice</option>
              <option value="oats">🥣 Oats</option>
              <option value="pasta">🍝 Pasta</option>
            </select>
          </div>
        </div>

        {/* Product Specifications */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formData.productType === 'cornflakes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎨 Color (CRITICAL SPECIFICATION)
                </label>
                <select
                  value={formData.specifications.color || ''}
                  onChange={(e) => handleSpecificationChange('color', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Color</option>
                  <option value="golden">✅ Golden</option>
                  <option value="light_brown">✅ Light Brown</option>
                  <option value="amber">✅ Amber</option>
                  <option value="honey">✅ Honey</option>
                  <option value="dark_brown">❌ Dark Brown (Invalid)</option>
                  <option value="white">❌ White (Invalid)</option>
                </select>
                <p className="text-xs text-red-600 mt-1 font-medium">
                  ⚠️ Wrong color selection caused 9-month project failure & product recall
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📦 Quantity
              </label>
              <input
                type="number"
                value={formData.specifications.quantity}
                onChange={(e) => handleSpecificationChange('quantity', Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📏 Unit
              </label>
              <select
                value={formData.specifications.unit}
                onChange={(e) => handleSpecificationChange('unit', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="kg">Kilograms</option>
                <option value="tons">Tons</option>
                <option value="lbs">Pounds</option>
                <option value="boxes">Boxes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || validationErrors.length > 0}
            className={`px-6 py-3 rounded-md font-medium text-white transition-colors ${
              isSubmitting || validationErrors.length > 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Validating & Submitting...' : 'Create RFQ'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RFQForm;