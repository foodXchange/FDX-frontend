import React, { useState, useEffect } from 'react';
import { complianceValidator } from '../utils/validation/complianceValidation';

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

interface WebSocketMessage {
  type: string;
  field: string;
  value: any;
  complianceStatus: string;
  timestamp: string;
}

const RFQFormRealTime: React.FC = () => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamActivity, setTeamActivity] = useState<string[]>([]);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection (mock for now)
    console.log('Initializing real-time collaboration...');
    
    // Simulate team activity
    const activityTimer = setInterval(() => {
      const activities = [
        'Sarah updated quantity specification',
        'Mike added compliance note',
        'Alex verified allergen information',
        'Team lead approved specifications'
      ];
      
      if (Math.random() > 0.8) { // 20% chance every few seconds
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        const timestamp = new Date().toLocaleTimeString();
        setTeamActivity(prev => [`${timestamp}: ${randomActivity}`, ...prev.slice(0, 4)]);
      }
    }, 5000);

    return () => {
      clearInterval(activityTimer);
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

    // Real-time validation
    if (formData.productType) {
      const validation = complianceValidator.validateProductSpecification(
        {
          productType: formData.productType,
          ...updatedSpecs
        },
        ['US', 'EU'] // Default target markets
      );
      
      setValidationErrors(validation.errors);

      // Critical color validation for cornflakes
      if (field === 'color' && formData.productType === 'cornflakes' && validation.errors.length > 0) {
        // Simulate real-time team notification
        const timestamp = new Date().toLocaleTimeString();
        setTeamActivity(prev => [
          `${timestamp}: 🚨 CRITICAL: Wrong cornflake color selected - this caused 9-month project failure before!`,
          ...prev.slice(0, 4)
        ]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Final validation
    const specValidation = complianceValidator.validateProductSpecification(
      {
        productType: formData.productType,
        ...formData.specifications
      },
      ['US', 'EU']
    );

    const allErrors = [...specValidation.errors];
    setValidationErrors(allErrors);

    if (allErrors.length === 0) {
      // Simulate successful submission
      const timestamp = new Date().toLocaleTimeString();
      setTeamActivity(prev => [
        `${timestamp}: ✅ RFQ passed all compliance checks and submitted successfully!`,
        ...prev.slice(0, 4)
      ]);
      
      setTimeout(() => {
        alert('RFQ submitted successfully with full compliance!');
        setIsSubmitting(false);
      }, 2000);
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create New RFQ</h2>
          <p className="text-sm text-gray-600">🔗 Real-time collaboration enabled</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
            <span className="text-green-800 text-sm font-medium">Live Collaboration</span>
          </div>
        </div>
      </div>

      {/* Team Activity */}
      {teamActivity.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-blue-800 font-medium mb-2">📡 Team Activity</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            {teamActivity.map((activity, index) => (
              <li key={index}>• {activity}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Validation Errors */}
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

      {/* Form */}
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Product Specifications
            <span className="text-sm text-blue-600 ml-2">📡 Changes broadcast to team</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Color selection for cornflakes */}
            {formData.productType === 'cornflakes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎨 Color (CRITICAL)
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
                  ⚠️ Team will be notified of invalid selections
                </p>
              </div>
            )}

            {/* Quantity */}
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

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📏 Unit
              </label>
              <select
                value={formData.specifications.unit}
                onChange={(e) => handleSpecificationChange('unit', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="tons">Tons</option>
                <option value="lbs">Pounds (lbs)</option>
                <option value="units">Units</option>
              </select>
            </div>
          </div>
        </div>

        {/* Timeline and Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Deadline
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💰 Budget (USD)
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              min="1"
              required
            />
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
            {isSubmitting 
              ? 'Validating & Notifying Team...' 
              : '🚀 Create RFQ (Team Notified)'
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default RFQFormRealTime;