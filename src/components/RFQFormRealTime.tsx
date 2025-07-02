// src/components/RFQFormRealTime.tsx
import React, { useState, useEffect } from 'react';
import { complianceValidator } from '../utils/validation/complianceValidator';
import websocketService from '../services/websocket';

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
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamActivity, setTeamActivity] = useState<string[]>([]);

  // 🚀 REAL-TIME SETUP
  useEffect(() => {
    // Connect to real-time system
    websocketService.connect('user123');
    
    // Join RFQ collaboration room
    websocketService.joinRFQRoom('rfq_123');
    
    // Listen for real-time updates from team members
    websocketService.on('rfq_updated', (update: any) => {
      console.log('📡 Real-time update from team:', update);
      
      setTeamActivity(prev => [
        \\: Team member updated \\,
        ...prev.slice(0, 4)
      ]);
      
      if (update.complianceStatus === 'error') {
        alert(\⚠️ Team member found compliance issue in \!\);
      }
    });

    return () => {
      websocketService.disconnect();
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

    // Validate specifications in real-time
    if (formData.productType) {
      const validation = complianceValidator.validateSpecifications({
        productType: formData.productType,
        ...updatedSpecs
      });
      setValidationErrors(validation.errors);
      
      // 🚀 BROADCAST CHANGES TO TEAM IN REAL-TIME
      const complianceStatus = validation.errors.length > 0 ? 'error' : 'valid';
      websocketService.updateRFQField(
        'rfq_123',
        field,
        value,
        complianceStatus
      );
      
      // 🚨 CRITICAL: Alert team about cornflake color issues
      if (field === 'color' && formData.productType === 'cornflakes' && validation.errors.length > 0) {
        websocketService.sendComplianceAlert(
          'rfq_123',
          'CRITICAL: Wrong cornflake color selected - this caused 9-month project failure before!',
          'error'
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Full compliance validation
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

    setValidationErrors(allErrors);

    if (allErrors.length === 0) {
      // Notify team of successful submission
      websocketService.sendComplianceAlert(
        'rfq_123',
        '✅ RFQ passed all compliance checks and submitted successfully!',
        'warning'
      );
      
      alert('✅ RFQ submitted successfully with full compliance!');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create New RFQ</h2>
          <p className="text-sm text-gray-600">🔗 Real-time collaboration enabled</p>
        </div>
        
        {/* REAL-TIME ACTIVITY INDICATOR */}
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
            <span className="text-green-800 text-sm font-medium">Live Collaboration</span>
          </div>
        </div>
      </div>

      {/* TEAM ACTIVITY FEED */}
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
      
      {/* VALIDATION ALERTS */}
      {validationErrors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-red-800 font-medium mb-2">🚨 Compliance Errors (Visible to Team)</h3>
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

        {/* Specifications with Real-Time Updates */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Product Specifications 
            <span className="text-sm text-blue-600 ml-2">📡 Changes broadcast to team</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formData.productType === 'cornflakes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎨 Color (CRITICAL - Team Will Be Alerted)
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
                  <option value="dark_brown">❌ Dark Brown (Invalid - Team Alert!)</option>
                  <option value="white">❌ White (Invalid - Team Alert!)</option>
                </select>
                <p className="text-xs text-red-600 mt-1 font-medium">
                  ⚠️ Team will be notified instantly of invalid selections
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
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || validationErrors.length > 0}
            className={\px-6 py-3 rounded-md font-medium \ text-white transition-colors\}
          >
            {isSubmitting ? 'Validating & Notifying Team...' : '🚀 Create RFQ (Team Notified)'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RFQFormRealTime;
