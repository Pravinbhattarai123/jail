// src/components/DashboardLayout.tsx
'use client';
import React from 'react';
import Sidebar from './sidebar';
import Header from './header';
import MainDashboard from './maindashboard';

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <MainDashboard />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;