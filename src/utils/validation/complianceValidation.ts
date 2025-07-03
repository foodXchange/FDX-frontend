// File: /src/utils/validation/complianceValidation.ts

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

interface ProductSpecification {
  productType: string;
  color?: string;
  size?: string;
  packaging?: string;
  ingredients?: string[];
  nutritionalInfo?: Record<string, any>;
  allergens?: string[];
}

interface MarketRequirement {
  market: string;
  regulations: string[];
  certifications: string[];
  allergenLabeling: string[];
  nutritionLabeling: boolean;
  specialRequirements?: string[];
}

class ComplianceValidator {
  private marketRequirements: Record<string, MarketRequirement> = {
    'US': {
      market: 'United States',
      regulations: ['FDA', 'USDA'],
      certifications: ['HACCP', 'SQF'],
      allergenLabeling: ['gluten', 'nuts', 'dairy', 'eggs', 'soy', 'fish', 'shellfish', 'sesame'],
      nutritionLabeling: true,
      specialRequirements: ['nutrition_facts_panel', 'ingredient_list_descending']
    },
    'EU': {
      market: 'European Union',
      regulations: ['EU_Food_Law', 'EU_Nutrition_Regulation'],
      certifications: ['ISO22000', 'BRC', 'IFS'],
      allergenLabeling: ['gluten', 'nuts', 'dairy', 'eggs', 'soy', 'fish', 'shellfish', 'celery', 'mustard', 'lupin', 'sesame', 'sulphites', 'molluscs'],
      nutritionLabeling: true,
      specialRequirements: ['ce_marking', 'allergen_emphasis']
    },
    'UK': {
      market: 'United Kingdom',
      regulations: ['UK_Food_Standards', 'Natasha_Law'],
      certifications: ['BRC', 'HACCP'],
      allergenLabeling: ['gluten', 'nuts', 'dairy', 'eggs', 'soy', 'fish', 'shellfish', 'celery', 'mustard', 'lupin', 'sesame', 'sulphites', 'molluscs'],
      nutritionLabeling: true,
      specialRequirements: ['prepacked_allergen_info', 'country_of_origin']
    },
    'CA': {
      market: 'Canada',
      regulations: ['Health_Canada', 'CFIA'],
      certifications: ['HACCP', 'SQF'],
      allergenLabeling: ['gluten', 'nuts', 'dairy', 'eggs', 'soy', 'fish', 'shellfish', 'sesame', 'mustard', 'sulphites'],
      nutritionLabeling: true,
      specialRequirements: ['bilingual_labeling', 'nutrition_facts_table']
    }
  };

  private criticalSpecErrors: Record<string, string[]> = {
    'cornflakes': ['dark_brown', 'black', 'white', 'blue', 'green'],
    'bread': ['purple', 'blue', 'black'],
    'milk': ['brown', 'green', 'blue'],
    'cheese': ['purple', 'blue', 'black']
  };

  validateProductSpecification(spec: ProductSpecification, targetMarkets: string[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Critical specification validation
    const specErrors = this.validateCriticalSpecs(spec);
    errors.push(...specErrors.errors);
    warnings.push(...specErrors.warnings);
    score -= specErrors.errors.length * 25; // Major penalty for critical errors

    // Market-specific validation
    for (const market of targetMarkets) {
      const marketValidation = this.validateMarketRequirements(spec, market);
      errors.push(...marketValidation.errors);
      warnings.push(...marketValidation.warnings);
      score -= marketValidation.errors.length * 10;
      score -= marketValidation.warnings.length * 5;
    }

    // Allergen validation
    const allergenValidation = this.validateAllergens(spec, targetMarkets);
    errors.push(...allergenValidation.errors);
    warnings.push(...allergenValidation.warnings);
    score -= allergenValidation.errors.length * 15;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, Math.min(100, score))
    };
  }

  private validateCriticalSpecs(spec: ProductSpecification): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for critical color specifications
    if (spec.color && this.criticalSpecErrors[spec.productType]) {
      const invalidColors = this.criticalSpecErrors[spec.productType];
      if (invalidColors.includes(spec.color.toLowerCase())) {
        errors.push(`CRITICAL: Invalid ${spec.productType} color "${spec.color}". This has caused product recalls. Use approved colors: golden, light_brown, amber, honey.`);
      }
    }

    // Validate packaging specifications
    if (spec.packaging) {
      const suspiciousPackaging = ['damaged', 'torn', 'expired', 'unlabeled'];
      if (suspiciousPackaging.some(issue => spec.packaging?.toLowerCase().includes(issue))) {
        errors.push(`Invalid packaging specification: "${spec.packaging}"`);
      }
    }

    // Validate ingredients
    if (spec.ingredients && spec.ingredients.length === 0) {
      warnings.push('No ingredients specified - required for most markets');
    }

    return { isValid: errors.length === 0, errors, warnings, score: 0 };
  }

  private validateMarketRequirements(spec: ProductSpecification, market: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const requirements = this.marketRequirements[market];

    if (!requirements) {
      warnings.push(`Unknown market: ${market}`);
      return { isValid: true, errors, warnings, score: 0 };
    }

    // Check nutrition labeling requirements
    if (requirements.nutritionLabeling && !spec.nutritionalInfo) {
      errors.push(`${market}: Nutritional information is mandatory`);
    }

    // Check special requirements
    if (requirements.specialRequirements) {
      for (const requirement of requirements.specialRequirements) {
        switch (requirement) {
          case 'bilingual_labeling':
            warnings.push(`${market}: Ensure bilingual labeling (English/French)`);
            break;
          case 'allergen_emphasis':
            warnings.push(`${market}: Allergens must be emphasized in ingredient list`);
            break;
          case 'country_of_origin':
            warnings.push(`${market}: Country of origin labeling required`);
            break;
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings, score: 0 };
  }

  private validateAllergens(spec: ProductSpecification, targetMarkets: string[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!spec.allergens) {
      warnings.push('No allergen information provided');
      return { isValid: true, errors, warnings, score: 0 };
    }

    // Get all required allergens for target markets
    const allRequiredAllergens = new Set<string>();
    for (const market of targetMarkets) {
      const requirements = this.marketRequirements[market];
      if (requirements) {
        requirements.allergenLabeling.forEach(allergen => allRequiredAllergens.add(allergen));
      }
    }

    // Check for missing allergen declarations
    const productAllergens = spec.allergens.map(a => a.toLowerCase());
    const commonAllergens = ['gluten', 'nuts', 'dairy', 'eggs', 'soy'];
    
    for (const allergen of commonAllergens) {
      if (!productAllergens.includes(allergen) && !productAllergens.includes(`no_${allergen}`)) {
        warnings.push(`Consider declaring ${allergen} status (present/absent/may contain)`);
      }
    }

    // Validate specific product-allergen combinations
    if (spec.productType === 'cornflakes' && productAllergens.includes('nuts')) {
      warnings.push('Nuts in cornflakes - verify cross-contamination prevention');
    }

    return { isValid: errors.length === 0, errors, warnings, score: 0 };
  }

  validateCertification(certName: string, expiryDate: string, targetMarkets: string[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Check expiry date
    const expiry = new Date(expiryDate);
    const now = new Date();
    const monthsUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (expiry < now) {
      errors.push(`Certificate "${certName}" has expired`);
      score = 0;
    } else if (monthsUntilExpiry < 6) {
      warnings.push(`Certificate "${certName}" expires in less than 6 months`);
      score -= 20;
    } else if (monthsUntilExpiry < 12) {
      warnings.push(`Certificate "${certName}" expires in less than 12 months`);
      score -= 10;
    }

    // Check if certification is required for target markets
    const requiredMarkets: string[] = [];
    for (const market of targetMarkets) {
      const requirements = this.marketRequirements[market];
      if (requirements?.certifications.includes(certName)) {
        requiredMarkets.push(market);
      }
    }

    if (requiredMarkets.length === 0) {
      warnings.push(`Certificate "${certName}" not required for target markets: ${targetMarkets.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }

  generateComplianceReport(spec: ProductSpecification, targetMarkets: string[]): string {
    const validation = this.validateProductSpecification(spec, targetMarkets);
    
    let report = `COMPLIANCE REPORT\n`;
    report += `Product: ${spec.productType}\n`;
    report += `Target Markets: ${targetMarkets.join(', ')}\n`;
    report += `Overall Score: ${validation.score}/100\n\n`;

    if (validation.errors.length > 0) {
      report += `CRITICAL ERRORS (${validation.errors.length}):\n`;
      validation.errors.forEach((error, index) => {
        report += `${index + 1}. ${error}\n`;
      });
      report += '\n';
    }

    if (validation.warnings.length > 0) {
      report += `WARNINGS (${validation.warnings.length}):\n`;
      validation.warnings.forEach((warning, index) => {
        report += `${index + 1}. ${warning}\n`;
      });
      report += '\n';
    }

    // Market-specific requirements
    report += `MARKET REQUIREMENTS:\n`;
    for (const market of targetMarkets) {
      const requirements = this.marketRequirements[market];
      if (requirements) {
        report += `\n${market} (${requirements.market}):\n`;
        report += `- Regulations: ${requirements.regulations.join(', ')}\n`;
        report += `- Required Certifications: ${requirements.certifications.join(', ')}\n`;
        report += `- Allergen Labeling: ${requirements.allergenLabeling.length} allergens\n`;
        if (requirements.specialRequirements) {
          report += `- Special Requirements: ${requirements.specialRequirements.join(', ')}\n`;
        }
      }
    }

    return report;
  }

  // Real-time validation for form inputs
  validateField(fieldName: string, value: any, context: ProductSpecification): string[] {
    const errors: string[] = [];

    switch (fieldName) {
      case 'color':
        if (context.productType && this.criticalSpecErrors[context.productType]) {
          const invalidColors = this.criticalSpecErrors[context.productType];
          if (value && invalidColors.includes(value.toLowerCase())) {
            errors.push(`⚠️ CRITICAL: ${value} color has caused product recalls for ${context.productType}`);
          }
        }
        break;

      case 'allergens':
        if (Array.isArray(value) && value.length === 0) {
          errors.push('Allergen information is required for most markets');
        }
        break;

      case 'ingredients':
        if (Array.isArray(value) && value.length === 0) {
          errors.push('Ingredient list is mandatory for food products');
        }
        break;
    }

    return errors;
  }
}

// File: /src/utils/validation/specValidation.ts

interface SpecValidationConfig {
  productType: string;
  allowedColors?: string[];
  requiredFields?: string[];
  numericRanges?: Record<string, { min: number; max: number }>;
}

class SpecificationValidator {
  private configurations: Record<string, SpecValidationConfig> = {
    'cornflakes': {
      productType: 'cornflakes',
      allowedColors: ['golden', 'light_brown', 'amber', 'honey', 'yellow'],
      requiredFields: ['color', 'size', 'packaging'],
      numericRanges: {
        moisture: { min: 2, max: 4 },
        protein: { min: 6, max: 10 },
        fat: { min: 0.5, max: 2 }
      }
    },
    'bread': {
      productType: 'bread',
      allowedColors: ['brown', 'white', 'golden', 'wheat'],
      requiredFields: ['type', 'weight', 'packaging'],
      numericRanges: {
        moisture: { min: 35, max: 40 },
        protein: { min: 8, max: 15 }
      }
    },
    'rice': {
      productType: 'rice',
      allowedColors: ['white', 'brown', 'red', 'black', 'wild'],
      requiredFields: ['variety', 'grade', 'origin'],
      numericRanges: {
        moisture: { min: 12, max: 14 },
        protein: { min: 6, max: 8 }
      }
    }
  };

  validateSpecification(spec: any, productType: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    const config = this.configurations[productType];
    if (!config) {
      warnings.push(`No validation rules defined for product type: ${productType}`);
      return { isValid: true, errors, warnings, score: 90 };
    }

    // Validate required fields
    if (config.requiredFields) {
      for (const field of config.requiredFields) {
        if (!spec[field] || spec[field] === '') {
          errors.push(`Required field missing: ${field}`);
          score -= 15;
        }
      }
    }

    // Validate colors
    if (config.allowedColors && spec.color) {
      if (!config.allowedColors.includes(spec.color.toLowerCase())) {
        errors.push(`Invalid color "${spec.color}" for ${productType}. Allowed colors: ${config.allowedColors.join(', ')}`);
        score -= 30; // Heavy penalty for color errors
      }
    }

    // Validate numeric ranges
    if (config.numericRanges) {
      for (const [field, range] of Object.entries(config.numericRanges)) {
        const value = parseFloat(spec[field]);
        if (!isNaN(value)) {
          if (value < range.min || value > range.max) {
            warnings.push(`${field} value ${value} outside recommended range: ${range.min}-${range.max}`);
            score -= 5;
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }
}

export const complianceValidator = new ComplianceValidator();
export const specValidator = new SpecificationValidator();

export type { ValidationResult, ProductSpecification, MarketRequirement };