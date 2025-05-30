import { PricingDataLayer } from '../../services/PricingDataLayer';

describe('PricingDataLayer', () => {
  let dataLayer: PricingDataLayer;

  beforeEach(() => {
    dataLayer = new PricingDataLayer();
  });

  describe('saveConfig', () => {
    it('should save configuration successfully', async () => {
      const strategyId = 'simple';
      const config = { pricePerKm: 1.5 };

      await expect(dataLayer.saveConfig(strategyId, config)).resolves.toBeUndefined();
    });

    it('should handle complex configurations', async () => {
      const strategyId = 'tiered';
      const config = {
        tiers: [
          { minWeight: 0, pricePerKm: 1.0 },
          { minWeight: 1000, pricePerKm: 1.5 }
        ]
      };

      await expect(dataLayer.saveConfig(strategyId, config)).resolves.toBeUndefined();
    });

    it('should create deep copy of configuration', async () => {
      const strategyId = 'simple';
      const config = { pricePerKm: 1.5 };

      await dataLayer.saveConfig(strategyId, config);
      
      // Modify original config
      config.pricePerKm = 2.0;
      
      // Saved config should not be affected
      const loadedConfig = await dataLayer.loadConfig(strategyId);
      expect(loadedConfig.pricePerKm).toBe(1.5);
    });
  });

  describe('loadConfig', () => {
    it('should return null for non-existent configuration', async () => {
      const result = await dataLayer.loadConfig('non-existent');
      expect(result).toBeNull();
    });

    it('should return saved configuration', async () => {
      const strategyId = 'simple';
      const config = { pricePerKm: 2.5 };

      await dataLayer.saveConfig(strategyId, config);
      const loadedConfig = await dataLayer.loadConfig(strategyId);

      expect(loadedConfig).toEqual(config);
    });
  });

  describe('getAllConfigs', () => {
    it('should return empty object when no configs saved', async () => {
      const result = await dataLayer.getAllConfigs();
      expect(result).toEqual({});
    });

    it('should return all saved configurations', async () => {
      const simpleConfig = { pricePerKm: 1.5 };
      const tieredConfig = {
        tiers: [
          { minWeight: 0, pricePerKm: 1.0 },
          { minWeight: 1000, pricePerKm: 2.0 }
        ]
      };

      await dataLayer.saveConfig('simple', simpleConfig);
      await dataLayer.saveConfig('tiered', tieredConfig);

      const allConfigs = await dataLayer.getAllConfigs();

      expect(allConfigs).toEqual({
        simple: simpleConfig,
        tiered: tieredConfig
      });
    });
  });

  describe('async behavior', () => {
    it('should simulate API delays', async () => {
      const startTime = Date.now();
      await dataLayer.saveConfig('test', { value: 1 });
      const endTime = Date.now();

      // Should take at least 100ms (simulated delay)
      expect(endTime - startTime).toBeGreaterThanOrEqual(90);
    });
  });
});

describe('PricingDataLayer', () => {
  let dataLayer: PricingDataLayer;

  beforeEach(() => {
    dataLayer = new PricingDataLayer();
  });

  describe('saveConfig', () => {
    it('should save configuration successfully', async () => {
      const strategyId = 'simple';
      const config = { pricePerKm: 1.5 };

      await expect(dataLayer.saveConfig(strategyId, config)).resolves.toBeUndefined();
    });

    it('should handle complex configurations', async () => {
      const strategyId = 'tiered';
      const config = {
        tiers: [
          { minWeight: 0, pricePerKm: 1.0 },
          { minWeight: 1000, pricePerKm: 1.5 }
        ]
      };

      await expect(dataLayer.saveConfig(strategyId, config)).resolves.toBeUndefined();
    });

    it('should create deep copy of configuration', async () => {
      const strategyId = 'simple';
      const config = { pricePerKm: 1.5 };

      await dataLayer.saveConfig(strategyId, config);
      
      // Modify original config
      config.pricePerKm = 2.0;
      
      // Saved config should not be affected
      const loadedConfig = await dataLayer.loadConfig(strategyId);
      expect(loadedConfig.pricePerKm).toBe(1.5);
    });
  });

  describe('loadConfig', () => {
    it('should return null for non-existent configuration', async () => {
      const result = await dataLayer.loadConfig('non-existent');
      expect(result).toBeNull();
    });

    it('should return saved configuration', async () => {
      const strategyId = 'simple';
      const config = { pricePerKm: 2.5 };

      await dataLayer.saveConfig(strategyId, config);
      const loadedConfig = await dataLayer.loadConfig(strategyId);

      expect(loadedConfig).toEqual(config);
    });
  });

  describe('getAllConfigs', () => {
    it('should return empty object when no configs saved', async () => {
      const result = await dataLayer.getAllConfigs();
      expect(result).toEqual({});
    });

    it('should return all saved configurations', async () => {
      const simpleConfig = { pricePerKm: 1.5 };
      const tieredConfig = {
        tiers: [
          { minWeight: 0, pricePerKm: 1.0 },
          { minWeight: 1000, pricePerKm: 2.0 }
        ]
      };

      await dataLayer.saveConfig('simple', simpleConfig);
      await dataLayer.saveConfig('tiered', tieredConfig);

      const allConfigs = await dataLayer.getAllConfigs();

      expect(allConfigs).toEqual({
        simple: simpleConfig,
        tiered: tieredConfig
      });
    });
  });

  describe('async behavior', () => {
    it('should simulate API delays', async () => {
      const startTime = Date.now();
      await dataLayer.saveConfig('test', { value: 1 });
      const endTime = Date.now();

      // Should take at least 100ms (simulated delay)
      expect(endTime - startTime).toBeGreaterThanOrEqual(90);
    });
  });
});