
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  trend,
}) => {
  return (
    <div className="stats-card card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend.isPositive
                ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900'
                : 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-1">{value}</h3>
        <p className="text-sm text-gray-600 dark:text-muted-foreground">{title}</p>
      </div>
    </div>
  );
};
