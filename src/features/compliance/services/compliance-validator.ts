// Simple compliance validator export for the compliance feature
export const complianceValidator = {
  validateField: (fieldName: string, value: any) => {
    return []; // Return empty errors for now
  },
  validateSpecification: (spec: any, markets: string[]) => {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      score: 95
    };
  },
  validateProductSpecification: (spec: any, markets: string[]) => {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      score: 95
    };
  }
};
