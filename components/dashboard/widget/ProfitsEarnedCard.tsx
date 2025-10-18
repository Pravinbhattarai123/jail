// src/components/widgets/ProfitsEarnedCard.tsx
'use client'; 
import React, { useState } from 'react';
import Card from '@/components/ui/Card'

const ProfitsEarnedCard: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>('Jul 2022');
  const profits: number = 60000;

  return (
    <Card
      title="Profits Earned"
      right={(
        <select
          value={selectedMonth}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 rounded-md p-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option>Jul 2022</option>
          <option>Jun 2022</option>
          <option>May 2022</option>
        </select>
      )}
    >
      <div className="bg-green-100 p-3 rounded-full text-green-600 inline-flex mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0h.01M9 12h6m-5 0h.01M9 16h6m-5 0h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <div>
        <div className="text-3xl font-extrabold text-gray-900 mb-1">₹ {profits.toLocaleString()}K</div>
        <p className="text-gray-500 text-sm">Net profit this period</p>
      </div>
    </Card>
  );
};

export default ProfitsEarnedCard;