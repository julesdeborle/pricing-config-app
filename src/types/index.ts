// ===== TYPE DEFINITIONS =====

export interface PricingStrategy {
    id: string;
    name: string;
    description: string;
    calculatePrice: (config: any, weight: number, distance: number) => number;
    getDefaultConfig: () => any;
    validateConfig: (config: any) => { isValid: boolean; errors: string[] };
    ConfigComponent: React.ComponentType<{
      config: any;
      onChange: (config: any) => void;
      errors: string[];
    }>;
  }
  
  export interface WeightTier {
    minWeight: number;
    pricePerKm: number;
  }
  
  export interface SimpleConfig {
    pricePerKm: number;
  }
  
  export interface TieredConfig {
    tiers: WeightTier[];
  }
  
  export interface PriceData {
    weight: number;
    price: number;
  }
  
  export interface TableRowData {
    distance: number;
    prices: PriceData[];
  }