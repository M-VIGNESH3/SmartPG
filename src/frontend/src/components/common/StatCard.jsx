import React from 'react';

const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', trend }) => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        {trend && (
          <p className={`text-sm mt-1 flex items-center ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </p>
        )}
      </div>
      {Icon && (
        <div className={`p-4 rounded-full ${colorMap[color] || colorMap.blue}`}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
