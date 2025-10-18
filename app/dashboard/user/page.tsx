// src/pages/UsersPage.tsx (You would use this inside your DashboardLayout)
"use client";
import React from "react";
import UserMetricCard from "../../../components/dashboard/users/UserMetricCard";
import UserListTable from "../../../components/dashboard/users/UserListTable";

const UsersPage: React.FC = () => {
  return (
    <div className="p-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <UserMetricCard
          title="Active Users"
          value={395}
          percentageChange="+10%"
          timeframe="more than last month"
          iconColor="text-indigo-600"
        />
        <UserMetricCard
          title="New Users"
          value={24}
          percentageChange="+10%"
          timeframe="more than last month"
          iconColor="text-gray-600"
        />
        <UserMetricCard
          title="Total Users"
          value={1243}
          percentageChange="+10%"
          timeframe="more than last month"
          iconColor="text-pink-600"
        />
      </div>

      {/* User List and Table */}
      <UserListTable />
    </div>
  );
};

export default UsersPage;
