
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'orange' | 'blue' | 'green' | 'purple';
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const colorClasses = {
  orange: {
    bg: 'bg-gradient-to-br from-orange-400 to-yellow-500',
    text: 'text-orange-600',
    bgLight: 'bg-orange-50',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
    text: 'text-blue-600',
    bgLight: 'bg-blue-50',
  },
  green: {
    bg: 'bg-gradient-to-br from-green-400 to-green-600',
    text: 'text-green-600',
    bgLight: 'bg-green-50',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-400 to-purple-600',
    text: 'text-purple-600',
    bgLight: 'bg-purple-50',
  },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
}) => {
  const classes = colorClasses[color];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${classes.bg} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend.isPositive
                ? 'text-green-700 bg-green-100'
                : 'text-red-700 bg-red-100'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
};
