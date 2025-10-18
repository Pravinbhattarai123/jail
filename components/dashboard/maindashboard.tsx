// src/components/MainDashboard.tsx
'use client';
import React from 'react';
// Import the TSX versions of the widgets
import RevenueCard from './widget/RevenueCard';
import WalletSoldCard from './widget/WalletSoldCard';
import TrafficGainedCard from './widget/TrafficGainedCard';
import ProfitsEarnedCard from './widget/ProfitsEarnedCard';
import SalesActivityCard from './widget/SalesActivityCard';

const MainDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* Top Row */}
      <div className="lg:col-span-2">
        <RevenueCard />
      </div>
      <div>
        <WalletSoldCard />
      </div>
      
      {/* Middle Row */}
      <div>
        <TrafficGainedCard />
      </div>
      <div>
        <ProfitsEarnedCard />
      </div>

      {/* Bottom Row */}
      <div className="lg:col-span-2"> 
        <SalesActivityCard />
      </div>
    </div>
  );
};

export default MainDashboard;