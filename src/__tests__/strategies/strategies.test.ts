import { simplePricingStrategy, tieredPricingStrategy } from '../../strategies';
import { SimpleConfig, TieredConfig } from '../../types';

describe('Simple Pricing Strategy', () => {
  describe('calculatePrice', () => {
    it('should calculate price correctly regardless of weight', () => {
      const config: SimpleConfig = { pricePerKm: 2.0 };
      
      expect(simplePricingStrategy.calculatePrice(config, 500, 50)).toBe(100);
      expect(simplePricingStrategy.calculatePrice(config, 2000, 50)).toBe(100);
      expect(simplePricingStrategy.calculatePrice(config, 1000, 25)).toBe(50);
    });

    it('should handle decimal prices correctly', () => {
      const config: SimpleConfig = { pricePerKm: 1.75 };
      
      expect(simplePricingStrategy.calculatePrice(config, 1000, 10)).toBe(17.5);
    });

    it('should handle zero distance', () => {
      const config: SimpleConfig = { pricePerKm: 2.0 };
      
      expect(simplePricingStrategy.calculatePrice(config, 1000, 0)).toBe(0);
    });
  });

  describe('validateConfig', () => {
    it('should validate correct configuration', () => {
      const config: SimpleConfig = { pricePerKm: 1.5 };
      const result = simplePricingStrategy.validateConfig(config);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject zero or negative prices', () => {
      const configs = [
        { pricePerKm: 0 },
        { pricePerKm: -1 },
        { pricePerKm: -0.5 }
      ];

      configs.forEach(config => {
        const result = simplePricingStrategy.validateConfig(config);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Price per km must be at least 0.01');
      });
    });

    it('should reject missing price', () => {
      const config = {} as SimpleConfig;
      const result = simplePricingStrategy.validateConfig(config);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Price per km is required for simple pricing');
    });
  });

  describe('getDefaultConfig', () => {
    it('should return valid default configuration', () => {
      const defaultConfig = simplePricingStrategy.getDefaultConfig();
      const validation = simplePricingStrategy.validateConfig(defaultConfig);
      
      expect(validation.isValid).toBe(true);
      expect(defaultConfig.pricePerKm).toBeGreaterThan(0);
    });
  });
});

describe('Tiered Pricing Strategy', () => {
  describe('calculatePrice', () => {
    const config: TieredConfig = {
      tiers: [
        { minWeight: 0, pricePerKm: 1.0 },
        { minWeight: 1000, pricePerKm: 1.5 },
        { minWeight: 2000, pricePerKm: 2.0 }
      ]
    };

    it('should calculate price for weight in first tier', () => {
      // 500kg, all in first tier (€1.0/km)
      expect(tieredPricingStrategy.calculatePrice(config, 500, 50)).toBe(50);
    });

    it('should calculate price for weight spanning multiple tiers', () => {
      // 1500kg: 1000kg at €1.0/km + 500kg at €1.5/km for 50km
      // Weighted price = (1000/1500 * 1.0 + 500/1500 * 1.5) * 50 = (0.667 + 0.5) * 50 = 58.33
      const result = tieredPricingStrategy.calculatePrice(config, 1500, 50);
      expect(result).toBeCloseTo(58.33, 2);
    });

    it('should calculate price for weight in highest tier', () => {
      // 2500kg: 1000kg at €1.0/km + 1000kg at €1.5/km + 500kg at €2.0/km for 50km
      // Weighted price = (1000/2500 * 1.0 + 1000/2500 * 1.5 + 500/2500 * 2.0) * 50
      const result = tieredPricingStrategy.calculatePrice(config, 2500, 50);
      expect(result).toBeCloseTo(70, 2);
    });

    it('should handle edge case at tier boundary', () => {
      // Exactly 1000kg should use first tier only
      expect(tieredPricingStrategy.calculatePrice(config, 1000, 50)).toBe(50);
    });

    it('should handle single tier configuration', () => {
      const singleTierConfig: TieredConfig = {
        tiers: [{ minWeight: 0, pricePerKm: 1.5 }]
      };
      
      expect(tieredPricingStrategy.calculatePrice(singleTierConfig, 1000, 50)).toBe(75);
      expect(tieredPricingStrategy.calculatePrice(singleTierConfig, 2000, 50)).toBe(75);
    });
  });

  describe('validateConfig', () => {
    it('should validate correct tiered configuration', () => {
      const config: TieredConfig = {
        tiers: [
          { minWeight: 0, pricePerKm: 1.0 },
          { minWeight: 1000, pricePerKm: 1.5 }
        ]
      };
      
      const result = tieredPricingStrategy.validateConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require first tier to start from 0', () => {
      const config: TieredConfig = {
        tiers: [
          { minWeight: 500, pricePerKm: 1.0 },
          { minWeight: 1000, pricePerKm: 1.5 }
        ]
      };
      
      const result = tieredPricingStrategy.validateConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('First tier must start from 0 kg');
    });

    it('should reject negative or zero prices', () => {
      const config: TieredConfig = {
        tiers: [
          { minWeight: 0, pricePerKm: 0 },
          { minWeight: 1000, pricePerKm: 1.5 }
        ]
      };
      
      const result = tieredPricingStrategy.validateConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((error: string) => error.includes('must be at least 0.01'))).toBe(true);
    });

    it('should reject duplicate weight thresholds', () => {
      const config: TieredConfig = {
        tiers: [
          { minWeight: 0, pricePerKm: 1.0 },
          { minWeight: 1000, pricePerKm: 1.5 },
          { minWeight: 1000, pricePerKm: 2.0 }
        ]
      };
      
      const result = tieredPricingStrategy.validateConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate weight threshold at 1000 kg');
    });
  });

  describe('getDefaultConfig', () => {
    it('should return valid default configuration', () => {
      const defaultConfig = tieredPricingStrategy.getDefaultConfig();
      const validation = tieredPricingStrategy.validateConfig(defaultConfig);
      
      expect(validation.isValid).toBe(true);
      expect(defaultConfig.tiers.length).toBeGreaterThan(0);
      expect(defaultConfig.tiers[0].minWeight).toBe(0);
    });
  });
});

describe('Strategy Integration', () => {
  it('should have consistent pricing for same inputs across strategies', () => {
    const simpleConfig: SimpleConfig = { pricePerKm: 1.5 };
    const tieredConfig: TieredConfig = {
      tiers: [{ minWeight: 0, pricePerKm: 1.5 }]
    };

    const weight = 1000;
    const distance = 50;

    const simplePrice = simplePricingStrategy.calculatePrice(simpleConfig, weight, distance);
    const tieredPrice = tieredPricingStrategy.calculatePrice(tieredConfig, weight, distance);

    expect(simplePrice).toBe(tieredPrice);
  });

  it('should handle extreme values gracefully', () => {
    const simpleConfig: SimpleConfig = { pricePerKm: 0.01 };
    const tieredConfig: TieredConfig = {
      tiers: [{ minWeight: 0, pricePerKm: 0.01 }]
    };

    const extremeWeight = 10000;
    const extremeDistance = 1000;

    expect(() => {
      simplePricingStrategy.calculatePrice(simpleConfig, extremeWeight, extremeDistance);
    }).not.toThrow();

    expect(() => {
      tieredPricingStrategy.calculatePrice(tieredConfig, extremeWeight, extremeDistance);
    }).not.toThrow();
  });
});