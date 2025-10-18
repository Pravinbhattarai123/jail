// src/components/widgets/WalletSoldCard.tsx
'use client'; 
import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card'

// --- Interfaces ---
interface PieDataItem {
    name: string;
    value: number;
    color: string;
}

// --- Dynamic Mock Data Function ---
const generateDataForMonth = (month: string): PieDataItem[] => {
    let oldCustomers: number;
    let newCustomers: number;

    // Simulate different sales figures based on the selected month
    switch (month) {
        case 'Last month':
            // Example: Lower sales last month
            oldCustomers = 8500;
            newCustomers = 3000;
            break;
        case 'Last 3 months':
            // Example: Higher sales over a longer period
            oldCustomers = 35000;
            newCustomers = 12000;
            break;
        case 'This month':
        default:
            // Default "This month" figures
            oldCustomers = 10000;
            newCustomers = 4000;
            break;
    }

    return [
        { name: 'Old Customers', value: oldCustomers, color: '#6366F1' },
        { name: 'New Customer', value: newCustomers, color: '#22C55E' },
    ];
};

const WalletSoldCard: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>('This month');
  const [chartData, setChartData] = useState<PieDataItem[]>(generateDataForMonth('This month'));

  // --- Dynamic Data Fetching (Simulation) ---
  useEffect(() => {
    // In a real app, you would make an API call here:
    // fetch(`/api/wallets/sold?period=${selectedMonth}`).then(res => setChartData(res.data));
    
    // Simulation: Update chart data based on selected month
    setChartData(generateDataForMonth(selectedMonth));
  }, [selectedMonth]); // Dependency array: runs whenever selectedMonth changes


  // --- Calculations based on current chartData state ---
  const total: number = chartData.reduce((sum, entry) => sum + entry.value, 0);
  const oldCustomerPercentage: number = (chartData[0].value / total) * 100;
  const newCustomerPercentage: number = (chartData[1].value / total) * 100;
  const newCustomerOffset: number = 100 - oldCustomerPercentage;

  // Inline style for rotation (to start chart at 12 o'clock without rotating text)
  const pathTransformStyle: React.CSSProperties = { 
      transform: 'rotate(-90deg)', 
      transformOrigin: '50% 50%' 
  };
  
  // Define the common path for the circular stroke
  const circlePath = "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831";
  

  return (
    <Card title="Wallet Sold" right={(<select
          value={selectedMonth}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 rounded-md p-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option>This month</option>
          <option>Last month</option>
          <option>Last 3 months</option>
        </select>)}>

      <div className="flex-1 flex items-center justify-center relative">
        {/* Doughnut Chart Placeholder (using SVG for basic visual) */}
        <div className="w-40 h-40 relative">
            <svg viewBox="0 0 36 36" className="w-full h-full">
                
                {/* Background Circle (Gray) */}
                <path 
                    className="text-gray-200" 
                    fill="none" 
                    stroke="currentColor"
                    strokeWidth="3.5"
                    d={circlePath}
                />
                
                {/* Old Customers Segment (Indigo) */}
                <path
                    className="text-indigo-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeDasharray={`${oldCustomerPercentage} 100`}
                    strokeLinecap="round"
                    d={circlePath}
                    style={pathTransformStyle}
                />
                
                {/* New Customers Segment (Green) */}
                <path
                    className="text-green-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeDasharray={`${newCustomerPercentage} 100`}
                    strokeDashoffset={newCustomerOffset}
                    strokeLinecap="round"
                    d={circlePath}
                    style={pathTransformStyle}
                />
            </svg>
            
            {/* Center Text: Always displays the main metric (Old Customers) */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-800">{(chartData[0].value / 1000).toFixed(0)}K</span>
                <span className="text-sm text-gray-500">Old Customers</span>
            </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center text-sm text-gray-700">
          <span className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-indigo-500 mr-2"></span> Old Customers
          </span>
          <span className="font-semibold">{(chartData[0].value / 1000).toFixed(1)}K</span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-700">
          <span className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span> New Customer
          </span>
          <span className="font-semibold">{(chartData[1].value / 1000).toFixed(1)}K</span>
        </div>
      </div>
    </Card>
  );
};

export default WalletSoldCard;