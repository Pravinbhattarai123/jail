// src/components/widgets/TrafficGainedCard.tsx
'use client'; 
import React, { useState } from 'react';
import Card from '@/components/ui/Card'

const TrafficGainedCard: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>('Jul 2022');
  const trafficCount: number = 300000;

  return (
    <Card
      title="Traffic Gained"
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
      <div>
        <div className="bg-purple-100 p-3 rounded-full text-purple-600 inline-flex mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.106-1.298-.309-1.9M7 20h5m-5 0v-2a3 3 0 013-3h2.144M7 5h10a2 2 0 012 2v1h1a2 2 0 012 2v10a2 2 0 01-2 2h-1v-2a3 3 0 00-3-3H6a3 3 0 00-3 3v2H2a2 2 0 01-2-2V7a2 2 0 012-2h1V4a2 2 0 012-2h10a2 2 0 012 2v1z"></path>
          </svg>
        </div>
        <div className="text-3xl font-extrabold text-gray-900 mb-1">{trafficCount.toLocaleString()}</div>
        <p className="text-gray-500 text-sm">Total visits this period</p>
      </div>
    </Card>
  );
};

export default TrafficGainedCard;