import { api } from './api';
import { ProductSpecification, ApiResponse } from '../shared/types';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  code?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface ProductSpecValidationData {
  category: string;
  specifications: ProductSpecification[];
  quantity?: number;
  unit?: string;
}

export interface ComplianceValidationData {
  productType: string;
  targetMarkets: string[];
  certifications: string[];
  specifications: ProductSpecification[];
}

export interface RFQValidationData {
  title: string;
  description: string;
  category: string;
  specifications: ProductSpecification[];
  deliveryDate: string;
  submissionDeadline: string;
  budgetRange?: {
    min: number;
    max: number;
  };
}

class ValidationService {
  async validateProductSpecs(data: ProductSpecValidationData): Promise<ValidationResult> {
    try {
      const response = await api.post<ApiResponse<ValidationResult>>('/validation/product-specs', data);
      
      if (!response.data) {
        throw new Error('Validation failed');
      }
      
      return response.data;
    } catch (error) {
      // Return basic client-side validation if API fails
      return this.performBasicSpecValidation(data);
    }
  }

  async validateCompliance(data: ComplianceValidationData): Promise<ValidationResult> {
    try {
      const response = await api.post<ApiResponse<ValidationResult>>('/validation/compliance', data);
      
      if (!response.data) {
        throw new Error('Compliance validation failed');
      }
      
      return response.data;
    } catch (error) {
      return this.performBasicComplianceValidation(data);
    }
  }

  async validateRFQ(data: RFQValidationData): Promise<ValidationResult> {
    try {
      const response = await api.post<ApiResponse<ValidationResult>>('/validation/rfq', data);
      
      if (!response.data) {
        throw new Error('RFQ validation failed');
      }
      
      return response.data;
    } catch (error) {
      return this.performBasicRFQValidation(data);
    }
  }

  async checkSpecificationStandards(category: string, specs: ProductSpecification[]): Promise<ValidationResult> {
    try {
      const response = await api.post<ApiResponse<ValidationResult>>('/validation/standards', {
        category,
        specifications: specs
      });
      
      return response.data || { isValid: true, errors: [], warnings: [], suggestions: [] };
    } catch (error) {
      return { isValid: true, errors: [], warnings: [], suggestions: [] };
    }
  }

  async validateDeliveryConstraints(deliveryDate: string, location: string, quantity: number): Promise<ValidationResult> {
    try {
      const response = await api.post<ApiResponse<ValidationResult>>('/validation/delivery', {
        deliveryDate,
        location,
        quantity
      });
      
      return response.data || { isValid: true, errors: [], warnings: [], suggestions: [] };
    } catch (error) {
      return this.performBasicDeliveryValidation(deliveryDate, location, quantity);
    }
  }

  // Client-side fallback validation methods
  private performBasicSpecValidation(data: ProductSpecValidationData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    // Check for required specifications based on category
    const requiredSpecs = this.getRequiredSpecsForCategory(data.category);
    const providedSpecs = data.specifications.map(spec => spec.name.toLowerCase());

    requiredSpecs.forEach(requiredSpec => {
      if (!providedSpecs.includes(requiredSpec.toLowerCase())) {
        errors.push({
          field: 'specifications',
          message: `Missing required specification: ${requiredSpec}`,
          severity: 'error'
        });
      }
    });

    // Check for empty or invalid specifications
    data.specifications.forEach((spec, index) => {
      if (!spec.name.trim()) {
        errors.push({
          field: `specifications[${index}].name`,
          message: 'Specification name cannot be empty',
          severity: 'error'
        });
      }

      if (!spec.value.trim()) {
        errors.push({
          field: `specifications[${index}].value`,
          message: 'Specification value cannot be empty',
          severity: 'error'
        });
      }

      // Check for numeric specifications that should have units
      if (this.isNumericValue(spec.value) && !this.hasUnits(spec.value)) {
        warnings.push({
          field: `specifications[${index}].value`,
          message: 'Numeric values should include units',
          suggestion: `Consider adding units to "${spec.value}"`
        });
      }
    });

    // Add suggestions based on category
    suggestions.push(...this.getSuggestionsForCategory(data.category));

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  private performBasicComplianceValidation(data: ComplianceValidationData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    // Check for required certifications based on product type and target markets
    const requiredCertifications = this.getRequiredCertifications(data.productType, data.targetMarkets);
    
    requiredCertifications.forEach(cert => {
      if (!data.certifications.includes(cert)) {
        warnings.push({
          field: 'certifications',
          message: `Recommended certification missing: ${cert}`,
          suggestion: `Consider obtaining ${cert} certification for ${data.targetMarkets.join(', ')} markets`
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  private performBasicRFQValidation(data: RFQValidationData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    // Validate dates
    const deliveryDate = new Date(data.deliveryDate);
    const submissionDeadline = new Date(data.submissionDeadline);
    const now = new Date();

    if (submissionDeadline <= now) {
      errors.push({
        field: 'submissionDeadline',
        message: 'Submission deadline must be in the future',
        severity: 'error'
      });
    }

    if (deliveryDate <= submissionDeadline) {
      errors.push({
        field: 'deliveryDate',
        message: 'Delivery date must be after submission deadline',
        severity: 'error'
      });
    }

    // Check minimum lead time
    const leadTime = (deliveryDate.getTime() - submissionDeadline.getTime()) / (1000 * 60 * 60 * 24);
    if (leadTime < 7) {
      warnings.push({
        field: 'deliveryDate',
        message: 'Short lead time may limit supplier responses',
        suggestion: 'Consider extending the lead time to at least 7 days'
      });
    }

    // Validate budget range
    if (data.budgetRange) {
      if (data.budgetRange.min >= data.budgetRange.max) {
        errors.push({
          field: 'budgetRange',
          message: 'Minimum budget must be less than maximum budget',
          severity: 'error'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  private performBasicDeliveryValidation(deliveryDate: string, _location: string, quantity: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    const delivery = new Date(deliveryDate);
    const now = new Date();
    const daysUntilDelivery = Math.ceil((delivery.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDelivery < 3) {
      errors.push({
        field: 'deliveryDate',
        message: 'Delivery date is too soon for most suppliers',
        severity: 'error'
      });
    } else if (daysUntilDelivery < 7) {
      warnings.push({
        field: 'deliveryDate',
        message: 'Short delivery timeline may limit supplier options',
        suggestion: 'Consider extending delivery date for more competitive pricing'
      });
    }

    // Check for high quantity orders
    if (quantity > 10000) {
      suggestions.push('Large quantity orders may require special handling and extended lead times');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  private getRequiredSpecsForCategory(category: string): string[] {
    const categorySpecs: { [key: string]: string[] } = {
      'fruits & vegetables': ['Weight', 'Grade', 'Origin', 'Packaging'],
      'grains & cereals': ['Protein Content', 'Moisture', 'Grade', 'Origin'],
      'dairy products': ['Fat Content', 'Protein', 'Shelf Life', 'Storage Temperature'],
      'meat & poultry': ['Cut Type', 'Grade', 'Packaging', 'Storage Temperature'],
      'seafood': ['Species', 'Grade', 'Processing', 'Storage Temperature'],
      'processed foods': ['Ingredients', 'Shelf Life', 'Packaging', 'Storage Conditions'],
      'beverages': ['Volume', 'Alcohol Content', 'Packaging', 'Shelf Life'],
      'spices & seasonings': ['Purity', 'Moisture', 'Origin', 'Packaging'],
      'oils & fats': ['Type', 'Purity', 'Smoke Point', 'Storage Conditions'],
      'bakery products': ['Ingredients', 'Shelf Life', 'Packaging', 'Storage Conditions']
    };

    return categorySpecs[category.toLowerCase()] || [];
  }

  private getRequiredCertifications(productType: string, targetMarkets: string[]): string[] {
    const certifications: string[] = [];
    
    if (targetMarkets.includes('US')) {
      certifications.push('FDA Approval');
    }
    
    if (targetMarkets.includes('EU')) {
      certifications.push('CE Marking');
    }
    
    if (productType.includes('organic')) {
      certifications.push('Organic Certification');
    }
    
    return certifications;
  }

  private getSuggestionsForCategory(category: string): string[] {
    const suggestions: { [key: string]: string[] } = {
      'fruits & vegetables': [
        'Consider specifying organic requirements if needed',
        'Include seasonal availability information',
        'Specify packaging and storage requirements'
      ],
      'dairy products': [
        'Include cold chain requirements',
        'Specify shelf life expectations',
        'Consider lactose-free alternatives'
      ],
      'meat & poultry': [
        'Include halal/kosher requirements if needed',
        'Specify cut specifications clearly',
        'Consider antibiotic-free options'
      ]
    };

    return suggestions[category.toLowerCase()] || [];
  }

  private isNumericValue(value: string): boolean {
    return /^\d+(\.\d+)?/.test(value.trim());
  }

  private hasUnits(value: string): boolean {
    return /\d+\s*[a-zA-Z]+/.test(value.trim());
  }
}

export const validationService = new ValidationService();