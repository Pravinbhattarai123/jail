// src/components/users/UserMetricCard.tsx
import React from 'react';

interface UserMetricCardProps {
  title: string;
  value: number;
  percentageChange: string;
  timeframe: string;
  iconColor: string;
}

const UserMetricCard: React.FC<UserMetricCardProps> = ({
  title,
  value,
  percentageChange,
  timeframe,
  iconColor,
}) => {
  // Determine icon based on card type
  const Icon = () => {
    switch (title) {
      case 'Active Users':
        return (
          <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18H4v-3a6 6 0 0112 0v3z" />
          </svg>
        );
      case 'New Users':
        return (
          <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
        );
      case 'Total Users':
        return (
          <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-between">
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl ${iconColor === 'text-indigo-600' ? 'bg-indigo-100' : iconColor === 'text-gray-600' ? 'bg-gray-100' : 'bg-pink-100'} ${iconColor}`}>
          <Icon />
        </div>
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-3xl font-extrabold text-gray-900 mt-1">
            {value.toLocaleString()}
          </h3>
        </div>
      </div>
      <div className="text-right">
        <span className="text-green-600 font-semibold text-sm">
          {percentageChange}
        </span>
        <p className="text-gray-500 text-xs mt-0.5">
          {timeframe}
        </p>
      </div>
    </div>
  );
};

export default UserMetricCard;