
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Bitcoin, TrendingUp } from 'lucide-react';
import { Chama } from '../../types/chama';
import { formatBTC } from '../../utils/ethUtils';

interface ChamaCardProps {
  chama: Chama;
}

export const ChamaCard: React.FC<ChamaCardProps> = ({ chama }) => {
  const progressPercentage = (chama.members.length / chama.maxMembers) * 100;
  const nextPayoutDate = chama.nextPayout ? new Date(chama.nextPayout) : null;

  return (
    <Link to={`/chama/${chama.id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:scale-105 cursor-pointer">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {chama.name}
          </h3>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            chama.active 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {chama.active ? 'Active' : 'Closed'}
          </div>
        </div>

        {/* Members Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {chama.members.length}/{chama.maxMembers} members
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-400 to-yellow-500 h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Contribution Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center space-x-1 mb-1">
              <Bitcoin className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-gray-500">Monthly</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {formatBTC(chama.contributionAmount)} BTC
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-1 mb-1">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">Duration</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {chama.cycleDuration} months
            </span>
          </div>
        </div>

        {/* Total Contributions */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600">Total Stacked</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {formatBTC(chama.totalContributions)} BTC
          </span>
        </div>

        {/* Next Payout */}
        {nextPayoutDate && (
          <div className="mt-3 text-center">
            <span className="text-xs text-gray-500">
              Next payout: {nextPayoutDate.toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};
