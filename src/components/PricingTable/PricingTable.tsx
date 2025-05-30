import React from 'react';
import { TableRowData } from '../../types';

interface PricingTableProps {
  tableData: TableRowData[];
}

export const PricingTable: React.FC<PricingTableProps> = ({ tableData }) => {
  if (!tableData || tableData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Pricing Table Preview</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Distance (km)</th>
              {[500, 1000, 1500, 2000, 2500].map(weight => (
                <th key={weight} className="border border-gray-300 px-4 py-2 text-center">
                  {weight} kg
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.distance} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">
                  {row.distance}
                </td>
                {row.prices.map((priceData) => (
                  <td key={priceData.weight} className="border border-gray-300 px-4 py-2 text-center">
                    €{priceData.price.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};