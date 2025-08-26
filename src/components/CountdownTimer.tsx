import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Timer, Calendar, AlertCircle } from 'lucide-react';

interface CountdownTimerProps {
  /** Target timestamp (in seconds) or seconds remaining */
  targetTime: number;
  /** Whether targetTime is a timestamp or seconds remaining */
  isTimestamp?: boolean;
  /** Display format for the timer */
  format?: 'full' | 'compact' | 'minimal' | 'badge';
  /** Color theme */
  theme?: 'default' | 'warning' | 'danger' | 'success';
  /** Show icon */
  showIcon?: boolean;
  /** Custom icon to display */
  icon?: React.ReactNode;
  /** Callback when timer reaches zero */
  onComplete?: () => void;
  /** Callback called every second with remaining time */
  onTick?: (remainingSeconds: number) => void;
  /** Label to show before the timer */
  label?: string;
  /** Whether to show "ago" when time is negative */
  showPastTime?: boolean;
  /** Custom className */
  className?: string;
}

interface TimeComponents {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const CountdownTimer = React.memo(function CountdownTimer({
  targetTime,
  isTimestamp = false,
  format = 'full',
  theme = 'default',
  showIcon = true,
  icon,
  onComplete,
  onTick,
  label,
  showPastTime = false,
  className = ''
}: CountdownTimerProps) {
  const [currentTime, setCurrentTime] = useState(() => Math.floor(Date.now() / 1000));
  
  // Calculate remaining time
  const remainingSeconds = useMemo(() => {
    if (isTimestamp) {
      return targetTime - currentTime;
    } else {
      return targetTime;
    }
  }, [targetTime, currentTime, isTimestamp]);

  const timeComponents = useMemo((): TimeComponents => {
    const total = Math.abs(remainingSeconds);
    const days = Math.floor(total / (24 * 60 * 60));
    const hours = Math.floor((total % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((total % (60 * 60)) / 60);
    const seconds = Math.floor(total % 60);

    return { days, hours, minutes, seconds, total };
  }, [remainingSeconds]);

  const isExpired = remainingSeconds <= 0;
  const isPastTime = remainingSeconds < 0;

  // Update current time every second
  useEffect(() => {
    if (!isTimestamp) return; // Don't update if not using timestamp

    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimestamp]);

  // Handle completion and tick callbacks
  useEffect(() => {
    if (onTick) {
      onTick(remainingSeconds);
    }

    if (isExpired && onComplete && !isPastTime) {
      onComplete();
    }
  }, [remainingSeconds, isExpired, isPastTime, onTick, onComplete]);

  // Theme colors
  const getThemeClasses = () => {
    const baseClasses = "transition-colors duration-200";
    
    switch (theme) {
      case 'warning':
        return `${baseClasses} text-yellow-600 dark:text-yellow-400`;
      case 'danger':
        return `${baseClasses} text-red-600 dark:text-red-400`;
      case 'success':
        return `${baseClasses} text-green-600 dark:text-green-400`;
      default:
        return `${baseClasses} text-gray-700 dark:text-gray-300`;
    }
  };

  const getThemeFromTime = (): 'default' | 'warning' | 'danger' => {
    if (isExpired) return 'danger';
    if (remainingSeconds <= 3600) return 'danger'; // Less than 1 hour
    if (remainingSeconds <= 24 * 3600) return 'warning'; // Less than 1 day
    return 'default';
  };

  const autoTheme = theme === 'default' ? getThemeFromTime() : theme;
  const themeClasses = getThemeClasses();

  // Format display text
  const formatTime = (): string => {
    const { days, hours, minutes, seconds } = timeComponents;
    
    if (isExpired && !showPastTime) {
      return 'Expired';
    }

    const prefix = isPastTime && showPastTime ? '' : '';
    const suffix = isPastTime && showPastTime ? ' ago' : '';

    switch (format) {
      case 'minimal':
        if (days > 0) return `${prefix}${days}d${suffix}`;
        if (hours > 0) return `${prefix}${hours}h${suffix}`;
        if (minutes > 0) return `${prefix}${minutes}m${suffix}`;
        return `${prefix}${seconds}s${suffix}`;

      case 'compact':
        if (days > 0) return `${prefix}${days}d ${hours}h${suffix}`;
        if (hours > 0) return `${prefix}${hours}h ${minutes}m${suffix}`;
        return `${prefix}${minutes}m ${seconds}s${suffix}`;

      case 'badge':
        if (days > 0) return `${days}d`;
        if (hours > 0) return `${hours}h`;
        return `${minutes}m`;

      case 'full':
      default:
        const parts: string[] = [];
        if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
        if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
        if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
        if (seconds > 0 && days === 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
        
        if (parts.length === 0) return isExpired ? 'Expired' : 'Less than a minute';
        return `${prefix}${parts.join(', ')}${suffix}`;
    }
  };

  // Get appropriate icon
  const getIcon = () => {
    if (icon) return icon;
    if (!showIcon) return null;

    if (isExpired) return <AlertCircle className="w-4 h-4" />;
    if (timeComponents.days > 0) return <Calendar className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  // Render based on format
  const renderTimer = () => {
    const displayIcon = getIcon();
    const displayText = formatTime();
    
    const combinedClasses = `${themeClasses} ${className}`.trim();

    switch (format) {
      case 'badge':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 ${combinedClasses}`}>
            {displayIcon}
            {displayText}
          </span>
        );

      case 'minimal':
        return (
          <span className={`inline-flex items-center gap-1 text-sm font-medium ${combinedClasses}`}>
            {displayIcon}
            {displayText}
          </span>
        );

      default:
        return (
          <div className={`flex items-center gap-2 ${combinedClasses}`}>
            {displayIcon}
            <div>
              {label && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {label}
                </div>
              )}
              <div className={`font-medium ${format === 'compact' ? 'text-sm' : 'text-base'}`}>
                {displayText}
              </div>
            </div>
          </div>
        );
    }
  };

  return renderTimer();
});

export default CountdownTimer;

// Utility hook for countdown timers
export function useCountdown(targetTime: number, isTimestamp: boolean = false) {
  const [currentTime, setCurrentTime] = useState(() => Math.floor(Date.now() / 1000));
  
  const remainingSeconds = useMemo(() => {
    if (isTimestamp) {
      return targetTime - currentTime;
    } else {
      return targetTime;
    }
  }, [targetTime, currentTime, isTimestamp]);

  useEffect(() => {
    if (!isTimestamp) return;

    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimestamp]);

  return {
    remainingSeconds,
    isExpired: remainingSeconds <= 0,
    isPastTime: remainingSeconds < 0,
    currentTime
  };
}

// Helper function to format duration in seconds to human readable format
export function formatDuration(seconds: number | undefined | null, format: 'full' | 'compact' | 'minimal' = 'full'): string {
  // Handle invalid input
  if (seconds === undefined || seconds === null || isNaN(seconds) || seconds <= 0) {
    return 'Invalid duration';
  }
  
  // Ensure seconds is a valid number
  const validSeconds = Number(seconds);
  if (!isFinite(validSeconds) || validSeconds <= 0) {
    return 'Invalid duration';
  }
  
  const days = Math.floor(validSeconds / (24 * 60 * 60));
  const hours = Math.floor((validSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((validSeconds % (60 * 60)) / 60);
  const secs = Math.floor(validSeconds % 60);

  switch (format) {
    case 'minimal':
      if (days > 0) return `${days}d`;
      if (hours > 0) return `${hours}h`;
      if (minutes > 0) return `${minutes}m`;
      return `${secs}s`;

    case 'compact':
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m ${secs}s`;

    case 'full':
    default:
      const parts: string[] = [];
      if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
      if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
      if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
      if (secs > 0 && days === 0) parts.push(`${secs} second${secs !== 1 ? 's' : ''}`);
      
      if (parts.length === 0) return 'Less than a minute';
      return parts.join(', ');
  }
}
