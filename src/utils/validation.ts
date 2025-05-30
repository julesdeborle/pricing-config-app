// ===== VALIDATION UTILITIES =====

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
  }
  
  /**
   * Validates a numeric value with constraints
   */
  export const validateNumericValue = (
    value: number,
    fieldName: string,
    options: {
      min?: number;
      max?: number;
      required?: boolean;
      decimalPlaces?: number;
    } = {}
  ): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
  
    // Required check
    if (options.required && (value === null || value === undefined || isNaN(value))) {
      errors.push(`${fieldName} is required`);
      return { isValid: false, errors, warnings };
    }
  
    // Skip other validations if value is not provided and not required
    if (value === null || value === undefined || isNaN(value)) {
      return { isValid: true, errors, warnings };
    }
  
    // Min value check
    if (options.min !== undefined && value < options.min) {
      errors.push(`${fieldName} must be at least ${options.min}`);
    }
  
    // Max value check
    if (options.max !== undefined && value > options.max) {
      errors.push(`${fieldName} must not exceed ${options.max}`);
    }
  
    // Decimal places check
    if (options.decimalPlaces !== undefined) {
      const decimalCount = (value.toString().split('.')[1] || '').length;
      if (decimalCount > options.decimalPlaces) {
        warnings.push(`${fieldName} has more than ${options.decimalPlaces} decimal places`);
      }
    }
  
    // Reasonable value warnings
    if (fieldName.toLowerCase().includes('price') && value > 100) {
      warnings.push(`${fieldName} seems unusually high (€${value})`);
    }
  
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };
  
  /**
   * Validates weight tiers for logical consistency
   */
  export const validateWeightTiers = (tiers: Array<{ minWeight: number; pricePerKm: number }>): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
  
    if (!tiers || tiers.length === 0) {
      errors.push('At least one tier is required');
      return { isValid: false, errors, warnings };
    }
  
    // Sort tiers for validation
    const sortedTiers = [...tiers].sort((a, b) => a.minWeight - b.minWeight);
  
    // First tier must start from 0
    if (sortedTiers[0].minWeight !== 0) {
      errors.push('First tier must start from 0 kg');
    }
  
    // Check for gaps or overlaps
    for (let i = 1; i < sortedTiers.length; i++) {
      const currentTier = sortedTiers[i];
      const previousTier = sortedTiers[i - 1];
  
      // Check for duplicate weights
      if (currentTier.minWeight === previousTier.minWeight) {
        errors.push(`Duplicate weight threshold at ${currentTier.minWeight} kg`);
      }
  
      // Check for logical weight progression
      if (currentTier.minWeight <= previousTier.minWeight) {
        errors.push('Weight thresholds must be in ascending order');
      }
  
      // Warn about large gaps
      const gap = currentTier.minWeight - previousTier.minWeight;
      if (gap > 1000) {
        warnings.push(`Large gap between tiers: ${previousTier.minWeight} kg to ${currentTier.minWeight} kg`);
      }
    }
  
    // Validate individual tier prices
    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      const priceValidation = validateNumericValue(
        tier.pricePerKm,
        `Tier ${i + 1} price per km`,
        { min: 0.01, max: 50, required: true, decimalPlaces: 2 }
      );
  
      errors.push(...priceValidation.errors);
      warnings.push(...(priceValidation.warnings || []));
    }
  
    // Business logic warnings
    if (sortedTiers.length > 5) {
      warnings.push('Having more than 5 tiers may be complex for users to understand');
    }
  
    // Check for decreasing prices (unusual but not invalid)
    for (let i = 1; i < sortedTiers.length; i++) {
      if (sortedTiers[i].pricePerKm < sortedTiers[i - 1].pricePerKm) {
        warnings.push('Price per km decreases as weight increases - is this intentional?');
        break;
      }
    }
  
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };
  
  /**
   * Validates configuration completeness
   */
  export const validateConfigCompleteness = (config: any, strategyId: string): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
  
    if (!config) {
      errors.push('Configuration is required');
      return { isValid: false, errors, warnings };
    }
  
    switch (strategyId) {
      case 'simple':
        if (!config.hasOwnProperty('pricePerKm')) {
          errors.push('Price per km is required for simple pricing');
        }
        break;
  
      case 'tiered':
        if (!config.hasOwnProperty('tiers') || !Array.isArray(config.tiers)) {
          errors.push('Tiers array is required for tiered pricing');
        }
        break;
  
      default:
        warnings.push(`Unknown strategy ID: ${strategyId}`);
    }
  
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };