// src/components/widgets/RevenueCard.tsx
'use client'; 
import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card'

interface ChartDataItem {
    name: string;
    earned: number;
    forecasted: number;
}

const generateChartData = (period: string): ChartDataItem[] => {
  const data: ChartDataItem[] = [];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  let count = 6;

  if (period === 'daily') count = 7;
  if (period === 'weekly') count = 4;
  if (period === 'monthly') count = 12;

  for (let i = 0; i < count; i++) {
    data.push({
      name: period === 'monthly' ? months[i % 12] : `Item ${i + 1}`,
      earned: Math.floor(Math.random() * (120 - 40 + 1)) + 40,
      forecasted: Math.floor(Math.random() * (120 - 40 + 1)) + 40,
    });
  }
  return data;
};

const formatCurrency = (value: number): string => {
    return `₹${(value / 10).toFixed(1)}M`;
}

const RevenueCard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Weekly');
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  useEffect(() => {
    setChartData(generateChartData(selectedPeriod.toLowerCase()));
  }, [selectedPeriod, selectedYear]);

  return (
    <Card
      title="Total Revenue"
      subtitle="Overview"
      right={(
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['Daily', 'Weekly', 'Monthly'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${selectedPeriod === period ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                {period}
              </button>
            ))}
          </div>
          <select
            value={selectedYear}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded-md p-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option>2025</option>
            <option>2024</option>
            <option>2023</option>
          </select>
        </div>
      )}
    >
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-semibold text-gray-900">₹ 10.5M</div>
          <div className="text-xs text-gray-500 mt-1">Mar 14 · <span className="font-medium text-gray-700">₹ 28K</span></div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-purple-500 mr-1"></span> Earned
          </span>
          <span className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span> Forecasted
          </span>
          <select className="border border-gray-300 rounded-md p-1 text-xs focus:ring-indigo-500 focus:border-indigo-500">
            <option>6 months</option>
            <option>3 months</option>
            <option>12 months</option>
          </select>
        </div>
      </div>

      <div className="mt-5 h-64 flex items-center justify-center bg-gray-50 rounded-lg text-gray-400 text-sm relative">
        <p>Dynamic Revenue Chart ({selectedPeriod})</p>
        <div className="absolute opacity-20 text-[10px] p-2 max-w-full overflow-auto">
          {JSON.stringify(chartData, null, 2)}
        </div>
      </div>
    </Card>
  );
};

export default RevenueCard;