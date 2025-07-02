// src/utils/validation/complianceValidator.ts

interface ValidationRule {
  type: 'required' | 'enum' | 'range' | 'exact_match' | 'regex';
  values?: string[] | number[];
  min?: number;
  max?: number;
  pattern?: RegExp;
  message?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface ProductSpecs {
  productType: string;
  color?: string;
  size?: string;
  packaging?: string;
  quantity?: number;
  unit?: string;
}

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

class ComplianceValidator {
  private static validateField(value: any, rule: ValidationRule): { isValid: boolean } {
    switch (rule.type) {
      case 'required':
        return { isValid: value !== null && value !== undefined && value !== '' };

      case 'enum':
        if (!rule.values) return { isValid: true };
        return { isValid: (rule.values as any[]).includes(value) || false };

      case 'range':
        if (typeof value !== 'number') return { isValid: false };
        const min = rule.min ?? Number.MIN_SAFE_INTEGER;
        const max = rule.max ?? Number.MAX_SAFE_INTEGER;
        return { isValid: value >= min && value <= max };

      case 'exact_match':
        if (!rule.values) return { isValid: true };
        return { isValid: (rule.values as any[]).includes(value) || false };

      case 'regex':
        if (!rule.pattern) return { isValid: true };
        return { isValid: rule.pattern.test(String(value)) };

      default:
        return { isValid: true };
    }
  }

  static validateProduct(formData: RFQFormData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!formData.title.trim()) {
      errors.push('RFQ title is required');
    }

    if (!formData.productType) {
      errors.push('Product type must be selected');
    }

    if (formData.specifications.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    // Budget validation
    if (formData.budget <= 0) {
      warnings.push('Consider setting a budget for better supplier matching');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  static validateSpecifications(specs: ProductSpecs): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Critical cornflake color validation
    if (specs.productType === 'cornflakes' && specs.color) {
      const approvedColors = ['golden', 'light_brown', 'amber', 'honey'];
      if (!approvedColors.includes(specs.color.toLowerCase())) {
        errors.push('❌ CRITICAL ERROR: Invalid cornflake color. Must be one of: ' + approvedColors.join(', '));
      }
    }

    // Quantity validation
    if (specs.quantity && specs.quantity < 1) {
      errors.push('Quantity must be at least 1');
    }

    if (specs.quantity && specs.quantity > 10000) {
      warnings.push('Large quantity order - consider breaking into smaller batches');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  static validateFoodSafety(formData: RFQFormData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Allergen validation
    if (formData.allergens.length === 0) {
      warnings.push('Consider specifying allergen requirements for food safety compliance');
    }

    // Deadline validation
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const now = new Date();
      const daysDiff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

      if (daysDiff < 7) {
        warnings.push('Short deadline may limit supplier options and increase costs');
      }

      if (daysDiff < 0) {
        errors.push('Deadline cannot be in the past');
      }
    }

    // Food safety requirements by product type
    if (formData.productType === 'cornflakes') {
      warnings.push('Ensure suppliers have HACCP certification for cereal products');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  static validateRegulatory(formData: RFQFormData, targetMarket: string = 'US'): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Market-specific regulations
    switch (targetMarket.toLowerCase()) {
      case 'us':
        warnings.push('Ensure FDA compliance for US market entry');
        break;
      case 'eu':
        warnings.push('Verify EU Novel Food regulations compliance');
        break;
      case 'uk':
        warnings.push('Check UK Food Standards Agency requirements');
        break;
      default:
        warnings.push('Verify local food safety regulations for target market');
    }

    // Labeling requirements
    if (formData.allergens.length > 0) {
      warnings.push('Allergen labeling must comply with local regulations');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Error prevention utilities
  static getColorValidationHint(productType: string): string {
    if (productType === 'cornflakes') {
      return '⚠️ Remember: Wrong cornflake color caused 9-month project failure. Approved: Golden, Light Brown, Amber, Honey';
    }
    return 'Select appropriate color specification for your product';
  }

  static getCriticalSpecs(productType: string): string[] {
    const criticalSpecs: { [key: string]: string[] } = {
      'cornflakes': ['color', 'quantity', 'packaging'],
      'wheat': ['grade', 'protein_content', 'moisture'],
      'rice': ['grain_type', 'quality_grade', 'moisture'],
      'oats': ['cut_type', 'quality', 'moisture'],
      'pasta': ['shape', 'wheat_type', 'cooking_time']
    };

    return criticalSpecs[productType] || ['quantity', 'quality'];
  }
}

export const complianceValidator = ComplianceValidator;