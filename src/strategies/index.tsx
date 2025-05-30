import React from 'react';
import { AlertCircle, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { PricingStrategy, SimpleConfig, TieredConfig, WeightTier } from '../types';
import { validateNumericValue, validateWeightTiers, validateConfigCompleteness } from '../utils/validation';

// ===== CONFIGURATION COMPONENTS =====

// Enhanced Simple Strategy Configuration Component
const SimpleConfigComponent: React.FC<{
  config: SimpleConfig;
  onChange: (config: SimpleConfig) => void;
  errors: string[];
}> = ({ config, onChange, errors }) => {
  // Get validation warnings for better UX
  const priceValidation = validateNumericValue(
    config.pricePerKm,
    'Price per km',
    { min: 0.01, max: 50, required: true, decimalPlaces: 2 }
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price per Kilometer (€)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="50"
          value={config.pricePerKm || ''}
          onChange={(e) => onChange({ pricePerKm: parseFloat(e.target.value) || 0 })}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            errors.length > 0 ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          placeholder="Enter price per km (e.g., 1.50)"
        />
        
        {/* Show validation warnings */}
        {priceValidation.warnings && priceValidation.warnings.map((warning, idx) => (
          <p key={`warning-${idx}`} className="mt-2 text-sm text-amber-600 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
            {warning}
          </p>
        ))}
        
        {/* Show validation errors */}
        {errors.map((error, idx) => (
          <p key={`error-${idx}`} className="mt-2 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </p>
        ))}
        
        <p className="mt-2 text-xs text-gray-500">
          Typical trucking rates range from €0.50 to €5.00 per kilometer
        </p>
      </div>
    </div>
  );
};

// Enhanced Tiered Strategy Configuration Component
const TieredConfigComponent: React.FC<{
  config: TieredConfig;
  onChange: (config: TieredConfig) => void;
  errors: string[];
}> = ({ config, onChange, errors }) => {
  // Get comprehensive validation
  const tiersValidation = validateWeightTiers(config.tiers || []);

  const addTier = () => {
    const existingWeights = config.tiers?.map(t => t.minWeight) || [0];
    const newWeight = Math.max(...existingWeights) + 500;
    const newTier: WeightTier = {
      minWeight: newWeight,
      pricePerKm: 1.0
    };
    onChange({
      tiers: [...(config.tiers || []), newTier].sort((a, b) => a.minWeight - b.minWeight)
    });
  };

  const removeTier = (index: number) => {
    if (config.tiers && config.tiers.length > 1) {
      onChange({
        tiers: config.tiers.filter((_, i) => i !== index)
      });
    }
  };

  const updateTier = (index: number, field: keyof WeightTier, value: number) => {
    if (!config.tiers) return;
    
    const newTiers = [...config.tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    onChange({ tiers: newTiers.sort((a, b) => a.minWeight - b.minWeight) });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Weight Tiers</h3>
          <p className="text-sm text-gray-600">Define pricing based on weight ranges</p>
        </div>
        <button
          onClick={addTier}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Tier
        </button>
      </div>
      
      {/* Validation warnings for the entire tier configuration */}
      {tiersValidation.warnings && tiersValidation.warnings.map((warning, idx) => (
        <div key={`tier-warning-${idx}`} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
            {warning}
          </p>
        </div>
      ))}
      
      {config.tiers && config.tiers.map((tier, index) => (
        <div key={index} className="flex items-end space-x-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Weight (kg)
            </label>
            <input
              type="number"
              min="0"
              step="100"
              value={tier.minWeight}
              onChange={(e) => updateTier(index, 'minWeight', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={index === 0} // First tier should always start from 0
            />
            {index === 0 && (
              <p className="mt-1 text-xs text-gray-500">Base tier (always starts at 0)</p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per km (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="50"
              value={tier.pricePerKm}
              onChange={(e) => updateTier(index, 'pricePerKm', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {config.tiers.length > 1 && index > 0 && (
            <div className="flex items-center">
              <button
                onClick={() => removeTier(index)}
                className="btn-danger btn-icon"
                title="Remove tier"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      ))}
      
      {/* Show configuration errors */}
      {errors.map((error, idx) => (
        <div key={`config-error-${idx}`} className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </p>
        </div>
      ))}
      
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Tip:</strong> Tiers apply cumulatively. For example, if you have tiers at 0kg (€1.00) and 1000kg (€1.50), 
          a 1500kg shipment will pay €1.00/km for the first 1000kg and €1.50/km for the remaining 500kg.
        </p>
      </div>
    </div>
  );
};

// ===== ENHANCED PRICING STRATEGIES =====

export const simplePricingStrategy: PricingStrategy = {
  id: 'simple',
  name: 'Simple Pricing',
  description: 'Single price per kilometer, weight not considered',
  
  calculatePrice: (config: SimpleConfig, weight: number, distance: number): number => {
    return config.pricePerKm * distance;
  },
  
  getDefaultConfig: (): SimpleConfig => ({
    pricePerKm: 1.5
  }),
  
  validateConfig: (config: SimpleConfig) => {
    // Use our enhanced validation
    const completenessValidation = validateConfigCompleteness(config, 'simple');
    if (!completenessValidation.isValid) {
      return completenessValidation;
    }
    
    const priceValidation = validateNumericValue(
      config.pricePerKm,
      'Price per km',
      { min: 0.01, max: 50, required: true }
    );
    
    return {
      isValid: priceValidation.isValid,
      errors: priceValidation.errors
    };
  },
  
  ConfigComponent: SimpleConfigComponent
};

export const tieredPricingStrategy: PricingStrategy = {
  id: 'tiered',
  name: 'Tiered Pricing',
  description: 'Different price per km based on weight thresholds',
  
  calculatePrice: (config: TieredConfig, weight: number, distance: number): number => {
    const sortedTiers = [...config.tiers].sort((a, b) => a.minWeight - b.minWeight);
    let totalPrice = 0;
    let remainingWeight = weight;
    
    for (let i = 0; i < sortedTiers.length; i++) {
      const currentTier = sortedTiers[i];
      const nextTier = sortedTiers[i + 1];
      
      if (remainingWeight <= 0) break;
      
      const tierMax = nextTier ? nextTier.minWeight : Infinity;
      const weightInThisTier = Math.min(remainingWeight, tierMax - currentTier.minWeight);
      
      if (weightInThisTier > 0) {
        totalPrice += (weightInThisTier / weight) * currentTier.pricePerKm * distance;
        remainingWeight -= weightInThisTier;
      }
    }
    
    return totalPrice;
  },
  
  getDefaultConfig: (): TieredConfig => ({
    tiers: [
      { minWeight: 0, pricePerKm: 1.0 },
      { minWeight: 1000, pricePerKm: 1.5 },
      { minWeight: 2000, pricePerKm: 2.0 }
    ]
  }),
  
  validateConfig: (config: TieredConfig) => {
    // Use our enhanced validation
    const completenessValidation = validateConfigCompleteness(config, 'tiered');
    if (!completenessValidation.isValid) {
      return completenessValidation;
    }
    
    return validateWeightTiers(config.tiers);
  },
  
  ConfigComponent: TieredConfigComponent
};

// Registry of all available strategies
export const PRICING_STRATEGIES: Record<string, PricingStrategy> = {
  simple: simplePricingStrategy,
  tiered: tieredPricingStrategy
};