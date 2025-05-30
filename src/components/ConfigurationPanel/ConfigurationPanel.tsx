import React from 'react';
import { Save } from 'lucide-react';
import { PricingStrategy } from '../../types';

interface ConfigurationPanelProps {
  strategy: PricingStrategy;
  config: any;
  errors: string[];
  saving: boolean;
  onConfigChange: (config: any) => void;
  onSave: () => void;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  strategy,
  config,
  errors,
  saving,
  onConfigChange,
  onSave
}) => {
  if (!strategy || !config) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Configure {strategy.name}</h2>
        <button
          onClick={onSave}
          disabled={saving || errors.length > 0}
          className={`btn-success ${saving ? 'btn-loading' : ''}`}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
      
      <strategy.ConfigComponent
        config={config}
        onChange={onConfigChange}
        errors={errors}
      />
    </div>
  );
};