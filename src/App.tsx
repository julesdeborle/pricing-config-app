import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

// Import our organized components and services
import { StrategySelector } from './components/StrategySelector/StrategySelector';
import { ConfigurationPanel } from './components/ConfigurationPanel/ConfigurationPanel';
import { PricingTable } from './components/PricingTable/PricingTable';
import { PRICING_STRATEGIES } from './strategies';
import { dataLayer } from './services/PricingDataLayer';
import { TableRowData } from './types';

const App: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('simple');
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  // Load configurations on mount
  useEffect(() => {
    const loadConfigs = async () => {
      const loadedConfigs = await dataLayer.getAllConfigs();
      const initialConfigs: Record<string, any> = {};
      
      Object.keys(PRICING_STRATEGIES).forEach(strategyId => {
        initialConfigs[strategyId] = loadedConfigs[strategyId] || 
          PRICING_STRATEGIES[strategyId].getDefaultConfig();
      });
      
      setConfigs(initialConfigs);
    };
    
    loadConfigs();
  }, []);

  // Generate pricing table data
  const tableData = useMemo((): TableRowData[] => {
    const strategy = PRICING_STRATEGIES[selectedStrategy];
    const config = configs[selectedStrategy];
    
    if (!strategy || !config) return [];
    
    const weights = [500, 1000, 1500, 2000, 2500];
    const distances = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    
    return distances.map(distance => ({
      distance,
      prices: weights.map(weight => ({
        weight,
        price: strategy.calculatePrice(config, weight, distance)
      }))
    }));
  }, [selectedStrategy, configs]);

  const handleConfigChange = (strategyId: string, newConfig: any) => {
    setConfigs(prev => ({ ...prev, [strategyId]: newConfig }));
    
    // Validate configuration
    const strategy = PRICING_STRATEGIES[strategyId];
    const validation = strategy.validateConfig(newConfig);
    setErrors(prev => ({ ...prev, [strategyId]: validation.errors }));
  };

  const handleSaveConfig = async (strategyId: string) => {
    const config = configs[strategyId];
    const strategy = PRICING_STRATEGIES[strategyId];
    const validation = strategy.validateConfig(config);
    
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, [strategyId]: validation.errors }));
      return;
    }
    
    setSaving(prev => ({ ...prev, [strategyId]: true }));
    try {
      await dataLayer.saveConfig(strategyId, config);
      setErrors(prev => ({ ...prev, [strategyId]: [] }));
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setSaving(prev => ({ ...prev, [strategyId]: false }));
    }
  };

  const currentStrategy = PRICING_STRATEGIES[selectedStrategy];
  const currentConfig = configs[selectedStrategy];
  const currentErrors = errors[selectedStrategy] || [];

  return (
    <div className="App">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Flexible Pricing Configuration System
          </h1>
          <p className="text-gray-300">
            Configure different pricing strategies for trucking operations
          </p>
        </header>

        {/* Strategy Selection */}
        <StrategySelector
          strategies={PRICING_STRATEGIES}
          selectedStrategy={selectedStrategy}
          onStrategyChange={setSelectedStrategy}
        />

        {/* Configuration Panel */}
        {currentStrategy && currentConfig && (
          <ConfigurationPanel
            strategy={currentStrategy}
            config={currentConfig}
            errors={currentErrors}
            saving={saving[selectedStrategy] || false}
            onConfigChange={(newConfig) => handleConfigChange(selectedStrategy, newConfig)}
            onSave={() => handleSaveConfig(selectedStrategy)}
          />
        )}

        {/* Pricing Table */}
        <PricingTable tableData={tableData} />
      </div>
    </div>
  );
};

export default App;