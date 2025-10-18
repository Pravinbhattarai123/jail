// src/components/widgets/SalesActivityCard.tsx
'use client'; 
import React, { useState, useEffect } from 'react';

interface SalesDataItem {
    name: string;
    sales: number;
}

const generateSalesData = (): SalesDataItem[] => {
  const days: string[] = ['M', 'T', 'W', 'Th', 'F', 'S'];
  return days.map(day => ({
    name: day,
    sales: Math.floor(Math.random() * (300 - 80 + 1)) + 80,
  }));
};

const SalesActivityCard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('This week');
  const [salesData, setSalesData] = useState<SalesDataItem[]>([]);

  useEffect(() => {
    setSalesData(generateSalesData());
  }, [selectedPeriod]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Sales Activity</h3>
        <select
          value={selectedPeriod}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedPeriod(e.target.value)}
          className="border border-gray-300 rounded-md p-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option>This week</option>
          <option>Last week</option>
          <option>This month</option>
        </select>
      </div>

      {/* Bar Chart Placeholder */}
      <div className="flex-1 h-64 flex items-end justify-around bg-gray-50 p-4 rounded-lg text-gray-400 text-xs relative">
        {salesData.map((item, index) => (
          <div key={index} className="flex flex-col items-center h-full justify-end w-1/6 px-1">
            <div 
              // Calculate height as a percentage of the max possible sales (300)
              style={{ height: `${item.sales / 3}%` }} 
              className="w-full bg-indigo-500 rounded-t-sm transition-all duration-300 ease-out hover:bg-indigo-600"
            ></div>
            <span className="mt-2 text-gray-600 text-sm">{item.name}</span>
          </div>
        ))}
        <div className="absolute opacity-20 text-xs top-2 left-2">
          {JSON.stringify(salesData, null, 2)}
        </div>
      </div>
    </div>
  );
};

export default SalesActivityCard;