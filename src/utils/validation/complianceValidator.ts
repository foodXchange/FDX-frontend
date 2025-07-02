interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface ProductSpecification {
  productType: string;
  color?: string;
  size?: string;
  packaging?: string;
  quantity: number;
  unit: string;
}

interface RFQData {
  title: string;
  description: string;
  productType: string;
  specifications: ProductSpecification;
  allergens: string[];
  deadline: string;
  budget: number;
}

const COMPLIANCE_RULES = {
  cornflakeColors: {
    valid: ['golden', 'light_brown', 'amber', 'honey'],
    invalid: ['dark_brown', 'white', 'black', 'grey', 'green']
  },
  
  commonAllergens: [
    'milk', 'eggs', 'fish', 'shellfish', 'tree_nuts', 'peanuts', 
    'wheat', 'soybeans', 'sesame', 'mustard', 'celery', 'lupin'
  ]
};

class ComplianceValidator {
  
  validateSpecifications(specs: ProductSpecification): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Critical cornflake color validation
    if (specs.productType === 'cornflakes' && specs.color) {
      if (COMPLIANCE_RULES.cornflakeColors.invalid.includes(specs.color)) {
        errors.push('CRITICAL: Invalid cornflake color \"' + specs.color + '\". This caused a 9-month project failure before!');
        errors.push('Valid colors: ' + COMPLIANCE_RULES.cornflakeColors.valid.join(', '));
      } else if (!COMPLIANCE_RULES.cornflakeColors.valid.includes(specs.color)) {
        warnings.push('Cornflake color \"' + specs.color + '\" not in pre-approved list. Verification required.');
      }
    }

    // Quantity validation
    if (specs.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (specs.quantity > 100000) {
      warnings.push('Large quantity order - verify supplier capacity and logistics');
    }

    // Unit validation
    const validUnits = ['kg', 'tons', 'lbs', 'pieces', 'cases'];
    if (!validUnits.includes(specs.unit)) {
      errors.push('Invalid unit \"' + specs.unit + '\". Valid units: ' + validUnits.join(', '));
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateProduct(rfqData: RFQData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!rfqData.title.trim()) {
      errors.push('RFQ title is required');
    }

    if (!rfqData.productType) {
      errors.push('Product type must be selected');
    }

    if (!rfqData.deadline) {
      errors.push('Deadline is required');
    } else {
      const deadlineDate = new Date(rfqData.deadline);
      const today = new Date();
      if (deadlineDate <= today) {
        errors.push('Deadline must be in the future');
      }
    }

    if (rfqData.budget <= 0) {
      errors.push('Budget must be greater than 0');
    }

    const specValidation = this.validateSpecifications(rfqData.specifications);
    errors.push(...specValidation.errors);
    warnings.push(...specValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateFoodSafety(rfqData: RFQData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (rfqData.allergens.length === 0) {
      warnings.push('No allergens declared - verify product is allergen-free');
    }

    const hasNuts = rfqData.allergens.some(allergen => 
      ['tree_nuts', 'peanuts'].includes(allergen)
    );
    const hasMilk = rfqData.allergens.includes('milk');
    
    if (hasNuts && hasMilk) {
      warnings.push('Product contains both nuts and milk - ensure separate production lines');
    }

    if (rfqData.productType === 'cornflakes') {
      if (!rfqData.allergens.includes('wheat') && !rfqData.title.toLowerCase().includes('gluten-free')) {
        warnings.push('Cornflakes typically contain gluten - verify allergen declaration');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export const complianceValidator = new ComplianceValidator();
export default complianceValidator;
