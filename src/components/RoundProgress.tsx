import React from 'react';
import { Progress } from '@/components/ui/progress';
import CountdownTimer from '@/components/CountdownTimer';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Calendar, Target, TrendingUp, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { ROSCAStatus } from '@/hooks/useRosca';
import { formatDuration } from '@/components/CountdownTimer';

interface RoundProgressProps {
  /** ROSCA status */
  status: ROSCAStatus | null;
  /** Current round number */
  currentRound: number;
  /** Total number of rounds */
  totalRounds: number;
  /** Time remaining until round ends (in seconds) */
  timeUntilRoundEnd: number | null;
  /** Round progress percentage (0-100) */
  roundProgress: number | null;
  /** Round start timestamp */
  roundStartTime: number | null;
  /** Round deadline timestamp */
  roundDeadline: number | null;
  /** Round duration in seconds */
  roundDuration: number | null;
  /** Time until ROSCA starts (for WAITING status) */
  timeUntilStart: number | null;
  /** Whether the round has expired */
  isExpired: boolean;
  /** Show detailed information */
  detailed?: boolean;
  /** Custom className */
  className?: string;
}

export default function RoundProgress({
  status,
  currentRound,
  totalRounds,
  timeUntilRoundEnd,
  roundProgress,
  roundStartTime,
  roundDeadline,
  roundDuration,
  timeUntilStart,
  isExpired,
  detailed = false,
  className = ''
}: RoundProgressProps) {
  const getStatusInfo = () => {
    switch (status) {
      case ROSCAStatus.RECRUITING:
        return {
          label: 'Recruiting Members',
          description: 'Waiting for members to join',
          color: 'bg-blue-500',
          textColor: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-950',
          borderColor: 'border-blue-200 dark:border-blue-800',
          icon: <Users className="w-5 h-5" />,
          showProgress: false,
        };

      case ROSCAStatus.WAITING:
        return {
          label: 'Ready to Start',
          description: timeUntilStart === 0 ? 'ROSCA can start now' : 'Waiting for deposits',
          color: 'bg-yellow-500',
          textColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          icon: <Clock className="w-5 h-5" />,
          showProgress: false,
        };

      case ROSCAStatus.ACTIVE:
        const actuallyExpired = timeUntilRoundEnd !== null && timeUntilRoundEnd <= 0;
        return {
          label: `Round ${currentRound} of ${totalRounds}`,
          description: actuallyExpired ? 'Round deadline passed' : 'Round in progress',
          color: actuallyExpired ? 'bg-red-500' : 'bg-green-500',
          textColor: actuallyExpired ? 'text-red-600' : 'text-green-600',
          bgColor: actuallyExpired ? 'bg-red-50 dark:bg-red-950' : 'bg-green-50 dark:bg-green-950',
          borderColor: actuallyExpired ? 'border-red-200 dark:border-red-800' : 'border-green-200 dark:border-green-800',
          icon: actuallyExpired ? <AlertCircle className="w-5 h-5" /> : <Target className="w-5 h-5" />,
          showProgress: true,
        };

      case ROSCAStatus.COMPLETED:
        return {
          label: 'ROSCA Completed',
          description: 'All rounds finished successfully',
          color: 'bg-purple-500',
          textColor: 'text-purple-600',
          bgColor: 'bg-purple-50 dark:bg-purple-950',
          borderColor: 'border-purple-200 dark:border-purple-800',
          icon: <CheckCircle className="w-5 h-5" />,
          showProgress: false,
        };

      case ROSCAStatus.CANCELLED:
        return {
          label: 'ROSCA Cancelled',
          description: 'ROSCA was cancelled',
          color: 'bg-gray-500',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50 dark:bg-gray-950',
          borderColor: 'border-gray-200 dark:border-gray-800',
          icon: <AlertCircle className="w-5 h-5" />,
          showProgress: false,
        };

      default:
        return {
          label: 'Loading...',
          description: 'Fetching ROSCA status',
          color: 'bg-gray-400',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50 dark:bg-gray-950',
          borderColor: 'border-gray-200 dark:border-gray-800',
          icon: <Clock className="w-5 h-5 animate-spin" />,
          showProgress: false,
        };
    }
  };

  const statusInfo = getStatusInfo();

  const formatTimeRange = () => {
    if (!roundStartTime || !roundDeadline) return '';
    
    const startDate = new Date(roundStartTime * 1000);
    const endDate = new Date(roundDeadline * 1000);
    
    const formatDate = (date: Date) => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }
    };

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    };

    return `${formatDate(startDate)} ${formatTime(startDate)} - ${formatDate(endDate)} ${formatTime(endDate)}`;
  };

  if (!detailed) {
    // Compact view for cards
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className={`w-3 h-3 rounded-full ${statusInfo.color}`}></div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {statusInfo.label}
            </span>
            {status === ROSCAStatus.ACTIVE && timeUntilRoundEnd !== null && (
              <CountdownTimer
                targetTime={timeUntilRoundEnd}
                isTimestamp={false}
                format="minimal"
                theme={timeUntilRoundEnd <= 0 ? 'danger' : timeUntilRoundEnd <= 3600 ? 'warning' : 'default'}
                showIcon={false}
                className="text-xs font-medium"
              />
            )}
          </div>
          {statusInfo.showProgress && roundProgress !== null && (
            <div className="mt-1">
              <Progress 
                value={roundProgress} 
                className="h-1.5"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detailed view for dashboard
  return (
    <Card className={`${statusInfo.borderColor} ${statusInfo.bgColor} ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${statusInfo.bgColor} ${statusInfo.textColor}`}>
            {statusInfo.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {statusInfo.label}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {statusInfo.description}
            </p>
          </div>
        </div>

        {/* Progress and Timer Section */}
        {status === ROSCAStatus.ACTIVE && (
          <div className="space-y-4">
            {/* Round Progress */}
            {roundProgress !== null && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Round Progress</span>
                  <span className="font-medium">{roundProgress.toFixed(1)}%</span>
                </div>
                <Progress value={roundProgress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Started</span>
                  <span>Complete</span>
                </div>
              </div>
            )}

            {/* Countdown Timer */}
            {timeUntilRoundEnd !== null && (
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {timeUntilRoundEnd && timeUntilRoundEnd > 0 ? 'Time Remaining' : 'Round Ended'}
                  </span>
                </div>
                <CountdownTimer
                  targetTime={timeUntilRoundEnd}
                  isTimestamp={false}
                  format="compact"
                  theme={isExpired ? 'danger' : timeUntilRoundEnd <= 3600 ? 'warning' : 'default'}
                  showIcon={false}
                />
              </div>
            )}

            {/* Round Duration Info */}
            {roundDuration && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Round Duration</span>
                <span className="font-medium">{formatDuration(roundDuration, 'compact')}</span>
              </div>
            )}

            {/* Time Range */}
            {formatTimeRange() && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{formatTimeRange()}</span>
              </div>
            )}
          </div>
        )}

        {/* Waiting to Start Timer */}
        {status === ROSCAStatus.WAITING && timeUntilStart !== null && timeUntilStart > 0 && (
          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Time until start
              </span>
            </div>
            <CountdownTimer
              targetTime={timeUntilStart}
              isTimestamp={false}
              format="compact"
              theme="default"
              showIcon={false}
            />
          </div>
        )}

        {/* Overall Progress (for active ROSCAs) */}
        {status === ROSCAStatus.ACTIVE && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
              <span className="font-medium">{currentRound} / {totalRounds} rounds</span>
            </div>
            <Progress value={(currentRound / totalRounds) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Round 1</span>
              <span>Round {totalRounds}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Utility component for small inline progress indicators
export function InlineRoundStatus({ 
  status, 
  currentRound, 
  totalRounds, 
  timeUntilRoundEnd,
  isExpired 
}: Pick<RoundProgressProps, 'status' | 'currentRound' | 'totalRounds' | 'timeUntilRoundEnd' | 'isExpired'>) {
  const getStatusColor = () => {
    switch (status) {
      case ROSCAStatus.RECRUITING: return 'text-blue-600';
      case ROSCAStatus.WAITING: return 'text-yellow-600';
      case ROSCAStatus.ACTIVE: return isExpired ? 'text-red-600' : 'text-green-600';
      case ROSCAStatus.COMPLETED: return 'text-purple-600';
      case ROSCAStatus.CANCELLED: return 'text-gray-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case ROSCAStatus.RECRUITING: return 'Recruiting';
      case ROSCAStatus.WAITING: return 'Ready to Start';
      case ROSCAStatus.ACTIVE: return `Round ${currentRound}/${totalRounds}`;
      case ROSCAStatus.COMPLETED: return 'Completed';
      case ROSCAStatus.CANCELLED: return 'Cancelled';
      default: return 'Loading...';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      {status === ROSCAStatus.ACTIVE && timeUntilRoundEnd !== null && timeUntilRoundEnd > 0 && (
        <CountdownTimer
          targetTime={timeUntilRoundEnd}
          isTimestamp={false}
          format="badge"
          theme={timeUntilRoundEnd <= 3600 ? 'warning' : 'default'}
          showIcon={false}
        />
      )}
    </div>
  );
}
