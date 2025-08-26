import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Calendar, Coins } from 'lucide-react';

interface SavingsProgressProps {
  currentAmount: number;
  targetAmount: number;
  timeProgress: number; // 0-100
  projectedAmount?: number;
  currency: string;
}

export function SavingsProgressChart({ 
  currentAmount, 
  targetAmount, 
  timeProgress, 
  projectedAmount,
  currency = "cBTC"
}: SavingsProgressProps) {
  const savingsProgress = (currentAmount / targetAmount) * 100;
  const isOnTrack = savingsProgress >= timeProgress;
  const projectedCompletion = projectedAmount ? (projectedAmount / targetAmount) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-bitcoin" />
          Savings Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Amount Saved
            </span>
            <span className="text-sm font-bold text-bitcoin">
              {currentAmount.toFixed(6)} {currency} / {targetAmount.toFixed(6)} {currency}
            </span>
          </div>
          <div className="relative">
            <Progress value={savingsProgress} className="h-3" />
            <div className="absolute inset-0 flex items-center px-2">
              <span className="text-xs text-white font-medium">
                {savingsProgress.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Time Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Time Elapsed
            </span>
            <span className="text-sm font-bold">
              {timeProgress.toFixed(1)}%
            </span>
          </div>
          <Progress value={timeProgress} className="h-2 bg-gray-200" />
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            {isOnTrack ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm font-medium">
              {isOnTrack ? "On Track" : "Behind Schedule"}
            </span>
          </div>
          
          {projectedAmount && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Projected Total</p>
              <p className="text-sm font-semibold text-bitcoin">
                {projectedAmount.toFixed(6)} {currency}
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.max(0, savingsProgress - timeProgress).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              {savingsProgress > timeProgress ? "Ahead" : "Behind"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(100 - savingsProgress).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Remaining</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PortfolioOverviewProps {
  chamasSavings: number;
  saccoCollateral: number;
  totalValue: number;
  currency: string;
}

export function PortfolioOverviewChart({ 
  chamasSavings, 
  saccoCollateral, 
  totalValue, 
  currency = "cBTC" 
}: PortfolioOverviewProps) {
  const chamasPercentage = totalValue > 0 ? (chamasSavings / totalValue) * 100 : 0;
  const saccoPercentage = totalValue > 0 ? (saccoCollateral / totalValue) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Coins className="h-5 w-5 text-bitcoin" />
          Portfolio Allocation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Value */}
        <div className="text-center p-4 bg-gradient-to-r from-bitcoin/10 to-yellow-400/10 rounded-lg">
          <div className="text-3xl font-bold text-bitcoin">
            {totalValue.toFixed(6)} {currency}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Portfolio</div>
        </div>

        {/* Allocation Breakdown */}
        <div className="space-y-4">
          {/* Chamas Savings */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-sm font-medium">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Chama Savings
              </span>
              <span className="text-sm font-bold">
                {chamasSavings.toFixed(6)} {currency} ({chamasPercentage.toFixed(1)}%)
              </span>
            </div>
            <Progress value={chamasPercentage} className="h-2" />
          </div>

          {/* Sacco Collateral */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-sm font-medium">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Sacco Collateral
              </span>
              <span className="text-sm font-bold">
                {saccoCollateral.toFixed(6)} {currency} ({saccoPercentage.toFixed(1)}%)
              </span>
            </div>
            <Progress value={saccoPercentage} className="h-2 bg-gray-200" />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {chamasPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">in Savings</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {saccoPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">as Collateral</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
