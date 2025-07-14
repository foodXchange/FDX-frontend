import React from 'react';
import { ProductSpecification } from '../../shared/types';

export interface SpecValidatorProps {
  specifications: ProductSpecification[];
  category: string;
  validationResults?: any;
  onChange?: (specs: ProductSpecification[]) => void;
  className?: string;
}

export const SpecValidator: React.FC<SpecValidatorProps> = ({
  specifications,
  category: _category,
  validationResults: _validationResults,
  onChange: _onChange,
  className
}) => {
  return (
    <div className={className}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Product Specifications
      </h3>
      
      <div className="space-y-4">
        {specifications.map((spec, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <span className="font-medium text-gray-900">{spec.name}:</span>
              <span className="ml-2 text-gray-700">{spec.value}</span>
              {spec.tolerance && (
                <span className="ml-2 text-gray-500">±{spec.tolerance}</span>
              )}
            </div>
            {spec.critical && (
              <div className="flex items-center text-red-600">
                <span className="text-sm font-medium">Critical</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {specifications.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No specifications defined
        </div>
      )}
    </div>
  );
};