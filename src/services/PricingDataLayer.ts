export class PricingDataLayer {
    private configs: Map<string, any> = new Map();
    
    async saveConfig(strategyId: string, config: any): Promise<void> {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      this.configs.set(strategyId, JSON.parse(JSON.stringify(config)));
    }
    
    async loadConfig(strategyId: string): Promise<any | null> {
      await new Promise(resolve => setTimeout(resolve, 50));
      return this.configs.get(strategyId) || null;
    }
    
    async getAllConfigs(): Promise<Record<string, any>> {
      await new Promise(resolve => setTimeout(resolve, 50));
      const result: Record<string, any> = {};
      this.configs.forEach((config, strategyId) => {
        result[strategyId] = config;
      });
      return result;
    }
  }
  
  export const dataLayer = new PricingDataLayer();