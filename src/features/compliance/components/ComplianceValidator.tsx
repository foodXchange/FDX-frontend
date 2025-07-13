// File: C:\Users\foodz\Documents\GitHub\Development\FDX-frontend\src\features\compliance\components\ComplianceValidator.tsx

import React, { useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { ClipboardDocumentCheckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface ValidationResult {
  passed: boolean;
  score: number;
  criticalErrors: string[];
  warnings: string[];
  suggestions: string[];
  certificationsRequired: string[];
  estimatedFixTime: string;
  marketCompliance: {
    compliant: boolean;
    requirements: string[];
    missingElements: string[];
  };
}

interface ComplianceValidatorProps {
  rfqId?: string;
  productType: string;
  specifications: any;
  onValidationComplete?: (result: ValidationResult) => void;
}

export const ComplianceValidator: React.FC<ComplianceValidatorProps> = ({
  rfqId,
  productType,
  specifications,
  onValidationComplete
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'errors' | 'warnings' | 'certifications'>('errors');
  const [realTimeErrors] = useState<Record<string, string>>({});

  // Full compliance validation
  const runFullValidation = async () => {
    setIsValidating(true);
    try {
      const response = await fetch('/api/compliance/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productType,
          specifications,
          targetMarket: 'US',
          rfqId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setValidationResult(data.validation);
        if (onValidationComplete) {
          onValidationComplete(data.validation);
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // Color validation preview (prevent cornflake color error)
  const ColorValidationPreview = ({ color }: { color: any }) => {
    const isValid = !['green', 'blue', 'purple', 'red'].includes(color?.colorName?.toLowerCase());
    
    return (
      <div className={`p-4 rounded-lg border-2 ${isValid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold">Color Specification</h4>
            <p className="text-sm text-gray-600">{color?.colorName || 'Not specified'}</p>
          </div>
          <div className="flex items-center space-x-2">
            {color?.hexCode && (
              <div 
                className="w-12 h-12 rounded border-2 border-gray-300"
                style={{ backgroundColor: color.hexCode }}
              />
            )}
            {isValid ? (
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            ) : (
              <XCircleIcon className="h-8 w-8 text-red-500" />
            )}
          </div>
        </div>
        {!isValid && (
          <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-700">
            <strong>Critical Error:</strong> This color will cause product rejection.
            <br />Allowed colors: golden, light golden, amber, honey
          </div>
        )}
      </div>
    );
  };

  // Validation score display
  const ScoreDisplay = ({ score }: { score: number }) => {
    const getScoreColor = () => {
      if (score >= 80) return 'text-green-600';
      if (score >= 60) return 'text-yellow-600';
      return 'text-red-600';
    };

    const getScoreBackground = () => {
      if (score >= 80) return 'bg-green-100';
      if (score >= 60) return 'bg-yellow-100';
      return 'bg-red-100';
    };

    return (
      <div className={`inline-flex items-center px-4 py-2 rounded-full ${getScoreBackground()}`}>
        <span className={`text-2xl font-bold ${getScoreColor()}`}>{score}</span>
        <span className="text-sm ml-1 text-gray-600">/100</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Compliance Validation</h2>
        </div>
        <button
          onClick={runFullValidation}
          disabled={isValidating}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            isValidating 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isValidating ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Validating...
            </span>
          ) : (
            'Run Full Validation'
          )}
        </button>
      </div>

      {/* Real-time errors */}
      {Object.keys(realTimeErrors).length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">Real-time Validation Errors</h3>
          {Object.entries(realTimeErrors).map(([field, error]) => (
            <div key={field} className="text-sm text-red-600 mb-1">
              <strong>{field}:</strong> {error}
            </div>
          ))}
        </div>
      )}

      {/* Color preview for cornflakes */}
      {productType === 'cornflakes' && specifications?.specifications?.visual?.primaryColor && (
        <div className="mb-6">
          <ColorValidationPreview color={specifications.specifications.visual.primaryColor} />
        </div>
      )}

      {/* Validation Results */}
      {validationResult && (
        <div className="space-y-6">
          {/* Score and Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <ScoreDisplay score={validationResult.score} />
              <div>
                <p className="text-sm text-gray-600">Compliance Status</p>
                <p className={`text-lg font-semibold ${validationResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {validationResult.passed ? 'PASSED' : 'FAILED'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Estimated Fix Time</p>
              <p className="text-lg font-semibold">{validationResult.estimatedFixTime}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('errors')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'errors'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Critical Errors ({validationResult.criticalErrors.length})
              </button>
              <button
                onClick={() => setActiveTab('warnings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'warnings'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Warnings ({validationResult.warnings.length})
              </button>
              <button
                onClick={() => setActiveTab('certifications')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'certifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Certifications ({validationResult.certificationsRequired.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === 'errors' && (
              <div className="space-y-3">
                {validationResult.criticalErrors.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No critical errors found!</p>
                ) : (
                  validationResult.criticalErrors.map((error, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
                      <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">{error}</p>
                        {validationResult.suggestions[index] && (
                          <p className="text-sm text-red-600 mt-1">
                            <strong>Fix:</strong> {validationResult.suggestions[index]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'warnings' && (
              <div className="space-y-3">
                {validationResult.warnings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No warnings found!</p>
                ) : (
                  validationResult.warnings.map((warning, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-800">{warning}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'certifications' && (
              <div className="space-y-3">
                {validationResult.certificationsRequired.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ClipboardDocumentCheckIcon className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium text-blue-800">{cert}</span>
                    </div>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Required</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Market Compliance */}
          {validationResult.marketCompliance && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Market Compliance (US)</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  {validationResult.marketCompliance.compliant ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className={validationResult.marketCompliance.compliant ? 'text-green-700' : 'text-red-700'}>
                    {validationResult.marketCompliance.compliant ? 'Market Compliant' : 'Not Market Compliant'}
                  </span>
                </div>
                {validationResult.marketCompliance.missingElements.length > 0 && (
                  <div className="ml-7">
                    <p className="text-sm text-gray-600 font-medium mb-1">Missing Requirements:</p>
                    <ul className="list-disc list-inside text-sm text-red-600">
                      {validationResult.marketCompliance.missingElements.map((element, idx) => (
                        <li key={idx}>{element}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};