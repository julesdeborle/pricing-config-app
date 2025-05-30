import React from 'react';
import { PricingStrategy } from '../../types';

interface StrategySelectorProps {
  strategies: Record<string, PricingStrategy>;
  selectedStrategy: string;
  onStrategyChange: (strategyId: string) => void;
}

export const StrategySelector: React.FC<StrategySelectorProps> = ({
  strategies,
  selectedStrategy,
  onStrategyChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Select Pricing Strategy</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(strategies).map((strategy) => (
          <div
            key={strategy.id}
            className={`strategy-card p-6 border-2 rounded-lg cursor-pointer transition-colors ${
              selectedStrategy === strategy.id
                ? 'selected border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onStrategyChange(strategy.id)}
          >
            <h3 className="font-semibold text-lg text-gray-900">{strategy.name}</h3>
            <p className="text-gray-600 text-sm mt-2">{strategy.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};