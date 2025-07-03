// File: /src/features/compliance/index.ts
import React from 'react';

export interface ComplianceCheck {
  id: string;
  rfqId: string;
  status: 'pending' | 'passed' | 'failed' | 'checking';
  score: number;
  issues: ComplianceIssue[];
}

export interface ComplianceIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  field?: string;
  suggestion?: string;
}

export interface ProductSpecificationValidation {
  isValid: boolean;
  score: number;
  errors: ComplianceIssue[];  // Changed from 'issues' to 'errors' to match usage
  warnings: string[];
  productType: string;
}

export const complianceValidator = {
  validateRFQ: (rfqData: any): ComplianceCheck => {
    return {
      id: `comp_${Date.now()}`,
      rfqId: rfqData.id || 'unknown',
      status: 'pending',
      score: 85,
      issues: []
    };
  },
  
  checkAllergens: (data: any): boolean => {
    return !!data.allergens && data.allergens.length > 0;
  },
  
  validateCertifications: (certs: string[]): boolean => {
    return certs && certs.length > 0;
  },

  // Fixed method signature to accept 2 parameters: specData and targetMarkets
  validateProductSpecification: (
    specData: {
      productType: string;
      [key: string]: any;
    },
    targetMarkets: string[] = ['US'] // Second parameter with default value
  ): ProductSpecificationValidation => {
    const errors: ComplianceIssue[] = [];  // Changed from 'issues' to 'errors'
    const warnings: string[] = [];
    let score = 100;

    // Basic validation rules
    if (!specData.productType) {
      errors.push({
        id: `error_${Date.now()}_1`,
        severity: 'high',
        message: 'Product type is required',
        field: 'productType',
        suggestion: 'Please specify the product type'
      });
      score -= 20;
    }

    // Market-specific validations
    targetMarkets.forEach(market => {
      if (market === 'EU') {
        // EU-specific validations
        if (!specData.allergens || specData.allergens.length === 0) {
          errors.push({
            id: `error_${Date.now()}_eu_allergens`,
            severity: 'critical',
            message: 'EU requires comprehensive allergen labeling',
            field: 'allergens',
            suggestion: 'Add detailed allergen information for EU compliance'
          });
          score -= 25;
        }
      }
      
      if (market === 'US') {
        // US-specific validations
        if (!specData.nutritionalInfo) {
          warnings.push('FDA nutritional labeling recommended for US market');
          score -= 5;
        }
      }
    });

    // Critical color validation for cornflakes (as mentioned in the code)
    if (specData.productType === 'cornflakes' && specData.color) {
      const validColors = ['golden', 'yellow', 'light brown', 'natural'];
      if (!validColors.includes(specData.color.toLowerCase())) {
        errors.push({
          id: `error_${Date.now()}_color`,
          severity: 'critical',
          message: `Invalid color "${specData.color}" for cornflakes. This could lead to product recall.`,
          field: 'color',
          suggestion: `Use one of the approved colors: ${validColors.join(', ')}`
        });
        score -= 30;
      }
    }

    // Check for common food safety requirements
    if (specData.productType && specData.productType.toLowerCase().includes('dairy')) {
      if (!specData.temperatureControl) {
        errors.push({
          id: `error_${Date.now()}_temp`,
          severity: 'critical',
          message: 'Temperature control specifications required for dairy products',
          field: 'temperatureControl',
          suggestion: 'Add temperature storage and transport requirements'
        });
        score -= 30;
      }
    }

    // Check packaging requirements
    if (!specData.packaging) {
      warnings.push('Packaging specifications not provided');
      score -= 5;
    }

    // Check shelf life
    if (!specData.shelfLife) {
      warnings.push('Shelf life information not specified');
      score -= 5;
    }

    // Validate nutritional information for food products
    if (specData.productType && 
        ['food', 'beverage', 'snack', 'cereal', 'dairy'].some(type => 
          specData.productType.toLowerCase().includes(type))) {
      
      if (!specData.nutritionalInfo) {
        errors.push({
          id: `error_${Date.now()}_nutrition`,
          severity: 'medium',
          message: 'Nutritional information recommended for food products',
          field: 'nutritionalInfo',
          suggestion: 'Provide basic nutritional facts'
        });
        score -= 10;
      }
    }

    // Check certifications
    if (!specData.certifications || specData.certifications.length === 0) {
      warnings.push('No certifications specified - consider adding relevant certifications');
      score -= 5;
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    return {
      isValid: errors.filter(e => e.severity === 'critical').length === 0,
      score,
      errors,  // Using 'errors' property name as expected by the code
      warnings,
      productType: specData.productType || 'unknown'
    };
  },

  // Additional utility methods
  getComplianceLevel: (score: number): string => {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'acceptable';
    return 'needs-improvement';
  },

  validateAllergenDeclaration: (allergens: string[], productType: string): ComplianceIssue[] => {
    const issues: ComplianceIssue[] = [];
    
    // Common allergens that should be declared
    if (productType.toLowerCase().includes('flour') && !allergens.includes('gluten')) {
      issues.push({
        id: `allergen_${Date.now()}`,
        severity: 'high',
        message: 'Gluten allergen should be declared for flour products',
        field: 'allergens',
        suggestion: 'Add gluten to allergen list'
      });
    }

    if (productType.toLowerCase().includes('chocolate') && !allergens.includes('dairy')) {
      issues.push({
        id: `allergen_dairy_${Date.now()}`,
        severity: 'medium',
        message: 'Dairy allergen commonly present in chocolate products',
        field: 'allergens',
        suggestion: 'Verify and declare dairy content'
      });
    }

    return issues;
  }
};

// Export components
export { default as ComplianceDashboard } from './components/ComplianceDashboard';

// Utility functions
export const complianceUtils = {
  getComplianceScore: (checks: ComplianceCheck[]): number => {
    if (checks.length === 0) return 0;
    return Math.round(checks.reduce((sum, check) => sum + check.score, 0) / checks.length);
  },
  
  hasIssues: (check: ComplianceCheck): boolean => {
    return check.issues.length > 0;
  },

  formatComplianceScore: (score: number): string => {
    return `${score}%`;
  },

  // Simulate real-time team notification (as used in RFQFormRealTime)
  notifyTeam: (message: string, user: string = 'System') => {
    return {
      id: `notification_${Date.now()}`,
      user,
      message,
      timestamp: new Date().toLocaleTimeString(),
      type: 'validation'
    };
  }
};
