import React, { useState, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  disabled?: boolean;
}

export function PullToRefresh({ 
  children, 
  onRefresh, 
  threshold = 80,
  disabled = false 
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const isMobile = useIsMobile();
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || !isMobile) return;
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || disabled || !isMobile) return;
    
    currentY.current = e.touches[0].clientY;
    const distance = Math.max(0, currentY.current - startY.current);
    
    // Only trigger if we're at the top of the page
    if (window.scrollY === 0 && distance > 10) {
      e.preventDefault();
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling || disabled || !isMobile) return;
    
    setIsPulling(false);
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const refreshProgress = Math.min(pullDistance / threshold, 1);
  const showRefreshIndicator = isPulling && pullDistance > 20;

  return (
    <div 
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {(showRefreshIndicator || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-gradient-to-b from-bitcoin/10 to-transparent z-10 transition-all duration-200"
          style={{ 
            transform: `translateY(${isPulling ? pullDistance - threshold : 0}px)`,
            opacity: showRefreshIndicator || isRefreshing ? 1 : 0
          }}
        >
          <div className="flex items-center space-x-2 text-bitcoin">
            <RefreshCw 
              size={20} 
              className={`${isRefreshing || refreshProgress >= 1 ? 'animate-spin' : ''}`}
              style={{
                transform: isPulling && !isRefreshing ? `rotate(${refreshProgress * 360}deg)` : undefined
              }}
            />
            <span className="text-sm font-medium">
              {isRefreshing 
                ? 'Refreshing...' 
                : refreshProgress >= 1 
                  ? 'Release to refresh'
                  : 'Pull to refresh'
              }
            </span>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div 
        style={{ 
          transform: isPulling ? `translateY(${Math.min(pullDistance, threshold)}px)` : undefined,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}
