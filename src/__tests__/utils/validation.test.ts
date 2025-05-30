import { 
    validateNumericValue, 
    validateWeightTiers, 
    validateConfigCompleteness 
  } from '../../utils/validation';
  
  describe('validateNumericValue', () => {
    it('should validate correct numeric values', () => {
      const result = validateNumericValue(5.5, 'Test Value', { min: 0, max: 10, required: true });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  
    it('should reject values below minimum', () => {
      const result = validateNumericValue(-1, 'Price', { min: 0, required: true });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Price must be at least 0');
    });
  
    it('should reject values above maximum', () => {
      const result = validateNumericValue(15, 'Distance', { max: 10, required: true });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Distance must not exceed 10');
    });
  
    it('should handle required field validation', () => {
      const testCases = [NaN, null, undefined];
      
      testCases.forEach(value => {
        const result = validateNumericValue(value as number, 'Required Field', { required: true });
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Required Field is required');
      });
    });
  
    it('should allow optional fields to be empty', () => {
      const testCases = [NaN, null, undefined];
      
      testCases.forEach(value => {
        const result = validateNumericValue(value as number, 'Optional Field', { required: false });
        expect(result.isValid).toBe(true);
      });
    });
  
    it('should warn about excessive decimal places', () => {
      const result = validateNumericValue(1.12345, 'Price', { decimalPlaces: 2 });
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Price has more than 2 decimal places');
    });
  
    it('should warn about unusually high prices', () => {
      const result = validateNumericValue(150, 'Price per km', { min: 0 });
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Price per km seems unusually high (€150)');
    });
  });
  
  describe('validateWeightTiers', () => {
    it('should validate correct tier configuration', () => {
      const tiers = [
        { minWeight: 0, pricePerKm: 1.0 },
        { minWeight: 1000, pricePerKm: 1.5 },
        { minWeight: 2000, pricePerKm: 2.0 }
      ];
      
      const result = validateWeightTiers(tiers);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  
    it('should reject empty tiers', () => {
      const result = validateWeightTiers([]);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one tier is required');
    });
  
    it('should reject tiers not starting from 0', () => {
      const tiers = [
        { minWeight: 500, pricePerKm: 1.0 },
        { minWeight: 1000, pricePerKm: 1.5 }
      ];
      
      const result = validateWeightTiers(tiers);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('First tier must start from 0 kg');
    });
  
    it('should reject duplicate weight thresholds', () => {
      const tiers = [
        { minWeight: 0, pricePerKm: 1.0 },
        { minWeight: 1000, pricePerKm: 1.5 },
        { minWeight: 1000, pricePerKm: 2.0 }
      ];
      
      const result = validateWeightTiers(tiers);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate weight threshold at 1000 kg');
    });
  
    it('should reject invalid price values', () => {
      const tiers = [
        { minWeight: 0, pricePerKm: 0 },
        { minWeight: 1000, pricePerKm: 1.5 }
      ];
      
      const result = validateWeightTiers(tiers);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((error: string) => error.includes('must be at least 0.01'))).toBe(true);
    });
  
    it('should warn about large gaps between tiers', () => {
      const tiers = [
        { minWeight: 0, pricePerKm: 1.0 },
        { minWeight: 5000, pricePerKm: 1.5 }
      ];
      
      const result = validateWeightTiers(tiers);
      expect(result.warnings).toContain('Large gap between tiers: 0 kg to 5000 kg');
    });
  
    it('should warn about too many tiers', () => {
      const tiers = Array.from({ length: 7 }, (_, i) => ({
        minWeight: i * 500,
        pricePerKm: 1.0 + i * 0.1
      }));
      
      const result = validateWeightTiers(tiers);
      expect(result.warnings).toContain('Having more than 5 tiers may be complex for users to understand');
    });
  
    it('should warn about decreasing prices', () => {
      const tiers = [
        { minWeight: 0, pricePerKm: 2.0 },
        { minWeight: 1000, pricePerKm: 1.5 },
        { minWeight: 2000, pricePerKm: 1.0 }
      ];
      
      const result = validateWeightTiers(tiers);
      expect(result.warnings).toContain('Price per km decreases as weight increases - is this intentional?');
    });
  
    it('should handle unsorted tiers correctly', () => {
      const tiers = [
        { minWeight: 1000, pricePerKm: 1.5 },
        { minWeight: 0, pricePerKm: 1.0 },
        { minWeight: 2000, pricePerKm: 2.0 }
      ];
      
      const result = validateWeightTiers(tiers);
      expect(result.isValid).toBe(true);
    });
  });
  
  describe('validateConfigCompleteness', () => {
    it('should validate complete simple config', () => {
      const config = { pricePerKm: 1.5 };
      const result = validateConfigCompleteness(config, 'simple');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  
    it('should validate complete tiered config', () => {
      const config = {
        tiers: [
          { minWeight: 0, pricePerKm: 1.0 },
          { minWeight: 1000, pricePerKm: 1.5 }
        ]
      };
      const result = validateConfigCompleteness(config, 'tiered');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  
    it('should reject null or undefined config', () => {
      const testCases = [null, undefined];
      
      testCases.forEach(config => {
        const result = validateConfigCompleteness(config, 'simple');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Configuration is required');
      });
    });
  
    it('should reject incomplete simple config', () => {
      const config = {};
      const result = validateConfigCompleteness(config, 'simple');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Price per km is required for simple pricing');
    });
  
    it('should reject incomplete tiered config', () => {
      const testCases = [
        {},
        { tiers: null },
        { tiers: 'invalid' }
      ];
      
      testCases.forEach((config: any) => {
        const result = validateConfigCompleteness(config, 'tiered');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Tiers array is required for tiered pricing');
      });
    });
  
    it('should warn about unknown strategy', () => {
      const config = { someProperty: 'value' };
      const result = validateConfigCompleteness(config, 'unknown-strategy');
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Unknown strategy ID: unknown-strategy');
    });
  });